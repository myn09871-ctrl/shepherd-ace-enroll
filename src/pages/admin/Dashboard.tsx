import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Globe, Mail, Clock, Eye, Images, CreditCard, Users, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import ExpandableSearch from "@/components/admin/ExpandableSearch";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredApplications = recentApplications.filter(app =>
    `${app.student_first_name} ${app.student_surname}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome panel */}
      <div className="rounded-md bg-primary p-4 md:p-6 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-semibold">Welcome back</h1>
            <div className="rule-gold mt-2" />
            <p className="mt-2 text-xs md:text-sm text-primary-foreground/80">Good Shepherd International School Admin Portal</p>
          </div>
          <ExpandableSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search applications..."
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {[
          { label: "Today's Applications", value: stats.todayCount, icon: FileText, urgent: false },
          { label: "Pending Review", value: stats.pendingCount, icon: Clock, urgent: stats.pendingCount > 0 },
          { label: "Approved This Week", value: stats.approvedThisWeek, icon: TrendingUp, urgent: false },
          { label: "Total Enrolled", value: stats.totalEnrolled, icon: Users, urgent: false },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-md border p-3 md:p-4 ${
              s.urgent
                ? "bg-[hsl(var(--gsis-gold-soft))] border-[hsl(var(--gsis-gold))] border-l-4"
                : "bg-card border-border"
            }`}
          >
            <s.icon className={`h-4 w-4 ${s.urgent ? "text-[hsl(var(--gsis-gold))]" : "text-primary"}`} />
            <p className="mt-2 font-heading text-2xl md:text-3xl font-semibold text-foreground">{s.value}</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {s.label}
              {s.urgent && <span className="ml-1 font-medium text-foreground">· needs attention</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-md border border-border overflow-hidden">
          <div className="p-3 md:p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Recent Applications
              </h2>
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-full">
                {filteredApplications.length} total
              </span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {filteredApplications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {searchQuery ? "No matching applications found" : "No applications yet"}
              </div>
            ) : (
              filteredApplications.slice(0, 5).map((app) => (
                <div key={app.id} className="p-2 md:p-3 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                      app.status === "pending" || app.status === "under_review" ? "bg-[hsl(var(--gsis-gold))]" :
                      app.status === "approved" ? "bg-[hsl(var(--gsis-status-good))]" :
                      app.status === "rejected" ? "bg-[hsl(var(--gsis-status-urgent))]" :
                      "bg-[hsl(var(--gsis-status-neutral))]"
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
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10" asChild>
                      <Link to={`/admin/applications/${app.id}`}>
                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {filteredApplications.length > 0 && (
            <div className="p-2 md:p-3 border-t border-border/50">
              <Button variant="outline" size="sm" className="w-full text-xs md:text-sm h-8 border-primary/20 hover:bg-primary/10" asChild>
                <Link to="/admin/applications">View All Applications</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-md border border-border overflow-hidden">
          <div className="p-3 md:p-4 border-b border-border">
            <h2 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Quick Actions
            </h2>
          </div>
          <div className="p-2 md:p-3 grid grid-cols-3 lg:grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex flex-col items-center justify-center gap-2 rounded-md border border-border bg-background p-3 text-center hover:border-primary transition-colors"
              >
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-[11px] md:text-xs font-medium text-foreground leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
