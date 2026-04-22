import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, ClipboardList, CheckSquare, FileEdit, PencilRuler,
  ChevronRight, CheckCircle2, MessageCircle, CalendarDays, SunMedium,
} from "lucide-react";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
      const classNames = assignedClasses.map(c => c.class_name);

      supabase.from("students").select("id", { count: "exact", head: true })
        .in("current_class", classNames).eq("status", "active")
        .then(({ count }) => setStudentCount(count || 0));

      supabase.from("assignments").select("id", { count: "exact", head: true })
        .in("class_name", classNames).gte("due_date", new Date().toISOString().split("T")[0])
        .then(({ count }) => setPendingTasks(count || 0));

      (async () => {
        const activities: ActivityItem[] = [];
        const { data: grades } = await supabase.from("grades")
          .select("id, posted_at, subjects(name)")
          .eq("posted_by", user.id).order("posted_at", { ascending: false }).limit(2);
        grades?.forEach((g: any) => {
          if (g.posted_at) activities.push({
            id: g.id, type: "grade",
            title: `Graded results for ${g.subjects?.name || "class"}`,
            timestamp: g.posted_at,
          });
        });
        const { data: msgs } = await supabase.from("parent_messages")
          .select("id, subject, created_at").eq("sender_id", user.id)
          .order("created_at", { ascending: false }).limit(2);
        msgs?.forEach(m => activities.push({
          id: m.id, type: "message", title: m.subject, timestamp: m.created_at,
        }));
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 3));
      })();

      supabase.from("portal_announcements")
        .select("id, title, published_at").eq("is_published", true)
        .order("published_at", { ascending: false }).limit(3)
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

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Welcome banner - beige */}
      <div className="rounded-xl bg-[#fdf6ec] border border-[#f0e6cf] px-5 py-3.5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[#f5d76e] flex items-center justify-center flex-shrink-0">
          <SunMedium className="h-5 w-5 text-[#8a6400]" strokeWidth={2.2} />
        </div>
        <div>
          <p className="text-[14px] font-bold text-foreground">
            {greeting()}, Mr. {lastName}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            You have {classCount} class{classCount !== 1 ? "es" : ""} today.
          </p>
        </div>
      </div>

      {/* Stats row - 3 cards with colored icon + label + big number */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Users, label: "My Students", value: studentCount, iconBg: "bg-[#fde8ec]", iconColor: "text-[#c44a6a]" },
          { icon: BookOpen, label: "Assigned Classes", value: classCount, iconBg: "bg-[#e0f1d7]", iconColor: "text-[#4a8b2e]" },
          { icon: ClipboardList, label: "Pending Tasks", value: pendingTasks, iconBg: "bg-[#fef1d6]", iconColor: "text-[#c98a1e]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border/50 px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} strokeWidth={2} />
              </div>
              <span className="text-[12.5px] font-medium text-foreground">{stat.label}</span>
            </div>
            <span className="text-[22px] font-bold text-[#1a3563] tabular-nums">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[13px] font-semibold text-foreground mb-2.5">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { onClick: () => navigate("/teacher/attendance"), label: "Mark Attendance", Icon: CheckSquare, bg: "bg-[#d9f1ec]", color: "text-[#1b9e7e]" },
            { onClick: () => navigate("/teacher/results"), label: "Enter Results", Icon: FileEdit, bg: "bg-[#fde8ec]", color: "text-[#c44a6a]" },
            { onClick: () => navigate("/teacher/assignments"), label: "Create Assignment", Icon: PencilRuler, bg: "bg-[#e5ecfb]", color: "text-[#3a5fcd]" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="bg-white rounded-xl border border-border/50 px-4 py-6 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <div className={`h-14 w-14 rounded-xl ${action.bg} flex items-center justify-center`}>
                <action.Icon className={`h-7 w-7 ${action.color}`} strokeWidth={2} />
              </div>
              <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity + Upcoming Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/40">
            <h3 className="text-[12.5px] font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="divide-y divide-border/30">
            {recentActivity.length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              recentActivity.map(a => (
                <button
                  key={a.id}
                  onClick={() => navigate(a.type === "grade" ? "/teacher/results" : "/teacher/messages")}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
                >
                  {a.type === "grade" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#3a5fcd] flex-shrink-0" strokeWidth={2} />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-[#c98a1e] flex-shrink-0" strokeWidth={2} />
                  )}
                  <span className="text-[12px] text-foreground flex-1 truncate">{a.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/40">
            <h3 className="text-[12.5px] font-semibold text-foreground">Upcoming Events</h3>
          </div>
          <div className="divide-y divide-border/30">
            {upcomingEvents.length === 0 ? (
              <p className="text-[11.5px] text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              upcomingEvents.map(e => (
                <button
                  key={e.id}
                  onClick={() => navigate("/teacher/announcements")}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <CalendarDays className="h-4 w-4 text-[#c44a6a] flex-shrink-0" strokeWidth={2} />
                  <span className="text-[12px] text-foreground flex-1 truncate">
                    {e.title}
                    {e.published_at && (
                      <span className="text-muted-foreground font-normal">: {format(new Date(e.published_at), "MMM d")}</span>
                    )}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
