CREATE TABLE IF NOT EXISTS public.publication_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('tech', 'food', 'travel', 'watched')),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 140),
  summary text,
  content text,
  category text,
  location text,
  map_url text,
  visited_on date,
  year integer CHECK (year IS NULL OR year BETWEEN 1888 AND 2100),
  rating numeric(2, 1) CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
  price_range text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  user_id uuid NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS publication_entries_kind_created_at_idx
ON public.publication_entries (kind, created_at DESC);

ALTER TABLE public.publication_entries ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.publication_entries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.publication_entries TO authenticated;

DROP POLICY IF EXISTS "Anyone can read publication entries" ON public.publication_entries;
DROP POLICY IF EXISTS "Curator can insert publication entries" ON public.publication_entries;
DROP POLICY IF EXISTS "Curator can update publication entries" ON public.publication_entries;
DROP POLICY IF EXISTS "Curator can delete publication entries" ON public.publication_entries;

CREATE POLICY "Anyone can read publication entries"
ON public.publication_entries FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Curator can insert publication entries"
ON public.publication_entries FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);

CREATE POLICY "Curator can update publication entries"
ON public.publication_entries FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
)
WITH CHECK (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);

CREATE POLICY "Curator can delete publication entries"
ON public.publication_entries FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);
