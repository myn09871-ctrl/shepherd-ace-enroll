// GSIS Grading Scale
export const calculateProficiencyLevel = (total: number | null): number | null => {
  if (total === null || total === undefined) return null;
  if (total >= 80) return 1;
  if (total >= 75) return 2;
  if (total >= 70) return 3;
  if (total >= 65) return 4;
  return 5;
};

export const calculateGradeLetter = (total: number | null): string => {
  if (total === null || total === undefined) return "";
  if (total >= 80) return "A";
  if (total >= 75) return "P";
  if (total >= 70) return "AP";
  if (total >= 65) return "D";
  return "B";
};

export const getGradeDescription = (total: number | null): string => {
  if (total === null || total === undefined) return "";
  if (total >= 80) return "Advanced";
  if (total >= 75) return "Proficient";
  if (total >= 70) return "Approaching Proficiency";
  if (total >= 65) return "Developing";
  return "Beginning";
};

export const getGradeColor = (grade: string | null): string => {
  if (!grade) return "bg-muted text-muted-foreground";
  switch (grade) {
    case "A": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "P": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "AP": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "D": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "B": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default: return "bg-muted text-muted-foreground";
  }
};

export const GRADE_SCALE = [
  { marks: "80% and above", level: 1, grade: "A", description: "Advanced", color: "bg-emerald-500" },
  { marks: "75 - 79%", level: 2, grade: "P", description: "Proficient", color: "bg-blue-500" },
  { marks: "70 - 74%", level: 3, grade: "AP", description: "Approaching Proficiency", color: "bg-amber-500" },
  { marks: "65 - 69%", level: 4, grade: "D", description: "Developing", color: "bg-orange-500" },
  { marks: "Below 64%", level: 5, grade: "B", description: "Beginning", color: "bg-red-500" },
];
