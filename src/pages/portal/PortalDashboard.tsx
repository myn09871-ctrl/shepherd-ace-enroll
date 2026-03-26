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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  termAverage: number | null;
  attendancePercentage: number;
  attendanceDaysPresent: number;
  attendanceDaysTotal: number;
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

interface DashboardMessage {
  id: string;
  subject: string;
  message: string;
  sender_type: string;
  is_read: boolean;
  created_at: string;
}

interface DashboardAnnouncement {
  id: string;
  title: string;
  published_at: string | null;
}

interface DashboardDocument {
  id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  created_at: string;
}

const PortalDashboard = () => {
  const { currentStudent: student, parentAccount } = useParentAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    termAverage: null,
    attendancePercentage: 0,
    attendanceDaysPresent: 0,
    attendanceDaysTotal: 0,
    unreadAnnouncements: 0,
    pendingFees: 0,
  });
  const [gradeBreakdown, setGradeBreakdown] = useState({ A: 0, B: 0, C: 0, D: 0, F: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recentMessages, setRecentMessages] = useState<DashboardMessage[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<DashboardAnnouncement[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<DashboardDocument[]>([]);
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

      // Fetch latest grades for term average + letter distribution
      const { data: gradesData } = await supabase
        .from<{ total_score: number | null; grade_letter: string | null }>("grades")
        .select("total_score, grade_letter")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const validScores = gradesData?.filter((g) => g?.total_score !== null).map((g) => Number(g.total_score)) || [];
      const termAverage = validScores.length > 0 
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
        : null;

      const breakdown = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      gradesData?.forEach((g) => {
        const letter = (g.grade_letter || "").toUpperCase();
        if (letter.startsWith("A")) breakdown.A += 1;
        else if (letter.startsWith("B")) breakdown.B += 1;
        else if (letter.startsWith("C")) breakdown.C += 1;
        else if (letter.startsWith("D")) breakdown.D += 1;
        else breakdown.F += 1;
      });

      const totalBreakdown = Math.max(1, gradesData?.length || 1);
      setGradeBreakdown({
        A: Math.round((breakdown.A / totalBreakdown) * 100),
        B: Math.round((breakdown.B / totalBreakdown) * 100),
        C: Math.round((breakdown.C / totalBreakdown) * 100),
        D: Math.round((breakdown.D / totalBreakdown) * 100),
        F: Math.round((breakdown.F / totalBreakdown) * 100),
      });

      setStats({
        termAverage,
        attendancePercentage,
        attendanceDaysPresent: presentDays,
        attendanceDaysTotal: totalDays || 60,
        unreadAnnouncements,
        pendingFees,
      });

      // Fetch dashboard-specific recent data
      const { data: messagesData } = await supabase
        .from("parent_messages")
        .select("id, subject, message, sender_type, is_read, created_at")
        .eq("parent_account_id", parentAccount?.id || "")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: latestAnnouncementsData } = await supabase
        .from("portal_announcements")
        .select("id, title, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      const { data: recentDocumentsData } = await supabase
        .from("student_documents")
        .select("id, document_type, document_name, file_url, created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentMessages(messagesData || []);
      setLatestAnnouncements(latestAnnouncementsData || []);
      setRecentDocuments(recentDocumentsData || []);

      // Build recent activity
      const activities: RecentActivity[] = [];

      // Recent grades
      const { data: recentGrades } = await supabase
        .from("grades")
        .select("id, total_score, subject_id, posted_at, subjects(name)")
        .eq("student_id", student.id)
        .order("posted_at", { ascending: false })
        .limit(3);

      recentGrades?.forEach((grade) => {
        const parsedGrade = grade as {
          id: string;
          total_score: number;
          subjects?: { name?: string };
          posted_at: string;
        };

        if (parsedGrade.posted_at) {
          activities.push({
            id: parsedGrade.id,
            type: "grade",
            title: `${parsedGrade.subjects?.name || "Subject"} Score Posted`,
            description: `Score: ${parsedGrade.total_score}%`,
            timestamp: parsedGrade.posted_at,
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

  const unreadMessagesCount = recentMessages.filter((m) => !m.is_read && m.sender_type !== "parent").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Academic Performance */}
        <Card className="lg:col-span-8 p-4">
          <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl font-bold">Academic Performance</CardTitle>
              <p className="text-sm text-muted-foreground">Latest Exam Result - {format(new Date(), "MMM yyyy")}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1">Overall</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <p className="text-5xl font-extrabold">{stats.termAverage !== null ? `${stats.termAverage}%` : "—"}</p>
                <p className="text-sm text-muted-foreground">Current Average</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                <p className="text-xs text-muted-foreground">Class avg</p>
                <p className="text-lg font-semibold">{stats.termAverage !== null ? `${Math.max(70, stats.termAverage - 5)}%` : "—"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>Performance</span>
                <span>{stats.termAverage !== null ? `${stats.termAverage}%` : "0%"}</span>
              </div>
              <Progress value={stats.termAverage ?? 0} />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-muted-foreground">A+ to D (keep improving)</span>
              <span className="text-xs text-muted-foreground">Score trend +6%</span>
            </div>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card className="lg:col-span-4 p-4">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Attendance This Term</CardTitle>
            <Badge className={getAttendanceColor(stats.attendancePercentage)}>Top</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-extrabold">{stats.attendancePercentage}%</p>
                <p className="text-sm text-muted-foreground">Current Days Present</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{Math.round((stats.attendancePercentage / 100) * 60)}/60</p>
                <p className="text-xs text-muted-foreground">100 days term est.</p>
              </div>
            </div>

            <div className="space-y-1">
              <Progress value={stats.attendancePercentage} />
              <p className="text-xs text-muted-foreground">Attendance as of today</p>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigate("/portal/attendance")}>View Attendance</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Messages */}
        <Card className="lg:col-span-7 p-4">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Messages</CardTitle>
            <Badge>{unreadMessagesCount} new</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet</p>
            ) : (
              <div className="space-y-2">
                {recentMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => navigate("/portal/messages")}
                    className={`w-full text-left p-3 rounded-lg border ${message.is_read || message.sender_type === "parent" ? "border-border" : "border-primary/40 bg-primary/5"} transition hover:border-primary/60`}
                  >
                    <p className="font-medium truncate">{message.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{message.message}</p>
                    <p className="text-[11px] text-muted-foreground">{format(new Date(message.created_at), "MMM d, yyyy")}</p>
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/portal/messages")}>View All Messages</Button>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="lg:col-span-3 p-4">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Latest Announcements</CardTitle>
            <Badge>{stats.unreadAnnouncements} unread</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet</p>
            ) : (
              latestAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => navigate("/portal/announcements")}> 
                  <p className="font-medium truncate">{announcement.title}</p>
                  <p className="text-[11px] text-muted-foreground">{announcement.published_at ? format(new Date(announcement.published_at), "MMM d") : ""}</p>
                </div>
              ))
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/portal/announcements")}>View All</Button>
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card className="lg:col-span-2 p-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Fees Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-3xl font-extrabold text-rose-600">GH₵{stats.pendingFees.toLocaleString()}</p>
            <Badge className={`px-3 py-1 ${stats.pendingFees > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
              {stats.pendingFees > 0 ? "Partially Paid" : "Paid"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => navigate("/portal/fees")}>View All Fees</Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card className="p-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Documents</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/portal/documents")}>View All</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents available</p>
          ) : (
            recentDocuments.slice(0, 5).map((document) => (
              <Link
                key={document.id}
                to={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{document.document_name}</p>
                  <p className="text-xs text-muted-foreground">{document.document_type.replace(/_/g, " ")}</p>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(document.created_at), "MMM d")}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalDashboard;

