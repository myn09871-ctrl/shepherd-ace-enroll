import { z } from "zod";

// Section A: Child's Personal Data
export const studentInfoSchema = z.object({
  student_surname: z.string().min(2, "Surname is required"),
  student_first_name: z.string().min(2, "First name is required"),
  student_middle_name: z.string().optional(),
  student_dob: z.string().min(1, "Date of birth is required"),
  student_gender: z.string().min(1, "Gender is required"),
  student_nationality: z.string().min(1, "Nationality is required"),
  student_place_of_birth: z.string().optional(),
  student_hometown: z.string().optional(),
  student_languages_spoken: z.string().optional(),
  student_religion: z.string().optional(),
});

// Section B: Health Status
export const healthSchema = z.object({
  has_medical_conditions: z.boolean().default(false),
  medical_conditions: z.array(z.string()).default([]),
  medical_conditions_details: z.string().optional(),
  has_allergies: z.boolean().default(false),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
  immunization_up_to_date: z.boolean().optional(),
  medical_authorization: z.boolean().default(false),
  // Specific immunizations from physical form
  immunization_bcg: z.boolean().default(false),
  immunization_dtp: z.boolean().default(false),
  immunization_whooping_cough: z.boolean().default(false),
  immunization_tetanus: z.boolean().default(false),
  immunization_poliomyelitis: z.boolean().default(false),
  immunization_measles: z.boolean().default(false),
  immunization_yellow_fever: z.boolean().default(false),
  immunization_hepatitis_b: z.boolean().default(false),
  immunization_hib: z.boolean().default(false),
});

// Section C: Record of Previous School
export const educationSchema = z.object({
  is_first_time_enrollment: z.boolean().default(false),
  previous_school_name: z.string().optional(),
  previous_school_location: z.string().optional(),
  previous_school_date_attended: z.string().optional(),
  previous_school_last_class: z.string().optional(),
  last_grade_completed: z.string().optional(),
  academic_performance: z.string().optional(),
  reason_for_change: z.string().optional(),
});

// Section D: Subjects Studied
export const subjectsStudiedSchema = z.object({
  subjects_studied: z.array(z.string()).default([]),
});

// Program Selection (kept from original)
export const programSchema = z.object({
  program_level: z.string().min(1, "Program level is required"),
  career_training_interests: z.array(z.string()).default([]),
  intended_start_date: z.string().optional(),
});

// Portal account schema for admission form (without refine to allow merge)
export const portalAccountBaseSchema = z.object({
  portal_email: z.string().email("Valid email is required for portal access"),
  portal_password: z.string().min(8, "Password must be at least 8 characters"),
  portal_password_confirm: z.string().min(8, "Please confirm your password"),
  security_question: z.string().min(1, "Please select a security question"),
  security_answer: z.string().min(2, "Security answer is required"),
});

// Section E: Biological Family Data - Father (reuses guardian1_ prefix)
export const fatherSchema = z.object({
  guardian1_full_name: z.string().min(2, "Father's name is required"),
  guardian1_occupation: z.string().optional(),
  guardian1_educational_qualification: z.string().optional(),
  guardian1_marital_status: z.string().optional(),
  guardian1_religion: z.string().optional(),
  guardian1_address: z.string().min(5, "Address is required"),
  guardian1_phone_primary: z.string().min(10, "Phone number is required"),
  guardian1_phone_secondary: z.string().optional(),
  guardian1_email: z.string().email("Valid email is required"),
  guardian1_location: z.string().optional(),
  guardian1_house_no: z.string().optional(),
  guardian1_landmark: z.string().optional(),
  guardian1_employer: z.string().optional(),
  guardian1_workplace_address: z.string().optional(),
  guardian1_workplace_phone: z.string().optional(),
  guardian1_children_in_home: z.number().optional(),
  guardian1_other_children_in_school: z.boolean().optional(),
  guardian1_how_many_children: z.string().optional(),
  guardian1_children_classes: z.string().optional(),
  guardian1_responsible_for_fees: z.boolean().optional(),
  guardian1_pupil_lives_with: z.boolean().optional(),
  guardian1_relationship: z.string().min(1, "Relationship is required"),
});

