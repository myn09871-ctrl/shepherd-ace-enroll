import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, Calendar, GraduationCap, Bell, ChevronRight, FileText, MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const PortalDashboard = () => {
  const { currentStudent: student, parentAccount } = useParentAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data states
  const [feesTotal, setFeesTotal] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [attendancePresent, setAttendancePresent] = useState(0);
  const [attendanceTotal, setAttendanceTotal] = useState(0);
  const [recentAbsences, setRecentAbsences] = useState<any[]>([]);
  const [termAverage, setTermAverage] = useState<number | null>(null);
  const [gradeDist, setGradeDist] = useState<Record<string, number>>({});
  const [latestTerm, setLatestTerm] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    if (student) fetchAll();
  }, [student]);

  const fetchAll = async () => {
    if (!student) return;
    setLoading(true);
    try {
      await Promise.all([
        fetchFees(), fetchAttendance(), fetchGrades(),
        fetchAnnouncements(), fetchMessages(), fetchDocuments(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    const { data } = await supabase
      .from("fees").select("amount, is_paid").eq("student_id", student!.id);
    const total = data?.reduce((s, f) => s + Number(f.amount), 0) || 0;
    const paid = data?.filter(f => f.is_paid).reduce((s, f) => s + Number(f.amount), 0) || 0;
    setFeesTotal(total);
    setFeesPaid(paid);
  };

  const fetchAttendance = async () => {
    const yr = new Date().getFullYear();
    const { data } = await supabase
      .from("attendance").select("status, date").eq("student_id", student!.id)
      .gte("date", `${yr}-01-01`).order("date", { ascending: false });
    const total = data?.length || 0;
    const present = data?.filter(a => a.status === "present" || a.status === "late").length || 0;
    setAttendanceTotal(total);
    setAttendancePresent(present);
    setRecentAbsences(data?.filter(a => a.status === "absent").slice(0, 3) || []);
  };

  const fetchGrades = async () => {
    const { data } = await supabase
      .from("grades").select("total_score, grade_letter, term, academic_year")
      .eq("student_id", student!.id).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setLatestTerm(`${data[0].term} - ${data[0].academic_year}`);
      const scores = data.filter(g => g.total_score != null).map(g => Number(g.total_score));
      setTermAverage(scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null);
      const dist: Record<string, number> = {};
      data.forEach(g => { if (g.grade_letter) dist[g.grade_letter] = (dist[g.grade_letter] || 0) + 1; });
      setGradeDist(dist);
    }
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("portal_announcements").select("id, title, content, published_at, category")
      .eq("is_published", true).order("published_at", { ascending: false }).limit(3);
    setAnnouncements(data || []);
  };

  const fetchMessages = async () => {
    if (!parentAccount) return;
    const { data } = await supabase
      .from("parent_messages").select("id, subject, message, created_at, sender_type, is_read")
      .eq("parent_account_id", parentAccount.id).order("created_at", { ascending: false }).limit(5);
    setMessages(data || []);
    setUnreadMsgCount(data?.filter(m => !m.is_read && m.sender_type !== "parent").length || 0);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from("student_documents").select("id, document_name, document_type, file_url, created_at")
      .eq("student_id", student!.id).order("created_at", { ascending: false }).limit(5);
    setDocuments(data || []);
  };

  const attendancePct = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 100;
  const outstanding = feesTotal - feesPaid;
  const feeStatus = outstanding <= 0 ? "Fully Paid" : feesPaid > 0 ? "Partially Paid" : "Unpaid";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-4">
      {/* Greeting */}
      <h2 className="text-lg font-bold text-foreground">
        Welcome, {parentAccount?.parent_name?.split(" ")[0]}! 👋
      </h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Fees Summary */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2">
            <div className="flex items-center gap-2 text-white">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-semibold">Fees Summary</span>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Outstanding</p>
              <p className="text-2xl font-bold text-foreground">
                GH₵{outstanding.toLocaleString()}
              </p>
            </div>
            <Badge variant={outstanding <= 0 ? "default" : "destructive"} className="text-[10px]">
              {feeStatus}
            </Badge>
            <Button
              variant="outline" size="sm"
              className="w-full text-xs mt-1"
              onClick={() => navigate("/portal/fees")}
            >
              View All Fees <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-semibold">Attendance</span>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-foreground">{attendancePct}%</p>
              <p className="text-[10px] text-muted-foreground mb-1">
                {attendancePresent}/{attendanceTotal} days
              </p>
            </div>
            <Progress value={attendancePct} className="h-2" />
            {recentAbsences.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground">Recent absences:</p>
                {recentAbsences.map(a => (
                  <p key={a.date} className="text-[10px] text-red-500">
                    • {format(new Date(a.date), "MMM d, yyyy")}
                  </p>
                ))}
              </div>
            )}
            <Button
              variant="outline" size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/portal/attendance")}
            >
              View Attendance <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Academic Performance */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="h-4 w-4" />
              <span className="text-xs font-semibold">Academic Performance</span>
            </div>
          </div>
          <CardContent className="p-4 space-y-3">
            {latestTerm && (
              <p className="text-[10px] text-muted-foreground">{latestTerm}</p>
            )}
            <p className="text-2xl font-bold text-foreground">
              {termAverage != null ? `${termAverage}%` : "—"}
            </p>
            {Object.keys(gradeDist).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(gradeDist).map(([letter, count]) => (
                  <span
                    key={letter}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium"
                  >
                    {letter}: {count}
                  </span>
                ))}
              </div>
            )}
            <Button
              variant="outline" size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/portal/academics")}
            >
              View All Results <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="overflow-hidden border shadow-sm">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2">
            <div className="flex items-center gap-2 text-white">
              <Bell className="h-4 w-4" />
              <span className="text-xs font-semibold">Latest Announcements</span>
            </div>
          </div>
          <CardContent className="p-4 space-y-2">
            {announcements.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No announcements</p>
            ) : (
              announcements.map(a => (
                <div
                  key={a.id}
                  className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate("/portal/announcements")}
                >
                  <p className="text-xs font-medium truncate">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{a.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages & Documents Tabs */}
      <Tabs defaultValue="messages">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="messages" className="text-xs gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Messages
            {unreadMsgCount > 0 && (
              <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-1">{unreadMsgCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-2">
          <Card className="border shadow-sm">
            <CardContent className="p-3 space-y-2">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No messages</p>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                      !m.is_read && m.sender_type !== "parent" ? "bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => navigate("/portal/messages")}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{m.subject}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{m.message}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(m.created_at), "MMM d")}
                    </span>
                  </div>
                ))
              )}
              <Button
                variant="ghost" size="sm"
                className="w-full text-xs text-primary"
                onClick={() => navigate("/portal/messages")}
              >
                View All Messages
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-2">
          <Card className="border shadow-sm">
            <CardContent className="p-3 space-y-2">
              {documents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No documents</p>
              ) : (
                documents.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <FileText className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{d.document_name}</p>
                      <p className="text-[10px] text-muted-foreground">{d.document_type}</p>
                    </div>
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm" className="text-[10px] h-7">
                        View
                      </Button>
                    </a>
                  </div>
                ))
              )}
              <Button
                variant="ghost" size="sm"
                className="w-full text-xs text-primary"
                onClick={() => navigate("/portal/documents")}
              >
                View All Documents
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortalDashboard;
