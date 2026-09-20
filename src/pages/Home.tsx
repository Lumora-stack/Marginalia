import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

// Lazy load the 3D scene so it doesn't block first paint
const HeroScene = lazy(() => import('../components/HeroScene'));
const Canvas = lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));

const sections = [
  { id: 'pencil-arts', label: 'Pencil Arts', class: 'md:col-span-2 md:row-span-2' },
  { id: 'pixel-arts', label: 'Pixel Arts', class: 'md:col-span-1 md:row-span-1' },
  { id: 'sketches', label: 'Sketches', class: 'md:col-span-1 md:row-span-2' },
  { id: 'doodles', label: 'Doodles', class: 'md:col-span-1 md:row-span-1' },
  { id: 'diy-crafts', label: 'DIY Crafts', class: 'md:col-span-2 md:row-span-1' },
];

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-12 md:gap-24">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:h-[80vh] flex items-center justify-center -mt-12 overflow-hidden py-24 md:py-0">
        {mounted && !shouldReduceMotion && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <HeroScene />
              </Canvas>
            </Suspense>
          </div>
        )}
        
        <div className="z-10 text-center relative pointer-events-none px-4">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-6 tracking-tight"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Artville Gallery of Imagination
          </motion.h1>
          <motion.p 
            className="text-base md:text-xl font-serif italic text-accent max-w-2xl mx-auto leading-relaxed"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            "Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍"
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="pb-12 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6 auto-rows-[250px]">
          {sections.map((section) => (
            <Link 
              key={section.id} 
              to={`/section/${section.id}`}
              className={`group relative overflow-hidden rounded-xl bg-ink/5 dark:bg-white/5 ${section.class} block`}
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              {/* Fallback pattern until we wire up Supabase cover images */}
              <div className="absolute inset-0 opacity-20 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent to-transparent group-hover:scale-110 transition-transform duration-700 ease-out" />
              
              <div className="absolute bottom-6 left-6 z-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-1 group-hover:text-accent transition-colors duration-300">
                  {section.label}
                </h2>
                <div className="h-0.5 w-0 bg-accent group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
