import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Users, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears } from "date-fns";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  date_of_birth: string;
  current_class: string;
  photo_url: string | null;
  gender: string;
}

// Level mapping based on class names
const getLevelFromClass = (className: string): string => {
  const lowerClass = className.toLowerCase();
  if (lowerClass.includes("creche") || lowerClass.includes("nursery")) {
    return "Early Years";
  }
  if (lowerClass.includes("kg") || lowerClass.includes("kindergarten")) {
    return "Kindergarten";
  }
  if (lowerClass.startsWith("p") || lowerClass.includes("primary")) {
    return "Primary";
  }
  if (lowerClass.includes("jhs") || lowerClass.includes("junior")) {
    return "Junior High School";
  }
  return "Other";
};

const levelOrder = ["Early Years", "Kindergarten", "Primary", "Junior High School", "Other"];

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(levelOrder));
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select("id, student_id, first_name, surname, date_of_birth, current_class, photo_url, gender")
        .eq("status", "active")
        .order("surname", { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
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

  // Group students by level and class
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const level = getLevelFromClass(student.current_class);
    const className = student.current_class;
    
    if (!acc[level]) {
      acc[level] = {};
    }
    if (!acc[level][className]) {
      acc[level][className] = [];
    }
    acc[level][className].push(student);
    return acc;
  }, {} as Record<string, Record<string, Student[]>>);

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const toggleLevel = (level: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const toggleClass = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const totalStudents = filteredStudents.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            {totalStudents} enrolled student{totalStudents !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or student ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Students by Level */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No students found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? "Try a different search term" : "Students will appear here once enrolled"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {levelOrder.map((level) => {
            const levelClasses = groupedStudents[level];
            if (!levelClasses) return null;

            const levelStudentCount = Object.values(levelClasses).reduce(
              (sum, students) => sum + students.length,
              0
            );

            return (
              <Collapsible
                key={level}
                open={expandedLevels.has(level)}
                onOpenChange={() => toggleLevel(level)}
              >
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {expandedLevels.has(level) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <h2 className="font-semibold text-lg text-foreground">{level}</h2>
                        <Badge variant="secondary">{levelStudentCount} students</Badge>
                      </div>
                      <Badge variant="outline">
                        {Object.keys(levelClasses).length} class{Object.keys(levelClasses).length !== 1 ? "es" : ""}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-border">
                      {Object.entries(levelClasses)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([className, classStudents]) => (
                          <Collapsible
                            key={className}
                            open={expandedClasses.has(className)}
                            onOpenChange={() => toggleClass(className)}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-b-0">
                                <div className="flex items-center gap-2">
                                  {expandedClasses.has(className) ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="font-medium text-foreground">{className}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {classStudents.length} student{classStudents.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <div className="px-6 pb-4 pt-2">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {classStudents.map((student) => (
                                    <div
                                      key={student.id}
                                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden shrink-0">
                                        {student.photo_url ? (
                                          <img
                                            src={student.photo_url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <>
                                            {student.first_name.charAt(0)}
                                            {student.surname.charAt(0)}
                                          </>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-foreground truncate">
                                          {student.first_name} {student.surname}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {student.student_id} • {calculateAge(student.date_of_birth)} yrs
                                        </p>
                                      </div>
                                      <Button variant="ghost" size="icon" className="shrink-0" asChild>
                                        <Link to={`/admin/students/${student.id}`}>
                                          <Eye className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Students;
