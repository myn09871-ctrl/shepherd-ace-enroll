
-- Add new columns to enrollment_applications for physical form alignment

-- Student fields (Section A)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS student_hometown text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS student_languages_spoken text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS student_religion text;

-- Father/Guardian1 extended fields (Section E)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_educational_qualification text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_marital_status text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_religion text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_house_no text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_location text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_children_in_home integer;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_other_children_in_school boolean;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_how_many_children text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_children_classes text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_responsible_for_fees boolean;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian1_pupil_lives_with boolean;

-- Mother/Guardian2 extended fields (Section E)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_occupation text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_educational_qualification text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_marital_status text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_religion text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_house_no text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_location text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_tel_no text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_children_in_home integer;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_other_children_in_school boolean;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_how_many_children text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_children_classes text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_responsible_for_fees boolean;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian2_pupil_lives_with boolean;

-- Guardian (third person) fields (Section E)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_name text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_occupation text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_educational_qualification text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_marital_status text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_religion text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_address text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_tel_no text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_location text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_house_no text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_children_in_home integer;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_responsible_for_fees boolean;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS guardian3_pupil_lives_with boolean;

-- Previous school extended fields (Section C)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS previous_school_date_attended text;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS previous_school_last_class text;

-- Subjects studied (Section D)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS subjects_studied text[];

-- Fee payment plan (Section F)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS fee_payment_plan text;

-- Specific immunizations (Section B)
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_bcg boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_dtp boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_whooping_cough boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_tetanus boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_poliomyelitis boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_measles boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_yellow_fever boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_hepatitis_b boolean DEFAULT false;
ALTER TABLE public.enrollment_applications ADD COLUMN IF NOT EXISTS immunization_hib boolean DEFAULT false;
