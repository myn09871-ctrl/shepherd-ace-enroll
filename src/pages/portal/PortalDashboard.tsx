import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  CalendarCheck2,
  GraduationCap,
  FileText,
  MessageSquare,
  Megaphone,
  CircleAlert,
  Clock3,
  ChevronRight,
} from "lucide-react";
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
        fetchFees(),
        fetchAttendance(),
        fetchGrades(),
        fetchAnnouncements(),
        fetchMessages(),
        fetchDocuments(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    const { data } = await supabase.from("fees").select("amount, is_paid").eq("student_id", student!.id);
    const total = data?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
    const paid = data?.filter((fee) => fee.is_paid).reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
    setFeesTotal(total);
    setFeesPaid(paid);
  };

  const fetchAttendance = async () => {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from("attendance")
      .select("status, date")
      .eq("student_id", student!.id)
      .gte("date", `${year}-01-01`)
      .order("date", { ascending: false });

    const total = data?.length || 0;
    const present = data?.filter((entry) => entry.status === "present" || entry.status === "late").length || 0;
    setAttendanceTotal(total);
    setAttendancePresent(present);
    setRecentAbsences(data?.filter((entry) => entry.status === "absent").slice(0, 2) || []);
  };

  const fetchGrades = async () => {
    const { data } = await supabase
      .from("grades")
      .select("total_score, grade_letter, term, academic_year")
      .eq("student_id", student!.id)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setLatestTerm(`${data[0].term} ${data[0].academic_year}`);
      const scores = data.filter((grade) => grade.total_score != null).map((grade) => Number(grade.total_score));
      setTermAverage(scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null);
      const distribution: Record<string, number> = {};
      data.forEach((grade) => {
        if (grade.grade_letter) distribution[grade.grade_letter] = (distribution[grade.grade_letter] || 0) + 1;
      });
      setGradeDist(distribution);
    }
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("portal_announcements")
      .select("id, title, content, published_at, category")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(2);
    setAnnouncements(data || []);
  };

  const fetchMessages = async () => {
    if (!parentAccount) return;
    const { data } = await supabase
      .from("parent_messages")
      .select("id, subject, message, created_at, sender_type, is_read")
      .eq("parent_account_id", parentAccount.id)
      .order("created_at", { ascending: false })
      .limit(4);
    setMessages(data || []);
    setUnreadMsgCount(data?.filter((message) => !message.is_read && message.sender_type !== "parent").length || 0);
  };

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from("student_documents")
      .select("id, document_name, document_type, file_url, created_at")
      .eq("student_id", student!.id)
      .order("created_at", { ascending: false })
      .limit(3);
    setDocuments(data || []);
  };

  const attendancePct = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 100;
  const absentPct = 100 - attendancePct;
  const outstanding = Math.max(feesTotal - feesPaid, 0);
  const feeStatus = outstanding <= 0 && feesTotal > 0 ? "Fully Paid" : feesPaid > 0 ? "Partially Paid" : outstanding > 0 ? "Unpaid" : "No Fees";
  const firstName = parentAccount?.parent_name?.split(" ")[0] || "Parent";

  const gradeSummary = [
    { label: "A+", count: (gradeDist["A+"] || 0) + (gradeDist["A"] || 0) },
    { label: "Bs", count: gradeDist["B"] || 0 },
    { label: "Cs", count: gradeDist["C"] || 0 },
    { label: "Ds", count: gradeDist["D"] || 0 },
  ];
  const trendPoints = [
    [0, 18],
    [14, 17],
    [28, 16],
    [42, 13],
    [56, 11],
    [70, 8],
    [84, 5],
    [98, 3],
  ];

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div>
        <h2 className="text-[16px] font-bold text-[hsl(var(--dashboard-ink))] md:text-[17px]">Welcome, {firstName}!</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.35fr_1fr_0.95fr] md:auto-rows-min">
        <section className="parent-card order-3 overflow-hidden rounded-2xl md:order-1">
          <div className="parent-card-header-blue flex items-center gap-2 px-4 py-3 text-primary-foreground">
            <GraduationCap className="h-4.5 w-4.5" strokeWidth={2.1} />
            <h3 className="text-[12.5px] font-bold">Academic Performance</h3>
          </div>
          <div className="parent-soft-blue space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-[hsl(var(--dashboard-ink))]">
                Latest Exam Result
                {latestTerm ? <span className="font-medium text-[hsl(var(--dashboard-soft-ink))]"> - {latestTerm}</span> : null}
              </p>
              <span className="parent-pill rounded-lg px-2 py-1 text-[9.5px] font-semibold text-primary">Cy 2029</span>
            </div>

            <div className="rounded-xl bg-card px-4 py-4 shadow-sm">
              <div className="flex items-end gap-2">
                <span className="text-[28px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">
                  {termAverage != null ? `${termAverage}%` : "—"}
                </span>
                <span className="pb-1 text-[12px] text-[hsl(var(--dashboard-ink))]">Current Average</span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="flex items-center gap-3 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
                  {gradeSummary.map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="font-semibold">{item.label}</p>
                      <p>{item.count}</p>
                    </div>
                  ))}
                </div>

                <svg width="124" height="34" viewBox="0 0 124 34" className="flex-shrink-0">
                  <polyline
                    points={trendPoints.map(([x, y]) => `${x + 8},${y + 6}`).join(" ")}
                    fill="none"
                    stroke="hsl(var(--parent-blue-end))"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {trendPoints.map(([x, y], index) => (
                    <circle
                      key={index}
                      cx={x + 8}
                      cy={y + 6}
                      r="4"
                      fill={index < 4 ? "hsl(var(--parent-orange-start))" : "hsl(var(--parent-blue-start))"}
                    />
                  ))}
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Logg.d Inking</span>
              <Button size="sm" className="h-8 rounded-xl px-4 text-[11px] font-semibold" onClick={() => navigate("/portal/academics")}>
                View All Results
              </Button>
            </div>
          </div>
        </section>

        <section className="parent-card order-2 overflow-hidden rounded-2xl md:order-2 md:col-span-2">
          <div className="parent-card-header-green flex items-center gap-2 px-4 py-3 text-primary-foreground">
            <CalendarCheck2 className="h-4.5 w-4.5" strokeWidth={2.1} />
            <h3 className="text-[12.5px] font-bold">Attendance This Term</h3>
          </div>
          <div className="parent-soft-green p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-end gap-3">
                  <span className="text-[32px] font-bold leading-none text-[hsl(var(--parent-green-end))]">{absentPct}%</span>
                  <div className="pb-1 leading-tight">
                    <p className="text-[11px] font-semibold text-[hsl(var(--dashboard-ink))]">Current Days Present</p>
                    <p className="text-[10px] text-[hsl(var(--dashboard-soft-ink))]">
                      {attendancePresent}/{attendanceTotal || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-border/70 pt-3">
                  {recentAbsences.length === 0 ? (
                    <p className="text-[11px] text-[hsl(var(--dashboard-soft-ink))]">No recent absences</p>
                  ) : (
                    recentAbsences.map((absence) => (
                      <div key={absence.date} className="flex items-center gap-3 text-[11px]">
                        <CircleAlert className="h-4 w-4 text-[hsl(var(--parent-green-end))]" strokeWidth={2.1} />
                        <span className="min-w-[92px] font-medium text-[hsl(var(--dashboard-ink))]">
                          {format(new Date(absence.date), "MMM d")}
                        </span>
                        <span className="text-[hsl(var(--dashboard-soft-ink))]">Absent</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="relative flex h-[104px] w-[104px] flex-shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--parent-green-soft))" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="hsl(var(--parent-green-start))"
                    strokeWidth="4"
                    strokeDasharray={`${(attendancePct / 100) * 113} 113`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[15px] font-bold leading-none text-[hsl(var(--parent-green-end))]">{attendancePct}%</span>
                  <span className="mt-1 text-[9px] font-medium text-[hsl(var(--dashboard-soft-ink))]">Attendant</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <Button size="sm" className="h-8 rounded-xl px-4 text-[11px] font-semibold" onClick={() => navigate("/portal/attendance")}>
                View Attendance
              </Button>
            </div>
          </div>
        </section>

        <section className="parent-card order-5 overflow-hidden rounded-2xl md:order-3 md:row-span-2">
          <div className="parent-card-header-blue flex items-center justify-between gap-2 px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5" strokeWidth={2.1} />
              <h3 className="text-[12.5px] font-bold">Messages</h3>
            </div>
            <span className="rounded-lg bg-card/85 px-2 py-1 text-[9.5px] font-semibold text-primary">
              {unreadMsgCount} Not read
            </span>
          </div>
          <div className="space-y-2 p-3">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-[11px] text-muted-foreground">
                No messages
              </div>
            ) : (
              messages.map((message, index) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => navigate("/portal/messages")}
                  className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/40"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                      index === 0 ? "bg-[hsl(var(--parent-blue-soft))] text-[hsl(var(--parent-blue-end))]" : "bg-[hsl(var(--parent-orange-soft))] text-[hsl(var(--parent-orange-end))]"
                    }`}
                  >
                    <MessageSquare className="h-4.5 w-4.5" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 flex-1 border-b border-border/60 pb-2 last:border-b-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12.5px] font-bold text-[hsl(var(--dashboard-ink))]">{message.subject}</p>
                      <span className="text-[10px] text-[hsl(var(--dashboard-soft-ink))]">
                        {format(new Date(message.created_at), "MMM d")}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[hsl(var(--dashboard-ink))]">{message.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="parent-card order-4 overflow-hidden rounded-2xl md:order-4">
          <div className="parent-card-header-orange flex items-center gap-2 px-4 py-3 text-primary-foreground">
            <Megaphone className="h-4.5 w-4.5" strokeWidth={2.1} />
            <h3 className="text-[12.5px] font-bold">Latest Announcements</h3>
          </div>
          <div className="parent-soft-orange space-y-3 p-4">
            {announcements.length === 0 ? (
              <p className="text-[11px] text-[hsl(var(--dashboard-soft-ink))]">No announcements</p>
            ) : (
              announcements.map((announcement) => (
                <button
                  key={announcement.id}
                  type="button"
                  onClick={() => navigate("/portal/announcements")}
                  className="block w-full text-left"
                >
                  <p className="text-[12.5px] font-bold text-[hsl(var(--dashboard-ink))]">{announcement.title}</p>
                  <p className="mt-1 text-[11px] text-[hsl(var(--dashboard-ink))]">
                    {announcement.published_at ? format(new Date(announcement.published_at), "MMM d, h:mm a") : "Published recently"}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-5 text-[hsl(var(--dashboard-ink))]">{announcement.content}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="parent-card order-1 overflow-hidden rounded-2xl md:order-5">
          <div className="parent-card-header-red flex items-center gap-2 px-4 py-3 text-primary-foreground">
            <CreditCard className="h-4.5 w-4.5" strokeWidth={2.1} />
            <h3 className="text-[12.5px] font-bold">Fees Summary</h3>
          </div>
          <div className="parent-soft-red space-y-4 p-4">
            <div>
              <p className="text-[11px] font-semibold text-[hsl(var(--parent-red-end))]">GHS {outstanding.toLocaleString()}</p>
              <p className="mt-1 text-[12px] text-[hsl(var(--dashboard-ink))]">Outstanding</p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--parent-orange-end))] px-3 py-2 text-center text-[12px] font-bold text-primary-foreground shadow-sm">
              {feeStatus}
            </div>
            <Button size="sm" className="h-8 w-full rounded-xl text-[11px] font-semibold" onClick={() => navigate("/portal/fees")}>
              View All Fees
            </Button>
          </div>
        </section>

        <section className="parent-card order-6 overflow-hidden rounded-2xl md:order-6 md:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-[hsl(var(--dashboard-soft-ink))]" strokeWidth={2.1} />
              <h3 className="text-[12.5px] font-bold text-[hsl(var(--dashboard-ink))]">Recent Documents</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate("/portal/documents")}
              className="parent-pill rounded-xl px-3 py-1.5 text-[10.5px] font-semibold text-primary"
            >
              Mark All Documents
            </button>
          </div>

          <div className="space-y-1 p-3">
            {documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-[11px] text-muted-foreground">
                No documents available
              </div>
            ) : (
              documents.map((document) => {
                const ext = (document.document_type || "pdf").toLowerCase();
                const isPdf = ext === "pdf";

                return (
                  <a
                    key={document.id}
                    href={document.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/40"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                        isPdf ? "bg-[hsl(var(--parent-red-soft))]" : "bg-[hsl(var(--parent-blue-soft))]"
                      }`}
                    >
                      <FileText
                        className={`h-4.5 w-4.5 ${
                          isPdf ? "text-[hsl(var(--parent-red-end))]" : "text-[hsl(var(--parent-blue-end))]"
                        }`}
                        strokeWidth={2.1}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-[hsl(var(--dashboard-ink))]">{document.document_name}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
                        <Clock3 className="h-3.5 w-3.5" />
                        {document.created_at ? format(new Date(document.created_at), "MMM yyyy") : "Recent"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="parent-pill rounded-lg px-2 py-1 text-[10px] font-bold uppercase text-primary">{ext}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortalDashboard;
