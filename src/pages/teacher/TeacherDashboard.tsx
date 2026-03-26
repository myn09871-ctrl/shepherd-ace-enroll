import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, CalendarCheck, ClipboardList, Bell, CheckCircle2, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  type: "assignment" | "announcement" | "message";
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  type: "field_trip" | "test" | "event";
}

interface AssignmentRow {
  id: string;
  title: string;
  class_name: string;
  due_date: string | null;
  created_at: string;
}

interface AnnouncementRow {
  id: string;
  title: string;
  published_at: string | null;
  category: string | null;
}

const TeacherDashboard = () => {
  const { teacherProfile, assignedClasses } = useTeacherAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const classNames = assignedClasses.map(c => c.class_name);

      if (classNames.length > 0) {
        const { count } = await supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .in("current_class", classNames)
          .eq("status", "active");
        setStudentCount(count || 0);
      }

      if (!teacherProfile) return;

      const now = new Date();
      const weekAhead = new Date();
      weekAhead.setDate(now.getDate() + 7);

      // pending tasks: assignments due within next 7 days
      const { data: pendingAssignments } = await supabase
        .from<AssignmentRow>("assignments")
        .select("id,due_date")
        .eq("teacher_id", teacherProfile.id)
        .gte("due_date", now.toISOString().slice(0, 10))
        .lte("due_date", weekAhead.toISOString().slice(0, 10));
      setPendingTasks((pendingAssignments || []).length);

      // recent activity from assignments + announcements
      const [assignmentsRes, announcementsRes] = await Promise.all([
        supabase
          .from<AssignmentRow>("assignments")
          .select("id,title,class_name,due_date,created_at")
          .eq("teacher_id", teacherProfile.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from<AnnouncementRow>("portal_announcements")
          .select("id,title,published_at,category")
          .eq("created_by", teacherProfile.user_id)
          .order("published_at", { ascending: false })
          .limit(5),
      ]);

      const activities: ActivityItem[] = [];
      (assignmentsRes.data || []).forEach((a) => {
        activities.push({
          id: a.id,
          title: `Created assignment: ${a.title}`,
          subtitle: `Class: ${a.class_name} • Due ${a.due_date ? new Date(a.due_date).toLocaleDateString() : "N/A"}`,
          date: a.created_at,
          type: "assignment",
        });
      });

      (announcementsRes.data || []).forEach((a) => {
        activities.push({
          id: a.id,
          title: `Posted announcement: ${a.title}`,
          subtitle: a.category ? a.category : "Announcement",
          date: a.published_at || "",
          type: "announcement",
        });
      });

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentActivity(activities.slice(0, 5));

      // upcoming events from assignments near due date and hardcoded events
      const nextEvents: EventItem[] = [];
      (pendingAssignments || []).slice(0, 3).forEach((a: any) => {
        nextEvents.push({
          id: a.id,
          title: "Assignment due soon",
          date: a.due_date || "",
          type: "event",
        });
      });

      const { data: eventAnnouncements } = await supabase
        .from("portal_announcements")
        .select("id,title,published_at")
        .eq("created_by", teacherProfile.user_id)
        .eq("category", "event")
        .order("published_at", { ascending: false })
        .limit(3);

      (eventAnnouncements || []).forEach((e: any) => {
        nextEvents.push({
          id: e.id,
          title: e.title,
          date: e.published_at || "",
          type: "event",
        });
      });

      setUpcomingEvents(nextEvents.slice(0, 4));
    };

    fetchDashboardData();
  }, [assignedClasses, teacherProfile]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    { label: "My Students", value: studentCount, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Assigned Classes", value: assignedClasses.length, icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
    { label: "Pending Tasks", value: pendingTasks, icon: Bell, color: "from-orange-500 to-orange-600" },
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: CalendarCheck, path: "/teacher/attendance" },
    { label: "Enter Results", icon: ClipboardList, path: "/teacher/results" },
    { label: "View Classes", icon: Users, path: "/teacher/classes" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 p-5 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold">{greeting()}, {teacherProfile?.full_name?.split(" ")[0] || "Teacher"}!</h1>
        <p className="mt-1 text-sm md:text-base text-white/90">You have {assignedClasses.length} classes today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-10 w-10 opacity-80" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => navigate(action.path)}
              >
                <action.icon className="h-6 w-6 text-primary" />
                <span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {assignedClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {assignedClasses.map((cls) => (
                <div key={cls.id} className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center">
                  <p className="font-semibold text-primary">{cls.class_name}</p>
                  <p className="text-xs text-muted-foreground">{cls.academic_year}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-muted/20 rounded-lg border border-border">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{activity.date ? new Date(activity.date).toLocaleString() : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-muted/20 rounded-lg border border-border">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date ? new Date(event.date).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
