import { useState, useEffect } from "react";
import { CalendarCheck, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
}

const TeacherAttendance = () => {
  const { assignedClasses, user } = useTeacherAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    supabase
      .from("students")
      .select("id, student_id, first_name, surname")
      .eq("current_class", selectedClass)
      .eq("status", "active")
      .order("surname")
      .then(({ data }) => {
        const studs = (data || []) as Student[];
        setStudents(studs);
        // Load existing attendance
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        supabase
          .from("attendance")
          .select("student_id, status")
          .eq("date", dateStr)
          .in("student_id", studs.map(s => s.id))
          .then(({ data: attData }) => {
            const map: Record<string, string> = {};
            studs.forEach(s => map[s.id] = "present");
            (attData || []).forEach((a: any) => map[a.student_id] = a.status);
            setAttendance(map);
            setLoading(false);
          });
      });
  }, [selectedClass, selectedDate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Delete existing records for this date/class then insert new
    const studentIds = students.map(s => s.id);
    await supabase.from("attendance").delete().eq("date", dateStr).in("student_id", studentIds);

    const records = students.map(s => ({
      student_id: s.id,
      date: dateStr,
      status: attendance[s.id] || "present",
      recorded_by: user.id,
    }));

    const { error } = await supabase.from("attendance").insert(records);
    if (error) {
      toast.error("Failed to save attendance");
    } else {
      toast.success(`Attendance saved for ${format(selectedDate, "PPP")}`);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <CalendarCheck className="h-6 w-6" /> Attendance
      </h1>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Select Class" /></SelectTrigger>
          <SelectContent>
            {assignedClasses.map(c => (
              <SelectItem key={c.id} value={c.class_name}>{c.class_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{format(selectedDate, "PPP")}</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedClass && !loading && students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{selectedClass} — {format(selectedDate, "PPP")}</CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.surname}, {s.first_name}</TableCell>
                    <TableCell>
                      <RadioGroup
                        value={attendance[s.id] || "present"}
                        onValueChange={(val) => setAttendance(prev => ({ ...prev, [s.id]: val }))}
                        className="flex gap-4"
                      >
                        {["present", "absent", "late"].map(status => (
                          <div key={status} className="flex items-center gap-1">
                            <RadioGroupItem value={status} id={`${s.id}-${status}`} />
                            <Label htmlFor={`${s.id}-${status}`} className="text-xs capitalize cursor-pointer">{status}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherAttendance;
