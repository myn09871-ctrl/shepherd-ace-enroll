import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, MessageSquare, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInYears } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";

interface Application {
  id: string;
  reference_number: string;
  student_first_name: string;
  student_surname: string;
  student_middle_name: string | null;
  student_dob: string;
  student_gender: string;
  student_nationality: string;
  student_place_of_birth: string | null;
  student_photo_url: string | null;
  guardian1_full_name: string;
  guardian1_relationship: string;
  guardian1_phone_primary: string;
  guardian1_phone_secondary: string | null;
  guardian1_email: string;
  guardian1_address: string;
  guardian1_occupation: string | null;
  guardian2_full_name: string | null;
  guardian2_relationship: string | null;
  guardian2_phone_primary: string | null;
  program_level: string;
  intended_start_date: string | null;
  previous_school_name: string | null;
  previous_school_location: string | null;
  last_grade_completed: string | null;
  has_medical_conditions: boolean | null;
  medical_conditions: string[] | null;
  has_allergies: boolean | null;
  allergies: unknown;
  immunization_up_to_date: boolean | null;
  birth_certificate_url: string | null;
  vaccination_card_url: string | null;
  academic_records_url: string | null;
  status: string;
  created_at: string;
}

interface AdminNote {
  id: string;
  note: string;
  created_at: string;
}

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication();
      fetchNotes();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from("enrollment_applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (error) {
      console.error("Error fetching application:", error);
      toast({
        title: "Error",
        description: "Failed to load application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data } = await supabase
        .from("admin_notes")
        .select("id, note, created_at")
        .eq("application_id", id)
        .order("created_at", { ascending: false });

      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("enrollment_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application has been marked as ${newStatus}`,
      });

      setApplication((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const saveNote = async () => {
    if (!newNote.trim() || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("admin_notes")
        .insert({
          application_id: id,
          admin_user_id: user.id,
          note: newNote.trim(),
        });

      if (error) throw error;

      toast({
        title: "Note Saved",
        description: "Your note has been added",
      });

      setNewNote("");
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const printApplication = () => {
    if (!application) return;

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(18);
    doc.text("Good Shepherd International School", 105, yPos, { align: "center" });
    yPos += 8;
    doc.setFontSize(14);
    doc.text("Enrollment Application", 105, yPos, { align: "center" });
    yPos += 15;

    doc.setFontSize(10);
    doc.text(`Reference: ${application.reference_number}`, 20, yPos);
    doc.text(`Status: ${application.status}`, 150, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.text("Student Information", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Name: ${application.student_first_name} ${application.student_surname}`, 25, yPos);
    yPos += 6;
    doc.text(`Date of Birth: ${format(new Date(application.student_dob), "MMMM d, yyyy")}`, 25, yPos);
    yPos += 6;
    doc.text(`Gender: ${application.student_gender}`, 25, yPos);
    yPos += 6;
    doc.text(`Program: ${application.program_level}`, 25, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.text("Guardian Information", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Name: ${application.guardian1_full_name}`, 25, yPos);
    yPos += 6;
    doc.text(`Phone: ${application.guardian1_phone_primary}`, 25, yPos);
    yPos += 6;
    doc.text(`Email: ${application.guardian1_email}`, 25, yPos);

    doc.save(`application-${application.reference_number}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found</p>
      </div>
    );
  }

  const age = differenceInYears(new Date(), new Date(application.student_dob));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/applications")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {application.student_first_name} {application.student_surname}
            </h1>
            <p className="text-muted-foreground">
              Ref: {application.reference_number} • Applied {format(new Date(application.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Student Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {application.student_first_name} {application.student_middle_name || ""} {application.student_surname}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {format(new Date(application.student_dob), "MMMM d, yyyy")} ({age} years)
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{application.student_gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationality</p>
                <p className="font-medium">{application.student_nationality}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Program Applied</p>
                <p className="font-medium text-primary">{application.program_level}</p>
              </div>
              {application.intended_start_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Intended Start</p>
                  <p className="font-medium">{format(new Date(application.intended_start_date), "MMMM yyyy")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Primary Guardian</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{application.guardian1_full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium">{application.guardian1_relationship}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone (Primary)</p>
                <p className="font-medium">{application.guardian1_phone_primary}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.guardian1_email}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{application.guardian1_address}</p>
              </div>
            </div>
          </div>

          {/* Educational Background */}
          {application.previous_school_name && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-semibold text-lg mb-4">Educational Background</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Previous School</p>
                  <p className="font-medium">{application.previous_school_name}</p>
                </div>
                {application.previous_school_location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{application.previous_school_location}</p>
                  </div>
                )}
                {application.last_grade_completed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Grade Completed</p>
                    <p className="font-medium">{application.last_grade_completed}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Health Information */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Health Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Medical Conditions</p>
                <p className="font-medium">
                  {application.has_medical_conditions
                    ? application.medical_conditions?.join(", ") || "Yes"
                    : "None reported"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Allergies</p>
                <p className="font-medium">
                  {application.has_allergies ? "Yes" : "None reported"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Immunization Up to Date</p>
                <p className={`font-medium ${application.immunization_up_to_date ? "text-green-600" : "text-red-600"}`}>
                  {application.immunization_up_to_date ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Uploaded Documents</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${application.birth_certificate_url ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-red-500 bg-red-50 dark:bg-red-950/20"}`}>
                <p className="text-sm font-medium">Birth Certificate</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {application.birth_certificate_url ? "Uploaded" : "Missing"}
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${application.vaccination_card_url ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"}`}>
                <p className="text-sm font-medium">Vaccination Card</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {application.vaccination_card_url ? "Uploaded" : "Not provided"}
                </p>
              </div>
              <div className={`p-4 rounded-lg border ${application.academic_records_url ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"}`}>
                <p className="text-sm font-medium">Academic Records</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {application.academic_records_url ? "Uploaded" : "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Actions</h2>
            <div className="space-y-3">
              <Button
                variant="default"
                className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => updateStatus("approved")}
                disabled={application.status === "approved"}
              >
                <Check className="h-4 w-4" />
                Approve Application
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                onClick={() => updateStatus("under_review")}
              >
                <MessageSquare className="h-4 w-4" />
                Request More Info
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => updateStatus("rejected")}
                disabled={application.status === "rejected"}
              >
                <X className="h-4 w-4" />
                Reject Application
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={printApplication}
              >
                <Printer className="h-4 w-4" />
                Print Application
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">Internal Notes</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={saveNote}
                disabled={saving || !newNote.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Note"}
              </Button>

              {notes.length > 0 && (
                <div className="border-t border-border pt-4 mt-4 space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="text-sm">
                      <p className="text-foreground">{note.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(note.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
