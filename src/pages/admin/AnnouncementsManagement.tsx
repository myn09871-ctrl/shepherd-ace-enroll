import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Megaphone, Eye, EyeOff, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  target_audience: string;
  target_class: string | null;
  visibility: string;
  is_published: boolean;
  requires_acknowledgment: boolean;
  published_at: string | null;
  created_at: string;
}

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "general",
    visibility: "internal",
    target_audience: "all",
    target_class: "",
    requires_acknowledgment: false,
    is_published: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("portal_announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingAnnouncement(null);
    setForm({
      title: "",
      content: "",
      category: "general",
      visibility: "internal",
      target_audience: "all",
      target_class: "",
      requires_acknowledgment: false,
      is_published: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      visibility: announcement.visibility || "internal",
      target_audience: announcement.target_audience,
      target_class: announcement.target_class || "",
      requires_acknowledgment: announcement.requires_acknowledgment,
      is_published: announcement.is_published,
    });
    setIsDialogOpen(true);
  };

  const saveAnnouncement = async () => {
    if (!form.title || !form.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const announcementData = {
        title: form.title,
        content: form.content,
        category: form.category,
        visibility: form.visibility,
        target_audience: form.target_audience,
        target_class: form.target_audience === "specific_class" ? form.target_class : null,
        requires_acknowledgment: form.requires_acknowledgment,
        is_published: form.is_published,
        published_at: form.is_published ? new Date().toISOString() : null,
        created_by: user?.id,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from("portal_announcements")
          .update(announcementData)
          .eq("id", editingAnnouncement.id);
        if (error) throw error;
        toast({ title: "Announcement Updated" });
      } else {
        const { error } = await supabase.from("portal_announcements").insert(announcementData);
        if (error) throw error;
        toast({ title: "Announcement Created" });
      }

      setIsDialogOpen(false);
      fetchAnnouncements();
    } catch (error: any) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save announcement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("portal_announcements")
        .update({
          is_published: !announcement.is_published,
          published_at: !announcement.is_published ? new Date().toISOString() : null,
        })
        .eq("id", announcement.id);

      if (error) throw error;
      toast({
        title: announcement.is_published ? "Unpublished" : "Published",
        description: `Announcement has been ${announcement.is_published ? "unpublished" : "published"}`,
      });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const { error } = await supabase.from("portal_announcements").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Announcement Deleted" });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "administrative":
        return "bg-orange-100 text-orange-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage school announcements</p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No announcements yet</p>
          <Button className="mt-4" onClick={openCreateDialog}>
            Create First Announcement
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-card rounded-lg border border-border p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Visibility badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        announcement.visibility === "public"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {announcement.visibility === "public" ? (
                        <Globe className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      {announcement.visibility === "public" ? "Public" : "Internal"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        announcement.category
                      )}`}
                    >
                      {announcement.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        announcement.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {announcement.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground truncate">{announcement.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(announcement.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublish(announcement)}
                    title={announcement.is_published ? "Unpublish" : "Publish"}
                  >
                    {announcement.is_published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(announcement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {form.visibility === "public" 
                ? "Public announcements appear on the website and parent portal"
                : "Internal announcements are only visible in the parent portal"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Visibility - IMPORTANT */}
            <div className="space-y-2">
              <Label>Visibility *</Label>
              <Select
                value={form.visibility}
                onValueChange={(value) => setForm({ ...form, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Internal (Portal Only)
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public (Website + Portal)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {form.visibility === "public" 
                  ? "Will be visible on the public website and parent portal"
                  : "Only visible to logged-in parents in the portal"
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>

            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Announcement content..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={form.target_audience}
                  onValueChange={(value) => setForm({ ...form, target_audience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parents</SelectItem>
                    <SelectItem value="specific_class">Specific Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.target_audience === "specific_class" && (
              <div className="space-y-2">
                <Label>Select Class</Label>
                <Select
                  value={form.target_class}
                  onValueChange={(value) => setForm({ ...form, target_class: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires_ack"
                checked={form.requires_acknowledgment}
                onCheckedChange={(checked) =>
                  setForm({ ...form, requires_acknowledgment: checked as boolean })
                }
              />
              <Label htmlFor="requires_ack" className="text-sm">
                Require parents to acknowledge
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_published"
                checked={form.is_published}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_published: checked as boolean })
                }
              />
              <Label htmlFor="is_published" className="text-sm">
                Publish immediately
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAnnouncement} disabled={saving}>
              {saving ? "Saving..." : editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsManagement;
