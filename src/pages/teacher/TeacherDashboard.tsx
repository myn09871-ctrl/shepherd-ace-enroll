import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, ClipboardList, CalendarCheck, GraduationCap, FileText, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: "grade" | "message" | "announcement";
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

      // Fetch student count
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .in("current_class", classNames)
        .eq("status", "active")
        .then(({ count }) => setStudentCount(count || 0));

      // Fetch pending assignments (due soon)
      supabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .in("class_name", classNames)
        .gte("due_date", new Date().toISOString().split("T")[0])
        .then(({ count }) => setPendingTasks(count || 0));

      // Fetch recent activity
      const fetchActivity = async () => {
        const activities: ActivityItem[] = [];
        const { data: grades } = await supabase
          .from("grades")
          .select("id, total_score, posted_at, subject_id, subjects(name)")
          .eq("posted_by", user.id)
          .order("posted_at", { ascending: false })
          .limit(4);

        grades?.forEach((g: any) => {
          if (g.posted_at) {
            activities.push({
              id: g.id, type: "grade",
              title: `${g.subjects?.name || "Subject"} results posted`,
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
          .limit(3);

        msgs?.forEach(m => {
          activities.push({
            id: m.id, type: "message",
            title: m.subject,
            description: m.sender_type === "teacher" ? "Message sent" : "Reply received",
            timestamp: m.created_at,
          });
        });

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivity(activities.slice(0, 5));
      };

      // Fetch upcoming events
      const fetchEvents = async () => {
        const { data } = await supabase
          .from("portal_announcements")
          .select("id, title, published_at, category")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(4);
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

  const firstName = teacherProfile?.full_name?.split(" ").slice(-1)[0] || "Teacher";

  return (
    <div className="space-y-5 bg-blue-50/40 -m-4 md:-m-6 p-4 md:p-6 min-h-screen">
      {/* Welcome Card */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👋</span>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              {greeting()}, {firstName}!
            </h1>
            <p className="text-sm text-muted-foreground">
              You have {assignedClasses.length} class{assignedClasses.length !== 1 ? "es" : ""} today. Have a productive day!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{studentCount}</p>
              <p className="text-xs text-muted-foreground">My Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100">
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{assignedClasses.length}</p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <ClipboardList className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => navigate("/teacher/attendance")}
        >
          <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-2xl bg-teal-100 group-hover:bg-teal-200 transition-colors">
              <CalendarCheck className="h-7 w-7 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-foreground">Mark Attendance</span>
          </CardContent>
        </Card>
        <Card
          className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => navigate("/teacher/results")}
        >
          <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <GraduationCap className="h-7 w-7 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">Enter Results</span>
          </CardContent>
        </Card>
        <Card
          className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => navigate("/teacher/assignments")}
        >
          <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
            <div className="p-3 rounded-2xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <FileText className="h-7 w-7 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-foreground">Create Assignment</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Upcoming Events */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No recent activity</p>
            ) : (
              recentActivity.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={`p-1.5 rounded-lg ${a.type === "grade" ? "bg-blue-100" : a.type === "message" ? "bg-green-100" : "bg-amber-100"}`}>
                    {a.type === "grade" && <GraduationCap className="h-3.5 w-3.5 text-blue-600" />}
                    {a.type === "message" && <FileText className="h-3.5 w-3.5 text-green-600" />}
                    {a.type === "announcement" && <ClipboardList className="h-3.5 w-3.5 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">{a.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(a.timestamp), "MMM d")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              upcomingEvents.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{e.title}</p>
                    <p className="text-[10px] text-muted-foreground">{e.category}</p>
                  </div>
                  {e.published_at && (
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(e.published_at), "MMM d")}
                    </span>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assigned Classes */}
      {assignedClasses.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {assignedClasses.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => navigate("/teacher/classes")}
                  className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <p className="font-semibold text-sm text-primary">{cls.class_name}</p>
                  <p className="text-[10px] text-muted-foreground">{cls.academic_year}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
