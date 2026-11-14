import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';

export const SECTION_VISIBILITY_ITEMS = [
  { id: 'creative', label: 'Creative Journey', group: 'main' },
  { id: 'tech', label: 'Tech', group: 'main' },
  { id: 'food', label: 'Food & Cafes', group: 'main' },
  { id: 'travel', label: 'Travel', group: 'main' },
  { id: 'watched', label: 'Watched', group: 'main' },
  { id: 'settings', label: 'Settings & About', group: 'main' },
  { id: 'pencil-arts', label: 'Pencil Arts', group: 'creative' },
  { id: 'pixel-arts', label: 'Pixel Arts', group: 'creative' },
  { id: 'sketches', label: 'Sketches', group: 'creative' },
  { id: 'doodles', label: 'Doodles', group: 'creative' },
  { id: 'diy-crafts', label: 'DIY Crafts', group: 'creative' },
  { id: 'games', label: 'Games', group: 'creative' },
] as const;

export type SectionVisibilityKey = typeof SECTION_VISIBILITY_ITEMS[number]['id'];
export type SectionVisibility = Record<SectionVisibilityKey, boolean>;

const DEFAULT_VISIBILITY: SectionVisibility = {
  creative: true,
  tech: true,
  food: true,
  travel: true,
  watched: true,
  settings: true,
  'pencil-arts': true,
  'pixel-arts': true,
  sketches: true,
  doodles: true,
  'diy-crafts': true,
  games: true,
};

type VisibilityContextValue = {
  visibility: SectionVisibility;
  loading: boolean;
  saving: boolean;
  error: string;
  isVisible: (key: SectionVisibilityKey) => boolean;
  setVisible: (key: SectionVisibilityKey, visible: boolean) => Promise<void>;
};

const SectionVisibilityContext = createContext<VisibilityContextValue | null>(null);

function isVisibilityKey(value: string): value is SectionVisibilityKey {
  return SECTION_VISIBILITY_ITEMS.some(item => item.id === value);
}

function normalizeVisibility(value: unknown): SectionVisibility {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_VISIBILITY;
  const normalized = { ...DEFAULT_VISIBILITY };
  for (const [key, enabled] of Object.entries(value)) {
    if (isVisibilityKey(key) && typeof enabled === 'boolean') normalized[key] = enabled;
  }
  return normalized;
}

export function isSectionVisible(visibility: SectionVisibility, key: SectionVisibilityKey) {
  if (key === 'creative') {
    return visibility.creative && SECTION_VISIBILITY_ITEMS.some(item =>
      item.group === 'creative' && visibility[item.id],
    );
  }
  if (key === 'pencil-arts' || key === 'pixel-arts' || key === 'sketches'
    || key === 'doodles' || key === 'diy-crafts' || key === 'games') {
    return visibility.creative && visibility[key];
  }
  return visibility[key];
}

export function isCreativeCategoryVisible(visibility: SectionVisibility, categoryId: string) {
  return isVisibilityKey(categoryId)
    && categoryId !== 'creative'
    && categoryId !== 'tech'
    && categoryId !== 'food'
    && categoryId !== 'travel'
    && categoryId !== 'watched'
    && categoryId !== 'settings'
    && isSectionVisible(visibility, categoryId);
}

export function SectionVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(isSupabaseConfigured ? '' : 'Section controls require Supabase configuration.');

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    void (async () => {
      try {
        const { data, error: loadError } = await supabase
          .from('site_settings')
          .select('value')
          .eq('id', 'section-visibility')
          .maybeSingle();
        if (!active) return;
        if (loadError) throw loadError;
        if (!data) {
          setError('Apply the section visibility migration in Supabase to enable these controls.');
          return;
        }
        setVisibility(normalizeVisibility(data.value));
        setError('');
      } catch (loadError: unknown) {
        console.error('Could not load section visibility settings:', loadError);
        if (active) setError('Could not load section visibility settings. Check the Supabase migration and reload.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  const setVisible = useCallback(async (key: SectionVisibilityKey, visible: boolean) => {
    setSaving(true);
    setError('');
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) throw new Error('Sign in again to change section visibility.');

      const next = { ...visibility, [key]: visible };
      const { data, error: updateError } = await supabase
        .from('site_settings')
        .update({ value: next, updated_by: session.user.id })
        .eq('id', 'section-visibility')
        .select('value')
        .single();
      if (updateError) throw updateError;
      setVisibility(normalizeVisibility(data.value));
    } catch (updateError) {
      console.error('Could not save section visibility settings:', updateError);
      setError(updateError instanceof Error ? updateError.message : 'Could not save this section setting.');
    } finally {
      setSaving(false);
    }
  }, [visibility]);

  const value = useMemo<VisibilityContextValue>(() => ({
    visibility,
    loading,
    saving,
    error,
    isVisible: key => isSectionVisible(visibility, key),
    setVisible,
  }), [error, loading, saving, setVisible, visibility]);

  return <SectionVisibilityContext.Provider value={value}>{children}</SectionVisibilityContext.Provider>;
}

export function useSectionVisibility() {
  const context = useContext(SectionVisibilityContext);
  if (!context) throw new Error('useSectionVisibility must be used within SectionVisibilityProvider.');
  return context;
}
