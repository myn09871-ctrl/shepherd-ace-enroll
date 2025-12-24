-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admissions_officer', 'content_manager');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admissions_officer', 'content_manager')
  )
$$;

-- RLS policy for user_roles - only super_admin can manage roles
CREATE POLICY "Super admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Admins can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create admin_notes table for internal notes on applications
CREATE TABLE public.admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.enrollment_applications(id) ON DELETE CASCADE NOT NULL,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes"
ON public.admin_notes
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create website_content table for CMS
CREATE TABLE public.website_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL UNIQUE,
    page_title TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read website content
CREATE POLICY "Anyone can read website content"
ON public.website_content
FOR SELECT
USING (true);

-- Only content managers and super admins can edit
CREATE POLICY "Content managers can edit content"
ON public.website_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_manager'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'content_manager'));

-- Create news_posts table
CREATE TABLE public.news_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Anyone can read published posts"
ON public.news_posts
FOR SELECT
USING (is_published = true);

-- Admins can manage all posts
CREATE POLICY "Admins can manage posts"
ON public.news_posts
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create email_templates table
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create sent_emails table for tracking
CREATE TABLE public.sent_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_type TEXT, -- 'applicant', 'enrolled_parent', 'custom'
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    application_id UUID REFERENCES public.enrollment_applications(id) ON DELETE SET NULL
);

ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sent emails"
ON public.sent_emails
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Create school_settings table
CREATE TABLE public.school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (for public info)
CREATE POLICY "Anyone can read settings"
ON public.school_settings
FOR SELECT
USING (true);

-- Only super admins can modify settings
CREATE POLICY "Super admins can manage settings"
ON public.school_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Add status update capability to enrollment_applications for admins
CREATE POLICY "Admins can update applications"
ON public.enrollment_applications
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, body) VALUES
('application_received', 'Application Received - Good Shepherd International School', 'Dear Parent/Guardian,\n\nThank you for submitting your application to Good Shepherd International School. We have received your application and it is currently under review.\n\nYour reference number is: {{reference_number}}\n\nWe will contact you within 5-7 working days regarding the status of your application.\n\nBest regards,\nGood Shepherd International School'),
('application_approved', 'Application Approved - Good Shepherd International School', 'Dear Parent/Guardian,\n\nCongratulations! We are pleased to inform you that the application for {{student_name}} has been approved.\n\nPlease visit our school office with the required documents to complete the enrollment process.\n\nWe look forward to welcoming your child to our school family.\n\nBest regards,\nGood Shepherd International School'),
('documents_requested', 'Additional Documents Required - Good Shepherd International School', 'Dear Parent/Guardian,\n\nThank you for your application to Good Shepherd International School.\n\nTo proceed with the review of your application, we require the following additional documents:\n\n{{documents_list}}\n\nPlease submit these documents at your earliest convenience.\n\nBest regards,\nGood Shepherd International School'),
('application_rejected', 'Application Status Update - Good Shepherd International School', 'Dear Parent/Guardian,\n\nThank you for your interest in Good Shepherd International School.\n\nAfter careful review of the application for {{student_name}}, we regret to inform you that we are unable to offer admission at this time.\n\n{{reason}}\n\nWe encourage you to reapply in the future.\n\nBest regards,\nGood Shepherd International School');

-- Insert default school settings
INSERT INTO public.school_settings (setting_key, setting_value) VALUES
('school_info', '{"name": "Good Shepherd International School", "address": "Mallam New Gbawe, Accra", "phone": "0208163186", "email": "info@goodshepherdschool.edu.gh", "motto": "In God We Trust"}'),
('admission_settings', '{"accept_creche": true, "accept_nursery": true, "accept_kindergarten": true, "accept_primary": true, "accept_jhs": true, "free_admission": true, "deadline": null}'),
('email_notifications', '{"on_application_received": true, "on_application_approved": true, "on_documents_missing": true, "weekly_summary": false}');

-- Add triggers for updated_at
CREATE TRIGGER update_website_content_updated_at
BEFORE UPDATE ON public.website_content
FOR EACH ROW
EXECUTE FUNCTION public.update_enrollment_updated_at();

CREATE TRIGGER update_news_posts_updated_at
BEFORE UPDATE ON public.news_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_enrollment_updated_at();

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_enrollment_updated_at();