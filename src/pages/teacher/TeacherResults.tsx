import { useState, useEffect, useCallback } from "react";
import { GraduationCap, Save, FileText, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateGradeLetter, calculateProficiencyLevel, getGradeDescription } from "@/lib/report-card-utils";
import { getSubjectLevel, TERMS, academicYearOptions } from "@/lib/class-utils";
import ReportCardPreview from "@/components/admin/ReportCardPreview";
import type { ReportCardData, SubjectGrade } from "@/components/admin/ReportCardPreview";

interface Student {
  id: string; student_id: string; first_name: string; surname: string;
  gender: string; photo_url: string | null;
}
interface Subject { id: string; name: string; code: string; class_level: string | null; }
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
interface ReportMeta {
  conduct: string; attitude: string; interest: string;
  attendance_present: string; attendance_total: string;
  form_teacher_remark: string; is_published: boolean;
}

const emptyMeta: ReportMeta = {
  conduct: "", attitude: "", interest: "",
  attendance_present: "", attendance_total: "",
  form_teacher_remark: "", is_published: false,
};

const TeacherResults = () => {
  const { assignedClasses, user, teacherProfile } = useTeacherAuth();
  const yearOptions = academicYearOptions();

  const [selectedClass, setSelectedClass] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [selectedTerm, setSelectedTerm] = useState("1");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [saving, setSaving] = useState(false);

  // report card state
  const [publishedMap, setPublishedMap] = useState<Record<string, boolean>>({});
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [meta, setMeta] = useState<ReportMeta>(emptyMeta);
  const [loadingCard, setLoadingCard] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const level = selectedClass ? getSubjectLevel(selectedClass) : "";
  const subjects = allSubjects.filter(s => (s.class_level || "") === level);
  const subjectsConfigured = subjects.length > 0;

  useEffect(() => {
    supabase.from("subjects").select("id, name, code, class_level").eq("is_active", true).order("name")
      .then(({ data }) => setAllSubjects((data || []) as Subject[]));
  }, []);

  useEffect(() => {
    if (assignedClasses.length > 0 && !selectedClass) setSelectedClass(assignedClasses[0].class_name);
  }, [assignedClasses, selectedClass]);

  useEffect(() => { setSelectedSubject(""); }, [selectedClass]);

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return; }
    supabase.from("students").select("id, student_id, first_name, surname, gender, photo_url")
      .eq("current_class", selectedClass).eq("status", "active").order("surname")
      .then(({ data }) => setStudents((data || []) as Student[]));
  }, [selectedClass]);

  // Draft / Published status per student
  const refreshPublished = useCallback(async () => {
    if (students.length === 0) { setPublishedMap({}); return; }
    const { data } = await supabase.from("report_cards")
      .select("student_id, is_published")
      .in("student_id", students.map(s => s.id))
      .eq("academic_year", academicYear).eq("term", selectedTerm);
    const map: Record<string, boolean> = {};
    (data || []).forEach((r: any) => { map[r.student_id] = r.is_published; });
    setPublishedMap(map);
  }, [students, academicYear, selectedTerm]);

  useEffect(() => { refreshPublished(); }, [refreshPublished]);

  // Load grades for the bulk grid
  useEffect(() => {
    if (!selectedClass || !selectedSubject || students.length === 0) return;
    supabase.from("grades").select("*")
      .eq("subject_id", selectedSubject)
      .eq("academic_year", academicYear)
      .eq("term", selectedTerm)
      .in("student_id", students.map(s => s.id))
      .then(({ data }) => {
        const map: Record<string, GradeEntry> = {};
        students.forEach(s => {
          map[s.id] = {
            student_id: s.id, ias_score: null, etes_score: null, total_score: null,
            grade_letter: null, proficiency_level: null, grade_description: null,
          };
        });
        (data || []).forEach((g: any) => {
          map[g.student_id] = {
            student_id: g.student_id,
            ias_score: g.ias_score, etes_score: g.etes_score, total_score: g.total_score,
            grade_letter: g.grade_letter, proficiency_level: g.proficiency_level,
            grade_description: g.grade_description, existing_id: g.id,
          };
        });
        setGrades(map);
      });
  }, [selectedClass, selectedSubject, selectedTerm, academicYear, students]);

  const updateScore = (studentId: string, field: "ias_score" | "etes_score", value: string) => {
    let num = value === "" ? null : parseFloat(value);
    if (num !== null && Number.isNaN(num)) num = null;
    if (num !== null) num = Math.min(50, Math.max(0, num));
    setGrades(prev => {
      const entry = { ...prev[studentId], student_id: studentId, [field]: num } as GradeEntry;
      const ias = field === "ias_score" ? num : entry.ias_score;
      const etes = field === "etes_score" ? num : entry.etes_score;
      const hasAny = ias !== null || etes !== null;
      const total = hasAny ? (ias || 0) + (etes || 0) : null;
      entry.total_score = total;
      entry.grade_letter = total === null ? null : calculateGradeLetter(total);
      entry.proficiency_level = total === null ? null : calculateProficiencyLevel(total);
      entry.grade_description = total === null ? null : getGradeDescription(total);
      return { ...prev, [studentId]: entry };
    });
  };

  const handleSave = async () => {
    if (!user || !selectedSubject) return;
    setSaving(true);
    const rows = Object.values(grades)
      .filter(g => g.ias_score !== null || g.etes_score !== null)
      .map(g => ({
        ...(g.existing_id ? { id: g.existing_id } : {}),
        student_id: g.student_id,
        subject_id: selectedSubject,
        academic_year: academicYear,
        term: selectedTerm,
        ias_score: g.ias_score,
        etes_score: g.etes_score,
        total_score: g.total_score,
        grade_letter: g.grade_letter,
        proficiency_level: g.proficiency_level,
        grade_description: g.grade_description,
        posted_by: user.id,
        posted_at: new Date().toISOString(),
      }));

    if (rows.length === 0) {
      toast.error("Enter at least one score before saving");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("grades").upsert(rows, { onConflict: "id" });
    if (error) {
      console.error(error);
      toast.error(error.message || "Failed to save results");
    } else {
      toast.success("Results saved");
      // refresh so new rows pick up their ids
      setSelectedSubject(s => s);
      const { data } = await supabase.from("grades").select("*")
        .eq("subject_id", selectedSubject).eq("academic_year", academicYear)
        .eq("term", selectedTerm).in("student_id", students.map(s => s.id));
      setGrades(prev => {
        const next = { ...prev };
        (data || []).forEach((g: any) => { if (next[g.student_id]) next[g.student_id].existing_id = g.id; });
        return next;
      });
    }
    setSaving(false);
  };

  // ---- Step 2: per-student report card --------------------------------
  const openReportCard = async (student: Student) => {
    setActiveStudent(student);
    setLoadingCard(true);
    setReportData(null);

    const [gradesRes, rcRes] = await Promise.all([
      supabase.from("grades").select("*, subjects(name)")
        .eq("student_id", student.id).eq("academic_year", academicYear).eq("term", selectedTerm),
      supabase.from("report_cards").select("*")
        .eq("student_id", student.id).eq("academic_year", academicYear)
        .eq("term", selectedTerm).maybeSingle(),
    ]);

    const subjectGrades: SubjectGrade[] = (gradesRes.data || []).map((g: any) => ({
      subject_name: g.subjects?.name || "Unknown",
      ias_score: g.ias_score, etes_score: g.etes_score, total_score: g.total_score,
      grade_letter: g.grade_letter, proficiency_level: g.proficiency_level,
      grade_description: g.grade_description, position_in_subject: g.position_in_subject,
    }));

    const rc = rcRes.data as any;
    setMeta(rc ? {
      conduct: rc.conduct || "", attitude: rc.attitude || "", interest: rc.interest || "",
      attendance_present: rc.attendance_present?.toString() ?? "",
      attendance_total: rc.attendance_total?.toString() ?? "",
      form_teacher_remark: rc.form_teacher_remark || "",
      is_published: !!rc.is_published,
    } : emptyMeta);

    const scored = subjectGrades.filter(g => g.total_score !== null);
    const cumulated = scored.reduce((a, g) => a + Number(g.total_score), 0);

    setReportData({
      student_name: `${student.surname}, ${student.first_name}`,
      student_id: student.student_id,
      gender: student.gender,
      class_name: selectedClass,
      academic_year: academicYear,
      term: selectedTerm,
      photo_url: student.photo_url,
      number_on_roll: rc?.number_on_roll ?? students.length,
      position_in_class: rc?.position_in_class ?? null,
      learner_average: scored.length ? Math.round((cumulated / scored.length) * 10) / 10 : null,
      class_average: rc?.class_average ?? null,
      cumulated_score: cumulated,
      max_possible_score: scored.length * 100,
      promoted_to: rc?.promoted_to ?? null,
      next_term_begins: rc?.next_term_begins ?? null,
      attendance_present: rc?.attendance_present ?? null,
      attendance_total: rc?.attendance_total ?? null,
      conduct: rc?.conduct ?? null,
      attitude: rc?.attitude ?? null,
      interest: rc?.interest ?? null,
      form_teacher_name: rc?.form_teacher_name ?? teacherProfile?.full_name ?? null,
      form_teacher_remark: rc?.form_teacher_remark ?? null,
      headteacher_name: rc?.headteacher_name ?? null,
      headteacher_remark: rc?.headteacher_remark ?? null,
      grades: subjectGrades,
    });
    setLoadingCard(false);
  };

  // keep the live preview in sync with the editable fields
  useEffect(() => {
    setReportData(prev => prev ? {
      ...prev,
      conduct: meta.conduct || null,
      attitude: meta.attitude || null,
      interest: meta.interest || null,
      attendance_present: meta.attendance_present === "" ? null : Number(meta.attendance_present),
      attendance_total: meta.attendance_total === "" ? null : Number(meta.attendance_total),
      form_teacher_remark: meta.form_teacher_remark || null,
    } : prev);
  }, [meta]);

  const handlePublish = async () => {
    if (!activeStudent) return;
    setPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("publish-report-card", {
        body: {
          student_id: activeStudent.id,
          class_name: selectedClass,
          academic_year: academicYear,
          term: selectedTerm,
          conduct: meta.conduct,
          attitude: meta.attitude,
          interest: meta.interest,
          attendance_present: meta.attendance_present,
          attendance_total: meta.attendance_total,
          form_teacher_remark: meta.form_teacher_remark,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Publish failed");

      toast.success("Report card published to the parent portal");
      setPublishedMap(prev => ({ ...prev, [activeStudent.id]: true }));
      setMeta(m => ({ ...m, is_published: true }));
      const rc = data.report_card;
      setReportData(prev => prev ? {
        ...prev,
        class_average: rc.class_average,
        learner_average: rc.learner_average,
        position_in_class: rc.position_in_class,
        number_on_roll: rc.number_on_roll,
        cumulated_score: rc.cumulated_score,
        max_possible_score: rc.max_possible_score,
        form_teacher_name: rc.form_teacher_name,
      } : prev);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not publish this report card");
    }
    setPublishing(false);
    setConfirmOpen(false);
  };

  const selectorRow = (
    <div className="flex flex-wrap gap-3">
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Class" /></SelectTrigger>
        <SelectContent>
          {assignedClasses.map(c => <SelectItem key={c.id} value={c.class_name}>{c.class_name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={academicYear} onValueChange={setAcademicYear}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={selectedTerm} onValueChange={setSelectedTerm}>
        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
        <SelectContent>{TERMS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <GraduationCap className="h-6 w-6" /> Results &amp; Report Cards
      </h1>

      {selectorRow}

      {selectedClass && !subjectsConfigured && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Subjects have not been configured for <strong>{selectedClass}</strong> yet.
            Ask an administrator to add this class&rsquo;s subject list before entering results.
          </CardContent>
        </Card>
      )}

      {selectedClass && subjectsConfigured && (
        <Tabs defaultValue="entry">
          <TabsList>
            <TabsTrigger value="entry">Step 1 &middot; Score Entry</TabsTrigger>
            <TabsTrigger value="cards">Step 2 &middot; Report Cards</TabsTrigger>
          </TabsList>

          {/* ---------------- Step 1 ---------------- */}
          <TabsContent value="entry" className="mt-4 space-y-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {selectedSubject && students.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
                No active learners found in {selectedClass}.
              </CardContent></Card>
            )}

            {selectedSubject && students.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Score Entry</CardTitle>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save"}
                  </Button>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="w-24">IAS (50)</TableHead>
                        <TableHead className="w-24">ETES (50)</TableHead>
                        <TableHead className="w-20">Total</TableHead>
                        <TableHead className="w-20">Grade</TableHead>
                        <TableHead className="w-16">Level</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(s => {
                        const g = grades[s.id];
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium whitespace-nowrap">{s.surname}, {s.first_name}</TableCell>
                            <TableCell>
                              <Input type="number" min={0} max={50} className="w-20"
                                value={g?.ias_score ?? ""} onChange={e => updateScore(s.id, "ias_score", e.target.value)} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" min={0} max={50} className="w-20"
                                value={g?.etes_score ?? ""} onChange={e => updateScore(s.id, "etes_score", e.target.value)} />
                            </TableCell>
                            <TableCell className="font-bold">{g?.total_score ?? "—"}</TableCell>
                            <TableCell><Badge variant="outline">{g?.grade_letter || "—"}</Badge></TableCell>
                            <TableCell>{g?.proficiency_level ?? "—"}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{g?.grade_description || "—"}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ---------------- Step 2 ---------------- */}
          <TabsContent value="cards" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Class Roster &mdash; {selectedClass}</CardTitle></CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No active learners in this class.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Report Card</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.surname}, {s.first_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{s.student_id}</TableCell>
                          <TableCell>
                            {publishedMap[s.id]
                              ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Published</Badge>
                              : <Badge variant="outline">Draft</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => openReportCard(s)}>
                              <FileText className="h-4 w-4 mr-1" /> Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* ---------------- Report card dialog ---------------- */}
      <Dialog open={!!activeStudent} onOpenChange={(o) => { if (!o) { setActiveStudent(null); setReportData(null); } }}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeStudent ? `${activeStudent.surname}, ${activeStudent.first_name}` : ""}
              {meta.is_published
                ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Published</Badge>
                : <Badge variant="outline">Draft</Badge>}
            </DialogTitle>
          </DialogHeader>

          {loadingCard || !reportData ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Conduct</Label>
                  <Input value={meta.conduct} onChange={e => setMeta({ ...meta, conduct: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Attitude</Label>
                  <Input value={meta.attitude} onChange={e => setMeta({ ...meta, attitude: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Interest</Label>
                  <Input value={meta.interest} onChange={e => setMeta({ ...meta, interest: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Days Present</Label>
                  <Input type="number" min={0} value={meta.attendance_present}
                    onChange={e => setMeta({ ...meta, attendance_present: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Total School Days</Label>
                  <Input type="number" min={0} value={meta.attendance_total}
                    onChange={e => setMeta({ ...meta, attendance_total: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                  <Label>Form Teacher&rsquo;s Remark</Label>
                  <Textarea rows={2} value={meta.form_teacher_remark}
                    onChange={e => setMeta({ ...meta, form_teacher_remark: e.target.value })} />
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <ReportCardPreview data={reportData} />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setConfirmOpen(true)} disabled={publishing}>
                  <Send className="h-4 w-4 mr-2" />
                  {meta.is_published ? "Re-publish to Parent" : "Publish to Parent"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this report card?</AlertDialogTitle>
            <AlertDialogDescription>
              The class average, learner average and position will be calculated and the report card
              will become visible to this learner&rsquo;s parents in the Parent Portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handlePublish(); }} disabled={publishing}>
              {publishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherResults;
