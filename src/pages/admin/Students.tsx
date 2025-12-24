import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { differenceInYears } from "date-fns";

interface Student {
  id: string;
  reference_number: string;
  student_first_name: string;
  student_surname: string;
  student_dob: string;
  program_level: string;
  guardian1_phone_primary: string;
  student_photo_url: string | null;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");

  useEffect(() => {
    fetchStudents();
  }, [programFilter]);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from("enrollment_applications")
        .select("id, reference_number, student_first_name, student_surname, student_dob, program_level, guardian1_phone_primary, student_photo_url")
        .eq("status", "enrolled")
        .order("student_surname", { ascending: true });

      if (programFilter !== "all") {
        query = query.eq("program_level", programFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.student_first_name} ${student.student_surname}`.toLowerCase();
    const refNumber = student.reference_number.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || refNumber.includes(query);
  });

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Enrolled student records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="Creche">Creche</SelectItem>
            <SelectItem value="Nursery">Nursery</SelectItem>
            <SelectItem value="Kindergarten">Kindergarten</SelectItem>
            <SelectItem value="Primary">Primary</SelectItem>
            <SelectItem value="JHS">JHS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Students Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No enrolled students found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Students will appear here once their applications are approved and marked as enrolled
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {student.student_first_name.charAt(0)}
                  {student.student_surname.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {student.student_first_name} {student.student_surname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.program_level} • {calculateAge(student.student_dob)} yrs
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {student.reference_number}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {student.guardian1_phone_primary}
                </p>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/admin/applications/${student.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
