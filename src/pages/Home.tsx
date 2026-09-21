import { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';

const HeroScene = lazy(() => import('../components/HeroScene'));
const Canvas = lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));

// Spans for a mathematically perfect 3x3 Bento grid without collisions:
// Row 1: [Pencil,  Pencil,  Pixel]
// Row 2: [Pencil,  Pencil,  Sketches]
// Row 3: [Doodles, DIY,     DIY]
const categorySpans: Record<string, string> = {
  'pencil-arts': 'md:col-span-2 md:row-span-2',
  'pixel-arts':  'md:col-span-1 md:row-span-1',
  'sketches':    'md:col-span-1 md:row-span-1',
  'doodles':     'md:col-span-1 md:row-span-1',
  'diy-crafts':  'md:col-span-2 md:row-span-1',
};

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [3.5, -3.5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3.5, 3.5]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHeroMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (shouldReduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [shouldReduceMotion, mouseX, mouseY]
  );

  const handleHeroMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const handleTilt = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (shouldReduceMotion) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const rx = (((e.clientY - rect.top) / rect.height) - 0.5) * -10;
    const ry = (((e.clientX - rect.left) / rect.width) - 0.5) * 10;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`;
  };

  const resetTilt = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  };

  return (
    <div className="flex flex-col gap-0 pb-16">

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center -mx-6 overflow-hidden select-none"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Soft atmospheric ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent/6 rounded-full filter blur-[120px] animate-blob transform-gpu pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full filter blur-[110px] animate-blob transform-gpu pointer-events-none" style={{ animationDelay: '3s' }} />

        {/* 3D Canvas */}
        {mounted && !shouldReduceMotion && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, 0, 5], fov: 58 }}>
                <HeroScene />
              </Canvas>
            </Suspense>
          </div>
        )}

        {/* Hero Content */}
        <motion.div
          style={shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' as const }}
          className="z-10 text-center relative px-6 max-w-5xl mx-auto"
        >
          {/* Subtle Tag */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md mb-8"
          >
            <Sparkles size={12} className="text-accent" />
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-accent font-semibold">
              Digital Art Archive & Museum
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-serif leading-none tracking-tighter mb-4"
          >
            Artville
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic text-accent leading-none tracking-tight mb-8"
          >
            Gallery of Imagination
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="text-sm md:text-base font-serif italic opacity-70 max-w-lg mx-auto leading-relaxed"
          >
            "Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/section/pencil-arts"
              className="px-8 py-3.5 rounded-full bg-accent text-white font-sans text-xs font-semibold tracking-widest uppercase hover:bg-accent-light transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] pointer-events-auto inline-flex items-center gap-2 group"
            >
              <span>Explore Exhibition</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-8 py-3.5 rounded-full border border-ink/20 dark:border-white/20 font-sans text-xs font-semibold tracking-widest uppercase hover:border-accent hover:text-accent transition-all duration-300 pointer-events-auto"
            >
              About the Artist
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
          }}
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase">Enter Gallery</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── EXHIBITION STATS & MANIFESTO ─── */}
      <div className="py-12 border-y border-ink/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center my-12 font-mono text-xs">
        <div>
          <p className="text-2xl font-serif text-accent mb-1">05</p>
          <p className="opacity-50 uppercase tracking-widest text-[10px]">Curated Rooms</p>
        </div>
        <div>
          <p className="text-2xl font-serif text-accent mb-1">Pencil & Pixel</p>
          <p className="opacity-50 uppercase tracking-widest text-[10px]">Dual Mediums</p>
        </div>
        <div>
          <p className="text-2xl font-serif text-accent mb-1">Handcrafted</p>
          <p className="opacity-50 uppercase tracking-widest text-[10px]">Physical & Digital</p>
        </div>
        <div>
          <p className="text-2xl font-serif text-accent mb-1">Chennai</p>
          <p className="opacity-50 uppercase tracking-widest text-[10px]">Origin Studio</p>
        </div>
      </div>

      {/* ─── SECTION INTRO ─── */}
      <div className="pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-accent" />
            <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent font-semibold">The Permanent Collection</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif">
            Curated <span className="italic text-accent">Rooms</span>
          </h2>
        </div>
        <p className="text-sm opacity-50 font-serif italic max-w-sm">
          Select any exhibition hall below to immerse yourself in the individual works.
        </p>
      </div>

      {/* ─── BENTO CATEGORIES GRID ─── */}
      <section className="pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 md:grid-rows-3 auto-rows-[280px] md:auto-rows-auto md:h-[900px]">
          {CATEGORIES.map((section, i) => (
            <motion.div
              key={section.id}
              className={`${categorySpans[section.id] || 'md:col-span-1 md:row-span-1'} h-full min-h-[260px]`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            >
              <Link
                to={`/section/${section.id}`}
                className="group relative block w-full h-full overflow-hidden rounded-3xl bg-ink border border-ink/10 dark:border-white/10 shadow-lg"
                style={{ transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                {/* Cover image */}
                <img
                  src={section.img}
                  alt={section.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 ease-out"
                  loading="lazy"
                />

                {/* Dark Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 font-mono text-xs tracking-[0.25em] group-hover:text-accent transition-colors">
                      {section.num}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 group-hover:text-accent transition-colors duration-300 leading-tight">
                      {section.label}
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm font-sans leading-relaxed line-clamp-2">
                      {section.desc}
                    </p>
                    <div className="mt-4 h-0.5 w-0 bg-accent group-hover:w-10 transition-all duration-500 ease-out" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
