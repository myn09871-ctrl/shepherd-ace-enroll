import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, CalendarCheck, GraduationCap, Bell, FileText, MessageSquare,
  MinusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const absentPct = 100 - attendancePct;
  const outstanding = feesTotal - feesPaid;
  const feeStatus = outstanding <= 0 && feesTotal > 0 ? "Fully Paid" : feesPaid > 0 ? "Partially Paid" : outstanding > 0 ? "Unpaid" : "No Fees";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
      </div>
    );
  }

  const firstName = parentAccount?.parent_name?.split(" ")[0] || "Parent";

  return (
    <div className="space-y-4 max-w-6xl">
      <h2 className="text-[16px] font-bold text-foreground">Welcome, {firstName}!</h2>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Academic Performance */}
        <div className="bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-[#3a6fd8] to-[#4d86eb] px-4 py-2.5 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2} />
            <span className="text-[13px] font-bold text-white">Academic Performance</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] text-muted-foreground">
                Latest Exam Result {latestTerm && <span className="text-foreground/80">- {latestTerm}</span>}
              </p>
              {termAverage != null && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-semibold">
                  Ov {termAverage}%
                </Badge>
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-bold text-foreground leading-none">
                {termAverage != null ? `${termAverage}%` : "—"}
              </span>
              <span className="text-[12px] text-muted-foreground pb-1">Current Average</span>
            </div>
            {/* Grade distribution dots + trend line */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {["A", "B", "C", "D"].map((letter) => {
                  const count = gradeDist[letter] || 0;
                  return (
                    <div key={letter} className="flex flex-col items-center gap-1">
                      <span className="text-[10.5px] font-semibold text-foreground/70">{letter}s</span>
                      <span className="text-[10px] text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
              {/* Mini trend dots */}
              <svg width="120" height="32" viewBox="0 0 120 32" className="text-[#3a6fd8]">
                <polyline
                  points="5,22 25,18 45,14 65,12 85,8 105,5 115,4"
                  fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                />
                {[[5,22],[25,18],[45,14],[65,12],[85,8],[105,5],[115,4]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" />
                ))}
              </svg>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10.5px] text-muted-foreground">Logg.d Inking</span>
              <Button size="sm" className="text-[11px] h-7 px-3 bg-[#3a6fd8] hover:bg-[#2d5bbf] text-white" onClick={() => navigate("/portal/academics")}>
                View All Results
              </Button>
            </div>
          </div>
        </div>

        {/* Attendance This Term */}
        <div className="bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-[#2ea765] to-[#3dc075] px-4 py-2.5 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-white" strokeWidth={2} />
            <span className="text-[13px] font-bold text-white">Attendance This Term</span>
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-bold text-[#2ea765] leading-none">{absentPct}%</span>
                  <div className="leading-tight">
                    <p className="text-[12px] text-foreground font-medium">Current Days Present</p>
                    <p className="text-[11px] text-muted-foreground">{attendancePresent} /{attendanceTotal}</p>
                  </div>
                </div>
                <div className="space-y-1 pt-1">
                  {recentAbsences.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">No recent absences</p>
                  ) : (
                    recentAbsences.map(a => (
                      <div key={a.date} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <MinusCircle className="h-3 w-3 text-[#2ea765]" />
                          <span className="text-foreground">{format(new Date(a.date), "MMM d")}</span>
                        </div>
                        <span className="text-muted-foreground">Absent</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Big circular progress */}
              <div className="relative h-[78px] w-[78px] flex-shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="17" fill="none" stroke="#e5f4ec" strokeWidth="4" />
                  <circle cx="20" cy="20" r="17" fill="none" stroke="#2ea765" strokeWidth="4"
                    strokeDasharray={`${(attendancePct / 100) * 106.8} 106.8`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[15px] font-bold text-[#2ea765] leading-none">{attendancePct}%</span>
                  <span className="text-[8px] text-muted-foreground mt-0.5">Attendant</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" className="text-[11px] h-7 px-3 bg-[#3a6fd8] hover:bg-[#2d5bbf] text-white" onClick={() => navigate("/portal/attendance")}>
                View Attendance
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-[#3a6fd8] to-[#4d86eb] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-white" strokeWidth={2} />
              <span className="text-[13px] font-bold text-white">Messages</span>
            </div>
            {unreadMsgCount > 0 && (
              <span className="text-[10px] text-white bg-white/20 rounded px-1.5 py-0.5 font-medium">
                {unreadMsgCount} Not read
              </span>
            )}
          </div>
          <div className="divide-y divide-border/30">
            {messages.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-6">No messages</p>
            ) : (
              messages.slice(0, 4).map(m => (
                <button
                  key={m.id}
                  onClick={() => navigate("/portal/messages")}
                  className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                    !m.is_read && m.sender_type !== "parent" ? "bg-blue-50/40" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MessageSquare className="h-3 w-3 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-semibold text-foreground truncate">{m.subject}</p>
                    <p className="text-[10.5px] text-muted-foreground line-clamp-1">{m.message}</p>
                  </div>
                  <span className="text-[9.5px] text-muted-foreground flex-shrink-0 mt-1">
                    {format(new Date(m.created_at), "MMM d")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right column: Announcements + Fees stacked */}
        <div className="space-y-4">
          {/* Latest Announcements */}
          <div className="bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#f5a623] to-[#f2b748] px-4 py-2.5 flex items-center gap-2">
              <Bell className="h-4 w-4 text-white" strokeWidth={2} />
              <span className="text-[13px] font-bold text-white">Latest Announcements</span>
            </div>
            <div className="p-4 space-y-2">
              {announcements.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-3">No announcements</p>
              ) : (
                announcements.map(a => (
                  <button
                    key={a.id}
                    onClick={() => navigate("/portal/announcements")}
                    className="w-full text-left hover:bg-muted/30 rounded p-1 transition-colors"
                  >
                    <p className="text-[12px] font-semibold text-foreground truncate">{a.title}</p>
                    <p className="text-[10.5px] text-muted-foreground line-clamp-2 mt-0.5">{a.content}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Fees Summary */}
          <div className="bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#d94d3a] to-[#e5664a] px-4 py-2.5 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-white" strokeWidth={2} />
              <span className="text-[13px] font-bold text-white">Fees Summary</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] font-bold text-[#d94d3a] leading-none">
                  GHS {outstanding.toLocaleString()}
                </span>
                <span className="text-[12px] text-muted-foreground">Outstanding</span>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-gradient-to-r from-[#f08a2c] to-[#f5a04a] text-white text-[11px] font-semibold">
                {feeStatus}
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="text-[11px] h-7 px-3 bg-[#3a6fd8] hover:bg-[#2d5bbf] text-white" onClick={() => navigate("/portal/fees")}>
                  View All Fees
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents - full width at bottom */}
      <div className="bg-white rounded-xl border border-border/50 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#d94d3a]" strokeWidth={2} />
            <span className="text-[13px] font-bold text-foreground">Recent Documents</span>
          </div>
          <button
            onClick={() => navigate("/portal/documents")}
            className="text-[10.5px] text-foreground border border-border/60 rounded px-2 py-0.5 hover:bg-white transition-colors"
          >
            Mark All Documents
          </button>
        </div>
        <div className="divide-y divide-border/30">
          {documents.length === 0 ? (
            <p className="text-[11px] text-muted-foreground text-center py-5">No documents available</p>
          ) : (
            documents.map(d => {
              const ext = (d.document_type || "pdf").toLowerCase();
              const colorMap: Record<string, string> = {
                pdf: "text-[#d94d3a]",
                doc: "text-[#3a6fd8]",
                docx: "text-[#3a6fd8]",
                image: "text-[#2ea765]",
              };
              return (
                <a
                  key={d.id}
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <FileText className={`h-4 w-4 flex-shrink-0 ${colorMap[ext] || "text-[#d94d3a]"}`} strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">
                      {d.document_name}
                      {d.created_at && (
                        <span className="text-muted-foreground font-normal"> - {format(new Date(d.created_at), "MMM yyyy")}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground border border-border rounded px-1.5 py-0.5 uppercase">
                    {ext}
                  </span>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PortalDashboard;
