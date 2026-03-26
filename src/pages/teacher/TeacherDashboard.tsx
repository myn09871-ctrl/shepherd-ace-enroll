import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, CalendarCheck, ClipboardList, CheckCircle, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface RecentActivityItem {
  id: string;
  type: "assignment" | "message" | "grade";
  title: string;
  description: string;
  timestamp: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: "event" | "deadline";
}

const TeacherDashboard = () => {
  const { teacherProfile, assignedClasses } = useTeacherAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignedClasses.length > 0 || teacherProfile) {
      fetchDashboardData();
    }
  }, [assignedClasses, teacherProfile]);

  const fetchDashboardData = async () => {
    if (!teacherProfile) return;

    try {
      // Fetch student count
      if (assignedClasses.length > 0) {
        const classNames = assignedClasses.map(c => c.class_name);
        const { count } = await supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .in("current_class", classNames)
          .eq("status", "active");

        setStudentCount(count || 0);
      }

      // Fetch assignments (pending tasks)
      const { data: assignmentsData } = await supabase
        .from("assignments")
        .select("id")
        .eq("teacher_id", teacherProfile.id)
        .gt("due_date", new Date().toISOString().split("T")[0]);

      setPendingTasks(assignmentsData?.length || 0);

      // Fetch recent activity (assignments + messages)
      const activities: RecentActivityItem[] = [];

      const { data: recentAssignments } = await supabase
        .from("assignments")
        .select("id, title, created_at")
        .eq("teacher_id", teacherProfile.id)
        .order("created_at", { ascending: false })
        .limit(3);

      recentAssignments?.forEach((assignment) => {
        activities.push({
          id: assignment.id,
          type: "assignment",
          title: assignment.title,
          description: "New assignment created",
          timestamp: assignment.created_at,
        });
      });

      // Recent messages to parents
      const { data: recentMessages } = await supabase
        .from("parent_messages")
        .select("id, subject, created_at")
        .eq("sender_id", teacherProfile.user_id)
        .order("created_at", { ascending: false })
        .limit(2);

      recentMessages?.forEach((message) => {
        activities.push({
          id: message.id,
          type: "message",
          title: message.subject,
          description: "Message to parent",
          timestamp: message.created_at,
        });
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));

      // Fetch upcoming events (using portal_announcements for school events)
      const { data: upcomingSchoolEvents } = await supabase
        .from("portal_announcements")
        .select("id, title, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(2);

      const events: UpcomingEvent[] = [];
      upcomingSchoolEvents?.forEach((event) => {
        events.push({
          id: event.id,
          title: event.title,
          date: event.published_at || new Date().toISOString(),
          type: "event",
        });
      });

      setUpcomingEvents(events);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const teacherFirstName = teacherProfile?.full_name?.split(" ")[0] || "Teacher";

  const stats = [
    { label: "My Students", value: studentCount, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Assigned Classes", value: assignedClasses.length, icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
    { label: "Pending Tasks", value: pendingTasks, icon: ClipboardList, color: "from-orange-500 to-orange-600" },
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: CalendarCheck, path: "/teacher/attendance" },
    { label: "Enter Results", icon: CheckCircle, path: "/teacher/results" },
    { label: "Create Assignment", icon: ClipboardList, path: "/teacher/assignments" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Greeting Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👋</span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{greeting()}, {teacherFirstName}!</h2>
              <p className="text-sm text-muted-foreground">You have {assignedClasses.length} classes today.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <div className={`bg-gradient-to-r ${stat.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm opacity-90">{stat.label}</p>
                  <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                </div>
                <div className="opacity-20">
                  <stat.icon className="h-12 w-12" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-5 flex flex-col gap-3 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition"
                onClick={() => navigate(action.path)}
              >
                <div className="p-3 rounded-lg bg-primary/10">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer">
                  <div className={`flex-shrink-0 p-2 rounded-lg ${activity.type === "assignment" ? "bg-blue-100 dark:bg-blue-900" : activity.type === "message" ? "bg-yellow-100 dark:bg-yellow-900" : "bg-green-100 dark:bg-green-900"}`}>
                    {activity.type === "assignment" && <ClipboardList className={`h-4 w-4 ${activity.type === "assignment" ? "text-blue-600 dark:text-blue-300" : "text-yellow-600"}`} />}
                    {activity.type === "message" && <MessageSquare className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />}
                    {activity.type === "grade" && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(activity.timestamp), "MMM d")}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition cursor-pointer">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-red-100 dark:bg-red-900">
                    <Calendar className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(event.date), "MMM d")}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
