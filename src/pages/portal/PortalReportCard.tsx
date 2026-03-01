import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import ReportCardPreview from "@/components/admin/ReportCardPreview";
import type { ReportCardData, SubjectGrade } from "@/components/admin/ReportCardPreview";

const PortalReportCard = () => {
  const { currentStudent: student } = useParentAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [availableTerms, setAvailableTerms] = useState<{ year: string; term: string }[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  useEffect(() => {
    if (student) fetchAvailableReports();
  }, [student]);

  useEffect(() => {
    if (student && selectedYear && selectedTerm) fetchReportCard();
  }, [student, selectedYear, selectedTerm]);

  const fetchAvailableReports = async () => {
    if (!student) return;
    const { data } = await supabase
      .from("report_cards")
      .select("academic_year, term")
      .eq("student_id", student.id)
      .eq("is_published", true);

    if (data && data.length > 0) {
      const terms = data.map(d => ({ year: d.academic_year, term: d.term }));
      setAvailableTerms(terms);
      setSelectedYear(terms[0].year);
      setSelectedTerm(terms[0].term);
    }
    setLoading(false);
  };

  const fetchReportCard = async () => {
    if (!student) return;
    setLoading(true);

    const [rcRes, gradesRes] = await Promise.all([
      supabase.from("report_cards").select("*")
        .eq("student_id", student.id)
        .eq("academic_year", selectedYear)
        .eq("term", selectedTerm)
        .eq("is_published", true)
        .maybeSingle(),
      supabase.from("grades")
        .select("*, subjects(name)")
        .eq("student_id", student.id)
        .eq("academic_year", selectedYear)
        .eq("term", selectedTerm),
    ]);

    if (rcRes.data) {
      const rc = rcRes.data as any;
      const grades: SubjectGrade[] = (gradesRes.data || []).map((g: any) => ({
        subject_name: g.subjects?.name || "Unknown",
        ias_score: g.ias_score,
        etes_score: g.etes_score,
        total_score: g.total_score,
        grade_letter: g.grade_letter,
        proficiency_level: g.proficiency_level,
        grade_description: g.grade_description,
        position_in_subject: g.position_in_subject,
      }));

      setReportData({
        student_name: `${student.surname}, ${student.first_name}`,
        student_id: student.student_id,
        gender: (student as any).gender || "",
        class_name: rc.class_name,
        academic_year: rc.academic_year,
        term: rc.term,
        photo_url: student.photo_url,
        number_on_roll: rc.number_on_roll,
        position_in_class: rc.position_in_class,
        learner_average: rc.learner_average,
        class_average: rc.class_average,
        cumulated_score: rc.cumulated_score,
        max_possible_score: rc.max_possible_score,
        promoted_to: rc.promoted_to,
        next_term_begins: rc.next_term_begins,
        attendance_present: rc.attendance_present,
        attendance_total: rc.attendance_total,
        conduct: rc.conduct,
        attitude: rc.attitude,
        interest: rc.interest,
        form_teacher_name: rc.form_teacher_name,
        form_teacher_remark: rc.form_teacher_remark,
        headteacher_name: rc.headteacher_name,
        headteacher_remark: rc.headteacher_remark,
        grades,
      });
    } else {
      setReportData(null);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    const el = document.getElementById("report-card-print");
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Report Card</title>
      <style>body{margin:0;font-family:sans-serif} table{border-collapse:collapse} td,th{padding:4px 8px}</style>
      </head><body>${el.outerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const uniqueYears = [...new Set(availableTerms.map(t => t.year))];
  const termsForYear = availableTerms.filter(t => t.year === selectedYear).map(t => t.term);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Card
          </h1>
          <p className="text-sm text-muted-foreground">View and download terminal report cards</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
            <SelectContent>
              {uniqueYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Term" /></SelectTrigger>
            <SelectContent>
              {termsForYear.map(t => <SelectItem key={t} value={t}>Term {t}</SelectItem>)}
            </SelectContent>
          </Select>
          {reportData && (
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-1" /> Print
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !reportData ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No published report card available for this term</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <ReportCardPreview data={reportData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalReportCard;
