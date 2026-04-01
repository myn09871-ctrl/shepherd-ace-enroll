import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, ClipboardList, CalendarCheck, GraduationCap, FileText, ChevronRight, Clock } from "lucide-react";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: "grade" | "message";
  title: string;
  description: string;
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

      const fetchActivity = async () => {
        const activities: ActivityItem[] = [];
        const { data: grades } = await supabase
          .from("grades")
          .select("id, total_score, posted_at, subject_id, subjects(name)")
          .eq("posted_by", user.id)
          .order("posted_at", { ascending: false })
          .limit(3);

        grades?.forEach((g: any) => {
          if (g.posted_at) {
            activities.push({
              id: g.id, type: "grade",
              title: `Graded results for ${g.subjects?.name || "Subject"}`,
              description: `Score: ${g.total_score}%`,
              timestamp: g.posted_at,
            });
          }
        });

        const { data: msgs } = await supabase
          .from("parent_messages")
          .select("id, subject, created_at, sender_type")
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false })
          .limit(2);

        msgs?.forEach(m => {
          activities.push({
            id: m.id, type: "message",
            title: m.subject,
            description: m.sender_type === "teacher" ? "Message sent" : "Reply received",
            timestamp: m.created_at,
          });
        });

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 4));
      };

      const fetchEvents = async () => {
        const { data } = await supabase
          .from("portal_announcements")
          .select("id, title, published_at, category")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(3);
        setUpcomingEvents(data || []);
      };

      fetchActivity();
      fetchEvents();
    }
  }, [assignedClasses, user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const lastName = teacherProfile?.full_name?.split(" ").slice(-1)[0] || "Teacher";

  return (
    <div className="space-y-4">
      {/* Welcome Card - beige/cream */}
      <div className="rounded-lg bg-[#fdf6ec] border border-amber-200/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">😊</span>
          <div>
            <h1 className="text-[15px] font-bold text-foreground">
              {greeting()}, Mr. {lastName} 👋
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              You have {assignedClasses.length} class{assignedClasses.length !== 1 ? "es" : ""} today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row - 3 cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "👨‍🎓", label: "My Students", value: studentCount },
          { icon: "🏫", label: "Assigned Classes", value: assignedClasses.length },
          { icon: "📋", label: "Pending Tasks", value: pendingTasks },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-border/60 px-4 py-3 flex items-center gap-3">
            <span className="text-xl">{stat.icon}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[13px] font-semibold text-foreground mb-2">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/teacher/attendance")}
            className="bg-white rounded-lg border border-border/60 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center">
              <CalendarCheck className="h-6 w-6 text-teal-600" />
            </div>
            <span className="text-[12px] font-medium text-foreground">Mark Attendance</span>
          </button>
          <button
            onClick={() => navigate("/teacher/results")}
            className="bg-white rounded-lg border border-border/60 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-[12px] font-medium text-foreground">Enter Results</span>
          </button>
          <button
            onClick={() => navigate("/teacher/assignments")}
            className="bg-white rounded-lg border border-border/60 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-[12px] font-medium text-foreground">Create Assignment</span>
          </button>
        </div>
      </div>

      {/* Recent Activity + Upcoming Events - side by side */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-border/60">
          <div className="px-4 py-2.5 border-b border-border/40">
            <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-border/30">
            {recentActivity.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              recentActivity.map(a => (
                <div key={a.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 cursor-pointer transition-colors">
                  <div className={`p-1 rounded ${a.type === "grade" ? "bg-blue-50" : "bg-green-50"}`}>
                    {a.type === "grade" ? (
                      <CalendarCheck className="h-3 w-3 text-blue-600" />
                    ) : (
                      <FileText className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-foreground flex-1 truncate">{a.title}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border/60">
          <div className="px-4 py-2.5 border-b border-border/40">
            <h3 className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5 text-primary" />
              Upcoming Events
            </h3>
          </div>
          <div className="divide-y divide-border/30">
            {upcomingEvents.length === 0 ? (
              <p className="text-[11px] text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              upcomingEvents.map(e => (
                <div key={e.id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                  <div className="p-1 rounded bg-amber-50">
                    <CalendarCheck className="h-3 w-3 text-amber-600" />
                  </div>
                  <span className="text-[11px] text-foreground flex-1 truncate">{e.title}</span>
                  {e.published_at && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {format(new Date(e.published_at), "MMM d")}
                    </span>
                  )}
                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
