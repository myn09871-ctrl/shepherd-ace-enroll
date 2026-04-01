import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, Calendar, GraduationCap, Bell, ChevronRight, FileText, MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const PortalDashboard = () => {
  const { currentStudent: student, parentAccount } = useParentAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
    const { data } = await supabase.from("fees").select("amount, is_paid").eq("student_id", student!.id);
    const total = data?.reduce((s, f) => s + Number(f.amount), 0) || 0;
    const paid = data?.filter(f => f.is_paid).reduce((s, f) => s + Number(f.amount), 0) || 0;
    setFeesTotal(total);
    setFeesPaid(paid);
  };

  const fetchAttendance = async () => {
    const yr = new Date().getFullYear();
    const { data } = await supabase.from("attendance").select("status, date").eq("student_id", student!.id)
      .gte("date", `${yr}-01-01`).order("date", { ascending: false });
    const total = data?.length || 0;
    const present = data?.filter(a => a.status === "present" || a.status === "late").length || 0;
    setAttendanceTotal(total);
    setAttendancePresent(present);
    setRecentAbsences(data?.filter(a => a.status === "absent").slice(0, 2) || []);
  };

  const fetchGrades = async () => {
    const { data } = await supabase.from("grades").select("total_score, grade_letter, term, academic_year")
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
    const { data } = await supabase.from("portal_announcements").select("id, title, content, published_at, category")
      .eq("is_published", true).order("published_at", { ascending: false }).limit(2);
    setAnnouncements(data || []);
  };

  const fetchMessages = async () => {
    if (!parentAccount) return;
    const { data } = await supabase.from("parent_messages").select("id, subject, message, created_at, sender_type, is_read")
      .eq("parent_account_id", parentAccount.id).order("created_at", { ascending: false }).limit(4);
    setMessages(data || []);
    setUnreadMsgCount(data?.filter(m => !m.is_read && m.sender_type !== "parent").length || 0);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase.from("student_documents").select("id, document_name, document_type, file_url, created_at")
      .eq("student_id", student!.id).order("created_at", { ascending: false }).limit(3);
    setDocuments(data || []);
  };

  const attendancePct = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 100;
  const outstanding = feesTotal - feesPaid;
  const feeStatus = outstanding <= 0 ? "Fully Paid" : feesPaid > 0 ? "Partially Paid" : "Unpaid";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Greeting */}
      <h2 className="text-[15px] font-bold text-foreground">
        Welcome, {parentAccount?.parent_name?.split(" ")[0]}!
      </h2>

      {/* 2x2 Card Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Fees Summary */}
        <div className="bg-white rounded-lg border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-white">
              <CreditCard className="h-3 w-3" />
              <span className="text-[10px] font-bold">Fees Summary</span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div>
              <p className="text-[16px] font-bold text-foreground">
                <span className="text-[11px] font-semibold">GHS </span>{outstanding.toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground">Outstanding</p>
            </div>
            <Badge
              variant={outstanding <= 0 ? "default" : "destructive"}
              className="text-[9px] h-5 px-2"
            >
              {feeStatus}
            </Badge>
            <Button
              variant="outline" size="sm"
              className="w-full text-[10px] h-7"
              onClick={() => navigate("/portal/fees")}
            >
              View All Fees
            </Button>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-lg border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-white">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-bold">Attendance</span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[14px] font-bold text-foreground">{attendancePct}%</p>
                <p className="text-[9px] text-muted-foreground">{attendancePresent}/{attendanceTotal} Current Days Present</p>
              </div>
              {/* Circular progress */}
              <div className="relative h-10 w-10 flex-shrink-0">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#16a34a" strokeWidth="3"
                    strokeDasharray={`${attendancePct * 0.94} 94`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-green-600">{attendancePct}%</span>
              </div>
            </div>
            {recentAbsences.map(a => (
              <div key={a.date} className="flex items-center justify-between">
                <span className="text-[9px] text-foreground">⊘ {format(new Date(a.date), "MMM d")}</span>
                <span className="text-[9px] text-red-500">Absent</span>
              </div>
            ))}
            <Button
              variant="outline" size="sm"
              className="w-full text-[10px] h-7"
              onClick={() => navigate("/portal/attendance")}
            >
              View Attendance
            </Button>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="bg-white rounded-lg border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-white">
              <GraduationCap className="h-3 w-3" />
              <span className="text-[10px] font-bold">Academic Performance</span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {latestTerm && (
              <p className="text-[9px] text-muted-foreground">Latest Exam Result - {latestTerm}</p>
            )}
            <div>
              <span className="text-[18px] font-bold text-foreground">{termAverage != null ? `${termAverage}%` : "—"}</span>
              <span className="text-[9px] text-muted-foreground ml-1">Current Average</span>
            </div>
            {Object.keys(gradeDist).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(gradeDist).map(([letter, count]) => (
                  <span key={letter} className="text-[8px] text-muted-foreground">{letter}s</span>
                ))}
                <div className="flex gap-0.5 ml-1">
                  {Object.entries(gradeDist).map(([letter, count]) => (
                    Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                      <span key={`${letter}-${i}`} className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                    ))
                  ))}
                </div>
              </div>
            )}
            <Button
              variant="outline" size="sm"
              className="w-full text-[10px] h-7"
              onClick={() => navigate("/portal/academics")}
            >
              View All Results
            </Button>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-lg border border-border/50 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-white">
              <Bell className="h-3 w-3" />
              <span className="text-[10px] font-bold">Latest Announcements</span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {announcements.length === 0 ? (
              <p className="text-[10px] text-muted-foreground text-center py-3">No announcements</p>
            ) : (
              announcements.map(a => (
                <div
                  key={a.id}
                  className="cursor-pointer hover:bg-muted/30 rounded p-1 transition-colors"
                  onClick={() => navigate("/portal/announcements")}
                >
                  <p className="text-[10px] font-semibold text-foreground truncate">📢 {a.title}</p>
                  <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Messages & Documents Tabs */}
      <Tabs defaultValue="messages">
        <TabsList className="w-full grid grid-cols-2 h-8">
          <TabsTrigger value="messages" className="text-[10px] gap-1 h-7">
            <MessageSquare className="h-3 w-3" />
            Messages
            {unreadMsgCount > 0 && (
              <Badge variant="destructive" className="text-[8px] h-3.5 px-1 ml-0.5">{unreadMsgCount} Net read</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-[10px] gap-1 h-7">
            <FileText className="h-3 w-3" />
            Recent Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-1.5">
          <div className="bg-white rounded-lg border border-border/50">
            <div className="divide-y divide-border/30">
              {messages.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-6">No messages</p>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                      !m.is_read && m.sender_type !== "parent" ? "bg-blue-50/50" : "hover:bg-muted/30"
                    }`}
                    onClick={() => navigate("/portal/messages")}
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{m.subject}</p>
                      <p className="text-[9px] text-muted-foreground line-clamp-1">{m.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[8px] text-muted-foreground">
                        {format(new Date(m.created_at), "MMM d")}
                      </span>
                      {m.sender_type !== "parent" && (
                        <Badge variant="outline" className="text-[7px] h-3.5 px-1">View PDF</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-1.5">
          <div className="bg-white rounded-lg border border-border/50">
            <div className="divide-y divide-border/30">
              {documents.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-6">No documents</p>
              ) : (
                documents.map(d => (
                  <div key={d.id} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/30">
                    <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <FileText className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{d.document_name}</p>
                      <p className="text-[9px] text-muted-foreground">{d.document_type}</p>
                    </div>
                    <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                      <Badge variant="outline" className="text-[8px] h-5 px-1.5 cursor-pointer">{d.document_type?.toUpperCase() || "PDF"}</Badge>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortalDashboard;
