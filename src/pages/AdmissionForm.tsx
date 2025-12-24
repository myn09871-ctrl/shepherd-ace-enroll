import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdmissionFormHeader from "@/components/admission/AdmissionFormHeader";
import FormPage1 from "@/components/admission/FormPage1";
import FormPage2 from "@/components/admission/FormPage2";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  page1Schema,
  page2Schema,
  Page1Data,
  Page2Data,
  generateReferenceNumber,
  programLevels,
} from "@/lib/admission-schema";
import { ChevronLeft, ChevronRight, Download, Send, Loader2 } from "lucide-react";

const AdmissionForm = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [referenceNumber] = useState(() => generateReferenceNumber());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const page1Form = useForm<Page1Data>({
    resolver: zodResolver(page1Schema),
    defaultValues: {
      student_surname: "",
      student_first_name: "",
      student_middle_name: "",
      student_dob: "",
      student_gender: "",
      student_nationality: "",
      student_place_of_birth: "",
      guardian1_relationship: "",
      guardian1_full_name: "",
      guardian1_occupation: "",
      guardian1_employer: "",
      guardian1_phone_primary: "",
      guardian1_phone_secondary: "",
      guardian1_email: "",
      guardian1_address: "",
      guardian1_landmark: "",
      guardian1_workplace_address: "",
      guardian1_workplace_phone: "",
      guardian2_full_name: "",
      guardian2_relationship: "",
      guardian2_phone_primary: "",
      guardian2_phone_secondary: "",
      guardian2_email: "",
      guardian2_address: "",
      guardian2_is_emergency_contact: false,
      is_first_time_enrollment: false,
      previous_school_name: "",
      previous_school_location: "",
      last_grade_completed: "",
      academic_performance: "",
      reason_for_change: "",
      program_level: "",
      career_training_interests: [],
      intended_start_date: "",
    },
  });

  const page2Form = useForm<Page2Data>({
    resolver: zodResolver(page2Schema),
    defaultValues: {
      has_medical_conditions: false,
      medical_conditions: [],
      medical_conditions_details: "",
      has_allergies: false,
      allergies: "",
      current_medications: "",
      immunization_up_to_date: false,
      medical_authorization: false,
      has_special_needs: false,
      special_needs_types: [],
      special_needs_details: "",
      financial_acknowledgment: false,
      financial_assistance_interest: false,
      transportation_method: "",
      pickup_location: "",
      consent_truthfulness: false,
      consent_media: false,
      consent_records: false,
      consent_discipline: false,
      consent_emergency: false,
      consent_terms: false,
    },
  });

  const handleNextPage = async () => {
    const isValid = await page1Form.trigger();
    if (isValid) {
      setCurrentPage(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in all required fields before continuing.");
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generatePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const pdf = new jsPDF();
      const page1Data = page1Form.getValues();
      const page2Data = page2Form.getValues();
      
      // Header
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("GOOD SHEPHERD INTERNATIONAL SCHOOL", 105, 20, { align: "center" });
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "italic");
      pdf.text("In God We Trust", 105, 28, { align: "center" });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.text("Mallam, New Gbawe - 100 meters from LAFA Police Station", 105, 35, { align: "center" });
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("ADMISSION APPLICATION FORM", 105, 48, { align: "center" });
      pdf.setFontSize(10);
      pdf.text(`Reference: ${referenceNumber}`, 105, 55, { align: "center" });
      
      let yPos = 70;
      const lineHeight = 7;
      const margin = 20;
      
      const addSection = (title: string) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text(title, margin, yPos);
        yPos += lineHeight;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
      };
      
      const addField = (label: string, value: string | undefined) => {
        if (yPos > 280) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(`${label}: ${value || "N/A"}`, margin, yPos);
        yPos += lineHeight;
      };
      
      // Student Information
      addSection("STUDENT INFORMATION");
      addField("Full Name", `${page1Data.student_surname} ${page1Data.student_first_name} ${page1Data.student_middle_name || ""}`);
      addField("Date of Birth", page1Data.student_dob);
      addField("Gender", page1Data.student_gender);
      addField("Nationality", page1Data.student_nationality);
      addField("Place of Birth", page1Data.student_place_of_birth);
      yPos += 5;
      
      // Primary Guardian
      addSection("PRIMARY GUARDIAN");
      addField("Name", page1Data.guardian1_full_name);
      addField("Relationship", page1Data.guardian1_relationship);
      addField("Phone", page1Data.guardian1_phone_primary);
      addField("Email", page1Data.guardian1_email);
      addField("Address", page1Data.guardian1_address);
      yPos += 5;
      
      // Program Selection
      addSection("PROGRAM SELECTION");
      const programLabel = programLevels.find(p => p.value === page1Data.program_level)?.label || page1Data.program_level;
      addField("Educational Level", programLabel);
      addField("Intended Start Date", page1Data.intended_start_date);
      if (page1Data.career_training_interests?.length) {
        addField("Career Training", page1Data.career_training_interests.join(", "));
      }
      yPos += 5;
      
      // Health Information
      pdf.addPage();
      yPos = 20;
      addSection("HEALTH INFORMATION");
      addField("Medical Conditions", page2Data.has_medical_conditions ? "Yes" : "No");
      if (page2Data.has_medical_conditions && page2Data.medical_conditions_details) {
        addField("Details", page2Data.medical_conditions_details);
      }
      addField("Allergies", page2Data.has_allergies ? "Yes" : "No");
      addField("Immunizations Up to Date", page2Data.immunization_up_to_date ? "Yes" : "No");
      yPos += 5;
      
      // Consent
      addSection("CONSENT & DECLARATIONS");
      addField("Truthfulness Declaration", page2Data.consent_truthfulness ? "Agreed" : "Not Agreed");
      addField("Media Consent", page2Data.consent_media ? "Agreed" : "Not Agreed");
      addField("Records Authorization", page2Data.consent_records ? "Agreed" : "Not Agreed");
      addField("Terms & Conditions", page2Data.consent_terms ? "Agreed" : "Not Agreed");
      
      // Footer
      yPos = 270;
      pdf.setFontSize(8);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPos);
      pdf.text("Thank you for choosing Good Shepherd International School.", 105, yPos + 5, { align: "center" });
      
      pdf.save(`GSIS_Application_${referenceNumber}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = await page2Form.trigger();
    if (!isValid) {
      toast.error("Please complete all required fields and consent checkboxes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const page1Data = page1Form.getValues();
      const page2Data = page2Form.getValues();

      const applicationData = {
        reference_number: referenceNumber,
        student_surname: page1Data.student_surname,
        student_first_name: page1Data.student_first_name,
        student_middle_name: page1Data.student_middle_name || null,
        student_dob: page1Data.student_dob,
        student_gender: page1Data.student_gender,
        student_nationality: page1Data.student_nationality,
        student_place_of_birth: page1Data.student_place_of_birth || null,
        guardian1_relationship: page1Data.guardian1_relationship,
        guardian1_full_name: page1Data.guardian1_full_name,
        guardian1_occupation: page1Data.guardian1_occupation || null,
        guardian1_employer: page1Data.guardian1_employer || null,
        guardian1_phone_primary: page1Data.guardian1_phone_primary,
        guardian1_phone_secondary: page1Data.guardian1_phone_secondary || null,
        guardian1_email: page1Data.guardian1_email,
        guardian1_address: page1Data.guardian1_address,
        guardian1_landmark: page1Data.guardian1_landmark || null,
        guardian1_workplace_address: page1Data.guardian1_workplace_address || null,
        guardian1_workplace_phone: page1Data.guardian1_workplace_phone || null,
        guardian2_full_name: page1Data.guardian2_full_name || null,
        guardian2_relationship: page1Data.guardian2_relationship || null,
        guardian2_phone_primary: page1Data.guardian2_phone_primary || null,
        guardian2_email: page1Data.guardian2_email || null,
        guardian2_address: page1Data.guardian2_address || null,
        guardian2_is_emergency_contact: page1Data.guardian2_is_emergency_contact,
        is_first_time_enrollment: page1Data.is_first_time_enrollment,
        previous_school_name: page1Data.previous_school_name || null,
        previous_school_location: page1Data.previous_school_location || null,
        last_grade_completed: page1Data.last_grade_completed || null,
        academic_performance: page1Data.academic_performance || null,
        reason_for_change: page1Data.reason_for_change || null,
        program_level: page1Data.program_level,
        career_training_interests: page1Data.career_training_interests,
        intended_start_date: page1Data.intended_start_date || null,
        has_medical_conditions: page2Data.has_medical_conditions,
        medical_conditions: page2Data.medical_conditions,
        medical_conditions_details: page2Data.medical_conditions_details || null,
        has_allergies: page2Data.has_allergies,
        allergies: page2Data.allergies ? { description: page2Data.allergies } : null,
        current_medications: page2Data.current_medications ? { description: page2Data.current_medications } : null,
        immunization_up_to_date: page2Data.immunization_up_to_date,
        medical_authorization: page2Data.medical_authorization,
        has_special_needs: page2Data.has_special_needs,
        special_needs_types: page2Data.special_needs_types,
        special_needs_details: page2Data.special_needs_details || null,
        financial_acknowledgment: page2Data.financial_acknowledgment,
        financial_assistance_interest: page2Data.financial_assistance_interest,
        transportation_method: page2Data.transportation_method || null,
        pickup_location: page2Data.pickup_location || null,
        consent_truthfulness: page2Data.consent_truthfulness,
        consent_media: page2Data.consent_media,
        consent_records: page2Data.consent_records,
        consent_discipline: page2Data.consent_discipline,
        consent_emergency: page2Data.consent_emergency,
        consent_terms: page2Data.consent_terms,
      };

      const { error } = await supabase.from("enrollment_applications").insert(applicationData);

      if (error) throw error;

      toast.success("Application submitted successfully!", {
        description: `Your reference number is ${referenceNumber}. You will receive a confirmation email shortly.`,
        duration: 10000,
      });
      
      // Generate PDF automatically after submission
      await generatePDF();
      
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div ref={formRef} className="bg-card rounded-xl shadow-elevated overflow-hidden">
            <AdmissionFormHeader referenceNumber={referenceNumber} currentPage={currentPage} />
            
            {currentPage === 1 ? (
              <FormPage1 form={page1Form} />
            ) : (
              <FormPage2 form={page2Form} />
            )}
            
            {/* Navigation Footer */}
            <div className="p-6 bg-muted/30 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Fields marked with * are required. For assistance, call 0208163186.
                </p>
                
                <div className="flex items-center gap-3">
                  {currentPage === 2 && (
                    <Button variant="outline" onClick={handlePrevPage}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Page 1
                    </Button>
                  )}
                  
                  {currentPage === 1 ? (
                    <Button onClick={handleNextPage} className="bg-primary hover:bg-primary/90">
                      Continue to Page 2
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={generatePDF}
                        disabled={isGeneratingPdf}
                      >
                        {isGeneratingPdf ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Download PDF
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-accent hover:bg-accent/90"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-1" />
                        )}
                        Submit Application
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Thank you for choosing Good Shepherd International School. We look forward to welcoming your child to our community of excellence.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdmissionForm;
