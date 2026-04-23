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
  ArrowRight,
  ReceiptText,
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
  const absentPct = Math.max(100 - attendancePct, 0);
  const outstanding = Math.max(feesTotal - feesPaid, 0);
  const feeStatus = outstanding <= 0 && feesTotal > 0 ? "Fully Paid" : feesPaid > 0 ? "Partially Paid" : outstanding > 0 ? "Unpaid" : "No Fees";
  const firstName = parentAccount?.parent_name?.split(" ")[0] || "Parent";

  const gradeSummary = [
    { label: "A+", count: (gradeDist["A+"] || 0) + (gradeDist["A"] || 0) },
    { label: "Bs", count: gradeDist["B"] || 0 },
    { label: "Cs", count: gradeDist["C"] || 0 },
    { label: "Ds", count: gradeDist["D"] || 0 },
  ];
  const latestMessage = messages[0] ?? null;
  const paidPercentage = feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-3">
      <div>
        <h2 className="text-[14px] font-bold text-[hsl(var(--dashboard-ink))] md:text-[15px]">Welcome, {firstName}</h2>
      </div>

      <section className="dashboard-compact-card rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" strokeWidth={2.1} />
              <h3 className="text-[12px] font-bold text-[hsl(var(--dashboard-ink))]">Academic Performance</h3>
            </div>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
              {latestTerm ? `Latest result • ${latestTerm}` : "Latest result"}
            </p>
          </div>
          <span className="dashboard-compact-pill rounded-full px-2.5 py-1 text-[9px] font-semibold">Current Term</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="flex items-end gap-2">
              <span className="text-[28px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">
                {termAverage != null ? `${termAverage}%` : "—"}
              </span>
              <span className="pb-1 text-[11px] text-[hsl(var(--dashboard-soft-ink))]">Average</span>
            </div>

            <div className="mt-3 space-y-2">
              {gradeSummary.map((item) => {
                const width = Math.min(item.count * 22, 100);
                return (
                  <div key={item.label} className="grid grid-cols-[30px_1fr_24px] items-center gap-2 text-[10.5px]">
                    <span className="font-semibold text-[hsl(var(--dashboard-ink))]">{item.label}</span>
                    <div className="h-2 rounded-full bg-[hsl(var(--parent-blue-soft))]">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${width}%` }} />
                    </div>
                    <span className="text-right text-[hsl(var(--dashboard-soft-ink))]">{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/portal/academics")}
            className="dashboard-compact-button inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10.5px] font-semibold"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </button>
        </div>
      </section>

      <section className="dashboard-compact-card rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-primary" strokeWidth={2.1} />
              <h3 className="text-[12px] font-bold text-[hsl(var(--dashboard-ink))]">Attendance This Term</h3>
            </div>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">{attendancePresent} days present out of {attendanceTotal || 0}</p>
          </div>
          <span className="text-[10px] font-semibold text-[hsl(var(--dashboard-soft-ink))]">{absentPct}% absent</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[28px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">{attendancePct}%</p>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Attendance rate</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">{attendanceTotal || 0}</p>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Total days</p>
          </div>
        </div>

        <div className="mt-4 h-2.5 rounded-full bg-[hsl(var(--parent-blue-soft))]">
          <div className="h-2.5 rounded-full bg-primary" style={{ width: `${attendancePct}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {recentAbsences.length === 0 ? (
            <p className="text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">No recent absences</p>
          ) : (
            recentAbsences.map((absence) => (
              <div key={absence.date} className="dashboard-compact-pill flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium">
                <CircleAlert className="h-3.5 w-3.5 text-[hsl(var(--parent-red-end))]" strokeWidth={2.1} />
                {format(new Date(absence.date), "MMM d")}
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/attendance")}
          className="dashboard-compact-button mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10.5px] font-semibold"
        >
          View Attendance
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </section>

      <section className="dashboard-compact-card rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" strokeWidth={2.1} />
              <h3 className="text-[12px] font-bold text-[hsl(var(--dashboard-ink))]">Messages</h3>
            </div>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Latest conversation</p>
          </div>
          <span className="dashboard-compact-pill rounded-full px-2.5 py-1 text-[9px] font-semibold">{unreadMsgCount} unread</span>
        </div>

        {latestMessage ? (
          <button
            type="button"
            onClick={() => navigate("/portal/messages")}
            className="mt-4 block w-full rounded-[14px] border border-[hsl(var(--parent-card-border))] px-3 py-3 text-left transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[11.5px] font-bold text-[hsl(var(--dashboard-ink))]">{latestMessage.subject}</p>
              <span className="text-[10px] text-[hsl(var(--dashboard-soft-ink))]">{format(new Date(latestMessage.created_at), "MMM d")}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-[10.5px] leading-5 text-[hsl(var(--dashboard-soft-ink))]">{latestMessage.message}</p>
          </button>
        ) : (
          <div className="mt-4 rounded-[14px] border border-dashed border-[hsl(var(--parent-card-border))] px-4 py-5 text-center text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
            No messages
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/portal/messages")}
          className="dashboard-compact-button mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10.5px] font-semibold"
        >
          View Messages
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </section>

      <section className="dashboard-compact-card rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" strokeWidth={2.1} />
              <h3 className="text-[12px] font-bold text-[hsl(var(--dashboard-ink))]">Latest Announcements</h3>
            </div>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">School updates</p>
          </div>
          <span className="dashboard-compact-pill rounded-full px-2.5 py-1 text-[9px] font-semibold">{announcements.length}</span>
        </div>

        <div className="mt-4 space-y-2">
          {announcements.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[hsl(var(--parent-card-border))] px-4 py-5 text-center text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
              No announcements
            </div>
          ) : (
            announcements.map((announcement) => (
              <button
                key={announcement.id}
                type="button"
                onClick={() => navigate("/portal/announcements")}
                className="block w-full rounded-[14px] border border-[hsl(var(--parent-card-border))] px-3 py-3 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11.5px] font-bold text-[hsl(var(--dashboard-ink))]">{announcement.title}</p>
                  <span className="text-[9.5px] text-[hsl(var(--dashboard-soft-ink))]">
                    {announcement.published_at ? format(new Date(announcement.published_at), "MMM d") : "Recent"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-5 text-[hsl(var(--dashboard-soft-ink))]">{announcement.content}</p>
              </button>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/announcements")}
          className="dashboard-compact-button mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10.5px] font-semibold"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </section>

      <section className="dashboard-compact-card rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" strokeWidth={2.1} />
              <h3 className="text-[12px] font-bold text-[hsl(var(--dashboard-ink))]">Fees Summary</h3>
            </div>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Current balance overview</p>
          </div>
          <span className="rounded-full bg-[hsl(var(--parent-green-soft))] px-2.5 py-1 text-[9px] font-semibold text-[hsl(var(--parent-green-end))]">{feeStatus}</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[28px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">GH¢ {outstanding.toLocaleString()}</p>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Outstanding</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">{paidPercentage}%</p>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Paid</p>
          </div>
        </div>

        <div className="mt-4 h-2.5 rounded-full bg-[hsl(var(--parent-green-soft))]">
          <div className="h-2.5 rounded-full bg-[hsl(var(--parent-green-end))]" style={{ width: `${paidPercentage}%` }} />
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/fees")}
          className="dashboard-compact-button mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10.5px] font-semibold"
        >
          View Fees
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </section>

      <section className="dashboard-compact-card rounded-[18px] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-primary" strokeWidth={2.1} />
              <h3 className="text-[12px] font-bold text-[hsl(var(--dashboard-ink))]">Recent Documents</h3>
            </div>
            <p className="mt-1 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">Latest files for your child</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/portal/documents")}
            className="text-[10px] font-semibold text-primary"
          >
            View All
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {documents.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-[hsl(var(--parent-card-border))] px-4 py-5 text-center text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
              No documents available
            </div>
          ) : (
            documents.map((document) => {
              const ext = (document.document_type || "pdf").toLowerCase();
              return (
                <a
                  key={document.id}
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-[14px] border border-[hsl(var(--parent-card-border))] px-3 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--parent-blue-soft))]">
                    <FileText className="h-4 w-4 text-primary" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-bold text-[hsl(var(--dashboard-ink))]">{document.document_name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[hsl(var(--dashboard-soft-ink))]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {document.created_at ? format(new Date(document.created_at), "MMM yyyy") : "Recent"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="dashboard-compact-pill rounded-full px-2 py-1 text-[9px] font-semibold uppercase">{ext}</span>
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--dashboard-soft-ink))]" />
                  </div>
                </a>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default PortalDashboard;
