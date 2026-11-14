CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY CHECK (id = 'section-visibility'),
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_by uuid REFERENCES auth.users(id)
);

INSERT INTO public.site_settings (id, value)
VALUES (
  'section-visibility',
  '{
    "creative": true,
    "tech": true,
    "food": true,
    "travel": true,
    "watched": true,
    "settings": true,
    "pencil-arts": true,
    "pixel-arts": true,
    "sketches": true,
    "doodles": true,
    "diy-crafts": true,
    "games": true
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;

DROP POLICY IF EXISTS "Anyone can read section visibility" ON public.site_settings;
DROP POLICY IF EXISTS "Curator can update section visibility" ON public.site_settings;

CREATE POLICY "Anyone can read section visibility"
ON public.site_settings FOR SELECT
TO anon, authenticated
USING (id = 'section-visibility');

CREATE POLICY "Curator can update section visibility"
ON public.site_settings FOR UPDATE
TO authenticated
USING (
  id = 'section-visibility'
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
)
WITH CHECK (
  id = 'section-visibility'
  AND lower(auth.jwt() ->> 'email') = lower('gpraveenkumar2005@gmail.com')
);

NOTIFY pgrst, 'reload schema';
