import { GRADE_SCALE, getGradeColor } from "@/lib/report-card-utils";
import { Badge } from "@/components/ui/badge";
import schoolCrest from "@/assets/school-crest.jpeg";

interface SubjectGrade {
  subject_name: string;
  ias_score: number | null;
  etes_score: number | null;
  total_score: number | null;
  grade_letter: string | null;
  proficiency_level: number | null;
  grade_description: string | null;
  position_in_subject: number | null;
}

interface ReportCardData {
  student_name: string;
  student_id: string;
  gender: string;
  class_name: string;
  academic_year: string;
  term: string;
  photo_url: string | null;
  number_on_roll: number | null;
  position_in_class: number | null;
  learner_average: number | null;
  class_average: number | null;
  cumulated_score: number | null;
  max_possible_score: number | null;
  promoted_to: string | null;
  next_term_begins: string | null;
  attendance_present: number | null;
  attendance_total: number | null;
  conduct: string | null;
  attitude: string | null;
  interest: string | null;
  form_teacher_name: string | null;
  form_teacher_remark: string | null;
  headteacher_name: string | null;
  headteacher_remark: string | null;
  grades: SubjectGrade[];
}

interface ReportCardPreviewProps {
  data: ReportCardData;
}

const ReportCardPreview = ({ data }: ReportCardPreviewProps) => {
  const overallRemark = () => {
    if (!data.learner_average) return "";
    if (data.learner_average >= 80) return "Excellent";
    if (data.learner_average >= 75) return "Very Good";
    if (data.learner_average >= 70) return "Good";
    if (data.learner_average >= 65) return "Satisfactory";
    return "Needs Improvement";
  };

  return (
    <div className="bg-white text-black p-6 max-w-[800px] mx-auto text-sm" id="report-card-print">
      {/* Header */}
      <div className="bg-gradient-to-r from-[hsl(230,70%,35%)] via-[hsl(220,80%,30%)] to-[hsl(180,60%,35%)] text-white rounded-t-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={schoolCrest} alt="Crest" className="h-16 w-16 rounded-full border-2 border-white/50 object-cover" />
            <div>
              <h1 className="text-xl font-bold tracking-wide">GOOD SHEPHERD INTERNATIONAL SCHOOL</h1>
              <p className="text-xs opacity-90">P.O. Box AF 1735, Adoagyiri - Nsawam, E/R</p>
              <p className="text-xs opacity-90">Tel: 0243-316-853 / 0508-525-498 | Email: gsikibi@gmail.com</p>
              <p className="text-xs italic opacity-80 mt-1">"Training Up a Child in The Way He Should Go"</p>
            </div>
          </div>
          {data.photo_url ? (
            <img src={data.photo_url} alt="Student" className="h-20 w-16 rounded border-2 border-white/50 object-cover" />
          ) : (
            <div className="h-20 w-16 rounded border-2 border-white/30 bg-white/10 flex items-center justify-center text-white/50 text-[10px]">
              Photo
            </div>
          )}
        </div>
      </div>

      {/* Title Bar */}
      <div className="bg-[hsl(45,90%,55%)] text-center py-2 font-bold text-base tracking-widest text-[hsl(230,70%,25%)]">
        LEARNER'S TERMINAL REPORT
      </div>

      {/* Student Info Grid */}
      <div className="border border-gray-300 p-3">
        <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs">
          <div><span className="font-semibold">Name:</span> {data.student_name}</div>
          <div><span className="font-semibold">Gender:</span> {data.gender}</div>
          <div><span className="font-semibold">No. on Roll:</span> {data.number_on_roll ?? "—"}</div>

          <div><span className="font-semibold">Form/Class:</span> {data.class_name}</div>
          <div><span className="font-semibold">Academic Year:</span> {data.academic_year}</div>
          <div><span className="font-semibold">Term:</span> Term {data.term}</div>

          <div><span className="font-semibold">Position:</span> {data.position_in_class ?? "—"}{data.position_in_class ? getOrdinalSuffix(data.position_in_class) : ""}</div>
          <div><span className="font-semibold">Average Mark:</span> {data.learner_average?.toFixed(1) ?? "—"}%</div>
          <div><span className="font-semibold">Remark:</span> {overallRemark()}</div>

          <div><span className="font-semibold">Promoted To:</span> {data.promoted_to ?? "—"}</div>
          <div><span className="font-semibold">Next Term:</span> {data.next_term_begins ?? "—"}</div>
          <div></div>
        </div>
      </div>

      {/* Grades Table */}
      <table className="w-full border-collapse mt-0 text-xs">
        <thead>
          <tr className="bg-[hsl(230,70%,35%)] text-white">
            <th className="border border-gray-400 px-2 py-1.5 text-left w-8">S/N</th>
            <th className="border border-gray-400 px-2 py-1.5 text-left">SUBJECT</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-14">IAS (50)</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-14">ETES (50)</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-16">TOTAL (100)</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-14">GRADE</th>
            <th className="border border-gray-400 px-2 py-1.5 text-center w-12">LEVEL</th>
            <th className="border border-gray-400 px-2 py-1.5 text-left">DESCRIPTION</th>
          </tr>
        </thead>
        <tbody>
          {data.grades.map((grade, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
              <td className="border border-gray-300 px-2 py-1 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-2 py-1 font-medium">{grade.subject_name}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{grade.ias_score ?? "—"}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">{grade.etes_score ?? "—"}</td>
              <td className="border border-gray-300 px-2 py-1 text-center font-bold">{grade.total_score ?? "—"}</td>
              <td className="border border-gray-300 px-2 py-1 text-center">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${getGradeColor(grade.grade_letter)}`}>
                  {grade.grade_letter || "—"}
                </span>
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center">{grade.proficiency_level ?? "—"}</td>
              <td className="border border-gray-300 px-2 py-1 text-[11px]">{grade.grade_description || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Overall Score */}
      <div className="bg-[hsl(45,90%,55%)] border border-gray-300 border-t-0 px-3 py-2 font-bold text-xs flex justify-between">
        <span>OVERALL: {data.cumulated_score?.toFixed(1) ?? "0.0"} OUT OF {data.max_possible_score?.toFixed(1) ?? "0.0"}</span>
        <span>LEARNER'S AVERAGE: {data.learner_average?.toFixed(1) ?? "—"}% | CLASS AVERAGE: {data.class_average?.toFixed(1) ?? "—"}%</span>
      </div>

      {/* Attendance, Conduct, Attitude, Interest */}
      <div className="border border-gray-300 border-t-0 p-3">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <div><span className="font-semibold">Attendance:</span> {data.attendance_present ?? "—"} out of {data.attendance_total ?? "—"} days</div>
          <div><span className="font-semibold">Conduct:</span> {data.conduct ?? "—"}</div>
          <div><span className="font-semibold">Attitude:</span> {data.attitude ?? "—"}</div>
          <div><span className="font-semibold">Interest:</span> {data.interest ?? "—"}</div>
        </div>
      </div>

      {/* Remarks */}
      <div className="border border-gray-300 border-t-0 p-3 space-y-2 text-xs">
        <div>
          <span className="font-semibold">Form Teacher:</span> {data.form_teacher_name ?? "—"}
          <div className="mt-0.5 pl-4 italic text-gray-700">{data.form_teacher_remark ?? "—"}</div>
        </div>
        <div>
          <span className="font-semibold">Headteacher:</span> {data.headteacher_name ?? "—"}
          <div className="mt-0.5 pl-4 italic text-gray-700">{data.headteacher_remark ?? "—"}</div>
        </div>
      </div>

      {/* Grade Interpretation Key */}
      <div className="border border-gray-300 border-t-0 rounded-b-xl p-3">
        <p className="font-bold text-xs mb-2 text-[hsl(230,70%,35%)]">GRADE INTERPRETATION</p>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {GRADE_SCALE.map((g) => (
            <div key={g.level} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-200">
              <div className={`w-2.5 h-2.5 rounded-full ${g.color}`} />
              <span className="font-bold">{g.marks}</span>
              <span>({g.level}: {g.grade} - {g.description})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default ReportCardPreview;
export type { ReportCardData, SubjectGrade };
