-- Create enrollment_applications table
CREATE TABLE public.enrollment_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Student Information
  student_surname TEXT NOT NULL,
  student_first_name TEXT NOT NULL,
  student_middle_name TEXT,
  student_dob DATE NOT NULL,
  student_gender TEXT NOT NULL,
  student_nationality TEXT NOT NULL,
  student_place_of_birth TEXT,
  student_photo_url TEXT,
  
  -- Guardian 1 (Primary)
  guardian1_relationship TEXT NOT NULL,
  guardian1_full_name TEXT NOT NULL,
  guardian1_occupation TEXT,
  guardian1_employer TEXT,
  guardian1_phone_primary TEXT NOT NULL,
  guardian1_phone_secondary TEXT,
  guardian1_email TEXT NOT NULL,
  guardian1_address TEXT NOT NULL,
  guardian1_landmark TEXT,
  guardian1_workplace_address TEXT,
  guardian1_workplace_phone TEXT,
  guardian1_is_primary_contact BOOLEAN DEFAULT true,
  
  -- Guardian 2 (Secondary)
  guardian2_full_name TEXT,
  guardian2_relationship TEXT,
  guardian2_phone_primary TEXT,
  guardian2_phone_secondary TEXT,
  guardian2_email TEXT,
  guardian2_address TEXT,
  guardian2_is_emergency_contact BOOLEAN DEFAULT false,
  
  -- Educational Background
  previous_school_name TEXT,
  previous_school_location TEXT,
  is_first_time_enrollment BOOLEAN DEFAULT false,
  last_grade_completed TEXT,
  academic_performance TEXT,
  reason_for_change TEXT,
  
  -- Program Selection
  program_level TEXT NOT NULL,
  career_training_interests TEXT[],
  intended_start_date DATE,
  
  -- Health Information
  has_medical_conditions BOOLEAN DEFAULT false,
  medical_conditions TEXT[],
  medical_conditions_details TEXT,
  has_allergies BOOLEAN DEFAULT false,
  allergies JSONB,
  current_medications JSONB,
  immunization_up_to_date BOOLEAN,
  medical_authorization BOOLEAN DEFAULT false,
  
  -- Special Educational Needs
  has_special_needs BOOLEAN DEFAULT false,
  special_needs_types TEXT[],
  special_needs_details TEXT,
  
  -- Financial & Transportation
  financial_acknowledgment BOOLEAN DEFAULT false,
  financial_assistance_interest BOOLEAN DEFAULT false,
  transportation_method TEXT,
  pickup_location TEXT,
  authorized_persons JSONB,
  
  -- Documents URLs
  birth_certificate_url TEXT,
  academic_records_url TEXT,
  vaccination_card_url TEXT,
  residence_proof_url TEXT,
  
  -- Consent
  consent_truthfulness BOOLEAN DEFAULT false,
  consent_media BOOLEAN DEFAULT false,
  consent_records BOOLEAN DEFAULT false,
  consent_discipline BOOLEAN DEFAULT false,
  consent_emergency BOOLEAN DEFAULT false,
  consent_terms BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.enrollment_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anyone can submit an application)
CREATE POLICY "Anyone can submit an application" 
ON public.enrollment_applications 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing applications by reference number (public read for status check)
CREATE POLICY "Anyone can view their application by reference number" 
ON public.enrollment_applications 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_enrollment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enrollment_applications_updated_at
BEFORE UPDATE ON public.enrollment_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_enrollment_updated_at();

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollment_applications;

-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('application-documents', 'application-documents', true);

-- Create storage policies
CREATE POLICY "Anyone can upload application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Anyone can view application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'application-documents');