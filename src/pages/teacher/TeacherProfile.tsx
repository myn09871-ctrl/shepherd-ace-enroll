import { useState } from "react";
import { User, Camera, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TeacherProfile = () => {
  const { user, teacherProfile, refreshProfile } = useTeacherAuth();
  const [fullName, setFullName] = useState(teacherProfile?.full_name || "");
  const [phone, setPhone] = useState(teacherProfile?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!teacherProfile) return;
    setSaving(true);
    const { error } = await supabase
      .from("teacher_profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", teacherProfile.id);
    if (error) toast.error("Failed to update profile");
    else {
      toast.success("Profile updated");
      refreshProfile();
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error("Min 6 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Failed to update password");
    else { toast.success("Password updated"); setNewPassword(""); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !teacherProfile) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage.from("teacher-avatars").upload(path, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("teacher-avatars").getPublicUrl(path);
    await supabase.from("teacher_profiles").update({ avatar_url: publicUrl }).eq("id", teacherProfile.id);
    toast.success("Avatar updated");
    refreshProfile();
    setUploading(false);
  };

  const initials = (teacherProfile?.full_name || "T").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User className="h-6 w-6" /> My Profile
      </h1>

      <Card>
        <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {teacherProfile?.avatar_url && <AvatarImage src={teacherProfile.avatar_url} />}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
                <Camera className="h-4 w-4" /> {uploading ? "Uploading..." : "Change Photo"}
              </div>
            </Label>
            <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Email (read-only)</Label><Input value={user?.email || ""} disabled /></div>
          <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
          <Button variant="outline" onClick={handlePasswordChange}>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfile;
