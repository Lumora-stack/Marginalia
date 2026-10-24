import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isMockGalleryEnabled, isSupabaseConfigured, type Artwork } from '../lib/supabase';
import { getMockArtworks } from '../lib/mock-artworks';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ImageOff, AlertCircle, LayoutGrid, GalleryHorizontal, Box, ChevronLeft, ChevronRight } from 'lucide-react';
import Lightbox from './Lightbox';

const GalleryWall = lazy(() => import('./three/GalleryWall'));
type GalleryView = 'masonry' | 'wall' | 'carousel';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const isRecent = (dateStr?: string) => {
  if (!dateStr) return false;
  try {
    const diffDays = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  } catch {
    return false;
  }
};

export default function Gallery({ sectionId }: { sectionId: string }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadedSection, setLoadedSection] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<{ section: string; message: string } | null>(null);
  const [isOwner, setIsOwner]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [view, setView] = useState<GalleryView>('masonry');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const mockArtworks = useMemo(() => getMockArtworks(sectionId), [sectionId]);
  const galleryArtworks = isMockGalleryEnabled ? mockArtworks : artworks;
  const loading = !isMockGalleryEnabled && isSupabaseConfigured && loadedSection !== sectionId;
  const error = isMockGalleryEnabled
    ? null
    : !isSupabaseConfigured
      ? 'Gallery is unavailable until Supabase is configured. Add your project URL and anon key to the environment.'
      : loadError?.section === sectionId ? loadError.message : null;
  const sortedArtworks = useMemo(
    () => [...galleryArtworks].sort((a, b) => {
      const direction = sortOrder === 'newest' ? -1 : 1;
      return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }),
    [galleryArtworks, sortOrder],
  );
  const visibleCarouselIndex = Math.min(carouselIndex, sortedArtworks.length - 1);

  useEffect(() => {
    let active = true;
    if (isMockGalleryEnabled) {
      return () => { active = false; };
    }
    if (!isSupabaseConfigured) {
      return () => { active = false; };
    }
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setIsOwner(!!session?.user);
    }).catch((authError: unknown) => {
      console.error('Error checking gallery curator session:', authError);
    });

    const fetchArtworks = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('artworks')
          .select('*')
          .eq('section', sectionId)
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;
        if (active) setArtworks((data as Artwork[] | null) ?? []);
      } catch (fetchErr) {
        console.error('Error fetching artworks:', fetchErr);
        if (active) setLoadError({ section: sectionId, message: 'We couldn’t load this gallery. Please try again in a moment.' });
      } finally {
        if (active) {
          setLoadedSection(sectionId);
          window.dispatchEvent(new Event('artville:layoutchange'));
        }
      }
    };

    void fetchArtworks();
    return () => { active = false; };
  }, [sectionId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isSupabaseConfigured || isMockGalleryEnabled) return;
    if (!window.confirm('Permanently delete this artwork from the gallery?')) return;

    const target = galleryArtworks.find(a => a.id === id);

    // Remove both original and thumbnail objects before deleting the record.
    if (target?.image_url || target?.thumbnail_url) {
      try {
        const storagePaths = [target.image_url, target.thumbnail_url]
          .filter((url): url is string => Boolean(url))
          .map(url => url.split('/portfolio-images/')[1])
          .filter((path): path is string => Boolean(path))
          .map(path => decodeURIComponent(path.split('?')[0]));
        const uniquePaths = [...new Set(storagePaths)];
        if (uniquePaths.length > 0) {
          const { error: storageError } = await supabase.storage.from('portfolio-images').remove(uniquePaths);
          if (storageError) throw storageError;
        }
      } catch (storageErr) {
        console.error('Storage removal failed:', storageErr);
        alert('Could not remove the stored artwork files. The gallery item was not deleted.');
        return;
      }
    }

    // 2. Delete database record
    const { error: dbError } = await supabase.from('artworks').delete().eq('id', id);
    if (!dbError) {
      setArtworks(prev => prev.filter(a => a.id !== id));
    } else {
      alert('Failed to delete artwork: ' + dbError.message);
    }
  };

  // Skeleton loading
  if (loading) {
    return (
      <div className="columns-2 lg:columns-3 gap-3 md:gap-5 space-y-3 md:space-y-5">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="break-inside-avoid mb-3 md:mb-5 rounded-2xl bg-ink/5 dark:bg-white/5 shimmer-bg animate-pulse"
            style={{ height: `${200 + (i % 3) * 90}px` }}
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-24 text-center space-y-4">
        <AlertCircle size={32} className="mx-auto text-red-400 opacity-80" />
        <p className="font-serif text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-mono tracking-widest text-accent uppercase hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (galleryArtworks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-28 flex flex-col items-center justify-center text-center gap-6"
      >
        <div className="w-20 h-20 rounded-full bg-ink/5 dark:bg-white/5 flex items-center justify-center border border-ink/10 dark:border-white/10">
          <ImageOff size={28} className="opacity-30" />
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-serif">Curating New Works</p>
          {isOwner ? (
            <p className="text-xs font-mono opacity-60 max-w-xs mx-auto">
              Tap the golden ✦ upload button at the bottom-right to add artworks to this room.
            </p>
          ) : (
            <p className="text-xs font-mono opacity-50">
              This gallery exhibition is currently being curated. Check back soon.
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Artwork counter info */}
      <div className="flex items-center justify-between mb-6 text-xs font-mono opacity-50">
        <span>EXHIBIT VIEW</span>
        <span>{sortedArtworks.length} {sortedArtworks.length === 1 ? 'PIECE' : 'PIECES'} DISPLAYED</span>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Gallery view">
          {([
            ['masonry', LayoutGrid, 'Masonry'],
            ['wall', Box, 'Gallery wall'],
            ['carousel', GalleryHorizontal, 'Carousel'],
          ] as const).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                view === mode
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-ink/10 dark:border-white/10 opacity-60 hover:opacity-100'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
          <span className="opacity-45">Sort</span>
          {(['newest', 'oldest'] as const).map(order => (
            <button
              key={order}
              type="button"
              aria-pressed={sortOrder === order}
              onClick={() => setSortOrder(order)}
              className={`rounded-full px-3 py-2 transition-colors ${
                sortOrder === order ? 'bg-ink/10 dark:bg-white/10 text-accent' : 'opacity-55 hover:opacity-100'
              }`}
            >
              {order}
            </button>
          ))}
        </div>
      </div>

      {view === 'wall' ? (
        <Suspense fallback={<div className="h-[32rem] rounded-3xl bg-ink/5 dark:bg-white/5 shimmer-bg animate-pulse" />}>
          <GalleryWall artworks={sortedArtworks} onSelect={setLightboxIndex} />
        </Suspense>
      ) : view === 'carousel' ? (
        <div className="relative overflow-hidden rounded-3xl border border-ink/10 dark:border-white/10 bg-ink/5 dark:bg-white/5 p-4 sm:p-8">
          <div className="flex min-h-[24rem] items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.button
                key={sortedArtworks[visibleCarouselIndex]?.id}
                type="button"
                initial={{ opacity: 0, x: 30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.98 }}
                onClick={() => setLightboxIndex(visibleCarouselIndex)}
                className="group max-w-full text-center"
              >
                <img
                  src={sortedArtworks[visibleCarouselIndex]?.thumbnail_url || sortedArtworks[visibleCarouselIndex]?.image_url}
                  alt={sortedArtworks[visibleCarouselIndex]?.title || ''}
                  width={sortedArtworks[visibleCarouselIndex]?.width ?? 1200}
                  height={sortedArtworks[visibleCarouselIndex]?.height ?? 900}
                  loading="lazy"
                  className="viewport-max-60 mx-auto max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl transition-transform group-hover:scale-[1.01]"
                />
                <span className="mt-4 block font-serif text-lg">{sortedArtworks[visibleCarouselIndex]?.title}</span>
              </motion.button>
            </AnimatePresence>
          </div>
          <button
            type="button"
            aria-label="Previous artwork"
            onClick={() => setCarouselIndex(index => (index - 1 + sortedArtworks.length) % sortedArtworks.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-ink/10 dark:border-white/15 bg-paper/80 dark:bg-black/60 p-3 text-accent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next artwork"
            onClick={() => setCarouselIndex(index => (index + 1) % sortedArtworks.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-ink/10 dark:border-white/15 bg-paper/80 dark:bg-black/60 p-3 text-accent"
          >
            <ChevronRight size={18} />
          </button>
          <p className="mt-3 text-center text-[10px] font-mono opacity-50">
            {visibleCarouselIndex + 1} / {sortedArtworks.length}
          </p>
        </div>
      ) : (
      <div className="columns-2 lg:columns-3 gap-3 md:gap-5 space-y-3 md:space-y-5">
        <AnimatePresence>
          {sortedArtworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05, ease: 'easeOut' }}
              className="break-inside-avoid mb-3 md:mb-5 cursor-zoom-in group transform-gpu"
              onClick={() => setLightboxIndex(i)}
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-ink/5 dark:bg-white/5 transition-all duration-300 md:group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:group-hover:-translate-y-1 border border-ink/5 dark:border-white/5"
              >
                {/* NEW badge for recent uploads (last 7 days) */}
                {isRecent(artwork.created_at) && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-accent text-white font-mono text-[9px] font-bold tracking-widest uppercase shadow-lg z-10">
                    NEW
                  </span>
                )}

                <motion.img
                  layoutId={`artwork-${artwork.id}`}
                  src={artwork.thumbnail_url || artwork.image_url}
                  alt={artwork.title}
                  width={artwork.width ?? 1200}
                  height={artwork.height ?? 900}
                  className="artwork-image w-full h-auto object-cover"
                  loading="lazy"
                />

                {/* Hover overlay with title & details */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white font-serif text-sm md:text-base translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    {artwork.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    {artwork.created_at && (
                      <span className="text-white/70 font-mono text-[10px] tracking-wider">
                        {formatDate(artwork.created_at)}
                      </span>
                    )}
                    {artwork.year && artwork.created_at && (
                      <span className="text-accent text-[10px]">•</span>
                    )}
                    {artwork.year && (
                      <span className="text-accent font-mono text-[10px] tracking-widest uppercase">
                        {artwork.year}
                      </span>
                    )}
                  </div>

                  {artwork.description && (
                    <p className="text-white/60 text-xs line-clamp-2 mt-1.5 font-serif italic">
                      {artwork.description}
                    </p>
                  )}
                </div>

                {/* Delete button (Owner only: always visible on mobile, hover-only on desktop) */}
                {isOwner && (
                  <button
                    onClick={e => handleDelete(e, artwork.id)}
                    title="Delete Artwork"
                    aria-label={`Delete ${artwork.title}`}
                    className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 transition-all z-20 shadow-lg cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          artworks={sortedArtworks}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
