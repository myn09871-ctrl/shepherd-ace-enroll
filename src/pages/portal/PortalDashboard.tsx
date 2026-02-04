import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Calendar, 
  Bell, 
  CreditCard, 
  TrendingUp,
  Clock,
  FileText,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  termAverage: number | null;
  attendancePercentage: number;
  unreadAnnouncements: number;
  pendingFees: number;
}

interface RecentActivity {
  id: string;
  type: "grade" | "announcement" | "attendance" | "fee";
  title: string;
  description: string;
  timestamp: string;
}

const PortalDashboard = () => {
  const { currentStudent: student, parentAccount } = useParentAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    termAverage: null,
    attendancePercentage: 0,
    unreadAnnouncements: 0,
    pendingFees: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) {
      fetchDashboardData();
    }
  }, [student]);

  const fetchDashboardData = async () => {
    if (!student) return;

    try {
      // Fetch attendance stats
      const currentYear = new Date().getFullYear();
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", student.id)
        .gte("date", `${currentYear}-01-01`);

      const totalDays = attendanceData?.length || 0;
      const presentDays = attendanceData?.filter(a => a.status === "present" || a.status === "late").length || 0;
      const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

      // Fetch pending fees
      const { data: feesData } = await supabase
        .from("fees")
        .select("amount")
        .eq("student_id", student.id)
        .eq("is_paid", false);

      const pendingFees = feesData?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;

      // Fetch unread announcements
      const { data: announcementsData } = await supabase
        .from("portal_announcements")
        .select("id")
        .eq("is_published", true);

      const { data: acknowledgedData } = await supabase
        .from("announcement_acknowledgments")
        .select("announcement_id")
        .eq("parent_account_id", parentAccount?.id || "");

      const acknowledgedIds = new Set(acknowledgedData?.map(a => a.announcement_id) || []);
      const unreadAnnouncements = announcementsData?.filter(a => !acknowledgedIds.has(a.id)).length || 0;

      // Fetch latest grades for term average
      const { data: gradesData } = await supabase
        .from("grades")
        .select("total_score")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const validScores = gradesData?.filter(g => g.total_score !== null).map(g => Number(g.total_score)) || [];
      const termAverage = validScores.length > 0 
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
        : null;

      setStats({
        termAverage,
        attendancePercentage,
        unreadAnnouncements,
        pendingFees,
      });

      // Build recent activity
      const activities: RecentActivity[] = [];

      // Recent grades
      const { data: recentGrades } = await supabase
        .from("grades")
        .select("id, total_score, subject_id, posted_at, subjects(name)")
        .eq("student_id", student.id)
        .order("posted_at", { ascending: false })
        .limit(3);

      recentGrades?.forEach((grade: any) => {
        if (grade.posted_at) {
          activities.push({
            id: grade.id,
            type: "grade",
            title: `${grade.subjects?.name || "Subject"} Score Posted`,
            description: `Score: ${grade.total_score}%`,
            timestamp: grade.posted_at,
          });
        }
      });

      // Recent announcements
      const { data: recentAnnouncements } = await supabase
        .from("portal_announcements")
        .select("id, title, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      recentAnnouncements?.forEach(announcement => {
        if (announcement.published_at) {
          activities.push({
            id: announcement.id,
            type: "announcement",
            title: announcement.title,
            description: "New announcement",
            timestamp: announcement.published_at,
          });
        }
      });

      // Sort by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 75) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleActivityClick = (activity: RecentActivity) => {
    if (activity.type === "announcement") {
      navigate("/portal/announcements");
    } else if (activity.type === "grade") {
      navigate("/portal/academics");
    } else if (activity.type === "fee") {
      navigate("/portal/fees");
    } else if (activity.type === "attendance") {
      navigate("/portal/attendance");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Blue Gradient */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-accent p-4 md:p-6 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        
        {student && (
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-4 ring-white/30">
              {student.photo_url ? (
                <img src={student.photo_url} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">
                  {student.first_name[0]}{student.surname[0]}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-white/80">Welcome back,</p>
              <h1 className="text-xl md:text-2xl font-bold">
                {student.first_name} {student.middle_name || ""} {student.surname}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">{student.student_id}</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">{student.current_class}</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">{calculateAge(student.date_of_birth)} years</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats - Blue themed */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-3 translate-x-3" />
          <TrendingUp className="h-5 w-5 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">
            {stats.termAverage !== null ? `${stats.termAverage}%` : "—"}
          </p>
          <p className="text-xs text-white/80">Term Average</p>
        </div>
        
        <div className={`relative overflow-hidden rounded-xl p-3 md:p-4 text-white shadow-lg ${
          stats.attendancePercentage >= 90 
            ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
            : stats.attendancePercentage >= 75 
            ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
            : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-3 translate-x-3" />
          <Calendar className="h-5 w-5 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.attendancePercentage}%</p>
          <p className="text-xs text-white/80">Attendance</p>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-3 md:p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-3 translate-x-3" />
          <div className="relative">
            <Bell className="h-5 w-5 mb-2 opacity-80" />
            {stats.unreadAnnouncements > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full text-[10px] text-orange-600 font-bold flex items-center justify-center">
                {stats.unreadAnnouncements}
              </span>
            )}
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats.unreadAnnouncements}</p>
          <p className="text-xs text-white/80">Unread</p>
        </div>
        
        <div className={`relative overflow-hidden rounded-xl p-3 md:p-4 text-white shadow-lg ${
          stats.pendingFees > 0 
            ? 'bg-gradient-to-br from-red-500 to-rose-600' 
            : 'bg-gradient-to-br from-emerald-500 to-green-600'
        }`}>
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-3 translate-x-3" />
          <CreditCard className="h-5 w-5 mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">
            {stats.pendingFees > 0 ? `GH₵${stats.pendingFees.toLocaleString()}` : "Paid ✓"}
          </p>
          <p className="text-xs text-white/80">Fees Status</p>
        </div>
      </div>

      {/* Quick Links & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links - Blue themed */}
        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/10">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/portal/academics">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs">Report Cards</span>
              </Button>
            </Link>
            <Link to="/portal/attendance">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs">Attendance</span>
              </Button>
            </Link>
            <Link to="/portal/timetable">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs">Timetable</span>
              </Button>
            </Link>
            <Link to="/portal/documents">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 hover:bg-primary/10 hover:border-primary/30 transition-all">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs">Documents</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity - Blue themed */}
        <Card className="bg-gradient-to-br from-card via-card to-secondary/5 border-secondary/10">
          <CardHeader className="pb-3 bg-gradient-to-r from-secondary/5 to-transparent">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-secondary/10">
                <Bell className="h-4 w-4 text-secondary" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/50 to-transparent hover:from-primary/10 hover:to-transparent transition-all cursor-pointer border border-transparent hover:border-primary/20"
                    onClick={() => handleActivityClick(activity)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleActivityClick(activity);
                      }
                    }}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      activity.type === "grade" ? "bg-blue-500/10" :
                      activity.type === "announcement" ? "bg-orange-500/10" :
                      activity.type === "attendance" ? "bg-green-500/10" :
                      "bg-purple-500/10"
                    }`}>
                      {activity.type === "grade" && <GraduationCap className="h-4 w-4 text-blue-600" />}
                      {activity.type === "announcement" && <Bell className="h-4 w-4 text-orange-600" />}
                      {activity.type === "attendance" && <Calendar className="h-4 w-4 text-green-600" />}
                      {activity.type === "fee" && <CreditCard className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {format(new Date(activity.timestamp), "MMM d")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/portal/announcements" className="block mt-4">
              <Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary">
                View All Activity
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortalDashboard;
