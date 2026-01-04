import { useEffect, useState } from "react";
import { Search, Calendar, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  current_class: string;
}

interface AttendanceRecord {
  id?: string;
  student_id: string;
  status: string;
  reason?: string;
  is_excused?: boolean;
}

const AttendanceManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students]);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from("students")
        .select("id, student_id, first_name, surname, current_class")
        .eq("status", "active")
        .order("surname", { ascending: true });

      if (classFilter !== "all") {
        query = query.eq("current_class", classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const studentIds = students.map((s) => s.id);
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", selectedDate)
        .in("student_id", studentIds);

      if (error) throw error;

      const records: Record<string, AttendanceRecord> = {};
      data?.forEach((record) => {
        records[record.student_id] = {
          id: record.id,
          student_id: record.student_id,
          status: record.status,
          reason: record.reason || "",
          is_excused: record.is_excused || false,
        };
      });
      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.surname}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query);
  });

  const updateAttendance = (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        status,
      },
    }));
  };

  const updateReason = (studentId: string, reason: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        reason,
      },
    }));
  };

  const saveAllAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.values(attendanceRecords).filter((r) => r.status);

      for (const record of records) {
        const attendanceData = {
          student_id: record.student_id,
          date: selectedDate,
          status: record.status,
          reason: record.reason || null,
          is_excused: record.status === "absent" ? record.is_excused || false : null,
          recorded_by: user?.id,
        };

        if (record.id) {
          await supabase.from("attendance").update(attendanceData).eq("id", record.id);
        } else {
          await supabase.from("attendance").insert(attendanceData);
        }
      }

      toast({
        title: "Attendance Saved",
        description: `Attendance for ${format(new Date(selectedDate), "MMMM d, yyyy")} has been saved`,
      });

      fetchAttendance();
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    const newRecords: Record<string, AttendanceRecord> = {};
    filteredStudents.forEach((student) => {
      newRecords[student.id] = {
        ...attendanceRecords[student.id],
        student_id: student.id,
        status: "present",
      };
    });
    setAttendanceRecords((prev) => ({ ...prev, ...newRecords }));
  };

  const classes = [
    "Creche",
    "Nursery 1",
    "Nursery 2",
    "KG 1",
    "KG 2",
    "Primary 1",
    "Primary 2",
    "Primary 3",
    "Primary 4",
    "Primary 5",
    "Primary 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-300";
      case "absent":
        return "bg-red-100 text-red-800 border-red-300";
      case "late":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">Record daily student attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            Mark All Present
          </Button>
          <Button onClick={saveAllAttendance} disabled={saving}>
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* Attendance List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No students found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Student</th>
                <th className="text-left p-4 font-medium text-sm hidden md:table-cell">Class</th>
                <th className="text-center p-4 font-medium text-sm">Status</th>
                <th className="text-left p-4 font-medium text-sm hidden lg:table-cell">Reason (if absent)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => {
                const record = attendanceRecords[student.id];
                return (
                  <tr key={student.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {student.first_name.charAt(0)}
                          {student.surname.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {student.first_name} {student.surname}
                          </p>
                          <p className="text-xs text-muted-foreground">{student.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm">{student.current_class}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${
                            record?.status === "present" ? getStatusColor("present") : ""
                          }`}
                          onClick={() => updateAttendance(student.id, "present")}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${
                            record?.status === "absent" ? getStatusColor("absent") : ""
                          }`}
                          onClick={() => updateAttendance(student.id, "absent")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${record?.status === "late" ? getStatusColor("late") : ""}`}
                          onClick={() => updateAttendance(student.id, "late")}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {record?.status === "absent" && (
                        <Input
                          placeholder="Reason for absence..."
                          value={record?.reason || ""}
                          onChange={(e) => updateReason(student.id, e.target.value)}
                          className="max-w-xs"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
