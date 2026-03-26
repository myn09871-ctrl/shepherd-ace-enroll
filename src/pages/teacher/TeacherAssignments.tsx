import { useState, useEffect } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_name: string;
  due_date: string | null;
  created_at: string;
}

const currentYear = new Date().getFullYear().toString();

const TeacherAssignments = () => {
  const { teacherProfile, assignedClasses } = useTeacherAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [saving, setSaving] = useState(false);

  const fetchAssignments = async () => {
    if (!teacherProfile) return;
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .eq("teacher_id", teacherProfile.id)
      .order("created_at", { ascending: false });
    setAssignments((data || []) as Assignment[]);
  };

  useEffect(() => { fetchAssignments(); }, [teacherProfile]);

  const handleCreate = async () => {
    if (!teacherProfile || !title || !className) return;
    setSaving(true);
    const { error } = await supabase.from("assignments").insert({
      teacher_id: teacherProfile.id,
      title,
      description: description || null,
      class_name: className,
      due_date: dueDate || null,
      academic_year: currentYear,
      term,
    });
    if (error) toast.error("Failed to create assignment");
    else {
      toast.success("Assignment created");
      setTitle(""); setDescription(""); setClassName(""); setDueDate("");
      setDialogOpen(false);
      fetchAssignments();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6" /> Assignments
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class</Label>
                  <Select value={className} onValueChange={setClassName}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {assignedClasses.map(c => <SelectItem key={c.id} value={c.class_name}>{c.class_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Term</Label>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Term 1","Term 2","Term 3"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Creating..." : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No assignments yet</CardContent></Card>
        ) : assignments.map(a => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{a.title}</CardTitle>
                <Badge variant="outline">{a.class_name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {a.description && <p className="text-sm text-muted-foreground mb-2">{a.description}</p>}
              <div className="flex gap-4 text-xs text-muted-foreground">
                {a.due_date && <span>Due: {format(new Date(a.due_date), "PPP")}</span>}
                <span>Created: {format(new Date(a.created_at), "PPP")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherAssignments;
