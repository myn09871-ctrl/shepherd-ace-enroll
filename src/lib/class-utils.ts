// Maps a class name (e.g. "Class 3", "primary-1", "JHS 1") to the
// `class_level` value used on the `subjects` table.
export const getSubjectLevel = (className: string): string => {
  const c = (className || "").toLowerCase();
  if (c.includes("creche") || c.includes("crèche")) return "creche";
  if (c.includes("nursery")) return "nursery";
  if (c.includes("kg") || c.includes("kindergarten")) return "kindergarten";
  if (c.includes("jhs") || c.includes("junior")) return "jhs";
  if (c.includes("class") || c.includes("primary") || /^p\s*\d/.test(c)) return "primary";
  return "other";
};

export const TERMS = [
  { value: "1", label: "Term 1" },
  { value: "2", label: "Term 2" },
  { value: "3", label: "Term 3" },
];

export const academicYearOptions = (): string[] => {
  const y = new Date().getFullYear();
  return [`${y - 1}`, `${y}`, `${y + 1}`];
};
