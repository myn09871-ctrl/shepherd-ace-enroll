import { useState, useEffect, useRef } from "react";
import { FileText, Users, Save, Eye, Printer, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ReportCardPreview from "@/components/admin/ReportCardPreview";
import type { ReportCardData, SubjectGrade } from "@/components/admin/ReportCardPreview";
import {
  calculateGradeLetter, calculateProficiencyLevel, getGradeDescription,
} from "@/lib/report-card-utils";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  middle_name: string | null;
  gender: string;
  current_class: string;
  photo_url: string | null;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface ReportCard {
  id?: string;
  student_id: string;
  academic_year: string;
  term: string;
  class_name: string;
  number_on_roll: number | null;
  attendance_present: number | null;
  attendance_total: number | null;
  conduct: string | null;
  attitude: string | null;
  interest: string | null;
  form_teacher_name: string | null;
  form_teacher_remark: string | null;
  headteacher_name: string | null;
  headteacher_remark: string | null;
  next_term_begins: string | null;
  promoted_to: string | null;
  cumulated_score: number | null;
  max_possible_score: number | null;
  learner_average: number | null;
  class_average: number | null;
  position_in_class: number | null;
  is_published: boolean;
}

interface GradeEntry {
  id?: string;
  student_id: string;
  subject_id: string;
  ias_score: number | null;
  etes_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  proficiency_level: number | null;
  grade_description: string | null;
  position_in_subject: number | null;
}

const currentYear = new Date().getFullYear().toString();

const ReportCards = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedClass, setSelectedClass] = useState("");
  const [academicYear, setAcademicYear] = useState(currentYear);
  const [term, setTerm] = useState("1");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [gradeEntries, setGradeEntries] = useState<Record<string, GradeEntry>>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentReportCard(selectedStudent);
    }
  }, [selectedStudent, academicYear, term]);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        supabase.from("students").select("id, student_id, first_name, surname, middle_name, gender, current_class, photo_url").eq("status", "active").order("surname"),
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

  const fetchStudentReportCard = async (student: Student) => {
    try {
      // Fetch report card
      const { data: rc } = await supabase
        .from("report_cards")
        .select("*")
        .eq("student_id", student.id)
        .eq("academic_year", academicYear)
        .eq("term", term)
        .maybeSingle();

      const classStudents = students.filter(s => s.current_class === selectedClass);

      if (rc) {
        setReportCard(rc as ReportCard);
      } else {
        setReportCard({
          student_id: student.id,
          academic_year: academicYear,
          term,
          class_name: selectedClass,
          number_on_roll: classStudents.length,
          attendance_present: null,
          attendance_total: null,
          conduct: null,
          attitude: null,
          interest: null,
          form_teacher_name: null,
          form_teacher_remark: null,
          headteacher_name: null,
          headteacher_remark: null,
          next_term_begins: null,
          promoted_to: null,
          cumulated_score: null,
          max_possible_score: null,
          learner_average: null,
          class_average: null,
          position_in_class: null,
          is_published: false,
        });
      }

      // Fetch grades
      const { data: grades } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", student.id)
        .eq("academic_year", academicYear)
        .eq("term", term);

      const gradeMap: Record<string, GradeEntry> = {};
      (grades || []).forEach((g: any) => {
        gradeMap[g.subject_id] = {
          id: g.id,
          student_id: g.student_id,
          subject_id: g.subject_id,
          ias_score: g.ias_score,
          etes_score: g.etes_score,
          total_score: g.total_score,
          grade_letter: g.grade_letter,
          proficiency_level: g.proficiency_level,
          grade_description: g.grade_description,
          position_in_subject: g.position_in_subject,
        };
      });
      setGradeEntries(gradeMap);
    } catch (error) {
      console.error(error);
    }
  };

  const updateGradeEntry = (subjectId: string, field: "ias_score" | "etes_score", value: number | null) => {
    setGradeEntries(prev => {
      const existing = prev[subjectId] || {
        student_id: selectedStudent!.id,
        subject_id: subjectId,
        ias_score: null,
        etes_score: null,
        total_score: null,
        grade_letter: null,
        proficiency_level: null,
        grade_description: null,
        position_in_subject: null,
      };
      const updated = { ...existing, [field]: value };
      const ias = updated.ias_score || 0;
      const etes = updated.etes_score || 0;
      const total = ias + etes;
      updated.total_score = total > 0 ? total : null;
      updated.grade_letter = calculateGradeLetter(updated.total_score);
      updated.proficiency_level = calculateProficiencyLevel(updated.total_score);
      updated.grade_description = getGradeDescription(updated.total_score);
      return { ...prev, [subjectId]: updated };
    });
  };

  const updateReportField = (field: keyof ReportCard, value: any) => {
    setReportCard(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const computeAggregates = () => {
    const entries = Object.values(gradeEntries).filter(g => g.total_score !== null);
    const cumulated = entries.reduce((sum, g) => sum + (g.total_score || 0), 0);
    const maxPossible = entries.length * 100;
    const average = entries.length > 0 ? cumulated / entries.length : null;
    return { cumulated, maxPossible, average };
  };

  const saveReportCard = async () => {
    if (!selectedStudent || !reportCard) return;
    setSaving(true);
    try {
      const { cumulated, maxPossible, average } = computeAggregates();
      const rcData = {
        ...reportCard,
        cumulated_score: cumulated,
        max_possible_score: maxPossible,
        learner_average: average,
        number_on_roll: students.filter(s => s.current_class === selectedClass).length,
      };

      // Upsert report card
      if (reportCard.id) {
        const { error } = await supabase.from("report_cards").update(rcData).eq("id", reportCard.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("report_cards").insert(rcData).select().single();
        if (error) throw error;
        setReportCard({ ...rcData, id: data.id });
      }

      // Save grades
      const gradesToSave = Object.values(gradeEntries).filter(g => g.ias_score !== null || g.etes_score !== null);
      for (const grade of gradesToSave) {
        const gradeData = {
          student_id: grade.student_id,
          subject_id: grade.subject_id,
          academic_year: academicYear,
          term,
          ias_score: grade.ias_score,
          etes_score: grade.etes_score,
          total_score: grade.total_score,
          grade_letter: grade.grade_letter,
          proficiency_level: grade.proficiency_level,
          grade_description: grade.grade_description,
          position_in_subject: grade.position_in_subject,
          posted_by: user?.id,
          posted_at: new Date().toISOString(),
        };

        if (grade.id) {
          await supabase.from("grades").update(gradeData).eq("id", grade.id);
        } else {
          const { data } = await supabase.from("grades").insert(gradeData).select().single();
          if (data) {
            setGradeEntries(prev => ({ ...prev, [grade.subject_id]: { ...grade, id: data.id } }));
          }
        }
      }

      toast.success("Report card saved successfully");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const generateAllReports = async () => {
    const classStudents = students.filter(s => s.current_class === selectedClass);
    setSaving(true);
    try {
      for (const student of classStudents) {
        const { data: existing } = await supabase
          .from("report_cards")
          .select("id")
          .eq("student_id", student.id)
          .eq("academic_year", academicYear)
          .eq("term", term)
          .maybeSingle();

        if (!existing) {
          await supabase.from("report_cards").insert({
            student_id: student.id,
            academic_year: academicYear,
            term,
            class_name: selectedClass,
            number_on_roll: classStudents.length,
            is_published: false,
          });
        }
      }
      toast.success(`Generated report cards for ${classStudents.length} students`);
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const publishAll = async () => {
    setSaving(true);
    try {
      const classStudentIds = students.filter(s => s.current_class === selectedClass).map(s => s.id);
      const { error } = await supabase
        .from("report_cards")
        .update({ is_published: true })
        .in("student_id", classStudentIds)
        .eq("academic_year", academicYear)
        .eq("term", term);
      if (error) throw error;
      toast.success("All report cards published!");
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const buildPreviewData = (): ReportCardData | null => {
    if (!selectedStudent || !reportCard) return null;
    const { cumulated, maxPossible, average } = computeAggregates();
    const gradesList: SubjectGrade[] = subjects.map(sub => {
      const g = gradeEntries[sub.id];
      return {
        subject_name: sub.name,
        ias_score: g?.ias_score ?? null,
        etes_score: g?.etes_score ?? null,
        total_score: g?.total_score ?? null,
        grade_letter: g?.grade_letter ?? null,
        proficiency_level: g?.proficiency_level ?? null,
        grade_description: g?.grade_description ?? null,
        position_in_subject: g?.position_in_subject ?? null,
      };
    });

    return {
      student_name: `${selectedStudent.surname}, ${selectedStudent.first_name}${selectedStudent.middle_name ? " " + selectedStudent.middle_name : ""}`,
      student_id: selectedStudent.student_id,
      gender: selectedStudent.gender,
      class_name: reportCard.class_name,
      academic_year: reportCard.academic_year,
      term: reportCard.term,
      photo_url: selectedStudent.photo_url,
      number_on_roll: reportCard.number_on_roll,
      position_in_class: reportCard.position_in_class,
      learner_average: average,
      class_average: reportCard.class_average,
      cumulated_score: cumulated,
      max_possible_score: maxPossible,
      promoted_to: reportCard.promoted_to,
      next_term_begins: reportCard.next_term_begins,
      attendance_present: reportCard.attendance_present,
      attendance_total: reportCard.attendance_total,
      conduct: reportCard.conduct,
      attitude: reportCard.attitude,
      interest: reportCard.interest,
      form_teacher_name: reportCard.form_teacher_name,
      form_teacher_remark: reportCard.form_teacher_remark,
      headteacher_name: reportCard.headteacher_name,
      headteacher_remark: reportCard.headteacher_remark,
      grades: gradesList,
    };
  };

  const uniqueClasses = [...new Set(students.map(s => s.current_class))].sort();
  const classStudents = students.filter(s => s.current_class === selectedClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Report Cards
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and manage student terminal report cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAllReports} disabled={saving} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Generate All
          </Button>
          <Button variant="outline" onClick={publishAll} disabled={saving} size="sm">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Publish All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedStudent(null); }}>
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
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> Students ({classStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-y-auto">
            {classStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors ${selectedStudent?.id === student.id ? "bg-primary/10 border-l-4 border-l-primary" : ""}`}
              >
                <p className="font-medium text-sm text-foreground">{student.surname}, {student.first_name}</p>
                <p className="text-xs text-muted-foreground">{student.student_id}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          {!selectedStudent ? (
            <CardContent className="py-20 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a student to edit their report card</p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {selectedStudent.surname}, {selectedStudent.first_name} — Report Card
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                    <Button size="sm" onClick={saveReportCard} disabled={saving}>
                      <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject Scores */}
                <div>
                  <h3 className="font-semibold text-sm mb-2">Subject Scores</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">Subject</TableHead>
                          <TableHead className="w-[80px]">IAS (50)</TableHead>
                          <TableHead className="w-[80px]">ETES (50)</TableHead>
                          <TableHead className="w-[70px]">Total</TableHead>
                          <TableHead className="w-[60px]">Grade</TableHead>
                          <TableHead className="w-[50px]">Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map(subject => {
                          const g = gradeEntries[subject.id];
                          return (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium text-sm">{subject.name}</TableCell>
                              <TableCell>
                                <Input type="number" min="0" max="50" className="h-8 w-16" value={g?.ias_score ?? ""}
                                  onChange={e => updateGradeEntry(subject.id, "ias_score", e.target.value ? parseFloat(e.target.value) : null)} />
                              </TableCell>
                              <TableCell>
                                <Input type="number" min="0" max="50" className="h-8 w-16" value={g?.etes_score ?? ""}
                                  onChange={e => updateGradeEntry(subject.id, "etes_score", e.target.value ? parseFloat(e.target.value) : null)} />
                              </TableCell>
                              <TableCell className="font-bold">{g?.total_score ?? "—"}</TableCell>
                              <TableCell>
                                <Badge className={`text-[10px] ${g?.grade_letter ? "bg-primary/10 text-primary" : ""}`}>
                                  {g?.grade_letter || "—"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">{g?.proficiency_level ?? "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Aggregates */}
                  {(() => {
                    const { cumulated, maxPossible, average } = computeAggregates();
                    return (
                      <div className="mt-2 flex gap-4 text-xs font-medium text-muted-foreground">
                        <span>Cumulated: {cumulated.toFixed(1)} / {maxPossible.toFixed(1)}</span>
                        <span>Average: {average?.toFixed(1) ?? "—"}%</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Report Card Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Attendance (Present)</Label>
                    <Input type="number" value={reportCard?.attendance_present ?? ""} onChange={e => updateReportField("attendance_present", e.target.value ? parseInt(e.target.value) : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Attendance (Total Days)</Label>
                    <Input type="number" value={reportCard?.attendance_total ?? ""} onChange={e => updateReportField("attendance_total", e.target.value ? parseInt(e.target.value) : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Position in Class</Label>
                    <Input type="number" value={reportCard?.position_in_class ?? ""} onChange={e => updateReportField("position_in_class", e.target.value ? parseInt(e.target.value) : null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Conduct</Label>
                    <Input value={reportCard?.conduct ?? ""} onChange={e => updateReportField("conduct", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Attitude</Label>
                    <Input value={reportCard?.attitude ?? ""} onChange={e => updateReportField("attitude", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Interest</Label>
                    <Input value={reportCard?.interest ?? ""} onChange={e => updateReportField("interest", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Promoted To</Label>
                    <Input value={reportCard?.promoted_to ?? ""} onChange={e => updateReportField("promoted_to", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Next Term Begins</Label>
                    <Input type="date" value={reportCard?.next_term_begins ?? ""} onChange={e => updateReportField("next_term_begins", e.target.value || null)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Class Average</Label>
                    <Input type="number" step="0.1" value={reportCard?.class_average ?? ""} onChange={e => updateReportField("class_average", e.target.value ? parseFloat(e.target.value) : null)} />
                  </div>
                </div>

                {/* Remarks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Form Teacher Name</Label>
                    <Input value={reportCard?.form_teacher_name ?? ""} onChange={e => updateReportField("form_teacher_name", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Headteacher Name</Label>
                    <Input value={reportCard?.headteacher_name ?? ""} onChange={e => updateReportField("headteacher_name", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Form Teacher Remark</Label>
                    <Textarea rows={2} value={reportCard?.form_teacher_remark ?? ""} onChange={e => updateReportField("form_teacher_remark", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Headteacher Remark</Label>
                    <Textarea rows={2} value={reportCard?.headteacher_remark ?? ""} onChange={e => updateReportField("headteacher_remark", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Card Preview</DialogTitle>
          </DialogHeader>
          {buildPreviewData() && <ReportCardPreview data={buildPreviewData()!} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportCards;
