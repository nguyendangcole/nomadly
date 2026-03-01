-- 1. Add description and image_url to locations table
ALTER TABLE public.locations
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create the Storage Bucket for Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-images', 'trip-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies for 'trip-images'

-- Allow public read access to the bucket
CREATE POLICY "Public Read trip-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'trip-images' );

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload trip-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'trip-images' );

-- Note: Run this in the Supabase SQL Editor.

-- 4. Create Trip Comments Table
CREATE TABLE IF NOT EXISTS public.trip_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.trip_comments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to comments
CREATE POLICY "Public Read trip-comments"
ON public.trip_comments FOR SELECT
USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Auth Insert trip-comments"
ON public.trip_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
