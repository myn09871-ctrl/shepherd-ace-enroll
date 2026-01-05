-- Add portal account fields to enrollment_applications
ALTER TABLE public.enrollment_applications
ADD COLUMN IF NOT EXISTS portal_email text,
ADD COLUMN IF NOT EXISTS portal_password_hash text,
ADD COLUMN IF NOT EXISTS security_question text,
ADD COLUMN IF NOT EXISTS security_answer text;

-- Create index for portal email lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_applications_portal_email 
ON public.enrollment_applications(portal_email);

-- Add notification preferences to parent_accounts
ALTER TABLE public.parent_accounts
ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_sms boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_grades boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_attendance boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_announcements boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_fees boolean DEFAULT true;