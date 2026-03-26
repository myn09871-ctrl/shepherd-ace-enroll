import { useState, useEffect } from "react";
import { Users, Plus, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CLASS_OPTIONS = [
  "Creche", "Nursery 1", "Nursery 2", "KG 1", "KG 2",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6",
  "JHS 1", "JHS 2", "JHS 3",
];

const currentYear = new Date().getFullYear().toString();

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  classes: string[];
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Create form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("teacher_profiles").select("*").order("full_name");
    if (!profiles) { setLoading(false); return; }

    const teacherIds = profiles.map(p => p.id);
    const { data: classData } = await supabase
      .from("class_teachers")
      .select("teacher_id, class_name")
      .in("teacher_id", teacherIds)
      .eq("is_active", true)
      .eq("academic_year", currentYear);

    const mapped = profiles.map(p => ({
      ...p,
      classes: (classData || []).filter((c: any) => c.teacher_id === p.id).map((c: any) => c.class_name),
    }));
    setTeachers(mapped as Teacher[]);
    setLoading(false);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleCreate = async () => {
    if (!email || !password || !fullName) { toast.error("Fill required fields"); return; }
    setCreating(true);

    const { data, error } = await supabase.functions.invoke("create-teacher-account", {
      body: {
        email,
        password,
        full_name: fullName,
        phone: phone || null,
        assigned_classes: selectedClasses.map(c => ({ class_name: c, academic_year: currentYear })),
      },
    });

    if (error || !data?.success) {
      toast.error(data?.error || "Failed to create teacher");
    } else {
      toast.success("Teacher account created");
      setEmail(""); setPassword(""); setFullName(""); setPhone(""); setSelectedClasses([]);
      setDialogOpen(false);
      fetchTeachers();
    }
    setCreating(false);
  };

  const handleAssignClass = async (teacherId: string, className: string) => {
    const { error } = await supabase.from("class_teachers").insert({
      teacher_id: teacherId,
      class_name: className,
      academic_year: currentYear,
    });
    if (error) toast.error("Failed to assign class");
    else { toast.success("Class assigned"); fetchTeachers(); }
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> Teacher Management
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Teacher</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Teacher Account</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Full Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div><Label>Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password *</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div>
                <Label>Assign Classes</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CLASS_OPTIONS.map(cls => (
                    <label key={cls} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={selectedClasses.includes(cls)} onCheckedChange={() => toggleClass(cls)} />
                      {cls}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? "Creating..." : "Create Teacher"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : teachers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No teachers yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.full_name}</TableCell>
                    <TableCell>{t.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.classes.length === 0 ? (
                          <span className="text-muted-foreground text-sm">None</span>
                        ) : t.classes.map(c => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={classDialogOpen && selectedTeacher?.id === t.id} onOpenChange={(open) => { setClassDialogOpen(open); if (open) setSelectedTeacher(t); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline"><BookOpen className="h-3 w-3 mr-1" /> Assign</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Assign Class to {t.full_name}</DialogTitle></DialogHeader>
                          <div className="grid grid-cols-2 gap-2">
                            {CLASS_OPTIONS.filter(c => !t.classes.includes(c)).map(cls => (
                              <Button key={cls} variant="outline" size="sm" onClick={() => { handleAssignClass(t.id, cls); setClassDialogOpen(false); }}>
                                {cls}
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherManagement;