// Section E: Mother (reuses guardian2_ prefix)
export const motherSchema = z.object({
  guardian2_full_name: z.string().optional(),
  guardian2_relationship: z.string().optional(),
  guardian2_occupation: z.string().optional(),
  guardian2_educational_qualification: z.string().optional(),
  guardian2_marital_status: z.string().optional(),
  guardian2_religion: z.string().optional(),
  guardian2_address: z.string().optional(),
  guardian2_phone_primary: z.string().optional(),
  guardian2_phone_secondary: z.string().optional(),
  guardian2_email: z.string().email().optional().or(z.literal("")),
  guardian2_location: z.string().optional(),
  guardian2_house_no: z.string().optional(),
  guardian2_tel_no: z.string().optional(),
  guardian2_children_in_home: z.number().optional(),
  guardian2_other_children_in_school: z.boolean().optional(),
  guardian2_how_many_children: z.string().optional(),
  guardian2_children_classes: z.string().optional(),
  guardian2_responsible_for_fees: z.boolean().optional(),
  guardian2_pupil_lives_with: z.boolean().optional(),
  guardian2_is_emergency_contact: z.boolean().default(false),
});

// Section E: Guardian (third person)
export const guardianSchema = z.object({
  guardian3_name: z.string().optional(),
  guardian3_occupation: z.string().optional(),
  guardian3_educational_qualification: z.string().optional(),
  guardian3_marital_status: z.string().optional(),
  guardian3_religion: z.string().optional(),
  guardian3_address: z.string().optional(),
  guardian3_tel_no: z.string().optional(),
  guardian3_location: z.string().optional(),
  guardian3_house_no: z.string().optional(),
  guardian3_children_in_home: z.number().optional(),
  guardian3_responsible_for_fees: z.boolean().optional(),
  guardian3_pupil_lives_with: z.boolean().optional(),
});

// Section F: Fee Payment Policy
export const feePaymentSchema = z.object({
  fee_payment_plan: z.string().optional(),
});

// Special Educational Needs
export const specialNeedsSchema = z.object({
  has_special_needs: z.boolean().default(false),
  special_needs_types: z.array(z.string()).default([]),
  special_needs_details: z.string().optional(),
});

// Transportation
export const financialTransportSchema = z.object({
  financial_acknowledgment: z.boolean().refine(val => val === true, "You must acknowledge the financial terms"),
  financial_assistance_interest: z.boolean().default(false),
  transportation_method: z.string().optional(),
  pickup_location: z.string().optional(),
});

// Section H: Undertaking / Consent
export const consentSchema = z.object({
  consent_truthfulness: z.boolean().refine(val => val === true, "Required"),
  consent_media: z.boolean().default(false),
  consent_records: z.boolean().refine(val => val === true, "Required"),
  consent_discipline: z.boolean().refine(val => val === true, "Required"),
  consent_emergency: z.boolean().refine(val => val === true, "Required"),
  consent_terms: z.boolean().refine(val => val === true, "Required"),
});

// Page 1: Sections A, B, C, D + Portal Account
const page1BaseSchema = studentInfoSchema
  .merge(healthSchema)
  .merge(educationSchema)
  .merge(subjectsStudiedSchema)
  .merge(programSchema)
  .merge(portalAccountBaseSchema);

export const page1Schema = page1BaseSchema.refine(
  (data) => data.portal_password === data.portal_password_confirm,
  {
    message: "Passwords do not match",
    path: ["portal_password_confirm"],
  }
);

// Page 2: Sections E, F, G, H + Special Needs + Transport
export const page2Schema = fatherSchema
  .merge(motherSchema)
  .merge(guardianSchema)
  .merge(feePaymentSchema)
  .merge(specialNeedsSchema)
  .merge(financialTransportSchema)
  .merge(consentSchema);

