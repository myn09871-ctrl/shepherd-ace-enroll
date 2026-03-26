import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, CalendarCheck, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";

const TeacherDashboard = () => {
  const { teacherProfile, assignedClasses } = useTeacherAuth();
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (assignedClasses.length > 0) {
      const classNames = assignedClasses.map(c => c.class_name);
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .in("current_class", classNames)
        .eq("status", "active")
        .then(({ count }) => setStudentCount(count || 0));
    }
  }, [assignedClasses]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    { label: "My Students", value: studentCount, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "My Classes", value: assignedClasses.length, icon: BookOpen, color: "from-emerald-500 to-emerald-600" },
  ];

  const quickActions = [
    { label: "Mark Attendance", icon: CalendarCheck, path: "/teacher/attendance" },
    { label: "Enter Results", icon: ClipboardList, path: "/teacher/results" },
    { label: "View Classes", icon: Users, path: "/teacher/classes" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {teacherProfile?.full_name?.split(" ")[0] || "Teacher"}!
        </h1>
        <p className="text-muted-foreground">Welcome to your teacher dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
};

export default TeacherDashboard;
