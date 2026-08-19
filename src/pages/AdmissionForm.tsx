import { useState, useRef } from "react";
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
  immunizationsList,
  feePaymentPlans,
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
      student_hometown: "",
      student_languages_spoken: "",
      student_religion: "",
      // Health (Section B)
      has_medical_conditions: false,
      medical_conditions: [],
      medical_conditions_details: "",
      has_allergies: false,
      allergies: "",
      current_medications: "",
      immunization_up_to_date: false,
      medical_authorization: false,
      immunization_bcg: false,
      immunization_dtp: false,
      immunization_whooping_cough: false,
      immunization_tetanus: false,
      immunization_poliomyelitis: false,
      immunization_measles: false,
      immunization_yellow_fever: false,
      immunization_hepatitis_b: false,
      immunization_hib: false,
      // Education (Section C)
      is_first_time_enrollment: false,
      previous_school_name: "",
      previous_school_location: "",
      previous_school_date_attended: "",
      previous_school_last_class: "",
      last_grade_completed: "",
      academic_performance: "",
      reason_for_change: "",
      // Subjects (Section D)
      subjects_studied: [],
      // Program
      program_level: "",
      career_training_interests: [],
      intended_start_date: "",
      // Portal account fields
      portal_email: "",
    },
  });

  const page2Form = useForm<Page2Data>({
    resolver: zodResolver(page2Schema),
    defaultValues: {
      // Father (Section E)
      guardian1_relationship: "",
      guardian1_full_name: "",
      guardian1_occupation: "",
      guardian1_educational_qualification: "",
      guardian1_marital_status: "",
      guardian1_religion: "",
      guardian1_address: "",
      guardian1_phone_primary: "",
      guardian1_phone_secondary: "",
      guardian1_email: "",
      guardian1_location: "",
      guardian1_house_no: "",
      guardian1_landmark: "",
      guardian1_employer: "",
      guardian1_workplace_address: "",
      guardian1_workplace_phone: "",
      guardian1_children_in_home: undefined,
      guardian1_other_children_in_school: false,
      guardian1_how_many_children: "",
      guardian1_children_classes: "",
      guardian1_responsible_for_fees: false,
      guardian1_pupil_lives_with: false,
      // Mother
      guardian2_full_name: "",
      guardian2_relationship: "",
      guardian2_occupation: "",
      guardian2_educational_qualification: "",
      guardian2_marital_status: "",
      guardian2_religion: "",
      guardian2_address: "",
      guardian2_phone_primary: "",
      guardian2_phone_secondary: "",
      guardian2_email: "",
      guardian2_location: "",
      guardian2_house_no: "",
      guardian2_tel_no: "",
      guardian2_children_in_home: undefined,
      guardian2_other_children_in_school: false,
      guardian2_how_many_children: "",
      guardian2_children_classes: "",
      guardian2_responsible_for_fees: false,
      guardian2_pupil_lives_with: false,
      guardian2_is_emergency_contact: false,
      // Guardian
      guardian3_name: "",
      guardian3_occupation: "",
      guardian3_educational_qualification: "",
      guardian3_marital_status: "",
      guardian3_religion: "",
      guardian3_address: "",
      guardian3_tel_no: "",
      guardian3_location: "",
      guardian3_house_no: "",
      guardian3_children_in_home: undefined,
      guardian3_responsible_for_fees: false,
      guardian3_pupil_lives_with: false,
      // Fee payment
      fee_payment_plan: "",
      // Special needs
      has_special_needs: false,
      special_needs_types: [],
      special_needs_details: "",
      // Financial/Transport
      financial_acknowledgment: false,
      financial_assistance_interest: false,
      transportation_method: "",
      pickup_location: "",
      // Consent
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
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, 61, { align: "center" });

      let yPos = 75;
      const lineHeight = 6;
      const margin = 15;
      const labelWidth = 60;
      const pageWidth = 210;
      const valueWidth = pageWidth - margin * 2 - labelWidth - 5;

      const addSection = (title: string) => {
        if (yPos > 260) { pdf.addPage(); yPos = 20; }
        yPos += 4;
        pdf.setFillColor(230, 240, 250);
        pdf.rect(margin, yPos - 5, pageWidth - margin * 2, 8, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(title, margin + 3, yPos);
        yPos += 8;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
      };

      const addField = (label: string, value: string | boolean | undefined | null | string[] | number) => {
        if (yPos > 280) { pdf.addPage(); yPos = 20; }
        pdf.setFont("helvetica", "bold");
        pdf.text(`${label}:`, margin, yPos);
        pdf.setFont("helvetica", "normal");
        let displayValue = "";
        if (Array.isArray(value)) {
          displayValue = value.length > 0 ? value.join(", ") : "";
        } else if (typeof value === "boolean") {
          displayValue = value ? "Yes" : "No";
        } else if (typeof value === "number") {
          displayValue = String(value);
        } else if (value !== undefined && value !== null && value !== "") {
          displayValue = String(value);
        }
        const splitText = pdf.splitTextToSize(displayValue || "", valueWidth);
        pdf.text(splitText, margin + labelWidth, yPos);
        yPos += lineHeight * Math.max(1, splitText.length);
      };

      // SECTION A
      addSection("SECTION A: CHILD'S PERSONAL DATA");
      addField("Surname", page1Data.student_surname);
      addField("Other Names", page1Data.student_first_name);
      addField("Middle Name", page1Data.student_middle_name);
      addField("Date of Birth", page1Data.student_dob);
      addField("Gender", page1Data.student_gender);
      addField("Nationality", page1Data.student_nationality);
      addField("Place of Birth", page1Data.student_place_of_birth);
      addField("Hometown", page1Data.student_hometown);
      addField("Language(s) Spoken", page1Data.student_languages_spoken);
      addField("Religion", page1Data.student_religion);

      // SECTION B
      addSection("SECTION B: HEALTH STATUS OF CHILD");
      addField("Has Medical Conditions", page1Data.has_medical_conditions);
      if (page1Data.has_medical_conditions) {
        addField("Medical Conditions", page1Data.medical_conditions);
        addField("Details", page1Data.medical_conditions_details);
      }
      addField("Has Allergies", page1Data.has_allergies);
      if (page1Data.has_allergies) {
        addField("Allergies", page1Data.allergies);
      }
      addField("Current Medications", page1Data.current_medications);
      // Immunizations
      const receivedImm = immunizationsList
        .filter(imm => page1Data[imm.key])
        .map(imm => imm.label);
      addField("Immunizations Received", receivedImm);
      addField("Medical Authorization", page1Data.medical_authorization);

      // SECTION C
      addSection("SECTION C: RECORD OF PREVIOUS SCHOOL");
      addField("First Time Enrollment", page1Data.is_first_time_enrollment);
      if (!page1Data.is_first_time_enrollment) {
        addField("School Name", page1Data.previous_school_name);
        addField("School Location", page1Data.previous_school_location);
        addField("Date Attended", page1Data.previous_school_date_attended);
        addField("Last Class Attended", page1Data.previous_school_last_class);
        addField("Academic Performance", page1Data.academic_performance);
        addField("Reason for Change", page1Data.reason_for_change);
      }
      const programLabel = programLevels.find(p => p.value === page1Data.program_level)?.label || page1Data.program_level;
      addField("Applying For Class", programLabel);
      addField("Intended Start Date", page1Data.intended_start_date);

      // SECTION D
      if (!page1Data.is_first_time_enrollment && page1Data.subjects_studied?.length) {
        addSection("SECTION D: SUBJECTS STUDIED");
        addField("Subjects", page1Data.subjects_studied);
        addField("Career Training Interests", page1Data.career_training_interests);
      }

      // Portal Account
      addSection("PARENT PORTAL ACCOUNT");
      addField("Portal Email", page1Data.portal_email);
      

      // SECTION E
      pdf.addPage(); yPos = 20;
      addSection("SECTION E: BIOLOGICAL FAMILY DATA - FATHER");
      addField("Name", page2Data.guardian1_full_name);
      addField("Relationship", page2Data.guardian1_relationship);
      addField("Occupation", page2Data.guardian1_occupation);
      addField("Educational Qualification", page2Data.guardian1_educational_qualification);
      addField("Marital Status", page2Data.guardian1_marital_status);
      addField("Religion", page2Data.guardian1_religion);
      addField("Address", page2Data.guardian1_address);
      addField("Phone", page2Data.guardian1_phone_primary);
      addField("Email", page2Data.guardian1_email);
      addField("Location", page2Data.guardian1_location);
      addField("House No.", page2Data.guardian1_house_no);
      addField("Children in Home", page2Data.guardian1_children_in_home);
      addField("Other Children in School", page2Data.guardian1_other_children_in_school);
      addField("Responsible for Fees", page2Data.guardian1_responsible_for_fees);
      addField("Child Lives With", page2Data.guardian1_pupil_lives_with);

      addSection("SECTION E: BIOLOGICAL FAMILY DATA - MOTHER");
      addField("Name", page2Data.guardian2_full_name);
      addField("Occupation", page2Data.guardian2_occupation);
      addField("Educational Qualification", page2Data.guardian2_educational_qualification);
      addField("Marital Status", page2Data.guardian2_marital_status);
      addField("Religion", page2Data.guardian2_religion);
      addField("Address", page2Data.guardian2_address);
      addField("Phone", page2Data.guardian2_phone_primary);
      addField("Email", page2Data.guardian2_email);
      addField("Location", page2Data.guardian2_location);
      addField("House No.", page2Data.guardian2_house_no);
      addField("Children in Home", page2Data.guardian2_children_in_home);
      addField("Emergency Contact", page2Data.guardian2_is_emergency_contact);
      addField("Responsible for Fees", page2Data.guardian2_responsible_for_fees);
      addField("Child Lives With", page2Data.guardian2_pupil_lives_with);

      addSection("SECTION E: BIOLOGICAL FAMILY DATA - GUARDIAN");
      addField("Name", page2Data.guardian3_name);
      addField("Occupation", page2Data.guardian3_occupation);
      addField("Educational Qualification", page2Data.guardian3_educational_qualification);
      addField("Marital Status", page2Data.guardian3_marital_status);
      addField("Religion", page2Data.guardian3_religion);
      addField("Address", page2Data.guardian3_address);
      addField("Tel No.", page2Data.guardian3_tel_no);
      addField("Location", page2Data.guardian3_location);
      addField("Responsible for Fees", page2Data.guardian3_responsible_for_fees);
      addField("Child Lives With", page2Data.guardian3_pupil_lives_with);

      // SECTION F
      addSection("SECTION F: FEE PAYMENT POLICY");
      const planLabel = feePaymentPlans.find(p => p.value === page2Data.fee_payment_plan)?.label || page2Data.fee_payment_plan;
      addField("Payment Plan", planLabel);
      addField("Financial Terms Acknowledged", page2Data.financial_acknowledgment);
      addField("Financial Assistance Interest", page2Data.financial_assistance_interest);

      // Special Needs
      addSection("SPECIAL EDUCATIONAL NEEDS");
      addField("Has Special Needs", page2Data.has_special_needs);
      if (page2Data.has_special_needs) {
        addField("Types", page2Data.special_needs_types);
        addField("Details", page2Data.special_needs_details);
      }

      // Transportation
      addSection("TRANSPORTATION");
      addField("Method", page2Data.transportation_method);
      addField("Pickup Location", page2Data.pickup_location);

      // SECTION H
      addSection("SECTION H: UNDERTAKING & CONSENT");
      addField("Truthfulness Declaration", page2Data.consent_truthfulness);
      addField("Media Consent", page2Data.consent_media);
      addField("Records Authorization", page2Data.consent_records);
      addField("Discipline Consent", page2Data.consent_discipline);
      addField("Emergency Consent", page2Data.consent_emergency);
      addField("Terms Accepted", page2Data.consent_terms);

      // Footer
      yPos = Math.max(yPos + 10, 260);
      if (yPos > 280) { pdf.addPage(); yPos = 260; }
      pdf.setDrawColor(200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.text("This is an official document of Good Shepherd International School.", 105, yPos, { align: "center" });
      pdf.text("For office use only - Do not alter.", 105, yPos + 5, { align: "center" });

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

      const applicationData: Record<string, any> = {
        reference_number: referenceNumber,
        // Section A
        student_surname: page1Data.student_surname,
        student_first_name: page1Data.student_first_name,
        student_middle_name: page1Data.student_middle_name || null,
        student_dob: page1Data.student_dob,
        student_gender: page1Data.student_gender,
        student_nationality: page1Data.student_nationality,
        student_place_of_birth: page1Data.student_place_of_birth || null,
        student_hometown: page1Data.student_hometown || null,
        student_languages_spoken: page1Data.student_languages_spoken || null,
        student_religion: page1Data.student_religion || null,
        // Section B
        has_medical_conditions: page1Data.has_medical_conditions,
        medical_conditions: page1Data.medical_conditions,
        medical_conditions_details: page1Data.medical_conditions_details || null,
        has_allergies: page1Data.has_allergies,
        allergies: page1Data.allergies ? { description: page1Data.allergies } : null,
        current_medications: page1Data.current_medications ? { description: page1Data.current_medications } : null,
        immunization_up_to_date: page1Data.immunization_up_to_date,
        medical_authorization: page1Data.medical_authorization,
        immunization_bcg: page1Data.immunization_bcg,
        immunization_dtp: page1Data.immunization_dtp,
        immunization_whooping_cough: page1Data.immunization_whooping_cough,
        immunization_tetanus: page1Data.immunization_tetanus,
        immunization_poliomyelitis: page1Data.immunization_poliomyelitis,
        immunization_measles: page1Data.immunization_measles,
        immunization_yellow_fever: page1Data.immunization_yellow_fever,
        immunization_hepatitis_b: page1Data.immunization_hepatitis_b,
        immunization_hib: page1Data.immunization_hib,
        // Section C
        is_first_time_enrollment: page1Data.is_first_time_enrollment,
        previous_school_name: page1Data.previous_school_name || null,
        previous_school_location: page1Data.previous_school_location || null,
        previous_school_date_attended: page1Data.previous_school_date_attended || null,
        previous_school_last_class: page1Data.previous_school_last_class || null,
        last_grade_completed: page1Data.last_grade_completed || null,
        academic_performance: page1Data.academic_performance || null,
        reason_for_change: page1Data.reason_for_change || null,
        // Section D
        subjects_studied: page1Data.subjects_studied,
        // Program
        program_level: page1Data.program_level,
        career_training_interests: page1Data.career_training_interests,
        intended_start_date: page1Data.intended_start_date || null,
        // Portal account fields
        portal_email: page1Data.portal_email,
        portal_password_hash: page1Data.portal_password,
        // Section E - Father
        guardian1_relationship: page2Data.guardian1_relationship,
        guardian1_full_name: page2Data.guardian1_full_name,
        guardian1_occupation: page2Data.guardian1_occupation || null,
        guardian1_employer: page2Data.guardian1_employer || null,
        guardian1_phone_primary: page2Data.guardian1_phone_primary,
        guardian1_phone_secondary: page2Data.guardian1_phone_secondary || null,
        guardian1_email: page2Data.guardian1_email,
        guardian1_address: page2Data.guardian1_address,
        guardian1_landmark: page2Data.guardian1_landmark || null,
        guardian1_workplace_address: page2Data.guardian1_workplace_address || null,
        guardian1_workplace_phone: page2Data.guardian1_workplace_phone || null,
        guardian1_educational_qualification: page2Data.guardian1_educational_qualification || null,
        guardian1_marital_status: page2Data.guardian1_marital_status || null,
        guardian1_religion: page2Data.guardian1_religion || null,
        guardian1_location: page2Data.guardian1_location || null,
        guardian1_house_no: page2Data.guardian1_house_no || null,
        guardian1_children_in_home: page2Data.guardian1_children_in_home || null,
        guardian1_other_children_in_school: page2Data.guardian1_other_children_in_school || null,
        guardian1_how_many_children: page2Data.guardian1_how_many_children || null,
        guardian1_children_classes: page2Data.guardian1_children_classes || null,
        guardian1_responsible_for_fees: page2Data.guardian1_responsible_for_fees || null,
        guardian1_pupil_lives_with: page2Data.guardian1_pupil_lives_with || null,
        // Mother
        guardian2_full_name: page2Data.guardian2_full_name || null,
        guardian2_relationship: page2Data.guardian2_relationship || null,
        guardian2_phone_primary: page2Data.guardian2_phone_primary || null,
        guardian2_phone_secondary: page2Data.guardian2_phone_secondary || null,
        guardian2_email: page2Data.guardian2_email || null,
        guardian2_address: page2Data.guardian2_address || null,
        guardian2_is_emergency_contact: page2Data.guardian2_is_emergency_contact,
        guardian2_occupation: page2Data.guardian2_occupation || null,
        guardian2_educational_qualification: page2Data.guardian2_educational_qualification || null,
        guardian2_marital_status: page2Data.guardian2_marital_status || null,
        guardian2_religion: page2Data.guardian2_religion || null,
        guardian2_location: page2Data.guardian2_location || null,
        guardian2_house_no: page2Data.guardian2_house_no || null,
        guardian2_tel_no: page2Data.guardian2_tel_no || null,
        guardian2_children_in_home: page2Data.guardian2_children_in_home || null,
        guardian2_other_children_in_school: page2Data.guardian2_other_children_in_school || null,
        guardian2_how_many_children: page2Data.guardian2_how_many_children || null,
        guardian2_children_classes: page2Data.guardian2_children_classes || null,
        guardian2_responsible_for_fees: page2Data.guardian2_responsible_for_fees || null,
        guardian2_pupil_lives_with: page2Data.guardian2_pupil_lives_with || null,
        // Guardian 3
        guardian3_name: page2Data.guardian3_name || null,
        guardian3_occupation: page2Data.guardian3_occupation || null,
        guardian3_educational_qualification: page2Data.guardian3_educational_qualification || null,
        guardian3_marital_status: page2Data.guardian3_marital_status || null,
        guardian3_religion: page2Data.guardian3_religion || null,
        guardian3_address: page2Data.guardian3_address || null,
        guardian3_tel_no: page2Data.guardian3_tel_no || null,
        guardian3_location: page2Data.guardian3_location || null,
        guardian3_house_no: page2Data.guardian3_house_no || null,
        guardian3_children_in_home: page2Data.guardian3_children_in_home || null,
        guardian3_responsible_for_fees: page2Data.guardian3_responsible_for_fees || null,
        guardian3_pupil_lives_with: page2Data.guardian3_pupil_lives_with || null,
        // Section F
        fee_payment_plan: page2Data.fee_payment_plan || null,
        // Special needs
        has_special_needs: page2Data.has_special_needs,
        special_needs_types: page2Data.special_needs_types,
        special_needs_details: page2Data.special_needs_details || null,
        // Financial/Transport
        financial_acknowledgment: page2Data.financial_acknowledgment,
        financial_assistance_interest: page2Data.financial_assistance_interest,
        transportation_method: page2Data.transportation_method || null,
        pickup_location: page2Data.pickup_location || null,
        // Consent
        consent_truthfulness: page2Data.consent_truthfulness,
        consent_media: page2Data.consent_media,
        consent_records: page2Data.consent_records,
        consent_discipline: page2Data.consent_discipline,
        consent_emergency: page2Data.consent_emergency,
        consent_terms: page2Data.consent_terms,
      };

      const { error } = await supabase.from("enrollment_applications").insert(applicationData as any);

      if (error) throw error;

      toast.success("Application submitted successfully!", {
        description: `Your reference number is ${referenceNumber}. You will receive a confirmation email shortly.`,
        duration: 10000,
      });

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
