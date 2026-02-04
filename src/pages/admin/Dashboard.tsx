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
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-4 md:p-6 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg md:text-2xl font-heading font-bold">Welcome Back!</h1>
            <p className="text-xs md:text-sm text-primary-foreground/80">Good Shepherd International School Admin Portal</p>
          </div>
          <ExpandableSearch 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search applications..."
          />
        </div>
      </div>

      {/* Stats Cards with blue theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
          <FileText className="h-5 w-5 md:h-6 md:w-6 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.todayCount}</p>
          <p className="text-xs md:text-sm text-white/80">Today's Applications</p>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 md:p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
          <Clock className="h-5 w-5 md:h-6 md:w-6 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.pendingCount}</p>
          <p className="text-xs md:text-sm text-white/80">Pending Review</p>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-3 md:p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
          <TrendingUp className="h-5 w-5 md:h-6 md:w-6 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.approvedThisWeek}</p>
          <p className="text-xs md:text-sm text-white/80">Approved This Week</p>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/80 p-3 md:p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
          <Users className="h-5 w-5 md:h-6 md:w-6 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.totalEnrolled}</p>
          <p className="text-xs md:text-sm text-white/80">Total Enrolled</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gradient-to-br from-card via-card to-primary/5 rounded-xl border border-border/50 shadow-card overflow-hidden">
          <div className="p-3 md:p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
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
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-card ${
                      app.status === "pending" ? "bg-blue-500 ring-blue-500/30" :
                      app.status === "under_review" ? "bg-yellow-500 ring-yellow-500/30" :
                      app.status === "approved" ? "bg-green-500 ring-green-500/30" :
                      app.status === "enrolled" ? "bg-primary ring-primary/30" :
                      "bg-red-500 ring-red-500/30"
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
            <div className="p-2 md:p-3 border-t border-border/50 bg-gradient-to-r from-transparent to-primary/5">
              <Button variant="outline" size="sm" className="w-full text-xs md:text-sm h-8 border-primary/20 hover:bg-primary/10" asChild>
                <Link to="/admin/applications">View All Applications</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-card via-card to-secondary/5 rounded-xl border border-border/50 shadow-card overflow-hidden">
          <div className="p-3 md:p-4 border-b border-border bg-gradient-to-r from-secondary/5 to-transparent">
            <h2 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-secondary" />
              Quick Actions
            </h2>
          </div>
          <div className="p-2 md:p-3 space-y-1 md:space-y-2">
            {quickActions.map((action, index) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 text-xs md:text-sm h-9 md:h-10 hover:bg-primary/10 hover:text-primary transition-all"
                asChild
              >
                <Link to={action.href}>
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <action.icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
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
