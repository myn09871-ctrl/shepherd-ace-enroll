import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Globe, Mail, Clock, Eye, Images, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Application {
  id: string;
  student_first_name: string;
  student_surname: string;
  program_level: string;
  status: string;
  created_at: string;
}

interface Stats {
  todayCount: number;
  pendingCount: number;
  approvedThisWeek: number;
  totalEnrolled: number;
}

const Dashboard = () => {
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    pendingCount: 0,
    approvedThisWeek: 0,
    totalEnrolled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent applications
      const { data: applications } = await supabase
        .from("enrollment_applications")
        .select("id, student_first_name, student_surname, program_level, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentApplications(applications || []);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get week start
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 7);

      // Count today's applications
      const { count: todayCount } = await supabase
        .from("enrollment_applications")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      // Count pending applications
      const { count: pendingCount } = await supabase
        .from("enrollment_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Count approved this week
      const { count: approvedThisWeek } = await supabase
        .from("enrollment_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved")
        .gte("updated_at", weekStart.toISOString());

      // Count enrolled
      const { count: totalEnrolled } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      setStats({
        todayCount: todayCount || 0,
        pendingCount: pendingCount || 0,
        approvedThisWeek: approvedThisWeek || 0,
        totalEnrolled: totalEnrolled || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "View Applications", icon: FileText, href: "/admin/applications" },
    { label: "Manage Gallery", icon: Images, href: "/admin/gallery" },
    { label: "Update Fees", icon: CreditCard, href: "/admin/fees" },
    { label: "Update Content", icon: Globe, href: "/admin/content" },
    { label: "Send Message", icon: Mail, href: "/admin/messages" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-lg md:text-xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Welcome to the admin portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <StatsCard
          title="Today"
          value={stats.todayCount}
          icon={FileText}
          variant="info"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCount}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Approved"
          value={stats.approvedThisWeek}
          icon={FileText}
          variant="success"
        />
        <StatsCard
          title="Enrolled"
          value={stats.totalEnrolled}
          icon={FileText}
          variant="default"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-soft">
          <div className="p-3 md:p-4 border-b border-border">
            <h2 className="text-xs md:text-sm font-semibold text-foreground">Recent Applications</h2>
          </div>
          <div className="divide-y divide-border">
            {recentApplications.length === 0 ? (
              <div className="p-4 text-center text-xs md:text-sm text-muted-foreground">
                No applications yet
              </div>
            ) : (
              recentApplications.slice(0, 5).map((app) => (
                <div key={app.id} className="p-2 md:p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      app.status === "pending" ? "bg-blue-500" :
                      app.status === "under_review" ? "bg-yellow-500" :
                      app.status === "approved" ? "bg-green-500" :
                      app.status === "enrolled" ? "bg-primary" :
                      "bg-red-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm font-medium text-foreground truncate">
                        {app.student_first_name} {app.student_surname}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                        {app.program_level} • {format(new Date(app.created_at), "MMM d")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <StatusBadge status={app.status} size="sm" />
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                      <Link to={`/admin/applications/${app.id}`}>
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentApplications.length > 0 && (
            <div className="p-2 md:p-3 border-t border-border">
              <Button variant="outline" size="sm" className="w-full text-xs md:text-sm h-8" asChild>
                <Link to="/admin/applications">View All</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border shadow-soft">
          <div className="p-3 md:p-4 border-b border-border">
            <h2 className="text-xs md:text-sm font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-2 md:p-3 space-y-1 md:space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs md:text-sm h-8 md:h-9"
                asChild
              >
                <Link to={action.href}>
                  <action.icon className="h-3 w-3 md:h-4 md:w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
