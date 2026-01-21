-- ==========================================
-- PHASE 2: Gallery System Tables & Storage
-- ==========================================

-- Create gallery_images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('graduation', 'sports', 'administration', 'events', 'academics')),
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gallery_images
CREATE POLICY "Admins can manage gallery images"
  ON public.gallery_images
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active gallery images"
  ON public.gallery_images
  FOR SELECT
  USING (is_active = true);

-- ==========================================
-- PHASE 10: Admin Profiles Table
-- ==========================================

CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view all profiles"
  ON public.admin_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update own profile"
  ON public.admin_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert own profile"
  ON public.admin_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_admin(auth.uid()));

-- ==========================================
-- PHASE 11: Push Subscriptions Table
-- ==========================================

CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================

-- Create gallery-images bucket (public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create admin-avatars bucket (public for display)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-avatars', 'admin-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create student-photos bucket (public for display)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STORAGE POLICIES
-- ==========================================

-- Gallery images - admins can manage, public can view
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');

CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images' AND is_admin(auth.uid()));

-- Admin avatars - admins can manage own
CREATE POLICY "Anyone can view admin avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'admin-avatars');

CREATE POLICY "Admins can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'admin-avatars' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'admin-avatars' AND is_admin(auth.uid()));

-- Student photos - parents and admins can manage
CREATE POLICY "Anyone can view student photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-photos');

CREATE POLICY "Parents can upload student photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'student-photos' AND 
    (is_admin(auth.uid()) OR EXISTS (
      SELECT 1 FROM parent_accounts WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can delete student photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'student-photos' AND is_admin(auth.uid()));

-- ==========================================
-- ENABLE REALTIME FOR MESSAGING
-- ==========================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.parent_messages;