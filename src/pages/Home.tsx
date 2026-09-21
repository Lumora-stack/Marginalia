import { Suspense, lazy, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const HeroScene = lazy(() => import('../components/HeroScene'));
const Canvas = lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));

const sections = [
  {
    id: 'pencil-arts',
    label: 'Pencil Arts',
    num: '01',
    desc: 'The timeless beauty of graphite and shadow.',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2000&auto=format&fit=crop',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    id: 'pixel-arts',
    label: 'Pixel Arts',
    num: '02',
    desc: 'Retro aesthetics meeting modern imagination.',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'sketches',
    label: 'Sketches',
    num: '03',
    desc: 'Raw ideas and spontaneous strokes.',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    id: 'doodles',
    label: 'Doodles',
    num: '04',
    desc: 'Wandering minds on paper.',
    img: 'https://images.unsplash.com/photo-1580828236166-512140fa960e?q=80&w=1000&auto=format&fit=crop',
    span: 'md:col-span-1 md:row-span-1',
  },
  {
    id: 'diy-crafts',
    label: 'DIY Crafts',
    num: '05',
    desc: 'Handmade creations from the heart.',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
    span: 'md:col-span-2 md:row-span-1',
  },
];

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3, 3]);

  useEffect(() => { setMounted(true); }, []);

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
    const rx = (((e.clientY - rect.top) / rect.height) - 0.5) * -12;
    const ry = (((e.clientX - rect.left) / rect.width) - 0.5) * 12;
    el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
  };

  const resetTilt = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  };

  return (
    <div className="flex flex-col gap-0">

      {/* ─── HERO ─── */}
      <section
        className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center -mt-12 -mx-6 overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Ambient orbs */}
        <div className="absolute top-1/3 left-1/5 w-80 h-80 bg-accent/6 rounded-full filter blur-[120px] animate-blob transform-gpu will-change-transform" />
        <div className="absolute bottom-1/4 right-1/5 w-72 h-72 bg-accent/8 rounded-full filter blur-[100px] animate-blob transform-gpu will-change-transform" style={{ animationDelay: '3s' }} />
        <div className="absolute top-2/3 left-1/2 w-60 h-60 bg-accent/4 rounded-full filter blur-[90px] animate-blob transform-gpu will-change-transform" style={{ animationDelay: '6s' }} />

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

        {/* Hero text */}
        <motion.div
          style={shouldReduceMotion ? {} : { rotateX, rotateY, transformStyle: 'preserve-3d' as const }}
          className="z-10 text-center relative px-6 max-w-5xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="text-xs md:text-sm font-mono tracking-[0.35em] uppercase text-accent mb-8"
          >
            ✦ Fine Art & Digital Portfolio ✦
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-serif leading-none tracking-tighter mb-4"
          >
            Artville
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic text-accent leading-none tracking-tight mb-10"
          >
            Gallery of Imagination
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }}
            className="text-sm md:text-base font-serif italic text-ink/50 dark:text-white/50 max-w-lg mx-auto leading-relaxed"
          >
            "Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai 🤍"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: 'easeOut' }}
            className="mt-10 flex items-center justify-center gap-6"
          >
            <Link
              to="/section/pencil-arts"
              className="px-8 py-3 rounded-full bg-accent text-white font-sans text-sm font-medium tracking-wide hover:bg-accent-light transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] pointer-events-auto"
            >
              Explore Gallery
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 rounded-full border border-ink/20 dark:border-white/20 font-sans text-sm font-medium tracking-wide hover:border-accent/60 transition-all duration-300 pointer-events-auto"
            >
              About the Artist
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-30"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── SECTION INTRO ─── */}
      <div className="px-0 pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-5"
        >
          <div className="w-12 h-px bg-accent" />
          <p className="text-xs font-mono tracking-[0.3em] uppercase text-accent/80">Explore Collections</p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-4 text-4xl md:text-5xl font-serif"
        >
          The Work
        </motion.h2>
      </div>

      {/* ─── CATEGORIES GRID ─── */}
      <section className="pb-24">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          style={{ gridTemplateRows: 'repeat(3, 300px)' }}
        >
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              className={section.span}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            >
              <Link
                to={`/section/${section.id}`}
                className="group relative block w-full h-[280px] md:h-full overflow-hidden rounded-2xl bg-ink"
                style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}
                onMouseMove={handleTilt}
                onMouseLeave={resetTilt}
              >
                {/* Cover image */}
                <img
                  src={section.img}
                  alt={section.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700 ease-out"
                  loading="lazy"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />

                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-white/25 font-mono text-xs tracking-[0.25em]">{section.num}</span>
                    <div className="w-6 h-px bg-white/20 group-hover:w-10 group-hover:bg-accent transition-all duration-500" />
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif text-white mb-2 group-hover:text-accent transition-colors duration-400 leading-tight">
                      {section.label}
                    </h2>
                    <motion.p
                      className="text-white/50 text-sm font-sans leading-relaxed overflow-hidden"
                      style={{ maxHeight: 0 }}
                      whileHover={{ maxHeight: '3rem' }}
                    >
                      {section.desc}
                    </motion.p>
                    <div className="mt-4 h-px w-0 bg-accent group-hover:w-8 transition-all duration-600 ease-out" />
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
