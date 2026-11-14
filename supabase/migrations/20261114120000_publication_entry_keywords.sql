ALTER TABLE public.publication_entries
ADD COLUMN IF NOT EXISTS keywords text[] NOT NULL DEFAULT '{}';

NOTIFY pgrst, 'reload schema';
