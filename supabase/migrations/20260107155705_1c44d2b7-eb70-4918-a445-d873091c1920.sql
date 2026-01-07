-- Add visibility column to portal_announcements for public vs internal
ALTER TABLE public.portal_announcements
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'internal';

-- Add constraint for valid values
ALTER TABLE public.portal_announcements
ADD CONSTRAINT portal_announcements_visibility_check 
CHECK (visibility IN ('public', 'internal'));

-- Create index for visibility queries
CREATE INDEX IF NOT EXISTS idx_portal_announcements_visibility 
ON public.portal_announcements(visibility, is_published);

-- Update RLS policy to allow public to view public announcements
CREATE POLICY "Anyone can view public announcements" 
ON public.portal_announcements 
FOR SELECT 
USING (visibility = 'public' AND is_published = true);