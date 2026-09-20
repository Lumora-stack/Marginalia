import { useEffect, useState } from 'react';
import { supabase, Artwork } from '../lib/supabase';
import { motion } from 'framer-motion';
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

  if (loading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-ink/5 dark:bg-white/5 rounded-xl animate-pulse" style={{ height: `${Math.random() * 200 + 200}px` }} />
        ))}
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="py-24 text-center opacity-60">
        <p className="text-xl font-serif mb-2">No artworks here yet.</p>
        {isOwner ? (
          <p>Use the upload button in the corner to add some pieces.</p>
        ) : (
          <p>Check back later!</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {artworks.map((artwork, i) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: (i % 6) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="break-inside-avoid mb-6 cursor-zoom-in group"
            onClick={() => setLightboxIndex(i)}
          >
            <div className="relative rounded-xl overflow-hidden bg-ink/5 dark:bg-white/5">
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white font-medium text-sm">{artwork.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
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
