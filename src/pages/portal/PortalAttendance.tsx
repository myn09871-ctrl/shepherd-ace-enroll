import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameMonth } from "date-fns";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  time_in: string | null;
  time_out: string | null;
  reason: string | null;
  is_excused: boolean | null;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  totalDays: number;
}

const PortalAttendance = () => {
  const { student } = useParentAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    totalDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (student) {
      fetchAttendance();
    }
  }, [student, selectedMonth]);

  const fetchAttendance = async () => {
    if (!student) return;

    setLoading(true);
    const startDate = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
    const endDate = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", student.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching attendance:", error);
    } else {
      setAttendance(data || []);
      
      // Calculate stats
      const present = data?.filter(a => a.status === "present").length || 0;
      const absent = data?.filter(a => a.status === "absent").length || 0;
      const late = data?.filter(a => a.status === "late").length || 0;
      const excused = data?.filter(a => a.is_excused).length || 0;
      
      setStats({
        present,
        absent,
        late,
        excused,
        totalDays: data?.length || 0,
      });
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "excused":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, isExcused: boolean | null) => {
    if (isExcused) {
      return <Badge className="bg-blue-100 text-blue-800">Excused</Badge>;
    }
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const attendancePercentage = stats.totalDays > 0 
    ? Math.round(((stats.present + stats.late) / stats.totalDays) * 100) 
    : 100;

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });

  const getAttendanceForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return attendance.find(a => a.date === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Attendance Record
          </h1>
          <p className="text-sm text-muted-foreground">
            Track daily attendance and punctuality
          </p>
        </div>

        <div className="flex gap-2">
          <Select 
            value={selectedMonth.getMonth().toString()} 
            onValueChange={(v) => {
              const newDate = new Date(selectedMonth);
              newDate.setMonth(parseInt(v));
              setSelectedMonth(newDate);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, i) => (
                <SelectItem key={i} value={i.toString()}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={selectedMonth.getFullYear().toString()} 
            onValueChange={(v) => {
              const newDate = new Date(selectedMonth);
              newDate.setFullYear(parseInt(v));
              setSelectedMonth(newDate);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-4 text-center">
            <div className={`text-3xl font-bold ${
              attendancePercentage >= 90 ? 'text-green-600' :
              attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {attendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">Late</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
            <p className="text-xs text-muted-foreground">Excused</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {format(selectedMonth, "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before the month starts */}
              {Array.from({ length: (calendarDays[0].getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              
              {calendarDays.map((day) => {
                const record = getAttendanceForDay(day);
                const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`
                      p-2 text-center rounded-lg text-sm
                      ${isWeekend(day) ? 'bg-muted/30 text-muted-foreground' : ''}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${record?.status === 'present' ? 'bg-green-100' : ''}
                      ${record?.status === 'absent' && !record?.is_excused ? 'bg-red-100' : ''}
                      ${record?.status === 'late' ? 'bg-yellow-100' : ''}
                      ${record?.is_excused ? 'bg-blue-100' : ''}
                    `}
                  >
                    <span className="block">{format(day, "d")}</span>
                    {record && (
                      <div className="flex justify-center mt-1">
                        {getStatusIcon(record.is_excused ? "excused" : record.status)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed List */}
      {attendance.filter(a => a.status === "absent" || a.status === "late").length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Absences & Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance
                  .filter(a => a.status === "absent" || a.status === "late")
                  .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(record.status, record.is_excused)}</TableCell>
                      <TableCell>{record.time_in || "—"}</TableCell>
                      <TableCell className="max-w-xs truncate">{record.reason || "—"}</TableCell>
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

export default PortalAttendance;
