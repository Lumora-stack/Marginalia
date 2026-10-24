import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';
import { useQuality } from '../lib/quality-context';
import { qualityAtLeast } from '../lib/quality-types';
import ScrambleText from '../components/motion/ScrambleText';

const HeroScene = lazy(() => import('../components/three/HeroScene'));
const MuseumFlythrough = lazy(() => import('../components/three/MuseumFlythrough'));
const Canvas = lazy(() => import('@react-three/fiber').then(m => ({ default: m.Canvas })));
const MotionLink = motion.create(Link);

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const { tier } = useQuality();
  const smallScreen = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
  const device = typeof navigator !== 'undefined'
    ? navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean; effectiveType?: string };
        hardwareConcurrency?: number;
      }
    : undefined;
  const deviceMemory = device?.deviceMemory;
  const lowMemory = deviceMemory !== undefined && deviceMemory <= 2;
  const lowCpu = device?.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 2;
  const connectionType = device?.connection?.effectiveType;
  const saveData = device?.connection?.saveData === true;
  const slowConnection = connectionType === 'slow-2g' || connectionType === '2g' || connectionType === '3g';
  const enable3D = qualityAtLeast(tier, 'medium') && shouldReduceMotion === false &&
    !smallScreen && !lowMemory && !lowCpu && !saveData && !slowConnection;
  const [hero3DReady, setHero3DReady] = useState(false);
  const roomsRef = useRef<HTMLDivElement>(null);
  const roomsSectionRef = useRef<HTMLElement>(null);
  const dragging = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    if (!qualityAtLeast(tier, 'high') || shouldReduceMotion || window.innerWidth < 1024) return
    let active = true
    let revert = () => {}
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (!active || !roomsRef.current || !roomsSectionRef.current) return
      const gsap = gsapModule.default
      const { ScrollTrigger } = triggerModule
      gsap.registerPlugin(ScrollTrigger)
      const section = roomsSectionRef.current
      const rail = roomsRef.current
      const context = gsap.context(() => {
        const getDistance = () => Math.max(0, rail.scrollWidth - window.innerWidth + 56)
        gsap.to(rail, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      }, section)
      revert = () => context.revert()
    })
    return () => {
      active = false
      revert()
    }
  }, [shouldReduceMotion, tier])

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [3.5, -3.5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-3.5, 3.5]);

  useEffect(() => {
    if (!enable3D) return;
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(() => setHero3DReady(true), { timeout: 2000 });
    } else {
      timeoutId = window.setTimeout(() => setHero3DReady(true), 300);
    }
    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [enable3D]);

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
    if (shouldReduceMotion || typeof window === 'undefined' || window.innerWidth < 768) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const rx = (((e.clientY - rect.top) / rect.height) - 0.5) * -10;
    const ry = (((e.clientX - rect.left) / rect.width) - 0.5) * 10;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.015,1.015,1.015)`;
  };

  const resetTilt = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  };

  const startRoomDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !roomsRef.current) return;
    dragging.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: roomsRef.current.scrollLeft,
      moved: false,
    };
  };

  const moveRoomDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragging.current;
    if (!drag.active || !roomsRef.current) return;
    const delta = e.clientX - drag.startX;
    if (Math.abs(delta) > 5) drag.moved = true;
    roomsRef.current.scrollLeft = drag.scrollLeft - delta;
  };

  const stopRoomDrag = () => {
    dragging.current.active = false;
  };

  return (
    <div className="flex flex-col gap-0 pb-16">

      {/* ─── HERO ─── */}
      <section
        id="home-hero"
        className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center -mx-6 overflow-hidden select-none"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Soft atmospheric ambient glow orbs - desktop only for 60fps mobile */}
        <div className="hidden md:block absolute top-1/4 left-1/4 w-80 h-80 bg-accent/6 rounded-full filter blur-[100px] animate-blob transform-gpu pointer-events-none" />
        <div className="hidden md:block absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full filter blur-[90px] animate-blob transform-gpu pointer-events-none" style={{ animationDelay: '3s' }} />

        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_45%,rgba(212,175,55,0.12),transparent_55%)]"
        />

        {/* 3D Canvas mounts only after the first paint and an idle callback. */}
        {enable3D && hero3DReady && (
          <div className="hero-scene-layer absolute inset-0 z-0 pointer-events-none will-change-transform">
            <Suspense fallback={null}>
              <Canvas
                dpr={[1, tier === 'ultra' ? 2 : tier === 'high' ? 1.5 : 1.25]}
                gl={{ powerPreference: 'high-performance', antialias: false }}
                camera={{ position: [0, 0, 22], fov: 58 }}
              >
                <HeroScene quality={tier} />
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
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { delayChildren: 0.18, staggerChildren: 0.045 } },
            }}
            aria-label="Artville"
            className="hero-wordmark text-6xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-serif leading-none tracking-tighter mb-4"
          >
            {'Artville'.split('').map((letter, index) => (
              <span key={`${letter}-${index}`} className="inline-block overflow-hidden align-bottom pb-2">
                <motion.span
                  aria-hidden="true"
                  variants={{
                    hidden: { opacity: 0, y: '110%', rotateX: -75, filter: 'blur(12px)' },
                    visible: { opacity: 1, y: '0%', rotateX: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  className="inline-block origin-bottom text-gradient"
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="hero-title-shimmer text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic text-accent leading-none tracking-tight mb-8"
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
            document.getElementById('curated-rooms')?.scrollIntoView({ behavior: 'smooth' });
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

      {qualityAtLeast(tier, 'medium') && !shouldReduceMotion && (
        <Suspense fallback={<div aria-hidden="true" className="my-14 h-[70vh] rounded-3xl bg-gradient-to-br from-[#17140c] via-[#0d0d0f] to-[#211a0e]" />}>
          <MuseumFlythrough quality={tier} />
        </Suspense>
      )}

      <div aria-hidden="true" className="collection-marquee my-8 -mx-6 overflow-hidden border-y border-accent/15 py-4">
        <div className="collection-marquee-track w-max whitespace-nowrap font-serif text-3xl text-accent/60 sm:text-5xl">
          PENCIL <span>·</span> PIXEL <span>·</span> SKETCH <span>·</span> DOODLE <span>·</span> CRAFT <span>·</span> PLAY <span>·</span>&nbsp;&nbsp;
          PENCIL <span>·</span> PIXEL <span>·</span> SKETCH <span>·</span> DOODLE <span>·</span> CRAFT <span>·</span> PLAY <span>·</span>
        </div>
      </div>

      {/* ─── EXHIBITION STATS & MANIFESTO ─── */}
      <div className="py-12 border-y border-ink/10 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center my-12 font-mono text-xs">
        <div>
          <p className="text-2xl font-serif text-accent mb-1">06</p>
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
      <div id="curated-rooms" className="pt-12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 scroll-mt-24">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-accent" />
            <ScrambleText text="The Permanent Collection" className="text-xs font-mono tracking-[0.3em] uppercase text-accent font-semibold" />
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
      <section ref={roomsSectionRef} className="pb-16">
        <div
          ref={roomsRef}
          className="museum-room-rail flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 cursor-grab active:cursor-grabbing"
          onPointerDown={qualityAtLeast(tier, 'high') && window.innerWidth >= 1024 ? undefined : startRoomDrag}
          onPointerMove={qualityAtLeast(tier, 'high') && window.innerWidth >= 1024 ? undefined : moveRoomDrag}
          onPointerUp={qualityAtLeast(tier, 'high') && window.innerWidth >= 1024 ? undefined : stopRoomDrag}
          onPointerCancel={qualityAtLeast(tier, 'high') && window.innerWidth >= 1024 ? undefined : stopRoomDrag}
          onClickCapture={e => {
            if (dragging.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              dragging.current.moved = false;
            }
          }}
          data-cursor="drag"
          aria-label="Curated rooms, horizontally scrollable"
        >
          {CATEGORIES.map((section, i) => (
            <motion.div
              key={section.id}
              className="w-[84vw] sm:w-[66vw] lg:w-[48vw] xl:w-[42vw] max-w-[600px] h-[26rem] md:h-[34rem] flex-none snap-start"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            >
              <MotionLink
                to={`/section/${section.id}`}
                layoutId={`room-cover-${section.id}`}
                className="group relative block w-full h-full overflow-hidden rounded-3xl bg-ink border border-ink/10 dark:border-white/10 shadow-lg"
                onClick={e => {
                  if (dragging.current.moved) {
                    e.preventDefault();
                    dragging.current.moved = false;
                  }
                }}
                onMouseMove={e => {
                  handleTilt(e);
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--glare-x', `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty('--glare-y', `${e.clientY - rect.top}px`);
                }}
                onMouseLeave={resetTilt}
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  '--glare-x': '50%',
                  '--glare-y': '50%',
                } as React.CSSProperties}
              >
                <span aria-hidden="true" className="room-card-glare absolute inset-0 z-[1] pointer-events-none" />
                <span aria-hidden="true" className="room-card-dissolve absolute inset-0 z-[2] pointer-events-none" />
                {/* Cover image */}
                <img
                  src={section.img}
                  alt={section.label}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop';
                  }}
                  className="room-cover-image absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition-all duration-700 ease-out"
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
                    <span aria-hidden="true" className="room-parallax-number absolute bottom-10 right-5 font-serif text-[8rem] leading-none text-white/10 md:text-[12rem]">
                      {section.num}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-2 group-hover:text-accent transition-colors duration-300 leading-tight">
                      {section.label}
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm font-sans leading-relaxed line-clamp-2">
                      {section.desc}
                    </p>
                    <div className="mt-4 h-0.5 w-0 bg-accent group-hover:w-10 transition-all duration-500 ease-out" />
                  </div>
                </div>
              </MotionLink>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
