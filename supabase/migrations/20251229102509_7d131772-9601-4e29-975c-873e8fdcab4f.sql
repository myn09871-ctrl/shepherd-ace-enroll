-- Create parent_role enum
CREATE TYPE public.parent_role AS ENUM ('primary', 'secondary');

-- Create students table (linked to approved enrollment applications)
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT UNIQUE NOT NULL, -- e.g., GSIS2025001
    enrollment_application_id UUID REFERENCES public.enrollment_applications(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    surname TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    nationality TEXT,
    current_class TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, graduated, transferred, suspended
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parent_accounts table (for portal login)
CREATE TABLE public.parent_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    parent_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_primary TEXT,
    phone_secondary TEXT,
    relationship TEXT NOT NULL, -- mother, father, guardian
    role parent_role NOT NULL DEFAULT 'primary',
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    class_level TEXT, -- which class levels this subject applies to
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create grades table
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    academic_year TEXT NOT NULL,
    term TEXT NOT NULL, -- Term 1, Term 2, Term 3
    class_work_score DECIMAL(5,2),
    assignment_score DECIMAL(5,2),
    midterm_score DECIMAL(5,2),
    endterm_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    grade_letter TEXT, -- A, B+, B, C+, C, D, E, F
    position_in_class INTEGER,
    class_average DECIMAL(5,2),
    teacher_comment TEXT,
    posted_by UUID,
    posted_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL, -- present, absent, late, excused
    time_in TIME,
    time_out TIME,
    reason TEXT,
    is_excused BOOLEAN DEFAULT false,
    recorded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, date)
);

-- Create student_documents table
CREATE TABLE public.student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL, -- report_card, certificate, medical, fee_receipt, permission_slip, other
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    academic_year TEXT,
    term TEXT,
    uploaded_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fees table
CREATE TABLE public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    academic_year TEXT NOT NULL,
    term TEXT,
    fee_type TEXT NOT NULL, -- tuition, uniform, books, examination, extracurricular, transportation
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    payment_date DATE,
    payment_method TEXT, -- mtn_momo, vodafone_cash, airtel_money, card, cash
    receipt_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create timetables table
CREATE TABLE public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL, -- 1=Monday, 5=Friday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    teacher_name TEXT,
    room_number TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create parent_messages table
CREATE TABLE public.parent_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_account_id UUID REFERENCES public.parent_accounts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    sender_type TEXT NOT NULL, -- parent, admin
    sender_id UUID,
    recipient_type TEXT NOT NULL, -- admissions, teacher, principal, accounts
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create portal_announcements table (announcements visible to parents)
CREATE TABLE public.portal_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL, -- academic, events, administrative, emergency
    target_audience TEXT NOT NULL DEFAULT 'all', -- all, specific_class, specific_student
    target_class TEXT,
    target_student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    attachment_url TEXT,
    requires_acknowledgment BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create announcement_acknowledgments table
CREATE TABLE public.announcement_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID REFERENCES public.portal_announcements(id) ON DELETE CASCADE NOT NULL,
    parent_account_id UUID REFERENCES public.parent_accounts(id) ON DELETE CASCADE NOT NULL,
    acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(announcement_id, parent_account_id)
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_acknowledgments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view their students" ON public.students FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE student_id = students.id AND user_id = auth.uid())
);

-- RLS Policies for parent_accounts
CREATE POLICY "Admins can manage parent accounts" ON public.parent_accounts FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view own account" ON public.parent_accounts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Parents can update own account" ON public.parent_accounts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS Policies for subjects
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for grades
CREATE POLICY "Admins can manage grades" ON public.grades FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view their child grades" ON public.grades FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE student_id = grades.student_id AND user_id = auth.uid())
);

-- RLS Policies for attendance
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view their child attendance" ON public.attendance FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE student_id = attendance.student_id AND user_id = auth.uid())
);

-- RLS Policies for student_documents
CREATE POLICY "Admins can manage documents" ON public.student_documents FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view their child documents" ON public.student_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE student_id = student_documents.student_id AND user_id = auth.uid())
);

-- RLS Policies for fees
CREATE POLICY "Admins can manage fees" ON public.fees FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view their child fees" ON public.fees FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE student_id = fees.student_id AND user_id = auth.uid())
);

-- RLS Policies for timetables
CREATE POLICY "Anyone can view timetables" ON public.timetables FOR SELECT USING (true);
CREATE POLICY "Admins can manage timetables" ON public.timetables FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for parent_messages
CREATE POLICY "Admins can manage all messages" ON public.parent_messages FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view their messages" ON public.parent_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE id = parent_messages.parent_account_id AND user_id = auth.uid())
);
CREATE POLICY "Parents can send messages" ON public.parent_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE id = parent_messages.parent_account_id AND user_id = auth.uid())
);

-- RLS Policies for portal_announcements
CREATE POLICY "Admins can manage announcements" ON public.portal_announcements FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Parents can view published announcements" ON public.portal_announcements FOR SELECT USING (
    is_published = true AND (
        target_audience = 'all' OR
        (target_audience = 'specific_class' AND EXISTS (
            SELECT 1 FROM public.students s 
            JOIN public.parent_accounts pa ON pa.student_id = s.id 
            WHERE pa.user_id = auth.uid() AND s.current_class = target_class
        )) OR
        (target_audience = 'specific_student' AND EXISTS (
            SELECT 1 FROM public.parent_accounts WHERE student_id = target_student_id AND user_id = auth.uid()
        ))
    )
);

-- RLS Policies for announcement_acknowledgments
CREATE POLICY "Admins can view acknowledgments" ON public.announcement_acknowledgments FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Parents can manage own acknowledgments" ON public.announcement_acknowledgments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE id = parent_account_id AND user_id = auth.uid())
) WITH CHECK (
    EXISTS (SELECT 1 FROM public.parent_accounts WHERE id = parent_account_id AND user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_students_student_id ON public.students(student_id);
CREATE INDEX idx_students_current_class ON public.students(current_class);
CREATE INDEX idx_parent_accounts_user_id ON public.parent_accounts(user_id);
CREATE INDEX idx_parent_accounts_student_id ON public.parent_accounts(student_id);
CREATE INDEX idx_grades_student_id ON public.grades(student_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_fees_student_id ON public.fees(student_id);
CREATE INDEX idx_timetables_class ON public.timetables(class_name);

-- Create trigger for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_updated_at();
CREATE TRIGGER update_parent_accounts_updated_at BEFORE UPDATE ON public.parent_accounts FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_updated_at();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_updated_at();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_enrollment_updated_at();

-- Generate student ID function
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    year_prefix TEXT;
    next_number INTEGER;
    new_id TEXT;
BEGIN
    year_prefix := 'GSIS' || TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(student_id FROM 9) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.students
    WHERE student_id LIKE year_prefix || '%';
    new_id := year_prefix || LPAD(next_number::TEXT, 4, '0');
    RETURN new_id;
END;
$$;