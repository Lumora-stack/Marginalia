import { useParams } from 'react-router-dom';
import Gallery from '../components/Gallery';
import { motion } from 'framer-motion';

const sectionMeta: Record<string, { label: string; desc: string; num: string }> = {
  'pencil-arts': { label: 'Pencil Arts', desc: 'The timeless beauty of graphite and shadow.', num: '01' },
  'pixel-arts':  { label: 'Pixel Arts',  desc: 'Retro aesthetics meeting modern imagination.', num: '02' },
  'sketches':    { label: 'Sketches',    desc: 'Raw ideas and spontaneous strokes.', num: '03' },
  'doodles':     { label: 'Doodles',     desc: 'Wandering minds on paper.', num: '04' },
  'diy-crafts':  { label: 'DIY Crafts',  desc: 'Handmade creations from the heart.', num: '05' },
};

export default function Section() {
  const { id } = useParams();
  if (!id) return null;

  const meta = sectionMeta[id] ?? { label: id.replace('-', ' '), desc: '', num: '—' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Section header */}
      <div className="mb-12 md:mb-16">
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent/70 mb-4">
          Collection {meta.num}
        </p>
        <div className="flex items-end gap-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif capitalize leading-none">
            {meta.label}
          </h1>
          <div className="hidden md:block mb-2 w-16 h-px bg-accent/40" />
        </div>
        {meta.desc && (
          <p className="mt-4 text-base opacity-50 font-serif italic max-w-md">{meta.desc}</p>
        )}
        <div className="mt-6 w-12 h-px bg-accent" />
      </div>

      <Gallery sectionId={id} />
    </motion.div>
  );
}
