import { useState, useRef } from "react";
import { Settings, Upload, Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PortalProfile = () => {
  const { parentAccount, currentStudent: student, setCurrentStudent } = useParentAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !student) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${student.id}/photo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("student-photos")
        .getPublicUrl(filePath);

      const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update student record
      const { error: updateError } = await supabase
        .from("students")
        .update({ photo_url: photoUrl })
        .eq("id", student.id);

      if (updateError) throw updateError;

      // Update local state
      setCurrentStudent({ ...student, photo_url: photoUrl });

      toast({
        title: "Photo Updated",
        description: "Student photo has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Profile Settings
        </h1>
      </div>

      {/* Student Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                {student?.photo_url ? (
                  <img
                    src={student.photo_url}
                    alt={`${student.first_name}'s photo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {student?.first_name?.[0]}{student?.surname?.[0]}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {student?.first_name} {student?.surname}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click the camera icon to update photo
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload New Photo"}
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-4">
            Recommended: Square image, at least 200x200 pixels. Max file size: 5MB.
          </p>
        </CardContent>
      </Card>

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parent Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{parentAccount?.parent_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{parentAccount?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{parentAccount?.phone_primary || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Relationship</p>
              <p className="font-medium capitalize">{parentAccount?.relationship}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="font-medium">
                {student?.first_name} {student?.middle_name || ""} {student?.surname}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Student ID</p>
              <p className="font-medium">{student?.student_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-medium">{student?.current_class}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Academic Year</p>
              <p className="font-medium">{student?.academic_year}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{student?.date_of_birth}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="font-medium capitalize">{student?.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalProfile;