export type Page1Data = z.infer<typeof page1Schema>;
export type Page2Data = z.infer<typeof page2Schema>;
export type FullApplicationData = Page1Data & Page2Data;

export const programLevels = [
  { value: "creche-infant", label: "Creche - Infant (0-1 years)" },
  { value: "creche-toddler", label: "Creche - Toddler (1-2 years)" },
  { value: "nursery-1", label: "Nursery 1" },
  { value: "nursery-2", label: "Nursery 2" },
  { value: "kg-1", label: "Kindergarten 1" },
  { value: "kg-2", label: "Kindergarten 2" },
  { value: "primary-1", label: "Primary Class 1" },
  { value: "primary-2", label: "Primary Class 2" },
  { value: "primary-3", label: "Primary Class 3" },
  { value: "primary-4", label: "Primary Class 4" },
  { value: "primary-5", label: "Primary Class 5" },
  { value: "primary-6", label: "Primary Class 6" },
  { value: "jhs-1", label: "JHS Form 1" },
  { value: "jhs-2", label: "JHS Form 2" },
  { value: "jhs-3", label: "JHS Form 3" },
];

export const careerTrainingOptions = [
  "Creative Arts",
  "Information Technology & Coding",
  "Fashion Designing",
  "Naval Corps",
];

export const relationshipOptions = [
  "Father",
  "Mother",
  "Legal Guardian",
  "Grandmother",
  "Grandfather",
  "Other",
];

export const medicalConditions = [
  "Asthma",
  "Diabetes",
  "Epilepsy",
  "Heart Conditions",
  "Sickle Cell Disease",
  "Other",
];

export const specialNeedsOptions = [
  "Learning Disabilities",
  "Attention Deficit Concerns",
  "Autism Spectrum",
  "Speech and Language Delays",
  "Physical Disabilities",
  "Visual or Hearing Impairments",
  "Behavioral Challenges",
  "Other",
];

export const securityQuestions = [
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your first pet?",
  "What is your favorite teacher's name?",
  "What is your favorite childhood memory location?",
  "What was the make of your first car?",
];

export const immunizationsList = [
  { key: "immunization_bcg" as const, label: "BCG" },
  { key: "immunization_dtp" as const, label: "DTP" },
  { key: "immunization_whooping_cough" as const, label: "Whooping Cough" },
  { key: "immunization_tetanus" as const, label: "Tetanus" },
  { key: "immunization_poliomyelitis" as const, label: "Poliomyelitis" },
  { key: "immunization_measles" as const, label: "Measles" },
  { key: "immunization_yellow_fever" as const, label: "Yellow Fever" },
  { key: "immunization_hepatitis_b" as const, label: "Hepatitis B (3 doses)" },
  { key: "immunization_hib" as const, label: "HIB (3 doses)" },
];

export const subjectCategories = [
  {
    category: "Science",
    subjects: ["Natural Science", "Integrated Science", "Mathematics"],
  },
  {
    category: "Social Sciences",
    subjects: ["Social Studies", "RME", "Citizenship"],
  },
  {
    category: "Languages",
    subjects: ["English", "French", "Akwapim Twi"],
  },
  {
    category: "Vocational Skills",
    subjects: ["Creative Arts", "Pre-Tech/BDT", "ICT"],
  },
];

export const feePaymentPlans = [
  { value: "one-touch", label: "One Touch", description: "Full fee payment at once on re-opening day" },
  { value: "two-installments", label: "Two Months Installments", description: "50% on re-opening, remaining 50% after Mid-terms" },
  { value: "daily-susu", label: "Daily Susu Payment Scheme", description: "Daily payment scheme arrangement" },
];

export const maritalStatusOptions = [
  "Single",
  "Married",
  "Divorced",
  "Widowed",
  "Separated",
];

export const educationalQualifications = [
  "No Formal Education",
  "Primary School",
  "JHS / Middle School",
  "SHS / Secondary School",
  "Diploma / HND",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate / PhD",
  "Professional Certification",
  "Other",
];

export const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GSIS-${year}-${random}`;
};
