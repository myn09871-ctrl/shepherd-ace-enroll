import { useState, useEffect } from "react";
import { GraduationCap, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  calculateGradeLetter, calculateProficiencyLevel, getGradeDescription, getGradeColor,
} from "@/lib/report-card-utils";

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
  ias_score: number | null;
  etes_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  proficiency_level: number | null;
  grade_description: string | null;
  teacher_comment: string | null;
  academic_year: string;
  term: string;
}

const currentYear = new Date().getFullYear().toString();

const ResultsManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [academicYear, setAcademicYear] = useState<string>(currentYear);
  const [term, setTerm] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingGrades, setEditingGrades] = useState<Record<string, Grade>>({});

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (selectedClass) fetchGrades();
  }, [selectedClass, academicYear, term]);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        supabase.from("students").select("id, student_id, first_name, surname, current_class").eq("status", "active").order("surname"),
        supabase.from("subjects").select("id, name, code").eq("is_active", true),
      ]);
      if (studentsRes.error) throw studentsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;
      setStudents(studentsRes.data || []);
      setSubjects(subjectsRes.data || []);
      const classes = [...new Set((studentsRes.data || []).map(s => s.current_class))].sort();
      if (classes.length > 0) setSelectedClass(classes[0]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    if (!selectedClass) return;
    try {
      const classStudents = students.filter(s => s.current_class === selectedClass);
      const studentIds = classStudents.map(s => s.id);
      const { data, error } = await supabase
        .from("grades").select("*").in("student_id", studentIds)
        .eq("academic_year", academicYear).eq("term", term);
      if (error) throw error;
      setGrades(data || []);
      const gradeMap: Record<string, Grade> = {};
      (data || []).forEach((g: any) => {
        gradeMap[`${g.student_id}-${g.subject_id}`] = {
          id: g.id,
          student_id: g.student_id,
          subject_id: g.subject_id,
          ias_score: g.ias_score,
          etes_score: g.etes_score,
          total_score: g.total_score,
          grade_letter: g.grade_letter,
          proficiency_level: g.proficiency_level,
          grade_description: g.grade_description,
          teacher_comment: g.teacher_comment,
          academic_year: g.academic_year,
          term: g.term,
        };
      });
      setEditingGrades(gradeMap);
    } catch (error) {
      console.error(error);
    }
  };

  const updateGrade = (studentId: string, subjectId: string, field: "ias_score" | "etes_score", value: number | null) => {
    const key = `${studentId}-${subjectId}`;
    const existingGrade = editingGrades[key] || {
      student_id: studentId,
      subject_id: subjectId,
      academic_year: academicYear,
      term,
      ias_score: null,
      etes_score: null,
      total_score: null,
      grade_letter: null,
      proficiency_level: null,
      grade_description: null,
      teacher_comment: null,
    };

    const updated = { ...existingGrade, [field]: value };
    const ias = updated.ias_score || 0;
    const etes = updated.etes_score || 0;
    const total = ias + etes;
    updated.total_score = total > 0 ? total : null;
    updated.grade_letter = calculateGradeLetter(updated.total_score);
    updated.proficiency_level = calculateProficiencyLevel(updated.total_score);
    updated.grade_description = getGradeDescription(updated.total_score);

    setEditingGrades(prev => ({ ...prev, [key]: updated }));
  };

  const saveGrades = async () => {
    const gradesToSave = Object.values(editingGrades).filter(
      g => g.ias_score !== null || g.etes_score !== null
    );

    if (gradesToSave.length === 0) {
      toast.error("No grades to save");
      return;
    }

    setSaving(true);
    try {
      for (const grade of gradesToSave) {
        const gradeData = {
          ias_score: grade.ias_score,
          etes_score: grade.etes_score,
          total_score: grade.total_score,
          grade_letter: grade.grade_letter,
          proficiency_level: grade.proficiency_level,
          grade_description: grade.grade_description,
          teacher_comment: grade.teacher_comment,
          posted_by: user?.id,
          posted_at: new Date().toISOString(),
        };

        const existingGrade = grades.find(
          g => g.student_id === grade.student_id && g.subject_id === grade.subject_id
        );

        if (existingGrade?.id) {
          await supabase.from("grades").update(gradeData).eq("id", existingGrade.id);
        } else {
          await supabase.from("grades").insert({
            ...gradeData,
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            academic_year: academicYear,
            term,
          });
        }
      }
      toast.success("Grades saved successfully");
      fetchGrades();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const uniqueClasses = [...new Set(students.map(s => s.current_class))].sort();
  const classStudents = students
    .filter(s => s.current_class === selectedClass)
    .filter(s => `${s.first_name} ${s.surname}`.toLowerCase().includes(searchQuery.toLowerCase()));

  const getGrade = (studentId: string, subjectId: string) => editingGrades[`${studentId}-${subjectId}`];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Results Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter and manage student academic results (IAS / ETES)
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
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Input placeholder="Search student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
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
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No subjects found. Please add subjects first.</p></CardContent></Card>
      ) : classStudents.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No students in this class</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {classStudents.map(student => (
            <Card key={student.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{student.first_name} {student.surname}</span>
                  <Badge variant="outline">{student.student_id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Subject</TableHead>
                        <TableHead className="w-[80px]">IAS (50)</TableHead>
                        <TableHead className="w-[80px]">ETES (50)</TableHead>
                        <TableHead className="w-[80px]">Total (100)</TableHead>
                        <TableHead className="w-[60px]">Grade</TableHead>
                        <TableHead className="w-[50px]">Level</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map(subject => {
                        const grade = getGrade(student.id, subject.id);
                        return (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium text-sm">{subject.name}</TableCell>
                            <TableCell>
                              <Input type="number" min="0" max="50" className="h-8 w-16"
                                value={grade?.ias_score ?? ""}
                                onChange={e => updateGrade(student.id, subject.id, "ias_score", e.target.value ? parseFloat(e.target.value) : null)} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min="0" max="50" className="h-8 w-16"
                                value={grade?.etes_score ?? ""}
                                onChange={e => updateGrade(student.id, subject.id, "etes_score", e.target.value ? parseFloat(e.target.value) : null)} />
                            </TableCell>
                            <TableCell className="font-semibold">{grade?.total_score ?? "—"}</TableCell>
                            <TableCell>
                              <Badge className={getGradeColor(grade?.grade_letter ?? null)}>
                                {grade?.grade_letter || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{grade?.proficiency_level ?? "—"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{grade?.grade_description || "—"}</TableCell>
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
