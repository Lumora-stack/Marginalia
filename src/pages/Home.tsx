import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

// Lazy load the 3D scene so it doesn't block first paint
const HeroScene = lazy(() => import('../components/HeroScene'));
const Canvas = lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));

const sections = [
  { 
    id: 'pencil-arts', 
    label: 'Pencil Arts', 
    desc: 'The timeless beauty of graphite and shadow.',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000&auto=format&fit=crop',
    class: 'md:col-span-2 md:row-span-2' 
  },
  { 
    id: 'pixel-arts', 
    label: 'Pixel Arts', 
    desc: 'Retro aesthetics meeting modern imagination.',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    class: 'md:col-span-1 md:row-span-1' 
  },
  { 
    id: 'sketches', 
    label: 'Sketches', 
    desc: 'Raw ideas and spontaneous strokes.',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
    class: 'md:col-span-1 md:row-span-2' 
  },
  { 
    id: 'doodles', 
    label: 'Doodles', 
    desc: 'Wandering minds on paper.',
    img: 'https://images.unsplash.com/photo-1580828236166-512140fa960e?q=80&w=1000&auto=format&fit=crop',
    class: 'md:col-span-1 md:row-span-1' 
  },
  { 
    id: 'diy-crafts', 
    label: 'DIY Crafts', 
    desc: 'Handmade creations from the heart.',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
    class: 'md:col-span-2 md:row-span-1' 
  },
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
        
        {/* Animated Background Orbs - subtle ambient glow */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-accent/8 rounded-full filter blur-[100px] animate-blob z-0 transform-gpu will-change-transform" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent/10 rounded-full filter blur-[100px] animate-blob z-0 transform-gpu will-change-transform" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/6 rounded-full filter blur-[120px] animate-blob z-0 transform-gpu will-change-transform" style={{ animationDelay: '4s' }} />

        {mounted && !shouldReduceMotion && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 [grid-template-rows:repeat(3,280px)] grid-rows-none">
          {sections.map((section) => (
            <Link 
              key={section.id} 
              to={`/section/${section.id}`}
              className={`group relative overflow-hidden rounded-2xl bg-ink ${section.class} block h-[280px] md:h-auto`}
            >
              <img 
                src={section.img} 
                alt={section.label}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <h2 className="text-2xl md:text-3xl font-serif mb-2 text-white group-hover:text-accent transition-colors duration-300">
                  {section.label}
                </h2>
                <p className="text-white/70 font-sans text-sm md:text-base opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  {section.desc}
                </p>
                <div className="h-0.5 w-0 bg-accent group-hover:w-12 mt-4 transition-all duration-500 ease-out" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
