import { useState, useEffect } from "react";
import { GraduationCap, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateGradeLetter, calculateProficiencyLevel, getGradeDescription } from "@/lib/report-card-utils";

interface Student { id: string; student_id: string; first_name: string; surname: string; }
interface Subject { id: string; name: string; code: string; }
interface GradeEntry {
  student_id: string;
  ias_score: number | null;
  etes_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  proficiency_level: number | null;
  grade_description: string | null;
  existing_id?: string;
}

const currentYear = new Date().getFullYear().toString();

const TeacherResults = () => {
  const { assignedClasses, user } = useTeacherAuth();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("subjects").select("id, name, code").eq("is_active", true).order("name")
      .then(({ data }) => setSubjects((data || []) as Subject[]));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    supabase.from("students").select("id, student_id, first_name, surname")
      .eq("current_class", selectedClass).eq("status", "active").order("surname")
      .then(({ data }) => setStudents((data || []) as Student[]));
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass || !selectedSubject || students.length === 0) return;
    supabase.from("grades").select("*")
      .eq("subject_id", selectedSubject)
      .eq("academic_year", currentYear)
      .eq("term", selectedTerm)
      .in("student_id", students.map(s => s.id))
      .then(({ data }) => {
        const map: Record<string, GradeEntry> = {};
        students.forEach(s => {
          map[s.id] = { student_id: s.id, ias_score: null, etes_score: null, total_score: null, grade_letter: null, proficiency_level: null, grade_description: null };
        });
        (data || []).forEach((g: any) => {
          map[g.student_id] = {
            student_id: g.student_id,
            ias_score: g.ias_score,
            etes_score: g.etes_score,
            total_score: g.total_score,
            grade_letter: g.grade_letter,
            proficiency_level: g.proficiency_level,
            grade_description: g.grade_description,
            existing_id: g.id,
          };
        });
        setGrades(map);
      });
  }, [selectedClass, selectedSubject, selectedTerm, students]);

  const updateScore = (studentId: string, field: "ias_score" | "etes_score", value: string) => {
    const num = value === "" ? null : parseFloat(value);
    setGrades(prev => {
      const entry = { ...prev[studentId], [field]: num };
      const ias = field === "ias_score" ? num : entry.ias_score;
      const etes = field === "etes_score" ? num : entry.etes_score;
      const total = (ias || 0) + (etes || 0);
      entry.total_score = total;
      entry.grade_letter = calculateGradeLetter(total);
      entry.proficiency_level = calculateProficiencyLevel(total);
      entry.grade_description = getGradeDescription(total);
      return { ...prev, [studentId]: entry };
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const upserts = Object.values(grades).map(g => ({
      ...(g.existing_id ? { id: g.existing_id } : {}),
      student_id: g.student_id,
      subject_id: selectedSubject,
      academic_year: currentYear,
      term: selectedTerm,
      ias_score: g.ias_score,
      etes_score: g.etes_score,
      total_score: g.total_score,
      grade_letter: g.grade_letter,
      proficiency_level: g.proficiency_level,
      grade_description: g.grade_description,
      posted_by: user.id,
    }));

    const { error } = await supabase.from("grades").upsert(upserts, { onConflict: "id" });
    if (error) toast.error("Failed to save results");
    else toast.success("Results saved successfully");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <GraduationCap className="h-6 w-6" /> Enter Results
      </h1>

      <div className="flex flex-wrap gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            {assignedClasses.map(c => <SelectItem key={c.id} value={c.class_name}>{c.class_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedTerm} onValueChange={setSelectedTerm}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Term 1", "Term 2", "Term 3"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedClass && selectedSubject && students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Score Entry</CardTitle>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save All"}
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>IAS (50)</TableHead>
                  <TableHead>ETES (50)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(s => {
                  const g = grades[s.id];
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.surname}, {s.first_name}</TableCell>
                      <TableCell>
                        <Input type="number" min={0} max={50} className="w-20"
                          value={g?.ias_score ?? ""} onChange={e => updateScore(s.id, "ias_score", e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} max={50} className="w-20"
                          value={g?.etes_score ?? ""} onChange={e => updateScore(s.id, "etes_score", e.target.value)} />
                      </TableCell>
                      <TableCell className="font-bold">{g?.total_score ?? "-"}</TableCell>
                      <TableCell><Badge variant="outline">{g?.grade_letter || "-"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherResults;
