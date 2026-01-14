import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, MessageSquare, Printer, Save, UserPlus, Loader2 } from "lucide-react";
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
  guardian1_employer: string | null;
  guardian1_landmark: string | null;
  guardian1_workplace_address: string | null;
  guardian1_workplace_phone: string | null;
  guardian1_is_primary_contact: boolean | null;
  guardian2_full_name: string | null;
  guardian2_relationship: string | null;
  guardian2_phone_primary: string | null;
  guardian2_phone_secondary: string | null;
  guardian2_email: string | null;
  guardian2_address: string | null;
  guardian2_is_emergency_contact: boolean | null;
  is_first_time_enrollment: boolean | null;
  program_level: string;
  intended_start_date: string | null;
  career_training_interests: string[] | null;
  previous_school_name: string | null;
  previous_school_location: string | null;
  last_grade_completed: string | null;
  academic_performance: string | null;
  reason_for_change: string | null;
  has_medical_conditions: boolean | null;
  medical_conditions: string[] | null;
  medical_conditions_details: string | null;
  has_allergies: boolean | null;
  allergies: unknown;
  current_medications: unknown;
  immunization_up_to_date: boolean | null;
  medical_authorization: boolean | null;
  has_special_needs: boolean | null;
  special_needs_types: string[] | null;
  special_needs_details: string | null;
  financial_acknowledgment: boolean | null;
  financial_assistance_interest: boolean | null;
  transportation_method: string | null;
  pickup_location: string | null;
  consent_truthfulness: boolean | null;
  consent_media: boolean | null;
  consent_records: boolean | null;
  consent_discipline: boolean | null;
  consent_emergency: boolean | null;
  consent_terms: boolean | null;
  birth_certificate_url: string | null;
  vaccination_card_url: string | null;
  academic_records_url: string | null;
  residence_proof_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
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
  const [creatingPortal, setCreatingPortal] = useState(false);

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

  // Approve and create student portal automatically
  const approveAndCreatePortal = async () => {
    if (!application) return;
    
    setCreatingPortal(true);
    try {
      // Call the edge function to create student and parent portal
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student-portal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ applicationId: application.id }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create portal");
      }

      // Show detailed success message based on backend response
      const emailStatus = result.emailSent 
        ? `Welcome email sent to ${result.portalEmail}` 
        : `Portal created but email failed: ${result.emailError || "Unknown error"}`;
      
      const accountType = result.isNewParent 
        ? "New parent account created" 
        : "Student linked to existing parent account";

      toast({
        title: "✅ Enrollment Complete!",
        description: `${result.studentName} - ${result.studentId}. ${accountType}. ${emailStatus}`,
      });

      // Show additional warning if email failed
      if (!result.emailSent) {
        toast({
          title: "⚠️ Email Not Sent",
          description: `Please manually share login credentials with ${result.portalEmail}. Password: ${result.tempPassword || "(existing account)"}`,
          variant: "destructive",
        });
      }

      // Refresh application data
      setApplication((prev) => prev ? { ...prev, status: "enrolled" } : null);
    } catch (error: any) {
      console.error("Error creating portal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create portal. Try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingPortal(false);
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
    const margin = 15;
    const pageWidth = 210;
    const labelWidth = 55;
    const valueWidth = pageWidth - margin * 2 - labelWidth - 5;
    const lineHeight = 5;
    let yPos = 20;

    const formatValue = (value: unknown): string => {
      if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (value !== undefined && value !== null && value !== "") return String(value);
      return "—";
    };

    const addSection = (title: string) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      yPos += 4;
      doc.setFillColor(230, 240, 250);
      doc.rect(margin, yPos - 4, pageWidth - margin * 2, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(title, margin + 2, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    };

    const addField = (label: string, value: unknown) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, yPos);
      doc.setFont("helvetica", "normal");
      const displayValue = formatValue(value);
      const splitText = doc.splitTextToSize(displayValue, valueWidth);
      doc.text(splitText, margin + labelWidth, yPos);
      yPos += lineHeight * Math.max(1, splitText.length);
    };

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("GOOD SHEPHERD INTERNATIONAL SCHOOL", 105, yPos, { align: "center" });
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("In God We Trust", 105, yPos, { align: "center" });
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Mallam, New Gbawe - 100 meters from LAFA Police Station", 105, yPos, { align: "center" });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ADMISSION APPLICATION FORM", 105, yPos, { align: "center" });
    yPos += 6;
    doc.setFontSize(9);
    doc.text(`Reference: ${application.reference_number}`, 105, yPos, { align: "center" });
    yPos += 5;
    doc.text(`Status: ${application.status.toUpperCase()} | Date: ${format(new Date(application.created_at), "MMMM d, yyyy")}`, 105, yPos, { align: "center" });
    yPos += 10;

    // SECTION 1: Student Information
    addSection("SECTION 1: STUDENT INFORMATION");
    addField("Surname", application.student_surname);
    addField("First Name", application.student_first_name);
    addField("Middle Name(s)", application.student_middle_name);
    addField("Date of Birth", application.student_dob ? format(new Date(application.student_dob), "MMMM d, yyyy") : "—");
    addField("Gender", application.student_gender);
    addField("Nationality", application.student_nationality);
    addField("Place of Birth", application.student_place_of_birth);

    // SECTION 2: Primary Guardian
    addSection("SECTION 2: PRIMARY PARENT/GUARDIAN");
    addField("Relationship to Student", application.guardian1_relationship);
    addField("Full Name", application.guardian1_full_name);
    addField("Occupation", application.guardian1_occupation);
    addField("Employer/Business", application.guardian1_employer);
    addField("Primary Phone", application.guardian1_phone_primary);
    addField("Secondary Phone", application.guardian1_phone_secondary);
    addField("Email Address", application.guardian1_email);
    addField("Residential Address", application.guardian1_address);
    addField("Nearest Landmark", application.guardian1_landmark);
    addField("Workplace Address", application.guardian1_workplace_address);
    addField("Workplace Phone", application.guardian1_workplace_phone);

    // SECTION 3: Secondary Guardian
    addSection("SECTION 3: SECONDARY PARENT/GUARDIAN");
    addField("Full Name", application.guardian2_full_name);
    addField("Relationship to Student", application.guardian2_relationship);
    addField("Primary Phone", application.guardian2_phone_primary);
    addField("Secondary Phone", application.guardian2_phone_secondary);
    addField("Email Address", application.guardian2_email);
    addField("Address", application.guardian2_address);
    addField("Is Emergency Contact", application.guardian2_is_emergency_contact);

    // SECTION 4: Educational Background
    addSection("SECTION 4: EDUCATIONAL BACKGROUND");
    addField("First Time Enrollment", application.is_first_time_enrollment);
    addField("Previous School Name", application.previous_school_name);
    addField("Previous School Location", application.previous_school_location);
    addField("Last Grade/Class Completed", application.last_grade_completed);
    addField("Academic Performance", application.academic_performance);
    addField("Reason for Changing School", application.reason_for_change);

    // SECTION 5: Program Selection
    addSection("SECTION 5: PROGRAM SELECTION");
    addField("Educational Level/Class", application.program_level);
    addField("Intended Start Date", application.intended_start_date);
    addField("Career Training Interests", application.career_training_interests);

    // SECTION 6: Health Information
    addSection("SECTION 6: HEALTH INFORMATION");
    addField("Has Medical Conditions", application.has_medical_conditions);
    addField("Medical Conditions", application.medical_conditions);
    addField("Medical Conditions Details", application.medical_conditions_details);
    addField("Has Allergies", application.has_allergies);
    const allergiesDesc = application.allergies && typeof application.allergies === "object" 
      ? (application.allergies as Record<string, string>).description 
      : application.allergies;
    addField("Allergies Description", allergiesDesc);
    const medsDesc = application.current_medications && typeof application.current_medications === "object"
      ? (application.current_medications as Record<string, string>).description
      : application.current_medications;
    addField("Current Medications", medsDesc);
    addField("Immunizations Up to Date", application.immunization_up_to_date);
    addField("Medical Treatment Authorization", application.medical_authorization);

    // SECTION 7: Special Needs
    addSection("SECTION 7: SPECIAL EDUCATIONAL NEEDS");
    addField("Has Special Needs", application.has_special_needs);
    addField("Types of Special Needs", application.special_needs_types);
    addField("Special Needs Details", application.special_needs_details);

    // SECTION 8: Financial & Transportation
    addSection("SECTION 8: FINANCIAL & TRANSPORTATION");
    addField("Financial Terms Acknowledged", application.financial_acknowledgment);
    addField("Interested in Financial Aid", application.financial_assistance_interest);
    addField("Transportation Method", application.transportation_method);
    addField("Pickup/Drop-off Location", application.pickup_location);

    // SECTION 9: Declarations & Consent
    addSection("SECTION 9: DECLARATIONS & CONSENT");
    addField("Truthfulness Declaration", application.consent_truthfulness);
    addField("Media/Photo Consent", application.consent_media);
    addField("Records Authorization", application.consent_records);
    addField("Discipline Policy Consent", application.consent_discipline);
    addField("Emergency Treatment Consent", application.consent_emergency);
    addField("Terms & Conditions Accepted", application.consent_terms);

    // SECTION 10: Documents
    addSection("SECTION 10: UPLOADED DOCUMENTS");
    addField("Birth Certificate", application.birth_certificate_url ? "Uploaded" : "Not uploaded");
    addField("Vaccination Card", application.vaccination_card_url ? "Uploaded" : "Not uploaded");
    addField("Academic Records", application.academic_records_url ? "Uploaded" : "Not uploaded");
    addField("Proof of Residence", application.residence_proof_url ? "Uploaded" : "Not uploaded");

    // Footer
    yPos += 8;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text("This is an official document of Good Shepherd International School.", 105, yPos, { align: "center" });
    doc.text("For office use only - Do not alter.", 105, yPos + 4, { align: "center" });

    doc.save(`GSIS_Application_${application.reference_number}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Complete application form has been downloaded",
    });
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
              {/* Main action - Approve & Create Portal (only for pending applications) */}
              {application.status === "pending" && (
                <Button
                  variant="default"
                  className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
                  onClick={approveAndCreatePortal}
                  disabled={creatingPortal}
                >
                  {creatingPortal ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {creatingPortal ? "Creating Portal..." : "Approve & Create Portal"}
                </Button>
              )}
              
              {/* Show status for non-pending applications */}
              {application.status === "enrolled" && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  ✓ Student enrolled and portal created
                </div>
              )}
              
              {application.status === "under_review" && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
                  ⏳ Application under review - awaiting additional info
                </div>
              )}
              
              {application.status === "rejected" && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  ✗ Application has been rejected
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                onClick={() => updateStatus("under_review")}
                disabled={application.status === "enrolled"}
              >
                <MessageSquare className="h-4 w-4" />
                Request More Info
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => updateStatus("rejected")}
                disabled={application.status === "rejected" || application.status === "enrolled"}
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
