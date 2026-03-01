
-- Create report_cards table
CREATE TABLE public.report_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year text NOT NULL,
  term text NOT NULL,
  class_name text NOT NULL,
  number_on_roll integer,
  attendance_present integer,
  attendance_total integer,
  conduct text,
  attitude text,
  interest text,
  form_teacher_name text,
  form_teacher_remark text,
  headteacher_name text,
  headteacher_remark text,
  next_term_begins date,
  promoted_to text,
  cumulated_score numeric,
  max_possible_score numeric,
  learner_average numeric,
  class_average numeric,
  position_in_class integer,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(student_id, academic_year, term)
);

-- Enable RLS
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins can manage report cards"
ON public.report_cards
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Parents can view published report cards for their children
CREATE POLICY "Parents can view published report cards"
ON public.report_cards
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM parent_accounts
    WHERE parent_accounts.student_id = report_cards.student_id
    AND parent_accounts.user_id = auth.uid()
  )
);

-- Add new columns to grades table for IAS/ETES structure
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS ias_score numeric;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS etes_score numeric;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS proficiency_level integer;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS grade_description text;
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS position_in_subject integer;
