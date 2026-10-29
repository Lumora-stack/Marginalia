import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, ExternalLink, MapPin, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { CURATOR_EMAIL, type PublicationEntry, type PublicationKind } from '../lib/publication';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type EntryDraft = {
  title: string;
  summary: string;
  content: string;
  category: string;
  location: string;
  map_url: string;
  visited_on: string;
  year: string;
  rating: string;
  price_range: string;
  image_url: string;
};

const emptyDraft = (): EntryDraft => ({
  title: '',
  summary: '',
  content: '',
  category: '',
  location: '',
  map_url: '',
  visited_on: '',
  year: '',
  rating: '',
  price_range: '',
  image_url: '',
});

const categoryOptions: Record<PublicationKind, string[]> = {
  tech: ['DevSecOps', 'CI/CD', 'Cloud security', 'Tooling', 'Other'],
  food: ['Cafe', 'Restaurant', 'Street food', 'Other'],
  travel: ['City', 'Nature', 'Culture', 'Stay', 'Other'],
  watched: ['Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Animation', 'Other'],
};

function isSafeHttpsUrl(value: string) {
  if (!value.trim()) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export default function PublicationEntries({
  kind,
  searchText = '',
  categoryFilter = '',
}: {
  kind: PublicationKind;
  searchText?: string;
  categoryFilter?: string;
}) {
  const [entries, setEntries] = useState<PublicationEntry[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCurator, setIsCurator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EntryDraft>(emptyDraft);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return [];
    }

    const { data, error: queryError } = await supabase
      .from('publication_entries')
      .select('*')
      .eq('kind', kind)
      .order('created_at', { ascending: false });
    if (queryError) throw queryError;
    return (data as PublicationEntry[] | null) ?? [];
  }, [kind]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;
    const syncSession = (id: string | null, email: string | undefined) => {
      if (!active) return;
      setUserId(id);
      setIsCurator(email?.toLowerCase() === CURATOR_EMAIL);
    };

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) throw sessionError;
      syncSession(data.session?.user.id ?? null, data.session?.user.email);
    }).catch((sessionError: unknown) => {
      console.error('Could not check publication curator session:', sessionError);
      if (active) setError('Could not verify the curator session. Reload and try again.');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session?.user.id ?? null, session?.user.email);
    });

    void fetchEntries()
      .then(data => {
        if (active) setEntries(data);
      })
      .catch((loadError: unknown) => {
        console.error(`Could not load ${kind} entries:`, loadError);
        if (active) setError('We couldn’t load this collection. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchEntries, kind]);

  const visibleEntries = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return entries.filter(entry => {
      const matchesCategory = !categoryFilter || entry.category === categoryFilter;
      const matchesQuery = !query || [
        entry.title,
        entry.summary,
        entry.content,
        entry.category,
        entry.location,
      ].some(value => value?.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, entries, searchText]);

  const startEditing = (entry: PublicationEntry) => {
    setEditingId(entry.id);
    setDraft({
      title: entry.title,
      summary: entry.summary ?? '',
      content: entry.content ?? '',
      category: entry.category ?? '',
      location: entry.location ?? '',
      map_url: entry.map_url ?? '',
      visited_on: entry.visited_on ?? '',
      year: entry.year?.toString() ?? '',
      rating: entry.rating?.toString() ?? '',
      price_range: entry.price_range ?? '',
      image_url: entry.image_url ?? '',
    });
    setError('');
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setEditorOpen(false);
    setEditingId(null);
    setDraft(emptyDraft());
    setError('');
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !isCurator) {
      setError('Sign in with the configured curator account before publishing.');
      return;
    }
    if (!isSafeHttpsUrl(draft.image_url) || !isSafeHttpsUrl(draft.map_url)) {
      setError('Image and map links must use secure https:// URLs.');
      return;
    }

    setSaving(true);
    setError('');
    const payload = {
      kind,
      title: draft.title.trim(),
      summary: draft.summary.trim() || null,
      content: draft.content.trim() || null,
      category: draft.category || null,
      location: draft.location.trim() || null,
      map_url: draft.map_url.trim() || null,
      visited_on: draft.visited_on || null,
      year: draft.year ? Number(draft.year) : null,
      rating: draft.rating ? Number(draft.rating) : null,
      price_range: draft.price_range.trim() || null,
      image_url: draft.image_url.trim() || null,
      user_id: userId,
    };

    try {
      const result = editingId
        ? await supabase.from('publication_entries').update(payload).eq('id', editingId)
        : await supabase.from('publication_entries').insert(payload);
      if (result.error) throw result.error;
      setEditorOpen(false);
      setEditingId(null);
      setDraft(emptyDraft());
      try {
        setEntries(await fetchEntries());
      } catch (refreshError) {
        console.error(`Saved ${kind} entry but could not refresh the collection:`, refreshError);
        setError('Saved successfully, but the collection could not refresh. Reload the page to see it.');
      }
    } catch (saveError) {
      console.error(`Could not save ${kind} entry:`, saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not save this entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (entry: PublicationEntry) => {
    if (!window.confirm(`Delete “${entry.title}” from this collection?`)) return;
    setError('');
    try {
      const { error: deleteError } = await supabase
        .from('publication_entries')
        .delete()
        .eq('id', entry.id);
      if (deleteError) throw deleteError;
      setEntries(current => current.filter(item => item.id !== entry.id));
    } catch (deleteError) {
      console.error(`Could not delete ${kind} entry:`, deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this entry.');
    }
  };

  const updateDraft = (field: keyof EntryDraft, value: string) => {
    setDraft(current => ({ ...current, [field]: value }));
  };

  if (!isSupabaseConfigured) {
    return <p role="status" className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm opacity-70">Content publishing is not configured for this deployment.</p>;
  }

  return (
    <section aria-label={`${kind} entries`}>
      {isCurator && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => { setEditingId(null); setDraft(emptyDraft()); setError(''); setEditorOpen(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-medium text-white transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus size={15} /> Add {kind === 'tech' ? 'topic' : kind === 'watched' ? 'review' : 'place'}
          </button>
        </div>
      )}

      {error && <p role="alert" className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}

      {editorOpen && isCurator && (
        <form onSubmit={handleSave} className="mb-8 grid gap-4 rounded-3xl border border-accent/25 bg-ink/[0.025] p-5 dark:bg-white/[0.025] sm:grid-cols-2 sm:p-7">
          <div className="flex items-center justify-between sm:col-span-2">
            <h2 className="font-serif text-2xl">{editingId ? 'Edit entry' : `Add ${kind === 'tech' ? 'a topic' : kind === 'watched' ? 'a review' : 'a place'}`}</h2>
            <button type="button" onClick={closeEditor} disabled={saving} aria-label="Close editor" className="rounded-full p-2 opacity-60 hover:bg-ink/5 hover:opacity-100 dark:hover:bg-white/5"><X size={18} /></button>
          </div>

          <label className="grid gap-1.5 text-xs sm:col-span-2">
            Title
            <input required maxLength={140} value={draft.title} onChange={event => updateDraft('title', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
          </label>

          {kind !== 'tech' && (
            <label className="grid gap-1.5 text-xs">
              {kind === 'watched' ? 'Genre' : 'Type'}
              <select value={draft.category} onChange={event => updateDraft('category', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20">
                <option value="">Choose one</option>
                {categoryOptions[kind].map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          )}

          {kind === 'tech' && (
            <label className="grid gap-1.5 text-xs">
              Topic
              <select value={draft.category} onChange={event => updateDraft('category', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20">
                <option value="">Choose one</option>
                {categoryOptions.tech.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          )}

          {(kind === 'food' || kind === 'travel') && (
            <>
              <label className="grid gap-1.5 text-xs">
                {kind === 'food' ? 'Location / address' : 'Destination'}
                <input maxLength={240} value={draft.location} onChange={event => updateDraft('location', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
              </label>
              <label className="grid gap-1.5 text-xs">
                {kind === 'food' ? 'Google Maps link' : 'Maps / destination link'}
                <input type="url" value={draft.map_url} onChange={event => updateDraft('map_url', event.target.value)} placeholder="https://" className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
              </label>
              <label className="grid gap-1.5 text-xs">
                {kind === 'food' ? 'Visit date' : 'Travel date'}
                <input type="date" value={draft.visited_on} onChange={event => updateDraft('visited_on', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
              </label>
              {kind === 'food' && (
                <label className="grid gap-1.5 text-xs">
                  Price range
                  <input maxLength={50} value={draft.price_range} onChange={event => updateDraft('price_range', event.target.value)} placeholder="e.g. ₹₹" className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
                </label>
              )}
            </>
          )}

          {kind === 'watched' && (
            <>
              <label className="grid gap-1.5 text-xs">
                Year
                <input type="number" min="1888" max="2100" value={draft.year} onChange={event => updateDraft('year', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
              </label>
              <label className="grid gap-1.5 text-xs">
                Personal rating (0–5)
                <input type="number" min="0" max="5" step="0.5" value={draft.rating} onChange={event => updateDraft('rating', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
              </label>
            </>
          )}

          {(kind === 'food' || kind === 'travel') && (
            <label className="grid gap-1.5 text-xs">
              Personal rating (0–5)
              <input type="number" min="0" max="5" step="0.5" value={draft.rating} onChange={event => updateDraft('rating', event.target.value)} className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
            </label>
          )}

          <label className="grid gap-1.5 text-xs sm:col-span-2">
            Short description
            <textarea rows={2} maxLength={500} value={draft.summary} onChange={event => updateDraft('summary', event.target.value)} className="resize-y rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
          </label>

          <label className="grid gap-1.5 text-xs sm:col-span-2">
            {kind === 'watched' ? 'Spoiler-free review' : kind === 'tech' ? 'Notes / article' : 'Visit notes'}
            <textarea rows={5} maxLength={12000} value={draft.content} onChange={event => updateDraft('content', event.target.value)} className="resize-y rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm leading-relaxed outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
          </label>

          <label className="grid gap-1.5 text-xs sm:col-span-2">
            Cover image URL (optional)
            <input type="url" value={draft.image_url} onChange={event => updateDraft('image_url', event.target.value)} placeholder="https://" className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm outline-none focus:border-accent/60 dark:border-white/10 dark:bg-black/20" />
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="rounded-full bg-accent px-5 py-2.5 text-xs font-medium text-white hover:brightness-110 disabled:opacity-50">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish entry'}</button>
            <button type="button" onClick={closeEditor} disabled={saving} className="rounded-full border border-ink/15 px-5 py-2.5 text-xs opacity-70 hover:opacity-100 dark:border-white/15">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p role="status" className="py-10 text-center text-sm opacity-55">Loading collection…</p>
      ) : visibleEntries.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-ink/15 px-6 py-10 text-center text-sm opacity-55 dark:border-white/15">
          {entries.length === 0
            ? isCurator ? 'This collection is empty. Use the button above to publish the first entry.' : 'No entries here yet.'
            : 'No entries match this search or filter.'}
        </p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {visibleEntries.map(entry => (
            <article key={entry.id} className="overflow-hidden rounded-3xl border border-ink/10 bg-ink/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
              {entry.image_url && (
                <img src={entry.image_url} alt="" loading="lazy" decoding="async" className="aspect-[16/8] w-full object-cover" />
              )}
              <div className="p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-accent">
                  {entry.category && <span>{entry.category}</span>}
                  {entry.year && <span>{entry.year}</span>}
                  {entry.visited_on && <time dateTime={entry.visited_on}>{new Date(`${entry.visited_on}T00:00:00`).toLocaleDateString()}</time>}
                  {entry.rating !== null && <span className="inline-flex items-center gap-1"><Star size={11} /> {entry.rating}/5</span>}
                </div>
                <h2 className="font-serif text-2xl">{entry.title}</h2>
                {entry.location && <p className="mt-2 inline-flex items-center gap-1.5 text-xs opacity-60"><MapPin size={13} className="text-accent" />{entry.location}</p>}
                {entry.summary && <p className="mt-3 text-sm leading-relaxed opacity-70">{entry.summary}</p>}
                {entry.content && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed opacity-80">{entry.content}</p>}
                {entry.price_range && <p className="mt-3 text-xs opacity-55">Price: {entry.price_range}</p>}
                {entry.map_url && (
                  <a href={entry.map_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                    Open map <ExternalLink size={12} />
                  </a>
                )}
                {isCurator && entry.user_id === userId && (
                  <div className="mt-5 flex gap-2 border-t border-ink/10 pt-4 dark:border-white/10">
                    <button type="button" onClick={() => startEditing(entry)} className="inline-flex items-center gap-1.5 text-xs opacity-65 hover:text-accent hover:opacity-100"><Pencil size={13} /> Edit</button>
                    <button type="button" onClick={() => void removeEntry(entry)} className="ml-auto inline-flex items-center gap-1.5 text-xs opacity-65 hover:text-red-500 hover:opacity-100"><Trash2 size={13} /> Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {kind === 'tech' && entries.length > 0 && <p className="mt-5 flex items-center gap-2 text-xs opacity-45"><BookOpen size={13} className="text-accent" /> Notes are shown as published by the curator.</p>}
    </section>
  );
}
