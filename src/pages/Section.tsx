import { useParams } from 'react-router-dom';
import Gallery from '../components/Gallery';
import { motion } from 'framer-motion';

export default function Section() {
  const { id } = useParams();

  if (!id) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-4 mb-12">
        <div className="w-8 h-px bg-accent/50" />
        <h1 className="text-4xl md:text-5xl capitalize font-serif tracking-tight">
          {id.replace('-', ' ')}
        </h1>
      </div>
      
      <Gallery sectionId={id} />
    </motion.div>
  );
}
