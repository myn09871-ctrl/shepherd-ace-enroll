import { useEffect, useState } from "react";
import { Search, Save, BookOpen } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  term: string;
  academic_year: string;
  class_work_score: number | null;
  assignment_score: number | null;
  midterm_score: number | null;
  endterm_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  position_in_class: number | null;
  teacher_comment: string | null;
}

const GradesManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("Term 1");
  const [yearFilter, setYearFilter] = useState("2024/2025");
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Grade form state
  const [gradeForm, setGradeForm] = useState({
    class_work_score: "",
    assignment_score: "",
    midterm_score: "",
    endterm_score: "",
    teacher_comment: "",
  });

  useEffect(() => {
    fetchData();
  }, [classFilter]);

  const fetchData = async () => {
    try {
      // Fetch students
      let studentQuery = supabase
        .from("students")
        .select("id, student_id, first_name, surname, current_class")
        .eq("status", "active")
        .order("surname", { ascending: true });

      if (classFilter !== "all") {
        studentQuery = studentQuery.eq("current_class", classFilter);
      }

      const { data: studentData, error: studentError } = await studentQuery;
      if (studentError) throw studentError;
      setStudents(studentData || []);

      // Fetch subjects
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (subjectError) throw subjectError;
      setSubjects(subjectData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.surname}`.toLowerCase();
    const studentId = student.student_id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || studentId.includes(query);
  });

  const openGradeDialog = async (student: Student) => {
    setSelectedStudent(student);
    setSelectedSubject("");
    setGradeForm({
      class_work_score: "",
      assignment_score: "",
      midterm_score: "",
      endterm_score: "",
      teacher_comment: "",
    });
    setIsGradeDialogOpen(true);
  };

  const loadExistingGrade = async (subjectId: string) => {
    if (!selectedStudent) return;

    try {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("student_id", selectedStudent.id)
        .eq("subject_id", subjectId)
        .eq("term", termFilter)
        .eq("academic_year", yearFilter)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGradeForm({
          class_work_score: data.class_work_score?.toString() || "",
          assignment_score: data.assignment_score?.toString() || "",
          midterm_score: data.midterm_score?.toString() || "",
          endterm_score: data.endterm_score?.toString() || "",
          teacher_comment: data.teacher_comment || "",
        });
      } else {
        setGradeForm({
          class_work_score: "",
          assignment_score: "",
          midterm_score: "",
          endterm_score: "",
          teacher_comment: "",
        });
      }
    } catch (error) {
      console.error("Error loading grade:", error);
    }
  };

  const calculateGradeLetter = (total: number): string => {
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    if (total >= 40) return "E";
    return "F";
  };

  const saveGrade = async () => {
    if (!selectedStudent || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const classWork = parseFloat(gradeForm.class_work_score) || 0;
      const assignment = parseFloat(gradeForm.assignment_score) || 0;
      const midterm = parseFloat(gradeForm.midterm_score) || 0;
      const endterm = parseFloat(gradeForm.endterm_score) || 0;
      const total = classWork + assignment + midterm + endterm;
      const gradeLetter = calculateGradeLetter(total);

      const gradeData = {
        student_id: selectedStudent.id,
        subject_id: selectedSubject,
        term: termFilter,
        academic_year: yearFilter,
        class_work_score: classWork || null,
        assignment_score: assignment || null,
        midterm_score: midterm || null,
        endterm_score: endterm || null,
        total_score: total || null,
        grade_letter: gradeLetter,
        teacher_comment: gradeForm.teacher_comment || null,
        posted_by: user?.id,
        posted_at: new Date().toISOString(),
      };

      // Check if grade exists
      const { data: existing } = await supabase
        .from("grades")
        .select("id")
        .eq("student_id", selectedStudent.id)
        .eq("subject_id", selectedSubject)
        .eq("term", termFilter)
        .eq("academic_year", yearFilter)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("grades")
          .update(gradeData)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("grades").insert(gradeData);
        if (error) throw error;
      }

      toast({
        title: "Grade Saved",
        description: `Grade posted for ${selectedStudent.first_name} ${selectedStudent.surname}`,
      });

      setIsGradeDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving grade:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save grade",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Grades Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Post and manage student grades</p>
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
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Term 1">Term 1</SelectItem>
            <SelectItem value="Term 2">Term 2</SelectItem>
            <SelectItem value="Term 3">Term 3</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024/2025">2024/2025</SelectItem>
            <SelectItem value="2025/2026">2025/2026</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No students found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Student</th>
                <th className="text-left p-4 font-medium text-sm hidden md:table-cell">Class</th>
                <th className="text-left p-4 font-medium text-sm hidden lg:table-cell">Student ID</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {student.first_name.charAt(0)}
                        {student.surname.charAt(0)}
                      </div>
                      <p className="font-medium text-sm">
                        {student.first_name} {student.surname}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm">{student.current_class}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{student.student_id}</span>
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" onClick={() => openGradeDialog(student)}>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Post Grade
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Dialog */}
      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post Grade</DialogTitle>
            <DialogDescription>
              {selectedStudent?.first_name} {selectedStudent?.surname} - {termFilter} ({yearFilter})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  loadExistingGrade(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Work (10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={gradeForm.class_work_score}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, class_work_score: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Assignment (10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={gradeForm.assignment_score}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, assignment_score: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mid-term (30)</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={gradeForm.midterm_score}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, midterm_score: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End-term (50)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={gradeForm.endterm_score}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, endterm_score: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teacher's Comment</Label>
              <Textarea
                value={gradeForm.teacher_comment}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, teacher_comment: e.target.value })
                }
                placeholder="Enter comment..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveGrade} disabled={saving || !selectedSubject}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradesManagement;
