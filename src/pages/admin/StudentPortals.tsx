import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, Eye, Mail, Key, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { differenceInYears, format } from "date-fns";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  date_of_birth: string;
  current_class: string;
  photo_url: string | null;
  status: string;
  parent_accounts?: ParentAccount[];
}

interface ParentAccount {
  id: string;
  parent_name: string;
  email: string;
  phone_primary: string | null;
  relationship: string;
  is_active: boolean;
  last_login_at: string | null;
}

const StudentPortals = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state for creating parent portal
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [tempPassword, setTempPassword] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  const fetchStudents = async () => {
    try {
      let query = supabase
        .from("students")
        .select(`
          *,
          parent_accounts (
            id,
            parent_name,
            email,
            phone_primary,
            relationship,
            is_active,
            last_login_at
          )
        `)
        .eq("status", "active")
        .order("surname", { ascending: true });

      if (classFilter !== "all") {
        query = query.eq("current_class", classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
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

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(password);
  };

  const openCreateDialog = (student: Student) => {
    setSelectedStudent(student);
    setParentName("");
    setParentEmail("");
    setParentPhone("");
    setRelationship("Father");
    generatePassword();
    setIsCreateDialogOpen(true);
  };

  const createParentPortal = async () => {
    if (!selectedStudent || !parentName || !parentEmail || !tempPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parentEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/portal/login`,
        },
      });

      if (authError) throw authError;

      // Create parent account
      const { error: parentError } = await supabase
        .from("parent_accounts")
        .insert({
          student_id: selectedStudent.id,
          user_id: authData.user?.id,
          parent_name: parentName,
          email: parentEmail,
          phone_primary: parentPhone || null,
          relationship: relationship,
          role: "primary",
        });

      if (parentError) throw parentError;

      toast({
        title: "Portal Created",
        description: `Parent portal created for ${parentName}. Temporary password: ${tempPassword}`,
      });

      setIsCreateDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      console.error("Error creating portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parent portal",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("parent_accounts")
        .update({ is_active: !currentStatus })
        .eq("id", accountId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Account Suspended" : "Account Activated",
        description: `Parent account has been ${currentStatus ? "suspended" : "activated"}`,
      });

      fetchStudents();
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description: "Failed to update account status",
        variant: "destructive",
      });
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
          <h1 className="text-2xl font-heading font-bold text-foreground">Student Portals</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage parent portal accounts</p>
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
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-40">
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
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
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
                <th className="text-left p-4 font-medium text-sm">Portal Status</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student) => {
                const hasPortal = student.parent_accounts && student.parent_accounts.length > 0;
                const primaryParent = student.parent_accounts?.[0];

                return (
                  <tr key={student.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {student.first_name.charAt(0)}
                          {student.surname.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {student.first_name} {student.surname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {calculateAge(student.date_of_birth)} years old
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm">{student.current_class}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{student.student_id}</span>
                    </td>
                    <td className="p-4">
                      {hasPortal ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            primaryParent?.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {primaryParent?.is_active ? "Active" : "Suspended"}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {primaryParent?.parent_name}
                          </p>
                          {primaryParent?.last_login_at && (
                            <p className="text-xs text-muted-foreground">
                              Last login: {format(new Date(primaryParent.last_login_at), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          No Portal
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {hasPortal ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleAccountStatus(primaryParent!.id, primaryParent!.is_active)}
                              title={primaryParent?.is_active ? "Suspend" : "Activate"}
                            >
                              {primaryParent?.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/students/${student.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCreateDialog(student)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Create Portal
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Portal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Parent Portal</DialogTitle>
            <DialogDescription>
              Create a portal account for {selectedStudent?.first_name} {selectedStudent?.surname}'s parent/guardian
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Name *</Label>
              <Input
                id="parentName"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentEmail">Email Address *</Label>
              <Input
                id="parentEmail"
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhone">Phone Number</Label>
              <Input
                id="parentPhone"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0244123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Grandparent">Grandparent</SelectItem>
                  <SelectItem value="Uncle">Uncle</SelectItem>
                  <SelectItem value="Aunt">Aunt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <div className="flex gap-2">
                <Input
                  id="tempPassword"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Temporary password"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this password with the parent. They should change it after first login.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createParentPortal} disabled={saving}>
              {saving ? "Creating..." : "Create Portal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPortals;
