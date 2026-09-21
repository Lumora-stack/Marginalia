import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Artwork } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ImageOff, AlertCircle } from 'lucide-react';
import Lightbox from './Lightbox';

export default function Gallery({ sectionId }: { sectionId: string }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [isOwner, setIsOwner]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });

    const fetchArtworks = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from('artworks')
        .select('*')
        .eq('section', sectionId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (fetchErr) {
        console.error('Error fetching artworks:', fetchErr);
        setError('Failed to load gallery items.');
      } else if (data) {
        setArtworks(data as Artwork[]);
      }
      setLoading(false);
    };

    fetchArtworks();
  }, [sectionId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Permanently delete this artwork from the gallery?')) return;

    const target = artworks.find(a => a.id === id);

    // 1. Delete from Supabase Storage bucket
    if (target?.image_url) {
      try {
        const parts = target.image_url.split('/portfolio-images/');
        if (parts.length > 1) {
          const storagePath = decodeURIComponent(parts[1].split('?')[0]);
          await supabase.storage.from('portfolio-images').remove([storagePath]);
        }
      } catch (storageErr) {
        console.warn('Storage removal warning:', storageErr);
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
  if (artworks.length === 0) {
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
        <span>{artworks.length} {artworks.length === 1 ? 'PIECE' : 'PIECES'} DISPLAYED</span>
      </div>

      <div className="columns-2 lg:columns-3 gap-3 md:gap-5 space-y-3 md:space-y-5">
        <AnimatePresence>
          {artworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ duration: 0.55, delay: Math.min(i, 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="break-inside-avoid mb-3 md:mb-5 cursor-zoom-in group"
              onClick={() => setLightboxIndex(i)}
            >
              <div
                className="relative rounded-2xl overflow-hidden bg-ink/5 dark:bg-white/5 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:-translate-y-1 border border-ink/5 dark:border-white/5"
              >
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />

                {/* Hover overlay with title & details */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                  <p className="text-white font-serif text-sm md:text-base translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    {artwork.title}
                  </p>
                  {artwork.year && (
                    <p className="text-accent/80 font-mono text-[10px] tracking-widest mt-0.5">{artwork.year}</p>
                  )}
                  {artwork.description && (
                    <p className="text-white/60 text-xs line-clamp-2 mt-1 font-serif italic">
                      {artwork.description}
                    </p>
                  )}
                </div>

                {/* Delete button (Owner only: always visible on mobile, hover-only on desktop) */}
                {isOwner && (
                  <button
                    onClick={e => handleDelete(e, artwork.id)}
                    title="Delete Artwork"
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

      {lightboxIndex !== null && (
        <Lightbox
          artworks={artworks}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
