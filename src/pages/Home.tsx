import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';
import { useQuality } from '../lib/quality-context';
import { qualityAtLeast } from '../lib/quality-types';
import { useThemeColors } from '../lib/useThemeColors';
import { useCanvasActivity } from '../components/motion/useCanvasActivity';
import ScrambleText from '../components/motion/ScrambleText';

const Aurora = lazy(() => import('../components/Aurora'));
const Particles = lazy(() => import('../components/Particles'));
const SplitText = lazy(() => import('../components/SplitText'));
const ShinyText = lazy(() => import('../components/ShinyText'));
const BlurText = lazy(() => import('../components/BlurText'));
const Magnet = lazy(() => import('../components/Magnet'));
const StarBorder = lazy(() => import('../components/StarBorder'));
const MotionLink = motion.create(Link);

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const { tier } = useQuality();
  const colors = useThemeColors();
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
  const enableHeroEffects = tier !== 'low' && !shouldReduceMotion && !lowMemory && !lowCpu && !saveData && !slowConnection;
  const [heroEffectsReady, setHeroEffectsReady] = useState(false);
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroEffectsActive = useCanvasActivity(heroSectionRef);
  const roomsRef = useRef<HTMLDivElement>(null);
  const roomsSectionRef = useRef<HTMLElement>(null);
  const dragging = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  useEffect(() => {
    if (!qualityAtLeast(tier, 'high') || shouldReduceMotion || window.innerWidth < 1024) return
    let active = true
    let revert = () => {}
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(([gsapModule, triggerModule]) => {
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
        ScrollTrigger.refresh()
        revert = () => context.revert()
      })
      .catch((error: unknown) => {
        if (active) console.error('Could not initialize the curated-rooms scroll animation:', error)
      })
    return () => {
      active = false
      revert()
    }
  }, [shouldReduceMotion, tier])

  useEffect(() => {
    if (!enableHeroEffects) return;
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    let completed = false;
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const reveal = () => {
      if (completed) return;
      completed = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      setHeroEffectsReady(true);
    };
    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(reveal, { timeout: 900 });
      timeoutId = window.setTimeout(reveal, 1200);
    } else {
      timeoutId = window.setTimeout(reveal, 300);
    }
    return () => {
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [enableHeroEffects]);

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
        ref={heroSectionRef}
        className="hero-viewport relative min-h-[85vh] md:min-h-screen flex items-center justify-center -mx-6 overflow-hidden select-none"
      >
        <div
          aria-hidden="true"
          className="hero-poster absolute inset-0 z-0 pointer-events-none"
        />

        {enableHeroEffects && heroEffectsReady && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Suspense fallback={null}>
              <Aurora
                colorStops={colors.isDark
                  ? ['#5e4918', '#d4af37', '#382b10']
                  : ['#9a7b1f', '#ccb05d', '#80641c']}
                amplitude={0.9}
                blend={0.48}
                speed={shouldReduceMotion ? 0 : tier === 'ultra' ? 0.72 : 0.42}
                height={0.55}
                scale={1.2}
                glow={0.28}
                brightness={colors.isDark ? 0.7 : 0.5}
                layers={tier === 'ultra' ? 2 : 1}
                lightMode={!colors.isDark}
                paused={!heroEffectsActive || !!shouldReduceMotion}
                dpr={Math.min(window.devicePixelRatio || 1, tier === 'ultra' ? 1.5 : 1)}
                className="absolute inset-0"
              />
              <Particles
                particleCount={tier === 'ultra' ? 1800 : tier === 'high' ? 1100 : 450}
                particleSpread={9}
                speed={0.12}
                particleColors={[colors.particle, colors.accent]}
                moveParticlesOnHover
                particleHoverFactor={0.7}
                alphaParticles
                particleBaseSize={2}
                sizeRandomness={1.4}
                disableRotation
                pixelRatio={Math.min(window.devicePixelRatio || 1, tier === 'ultra' ? 1.5 : 1)}
                shape="sparkle"
                glow={0.15}
                twinkle={0.35}
                depthOfField={0}
                connections={false}
                hoverEffect="repel"
                hoverRadius={1.8}
                clickBurst
                drift="up"
                driftSpeed={0.04}
                intro={!shouldReduceMotion}
                opacity={0.72}
                lightMode={!colors.isDark}
                paused={!heroEffectsActive || !!shouldReduceMotion}
                className="absolute inset-0"
              />
            </Suspense>
          </div>
        )}

        {/* Hero Content */}
        <div className="z-10 text-center relative px-6 max-w-5xl mx-auto">
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

          <Suspense fallback={<h1 className="hero-wordmark text-6xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-serif leading-none tracking-tighter mb-4 text-gradient">Artville</h1>}>
            <SplitText
              text="Artville"
              tag="h1"
              splitType="chars"
              effect="flip"
              trigger="load"
              duration={0.85}
              delay={45}
              className="hero-wordmark text-6xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-serif leading-none tracking-tighter mb-4 text-gradient"
              color={colors.accent}
              accentColor={colors.accent}
            />
          </Suspense>

          <Suspense fallback={<h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic text-accent leading-none tracking-tight mb-8">Gallery of Imagination</h2>}>
            <ShinyText
              text="Gallery of Imagination"
              color={colors.accent}
              shineColor={colors.isDark ? '#fff2bd' : '#5f4a12'}
              speed={4}
              delay={0.8}
              trigger="loop"
              className="mb-8 block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic leading-none tracking-tight"
            />
          </Suspense>

          <Suspense fallback={<p className="text-sm md:text-base font-serif italic opacity-70 max-w-lg mx-auto leading-relaxed">Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai.</p>}>
            <BlurText
              text="Creating art from tiny feelings, peaceful thoughts, and a little bit of imagination — straight from Chennai."
              animateBy="words"
              effect="blur"
              trigger={shouldReduceMotion ? 'load' : 'view'}
              delay={85}
              stepDuration={0.3}
              color={colors.isDark ? '#f0ede6' : '#29271f'}
              className="text-sm md:text-base font-serif italic opacity-75 max-w-lg mx-auto leading-relaxed"
            />
          </Suspense>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
          >
            <Suspense fallback={<Link to="/section/pencil-arts" className="rounded-full bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white">Explore Exhibition</Link>}>
              <Magnet padding={60} magnetStrength={2.2} maxOffset={12} className="pointer-events-auto">
                <Link to="/section/pencil-arts" aria-label="Explore Exhibition">
                  <StarBorder
                    as="span"
                    color={colors.accent}
                    trailColor={colors.isDark ? '#fff0b5' : '#5f4a12'}
                    theme={colors.isDark ? 'dark' : 'light'}
                    backgroundColor={colors.background}
                    textColor={colors.isDark ? '#f0ede6' : '#28251d'}
                    borderColor={colors.accent}
                    className="group px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-widest"
                  >
                    <span>Explore Exhibition</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </StarBorder>
                </Link>
              </Magnet>
              <Magnet padding={60} magnetStrength={1.6} maxOffset={9} className="pointer-events-auto">
                <Link
                  to="/about"
                  className="inline-flex rounded-full border border-ink/20 px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-widest transition-colors hover:border-accent hover:text-accent dark:border-white/20"
                >
                  About the Artist
                </Link>
              </Magnet>
            </Suspense>
          </motion.div>
        </div>

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

      <div aria-hidden="true" className="collection-marquee my-8 -mx-6 overflow-hidden border-y border-accent/15 py-4">
        <div className="collection-marquee-track w-max whitespace-nowrap font-serif text-3xl text-accent sm:text-5xl">
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
