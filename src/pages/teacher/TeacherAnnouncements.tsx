import { useState, useEffect } from "react";
import { Megaphone, Plus } from "lucide-react";
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

const TeacherAnnouncements = () => {
  const { user, assignedClasses } = useTeacherAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("portal_announcements")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
  };

  useEffect(() => { fetchAnnouncements(); }, [user]);

  const handleCreate = async () => {
    if (!user || !title || !content || !targetClass) return;
    setSaving(true);
    const { error } = await supabase.from("portal_announcements").insert({
      title,
      content,
      category,
      target_audience: "specific_class",
      target_class: targetClass,
      visibility: "internal",
      is_published: true,
      created_by: user.id,
    });
    if (error) toast.error("Failed to create announcement");
    else {
      toast.success("Announcement posted");
      setTitle(""); setContent(""); setTargetClass("");
      setDialogOpen(false);
      fetchAnnouncements();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Megaphone className="h-6 w-6" /> Announcements
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
              <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Class</Label>
                  <Select value={targetClass} onValueChange={setTargetClass}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {assignedClasses.map(c => <SelectItem key={c.id} value={c.class_name}>{c.class_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["general","academic","event","emergency"].map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={saving} className="w-full">{saving ? "Posting..." : "Post Announcement"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No announcements yet</CardContent></Card>
        ) : announcements.map((a: any) => (
          <Card key={a.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{a.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{a.target_class}</Badge>
                  <Badge variant="secondary" className="capitalize">{a.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{a.content}</p>
              <p className="text-xs text-muted-foreground mt-2">{format(new Date(a.created_at), "PPP")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherAnnouncements;
