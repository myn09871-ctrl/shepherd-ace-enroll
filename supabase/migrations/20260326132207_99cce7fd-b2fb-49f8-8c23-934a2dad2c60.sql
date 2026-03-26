
-- Create teacher_profiles table
CREATE TABLE public.teacher_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create class_teachers table
CREATE TABLE public.class_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  class_name text NOT NULL,
  academic_year text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class_name, academic_year)
);
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

-- Create assignments table
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  class_name text NOT NULL,
  title text NOT NULL,
  description text,
  due_date date,
  attachment_url text,
  academic_year text,
  term text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('teacher-avatars', 'teacher-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view teacher avatars" ON storage.objects FOR SELECT USING (bucket_id = 'teacher-avatars');
CREATE POLICY "Teachers can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teacher-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Teachers can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'teacher-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Functions
CREATE OR REPLACE FUNCTION public.is_teacher(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'teacher') $$;

CREATE OR REPLACE FUNCTION public.get_teacher_profile_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT id FROM public.teacher_profiles WHERE user_id = _user_id LIMIT 1 $$;

CREATE OR REPLACE FUNCTION public.teacher_has_class(_user_id uuid, _class_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.class_teachers ct
  JOIN public.teacher_profiles tp ON tp.id = ct.teacher_id
  WHERE tp.user_id = _user_id AND ct.class_name = _class_name AND ct.is_active = true
) $$;

-- RLS: teacher_profiles
CREATE POLICY "Teachers can view own profile" ON public.teacher_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Teachers can update own profile" ON public.teacher_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage teacher profiles" ON public.teacher_profiles FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- RLS: class_teachers
CREATE POLICY "Teachers can view own classes" ON public.class_teachers FOR SELECT USING (teacher_id = get_teacher_profile_id(auth.uid()));
CREATE POLICY "Admins can manage class teachers" ON public.class_teachers FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- RLS: assignments
CREATE POLICY "Teachers can manage own assignments" ON public.assignments FOR ALL USING (teacher_id = get_teacher_profile_id(auth.uid())) WITH CHECK (teacher_id = get_teacher_profile_id(auth.uid()));
CREATE POLICY "Admins can manage all assignments" ON public.assignments FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view class assignments" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM students s JOIN parent_accounts pa ON pa.student_id = s.id WHERE pa.user_id = auth.uid() AND s.current_class = assignments.class_name)
);

-- RLS updates for existing tables
CREATE POLICY "Teachers can manage class grades" ON public.grades FOR ALL
USING (EXISTS (SELECT 1 FROM students s WHERE s.id = grades.student_id AND teacher_has_class(auth.uid(), s.current_class)))
WITH CHECK (EXISTS (SELECT 1 FROM students s WHERE s.id = grades.student_id AND teacher_has_class(auth.uid(), s.current_class)));

CREATE POLICY "Teachers can manage class attendance" ON public.attendance FOR ALL
USING (EXISTS (SELECT 1 FROM students s WHERE s.id = attendance.student_id AND teacher_has_class(auth.uid(), s.current_class)))
WITH CHECK (EXISTS (SELECT 1 FROM students s WHERE s.id = attendance.student_id AND teacher_has_class(auth.uid(), s.current_class)));

CREATE POLICY "Teachers can view class students" ON public.students FOR SELECT
USING (teacher_has_class(auth.uid(), current_class));

CREATE POLICY "Teachers can create class announcements" ON public.portal_announcements FOR INSERT
WITH CHECK (is_teacher(auth.uid()) AND target_audience = 'specific_class' AND teacher_has_class(auth.uid(), target_class));

CREATE POLICY "Teachers can view own announcements" ON public.portal_announcements FOR SELECT
USING (created_by = auth.uid() AND is_teacher(auth.uid()));

CREATE POLICY "Teachers can send class messages" ON public.parent_messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM students s WHERE s.id = parent_messages.student_id AND teacher_has_class(auth.uid(), s.current_class)));

CREATE POLICY "Teachers can view class messages" ON public.parent_messages FOR SELECT
USING (sender_id = auth.uid() OR EXISTS (SELECT 1 FROM students s WHERE s.id = parent_messages.student_id AND teacher_has_class(auth.uid(), s.current_class)));

-- Trigger
CREATE TRIGGER update_teacher_profiles_updated_at
BEFORE UPDATE ON public.teacher_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_updated_at();
