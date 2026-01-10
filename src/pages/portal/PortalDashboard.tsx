import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      {student && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {student.first_name[0]}{student.surname[0]}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold text-foreground">
                  {student.first_name} {student.middle_name || ""} {student.surname}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <Badge variant="secondary">{student.student_id}</Badge>
                  <Badge variant="outline">{student.current_class}</Badge>
                  <Badge variant="outline">{calculateAge(student.date_of_birth)} years old</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Academic Year: {student.academic_year}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Term Average</p>
                <p className="text-lg font-bold text-foreground">
                  {stats.termAverage !== null ? `${stats.termAverage}%` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getAttendanceColor(stats.attendancePercentage)}`}>
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="text-lg font-bold text-foreground">{stats.attendancePercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg relative">
                <Bell className="h-5 w-5 text-orange-600" />
                {stats.unreadAnnouncements > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                    {stats.unreadAnnouncements}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unread</p>
                <p className="text-lg font-bold text-foreground">{stats.unreadAnnouncements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stats.pendingFees > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                <CreditCard className={`h-5 w-5 ${stats.pendingFees > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Fees</p>
                <p className="text-lg font-bold text-foreground">
                  {stats.pendingFees > 0 ? `GH₵${stats.pendingFees.toLocaleString()}` : "Paid"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/portal/academics">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-xs">Report Cards</span>
              </Button>
            </Link>
            <Link to="/portal/attendance">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-xs">Attendance</span>
              </Button>
            </Link>
            <Link to="/portal/timetable">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-xs">Timetable</span>
              </Button>
            </Link>
            <Link to="/portal/documents">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-xs">Documents</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-full shrink-0 ${
                      activity.type === "grade" ? "bg-blue-100" :
                      activity.type === "announcement" ? "bg-orange-100" :
                      activity.type === "attendance" ? "bg-green-100" :
                      "bg-purple-100"
                    }`}>
                      {activity.type === "grade" && <GraduationCap className="h-3 w-3 text-blue-600" />}
                      {activity.type === "announcement" && <Bell className="h-3 w-3 text-orange-600" />}
                      {activity.type === "attendance" && <Calendar className="h-3 w-3 text-green-600" />}
                      {activity.type === "fee" && <CreditCard className="h-3 w-3 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(activity.timestamp), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/portal/announcements" className="block mt-4">
              <Button variant="ghost" size="sm" className="w-full">
                View All
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
