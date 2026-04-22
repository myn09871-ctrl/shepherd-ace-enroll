import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  School,
  ClipboardList,
  CalendarCheck2,
  FileSignature,
  NotebookPen,
  SunMedium,
  ChevronRight,
  CircleCheckBig,
  MessageSquareText,
  CalendarRange,
} from "lucide-react";
import { format } from "date-fns";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: "grade" | "message";
  title: string;
  timestamp: string;
}

const TeacherDashboard = () => {
  const { teacherProfile, assignedClasses, user } = useTeacherAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    if (assignedClasses.length > 0 && user) {
      const classNames = assignedClasses.map((assignment) => assignment.class_name);

      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .in("current_class", classNames)
        .eq("status", "active")
        .then(({ count }) => setStudentCount(count || 0));

      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .in("class_name", classNames)
        .gte("due_date", new Date().toISOString().split("T")[0])
        .then(({ count }) => setPendingTasks(count || 0));

      (async () => {
        const activities: ActivityItem[] = [];
        const { data: grades } = await supabase
          .from("grades")
          .select("id, posted_at, subjects(name)")
          .eq("posted_by", user.id)
          .order("posted_at", { ascending: false })
          .limit(2);

        grades?.forEach((grade: any) => {
          if (grade.posted_at) {
            activities.push({
              id: grade.id,
              type: "grade",
              title: `Graded results for ${grade.subjects?.name || "class"}`,
              timestamp: grade.posted_at,
            });
          }
        });

        const { data: messages } = await supabase
          .from("parent_messages")
          .select("id, subject, created_at")
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2);

        messages?.forEach((message) => {
          activities.push({
            id: message.id,
            type: "message",
            title: message.subject,
            timestamp: message.created_at,
          });
        });

        activities.sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime());
        setRecentActivity(activities.slice(0, 3));
      })();

      supabase
        .from("portal_announcements")
        .select("id, title, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3)
        .then(({ data }) => setUpcomingEvents(data || []));
    }
  }, [assignedClasses, user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const lastName = teacherProfile?.full_name?.split(" ").slice(-1)[0] || "Teacher";
  const classCount = assignedClasses.length;

  const stats = [
    {
      label: "My Students",
      value: studentCount,
      Icon: Users,
      soft: "bg-[hsl(var(--teacher-coral-soft))]",
      icon: "text-[hsl(var(--teacher-coral))]",
    },
    {
      label: "Assigned Classes",
      value: classCount,
      Icon: School,
      soft: "bg-[hsl(var(--teacher-green-soft))]",
      icon: "text-[hsl(var(--teacher-green))]",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      Icon: ClipboardList,
      soft: "bg-[hsl(var(--teacher-amber-soft))]",
      icon: "text-[hsl(var(--teacher-amber))]",
    },
  ];

  const quickActions = [
    {
      label: "Mark Attendance",
      Icon: CalendarCheck2,
      onClick: () => navigate("/teacher/attendance"),
      soft: "bg-[hsl(var(--teacher-green-soft))]",
      icon: "text-[hsl(var(--teacher-green))]",
      accent: "bg-[hsl(var(--teacher-green))/0.14]",
    },
    {
      label: "Enter Results",
      Icon: FileSignature,
      onClick: () => navigate("/teacher/results"),
      soft: "bg-[hsl(var(--teacher-coral-soft))]",
      icon: "text-[hsl(var(--teacher-coral))]",
      accent: "bg-[hsl(var(--teacher-coral))/0.14]",
    },
    {
      label: "Create Assignment",
      Icon: NotebookPen,
      onClick: () => navigate("/teacher/assignments"),
      soft: "bg-[hsl(var(--teacher-blue-soft))]",
      icon: "text-[hsl(var(--teacher-blue))]",
      accent: "bg-[hsl(var(--teacher-blue))/0.14]",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="teacher-welcome-banner rounded-2xl px-4 py-4 md:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--teacher-welcome-icon)/0.16)] text-[hsl(var(--teacher-welcome-icon-foreground))]">
            <SunMedium className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-[hsl(var(--dashboard-ink))] md:text-[14px]">
              {greeting()}, Mr. {lastName}
            </h2>
            <p className="mt-1 text-[12px] text-[hsl(var(--dashboard-soft-ink))]">
              You have {classCount} class{classCount === 1 ? "" : "es"} today.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="teacher-stat-card rounded-2xl px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${stat.soft}`}>
                  <stat.Icon className={`h-5 w-5 ${stat.icon}`} strokeWidth={2.1} />
                </div>
                <div className="h-10 w-px bg-border/80" />
                <span className="truncate text-[12.5px] font-semibold text-[hsl(var(--dashboard-ink))]">{stat.label}</span>
              </div>
              <span className="text-[22px] font-bold leading-none text-[hsl(var(--dashboard-ink))]">{stat.value}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[13px] font-bold text-[hsl(var(--dashboard-ink))]">Quick Actions</h3>
          <div className="teacher-divider h-px flex-1 border-t" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="teacher-action-card group rounded-2xl px-5 py-5 text-left transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-[20px] ${action.soft}`}>
                  <div className={`absolute inset-3 rounded-2xl ${action.accent}`} />
                  <action.Icon className={`relative h-11 w-11 ${action.icon}`} strokeWidth={1.9} />
                </div>
                <span className="text-[13px] font-bold text-[hsl(var(--dashboard-ink))]">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="teacher-list-card rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-[13px] font-bold text-[hsl(var(--dashboard-ink))]">Recent Activity</h3>
            <div className="teacher-divider h-px flex-1 border-t" />
          </div>

          <div className="space-y-2">
            {recentActivity.length === 0 ? (
              <div className="teacher-panel rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-[11px] text-muted-foreground">
                No recent activity
              </div>
            ) : (
              recentActivity.map((item) => {
                const isGrade = item.type === "grade";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(isGrade ? "/teacher/results" : "/teacher/messages")}
                    className="teacher-panel flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
                  >
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                        isGrade ? "bg-[hsl(var(--teacher-blue-soft))]" : "bg-[hsl(var(--teacher-amber-soft))]"
                      }`}
                    >
                      {isGrade ? (
                        <CircleCheckBig className="h-4.5 w-4.5 text-[hsl(var(--teacher-blue))]" strokeWidth={2.1} />
                      ) : (
                        <MessageSquareText className="h-4.5 w-4.5 text-[hsl(var(--teacher-amber))]" strokeWidth={2.1} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-[hsl(var(--dashboard-ink))]">{item.title}</p>
                      <p className="mt-0.5 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
                        {format(new Date(item.timestamp), "MMM d, yyyy")}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </button>
                );
              })
            )}
          </div>
        </article>

        <article className="teacher-list-card rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-[13px] font-bold text-[hsl(var(--dashboard-ink))]">Upcoming Events</h3>
            <div className="teacher-divider h-px flex-1 border-t" />
          </div>

          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <div className="teacher-panel rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-[11px] text-muted-foreground">
                No upcoming events
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => navigate("/teacher/announcements")}
                  className="teacher-panel flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--teacher-coral-soft))]">
                    <CalendarRange className="h-4.5 w-4.5 text-[hsl(var(--teacher-coral))]" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-[hsl(var(--dashboard-ink))]">{event.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-[hsl(var(--dashboard-soft-ink))]">
                      {event.published_at ? format(new Date(event.published_at), "MMM d, yyyy") : "Published recently"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
};

export default TeacherDashboard;
