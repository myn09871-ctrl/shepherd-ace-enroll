import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  gender: string;
  current_class: string;
  photo_url: string | null;
}

const TeacherClasses = () => {
  const { assignedClasses } = useTeacherAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assignedClasses.length > 0 && !selectedClass) {
      setSelectedClass(assignedClasses[0].class_name);
    }
  }, [assignedClasses]);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    supabase
      .from("students")
      .select("*")
      .eq("current_class", selectedClass)
      .eq("status", "active")
      .order("surname")
      .then(({ data }) => {
        setStudents((data || []) as Student[]);
        setLoading(false);
      });
  }, [selectedClass]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Classes</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {assignedClasses.map((cls) => (
          <button
            key={cls.id}
            onClick={() => setSelectedClass(cls.class_name)}
            className={`p-4 rounded-xl border-2 transition-all text-center ${
              selectedClass === cls.class_name
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/30"
            }`}
          >
            <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="font-semibold text-sm">{cls.class_name}</p>
            <p className="text-xs text-muted-foreground">{cls.academic_year}</p>
          </button>
        ))}
      </div>

      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Students in {selectedClass}
              <Badge variant="secondary" className="ml-auto">{students.length} students</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No students found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.student_id}</TableCell>
                      <TableCell className="font-medium">
                        {s.surname}, {s.first_name} {s.middle_name || ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.gender}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherClasses;
