import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";

const PortalTimetable = () => {
  const { currentStudent: student } = useParentAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) fetchTimetable();
  }, [student]);

  const fetchTimetable = async () => {
    if (!student) return;
    const { data } = await supabase
      .from("timetables")
      .select("*, subjects(name)")
      .eq("class_name", student.current_class)
      .eq("is_active", true)
      .order("day_of_week")
      .order("start_time");
    setTimetable(data || []);
    setLoading(false);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const groupedByDay = timetable.reduce((acc, item) => {
    const day = days[item.day_of_week - 1] || "Unknown";
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Class Timetable
        </h1>
        <p className="text-sm text-muted-foreground">{student?.current_class} weekly schedule</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : timetable.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No timetable available</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {days.map((day) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent>
                {!groupedByDay[day]?.length ? (
                  <p className="text-sm text-muted-foreground">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {groupedByDay[day].map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg">
                        <div className="text-sm font-medium w-24">
                          {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.subjects?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{item.teacher_name || ""}</p>
                        </div>
                        {item.room_number && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Room {item.room_number}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalTimetable;
