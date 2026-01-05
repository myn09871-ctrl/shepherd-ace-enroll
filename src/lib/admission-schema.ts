import { z } from "zod";

export const studentInfoSchema = z.object({
  student_surname: z.string().min(2, "Surname is required"),
  student_first_name: z.string().min(2, "First name is required"),
  student_middle_name: z.string().optional(),
  student_dob: z.string().min(1, "Date of birth is required"),
  student_gender: z.string().min(1, "Gender is required"),
  student_nationality: z.string().min(1, "Nationality is required"),
  student_place_of_birth: z.string().optional(),
});

export const guardian1Schema = z.object({
  guardian1_relationship: z.string().min(1, "Relationship is required"),
  guardian1_full_name: z.string().min(2, "Full name is required"),
  guardian1_occupation: z.string().optional(),
  guardian1_employer: z.string().optional(),
  guardian1_phone_primary: z.string().min(10, "Phone number is required"),
  guardian1_phone_secondary: z.string().optional(),
  guardian1_email: z.string().email("Valid email is required"),
  guardian1_address: z.string().min(5, "Address is required"),
  guardian1_landmark: z.string().optional(),
  guardian1_workplace_address: z.string().optional(),
  guardian1_workplace_phone: z.string().optional(),
});

export const guardian2Schema = z.object({
  guardian2_full_name: z.string().optional(),
  guardian2_relationship: z.string().optional(),
  guardian2_phone_primary: z.string().optional(),
  guardian2_phone_secondary: z.string().optional(),
  guardian2_email: z.string().email().optional().or(z.literal("")),
  guardian2_address: z.string().optional(),
  guardian2_is_emergency_contact: z.boolean().default(false),
});

export const educationSchema = z.object({
  is_first_time_enrollment: z.boolean().default(false),
  previous_school_name: z.string().optional(),
  previous_school_location: z.string().optional(),
  last_grade_completed: z.string().optional(),
  academic_performance: z.string().optional(),
  reason_for_change: z.string().optional(),
});

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

export const healthSchema = z.object({
  has_medical_conditions: z.boolean().default(false),
  medical_conditions: z.array(z.string()).default([]),
  medical_conditions_details: z.string().optional(),
  has_allergies: z.boolean().default(false),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
  immunization_up_to_date: z.boolean().optional(),
  medical_authorization: z.boolean().default(false),
});

export const specialNeedsSchema = z.object({
  has_special_needs: z.boolean().default(false),
  special_needs_types: z.array(z.string()).default([]),
  special_needs_details: z.string().optional(),
});

export const financialTransportSchema = z.object({
  financial_acknowledgment: z.boolean().refine(val => val === true, "You must acknowledge the financial terms"),
  financial_assistance_interest: z.boolean().default(false),
  transportation_method: z.string().optional(),
  pickup_location: z.string().optional(),
});

export const consentSchema = z.object({
  consent_truthfulness: z.boolean().refine(val => val === true, "Required"),
  consent_media: z.boolean().default(false),
  consent_records: z.boolean().refine(val => val === true, "Required"),
  consent_discipline: z.boolean().refine(val => val === true, "Required"),
  consent_emergency: z.boolean().refine(val => val === true, "Required"),
  consent_terms: z.boolean().refine(val => val === true, "Required"),
});

// Create base page1 schema without password confirmation validation
const page1BaseSchema = studentInfoSchema
  .merge(guardian1Schema)
  .merge(guardian2Schema)
  .merge(educationSchema)
  .merge(programSchema)
  .merge(portalAccountBaseSchema);

// Add password confirmation validation with refine
export const page1Schema = page1BaseSchema.refine(
  (data) => data.portal_password === data.portal_password_confirm,
  {
    message: "Passwords do not match",
    path: ["portal_password_confirm"],
  }
);

export const page2Schema = healthSchema.merge(specialNeedsSchema).merge(financialTransportSchema).merge(consentSchema);

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

export const generateReferenceNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GSIS-${year}-${random}`;
};
