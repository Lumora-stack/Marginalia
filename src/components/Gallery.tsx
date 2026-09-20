import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Artwork } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import Lightbox from './Lightbox';

export default function Gallery({ sectionId }: { sectionId: string }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwner(!!session?.user);
    });

    const fetchArtworks = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('section', sectionId)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (data) setArtworks(data as Artwork[]);
      setLoading(false);
    };

    fetchArtworks();
  }, [sectionId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this artwork?")) return;
    
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (!error) {
      setArtworks(prev => prev.filter(a => a.id !== id));
    } else {
      alert("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="columns-2 lg:columns-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-ink/5 dark:bg-white/5 rounded-xl animate-pulse" style={{ height: `${Math.random() * 200 + 150}px` }} />
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-24 text-center opacity-60"
      >
        <p className="text-xl font-serif mb-2">No artworks here yet.</p>
        {isOwner ? (
          <p>Use the upload button in the corner to add some pieces.</p>
        ) : (
          <p>Check back later!</p>
        )}
      </motion.div>
    );
  }

  return (
    <>
      <div className="columns-2 lg:columns-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
        <AnimatePresence>
          {artworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              transition={{ duration: 0.6, delay: Math.min(i, 6) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="break-inside-avoid mb-3 md:mb-6 cursor-zoom-in group"
              onClick={() => setLightboxIndex(i)}
            >
              <div className="relative rounded-xl overflow-hidden bg-ink/5 dark:bg-white/5 shadow-sm hover:shadow-xl transition-shadow duration-500">
                <img 
                  src={artwork.image_url} 
                  alt={artwork.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium text-sm md:text-base">{artwork.title}</p>
                </div>
                
                {isOwner && (
                  <button 
                    onClick={(e) => handleDelete(e, artwork.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full md:opacity-0 md:group-hover:opacity-100 opacity-100 hover:bg-red-600 transition-all z-20"
                  >
                    <Trash2 size={16} />
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
