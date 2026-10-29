CREATE TABLE IF NOT EXISTS public.artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  thumbnail_url text NOT NULL,
  year text,
  medium text,
  width integer,
  height integer,
  link_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.artworks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.artworks TO authenticated;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.artworks;
DROP POLICY IF EXISTS "Users can insert their own artworks." ON public.artworks;
DROP POLICY IF EXISTS "Users can update their own artworks." ON public.artworks;
DROP POLICY IF EXISTS "Users can delete their own artworks." ON public.artworks;
DROP POLICY IF EXISTS "Curator can read artworks" ON public.artworks;
DROP POLICY IF EXISTS "Curator can insert artworks" ON public.artworks;
DROP POLICY IF EXISTS "Curator can update artworks" ON public.artworks;
DROP POLICY IF EXISTS "Curator can delete artworks" ON public.artworks;

CREATE POLICY "Curator can read artworks"
ON public.artworks FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Curator can insert artworks"
ON public.artworks FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);

CREATE POLICY "Curator can update artworks"
ON public.artworks FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
)
WITH CHECK (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);

CREATE POLICY "Curator can delete artworks"
ON public.artworks FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Curator can read portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Curator can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Curator can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Curator can delete portfolio images" ON storage.objects;

CREATE POLICY "Curator can read portfolio images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'portfolio-images');

CREATE POLICY "Curator can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Curator can update portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Curator can delete portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images'
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
