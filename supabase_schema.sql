-- Create the artworks table
CREATE TABLE public.artworks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    year TEXT,
    medium TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Policies for artworks table
-- Anyone can read artworks
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.artworks FOR SELECT 
USING ( true );

-- Only authenticated owner can insert
CREATE POLICY "Users can insert their own artworks." 
ON public.artworks FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- Only authenticated owner can update
CREATE POLICY "Users can update their own artworks." 
ON public.artworks FOR UPDATE 
USING ( auth.uid() = user_id );

-- Only authenticated owner can delete
CREATE POLICY "Users can delete their own artworks." 
ON public.artworks FOR DELETE 
USING ( auth.uid() = user_id );

-- Create storage bucket for portfolio-images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true);

-- Policies for storage bucket
-- Anyone can read images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'portfolio-images' );

-- Only authenticated owner can upload
CREATE POLICY "Owner Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'portfolio-images' AND auth.uid() = owner );

-- Only authenticated owner can update
CREATE POLICY "Owner Update Access" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'portfolio-images' AND auth.uid() = owner );

-- Only authenticated owner can delete
CREATE POLICY "Owner Delete Access" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'portfolio-images' AND auth.uid() = owner );
