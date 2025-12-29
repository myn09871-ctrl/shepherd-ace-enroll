import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface Grade {
  id: string;
  subject_name: string;
  class_work_score: number | null;
  assignment_score: number | null;
  midterm_score: number | null;
  endterm_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  position_in_class: number | null;
  class_average: number | null;
  teacher_comment: string | null;
}

const PortalAcademics = () => {
  const { student } = useParentAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);

  useEffect(() => {
    if (student) {
      fetchAvailableFilters();
    }
  }, [student]);

  useEffect(() => {
    if (student && selectedYear && selectedTerm) {
      fetchGrades();
    }
  }, [student, selectedYear, selectedTerm]);

  const fetchAvailableFilters = async () => {
    if (!student) return;

    const { data } = await supabase
      .from("grades")
      .select("academic_year, term")
      .eq("student_id", student.id);

    if (data) {
      const years = [...new Set(data.map(g => g.academic_year))].sort().reverse();
      const terms = [...new Set(data.map(g => g.term))];
      
      setAvailableYears(years);
      setAvailableTerms(terms);
      
      if (years.length > 0) setSelectedYear(years[0]);
      if (terms.length > 0) setSelectedTerm(terms[0]);
    }
    setLoading(false);
  };

  const fetchGrades = async () => {
    if (!student) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("grades")
      .select(`
        id,
        class_work_score,
        assignment_score,
        midterm_score,
        endterm_score,
        total_score,
        grade_letter,
        position_in_class,
        class_average,
        teacher_comment,
        subjects(name)
      `)
      .eq("student_id", student.id)
      .eq("academic_year", selectedYear)
      .eq("term", selectedTerm)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching grades:", error);
    } else {
      const formattedGrades: Grade[] = (data || []).map((g: any) => ({
        id: g.id,
        subject_name: g.subjects?.name || "Unknown Subject",
        class_work_score: g.class_work_score,
        assignment_score: g.assignment_score,
        midterm_score: g.midterm_score,
        endterm_score: g.endterm_score,
        total_score: g.total_score,
        grade_letter: g.grade_letter,
        position_in_class: g.position_in_class,
        class_average: g.class_average,
        teacher_comment: g.teacher_comment,
      }));
      setGrades(formattedGrades);
    }
    setLoading(false);
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-gray-100 text-gray-800";
    if (grade.startsWith("A")) return "bg-green-100 text-green-800";
    if (grade.startsWith("B")) return "bg-blue-100 text-blue-800";
    if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-800";
    if (grade.startsWith("D")) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getPerformanceIndicator = (score: number | null, average: number | null) => {
    if (score === null || average === null) return null;
    if (score > average + 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (score < average - 5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const calculateOverallAverage = () => {
    const validScores = grades.filter(g => g.total_score !== null);
    if (validScores.length === 0) return null;
    const sum = validScores.reduce((acc, g) => acc + (g.total_score || 0), 0);
    return (sum / validScores.length).toFixed(1);
  };

  const overallAverage = calculateOverallAverage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Academic Performance
          </h1>
          <p className="text-sm text-muted-foreground">
            View grades, report cards, and academic progress
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              {availableTerms.map(term => (
                <SelectItem key={term} value={term}>{term}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Card */}
      {overallAverage && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Term Average</p>
                <p className="text-3xl font-bold text-foreground">{overallAverage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTerm} - {selectedYear}
                </p>
              </div>
              <div className="p-4 bg-primary/20 rounded-full">
                <Award className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grades Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Subject Grades</CardTitle>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No grades available for this term</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Class Work</TableHead>
                    <TableHead className="text-center">Assignment</TableHead>
                    <TableHead className="text-center">Mid-term</TableHead>
                    <TableHead className="text-center">End-term</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-center">vs Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.subject_name}</TableCell>
                      <TableCell className="text-center">{grade.class_work_score ?? "—"}</TableCell>
                      <TableCell className="text-center">{grade.assignment_score ?? "—"}</TableCell>
                      <TableCell className="text-center">{grade.midterm_score ?? "—"}</TableCell>
                      <TableCell className="text-center">{grade.endterm_score ?? "—"}</TableCell>
                      <TableCell className="text-center font-semibold">{grade.total_score ?? "—"}</TableCell>
                      <TableCell className="text-center">
                        {grade.grade_letter && (
                          <Badge className={getGradeColor(grade.grade_letter)}>
                            {grade.grade_letter}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{grade.position_in_class ?? "—"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getPerformanceIndicator(grade.total_score, grade.class_average)}
                          <span className="text-xs text-muted-foreground">
                            {grade.class_average ? `${grade.class_average}%` : "—"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Comments */}
      {grades.some(g => g.teacher_comment) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Teacher Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {grades.filter(g => g.teacher_comment).map((grade) => (
              <div key={grade.id} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">{grade.subject_name}</p>
                <p className="text-sm text-muted-foreground mt-1">{grade.teacher_comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalAcademics;
