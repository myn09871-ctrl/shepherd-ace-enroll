import { useState, useEffect } from "react";
import { GraduationCap, Plus, Search, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  current_class: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Grade {
  id?: string;
  student_id: string;
  subject_id: string;
  class_work_score: number | null;
  assignment_score: number | null;
  midterm_score: number | null;
  endterm_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  teacher_comment: string | null;
  academic_year: string;
  term: string;
}

const currentYear = new Date().getFullYear().toString();

const calculateGradeLetter = (total: number | null): string => {
  if (total === null) return "";
  if (total >= 80) return "A1";
  if (total >= 70) return "B2";
  if (total >= 65) return "B3";
  if (total >= 60) return "C4";
  if (total >= 55) return "C5";
  if (total >= 50) return "C6";
  if (total >= 45) return "D7";
  if (total >= 40) return "E8";
  return "F9";
};

const ResultsManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>(currentYear);
  const [term, setTerm] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");

  // Editing state
  const [editingGrades, setEditingGrades] = useState<Record<string, Grade>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchGrades();
    }
  }, [selectedClass, academicYear, term]);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        supabase
          .from("students")
          .select("id, student_id, first_name, surname, current_class")
          .eq("status", "active")
          .order("surname"),
        supabase.from("subjects").select("id, name, code").eq("is_active", true),
      ]);

      if (studentsRes.error) throw studentsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setStudents(studentsRes.data || []);
      setSubjects(subjectsRes.data || []);

      // Set default class
      const classes = [...new Set((studentsRes.data || []).map((s) => s.current_class))].sort();
      if (classes.length > 0) {
        setSelectedClass(classes[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedClass) return;

    try {
      const classStudents = students.filter((s) => s.current_class === selectedClass);
      const studentIds = classStudents.map((s) => s.id);

      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .in("student_id", studentIds)
        .eq("academic_year", academicYear)
        .eq("term", term);

      if (error) throw error;

      setGrades(data || []);

      // Initialize editing grades
      const gradeMap: Record<string, Grade> = {};
      (data || []).forEach((g) => {
        gradeMap[`${g.student_id}-${g.subject_id}`] = g;
      });
      setEditingGrades(gradeMap);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const updateGrade = (studentId: string, subjectId: string, field: keyof Grade, value: any) => {
    const key = `${studentId}-${subjectId}`;
    const existingGrade = editingGrades[key] || {
      student_id: studentId,
      subject_id: subjectId,
      academic_year: academicYear,
      term,
      class_work_score: null,
      assignment_score: null,
      midterm_score: null,
      endterm_score: null,
      total_score: null,
      grade_letter: null,
      teacher_comment: null,
    };

    const updated = { ...existingGrade, [field]: value };

    // Auto-calculate total and grade
    const cw = updated.class_work_score || 0;
    const assign = updated.assignment_score || 0;
    const mid = updated.midterm_score || 0;
    const end = updated.endterm_score || 0;
    const total = cw + assign + mid + end;

    updated.total_score = total > 0 ? total : null;
    updated.grade_letter = calculateGradeLetter(updated.total_score);

    setEditingGrades((prev) => ({ ...prev, [key]: updated }));
  };

  const saveGrades = async () => {
    const gradesToSave = Object.values(editingGrades).filter(
      (g) =>
        g.class_work_score !== null ||
        g.assignment_score !== null ||
        g.midterm_score !== null ||
        g.endterm_score !== null
    );

    if (gradesToSave.length === 0) {
      toast.error("No grades to save");
      return;
    }

    setSaving(true);
    try {
      for (const grade of gradesToSave) {
        const existingGrade = grades.find(
          (g) => g.student_id === grade.student_id && g.subject_id === grade.subject_id
        );

        if (existingGrade) {
          await supabase
            .from("grades")
            .update({
              class_work_score: grade.class_work_score,
              assignment_score: grade.assignment_score,
              midterm_score: grade.midterm_score,
              endterm_score: grade.endterm_score,
              total_score: grade.total_score,
              grade_letter: grade.grade_letter,
              teacher_comment: grade.teacher_comment,
              posted_by: user?.id,
              posted_at: new Date().toISOString(),
            })
            .eq("id", existingGrade.id);
        } else {
          await supabase.from("grades").insert({
            ...grade,
            posted_by: user?.id,
            posted_at: new Date().toISOString(),
          });
        }
      }

      toast.success("Grades saved successfully");
      fetchGrades();
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const uniqueClasses = [...new Set(students.map((s) => s.current_class))].sort();
  const classStudents = students
    .filter((s) => s.current_class === selectedClass)
    .filter((s) =>
      `${s.first_name} ${s.surname}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const getGrade = (studentId: string, subjectId: string): Grade | undefined => {
    return editingGrades[`${studentId}-${subjectId}`];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Results Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter and manage student academic results
          </p>
        </div>
        <Button onClick={saveGrades} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save All Grades"}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Term 1</SelectItem>
                  <SelectItem value="2">Term 2</SelectItem>
                  <SelectItem value="3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Entry */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No subjects found. Please add subjects first.
            </p>
          </CardContent>
        </Card>
      ) : classStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No students in this class</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {classStudents.map((student) => (
            <Card key={student.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    {student.first_name} {student.surname}
                  </span>
                  <Badge variant="outline">{student.student_id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Subject</TableHead>
                        <TableHead className="w-[80px]">CW (20)</TableHead>
                        <TableHead className="w-[80px]">Assign (10)</TableHead>
                        <TableHead className="w-[80px]">Mid (30)</TableHead>
                        <TableHead className="w-[80px]">End (40)</TableHead>
                        <TableHead className="w-[80px]">Total</TableHead>
                        <TableHead className="w-[60px]">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => {
                        const grade = getGrade(student.id, subject.id);
                        return (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium text-sm">
                              {subject.name}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                className="h-8 w-16"
                                value={grade?.class_work_score ?? ""}
                                onChange={(e) =>
                                  updateGrade(
                                    student.id,
                                    subject.id,
                                    "class_work_score",
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                className="h-8 w-16"
                                value={grade?.assignment_score ?? ""}
                                onChange={(e) =>
                                  updateGrade(
                                    student.id,
                                    subject.id,
                                    "assignment_score",
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                className="h-8 w-16"
                                value={grade?.midterm_score ?? ""}
                                onChange={(e) =>
                                  updateGrade(
                                    student.id,
                                    subject.id,
                                    "midterm_score",
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                max="40"
                                className="h-8 w-16"
                                value={grade?.endterm_score ?? ""}
                                onChange={(e) =>
                                  updateGrade(
                                    student.id,
                                    subject.id,
                                    "endterm_score",
                                    e.target.value ? parseFloat(e.target.value) : null
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold">
                                {grade?.total_score ?? "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  grade?.grade_letter?.startsWith("A")
                                    ? "default"
                                    : grade?.grade_letter?.startsWith("B")
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {grade?.grade_letter || "-"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsManagement;
