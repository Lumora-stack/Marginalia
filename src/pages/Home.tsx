import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Sparkles, ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../lib/categories';
import { useQuality } from '../lib/quality-context';
import { qualityAtLeast } from '../lib/quality-types';
import { useThemeColors } from '../lib/useThemeColors';
import { useCanvasActivity } from '../components/motion/useCanvasActivity';

const Aurora = lazy(() => import('../components/Aurora'));
const SplitText = lazy(() => import('../components/SplitText'));
const ShinyText = lazy(() => import('../components/ShinyText'));
const BlurText = lazy(() => import('../components/BlurText'));
const Magnet = lazy(() => import('../components/Magnet'));
const StarBorder = lazy(() => import('../components/StarBorder'));
const TiltedCard = lazy(() => import('../components/TiltedCard'));
const FadeContent = lazy(() => import('../components/FadeContent'));
const ScrollReveal = lazy(() => import('../components/ScrollReveal'));
const RoomScrollVelocity = lazy(() => import('../components/ScrollVelocity'));
const DecryptedText = lazy(() => import('../components/DecryptedText'));
const MotionLink = motion.create(Link);

function RoomCardContent({ section }: { section: (typeof CATEGORIES)[number] }) {
  return (
    <div className="absolute inset-0 z-[1] flex flex-col justify-between bg-gradient-to-t from-ink/95 via-ink/40 to-transparent p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.25em] text-white/50 transition-colors group-hover:text-accent">
          {section.num}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent group-hover:text-white">
          <ArrowUpRight size={14} />
        </span>
      </div>
      <div className="relative">
        <span aria-hidden="true" className={`room-signature room-signature-${section.id} room-depth-number absolute bottom-0 right-0 font-serif text-[8rem] leading-none text-white/10 md:text-[12rem]`}>
          {section.num}
        </span>
        <h3 className={`room-signature room-signature-${section.id} relative mb-2 font-serif text-2xl leading-tight text-white transition-colors duration-300 group-hover:text-accent md:text-3xl`}>
          {section.label}
        </h3>
        <p className="relative line-clamp-1 font-sans text-xs leading-relaxed text-white/60 sm:text-sm">
          {section.desc}
        </p>
        <span aria-hidden="true" className="mt-4 block h-0.5 w-0 bg-accent transition-all duration-500 ease-out group-hover:w-10" />
      </div>
    </div>
  );
}

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
  const [isTouch, setIsTouch] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches,
  );

  useEffect(() => {
    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const updateTouch = () => setIsTouch(touchQuery.matches);
    updateTouch();
    touchQuery.addEventListener('change', updateTouch);
    return () => touchQuery.removeEventListener('change', updateTouch);
  }, []);

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

  const manifesto = (
    <div className="my-[calc(var(--section-space)*0.35)] grid grid-cols-2 gap-6 border-y border-ink/10 py-[calc(var(--section-space)*0.25)] text-center font-mono text-xs dark:border-white/10 sm:grid-cols-4">
      <div>
        <p className="mb-1 font-serif text-2xl text-accent">06</p>
        <p className="text-[10px] uppercase tracking-widest opacity-50">Curated Rooms</p>
      </div>
      <div>
        <p className="mb-1 font-serif text-2xl text-accent">Pencil &amp; Pixel</p>
        <p className="text-[10px] uppercase tracking-widest opacity-50">Dual Mediums</p>
      </div>
      <div>
        <p className="mb-1 font-serif text-2xl text-accent">Handcrafted</p>
        <p className="text-[10px] uppercase tracking-widest opacity-50">Physical &amp; Digital</p>
      </div>
      <div>
        <p className="mb-1 font-serif text-2xl text-accent">Chennai</p>
        <p className="text-[10px] uppercase tracking-widest opacity-50">Origin Studio</p>
      </div>
    </div>
  );
  const exploreLink = (
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
  );
  const aboutLink = (
    <Link
      to="/about"
      className="inline-flex rounded-full border border-ink/20 px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-widest transition-colors hover:border-accent hover:text-accent dark:border-white/20"
    >
      About the Artist
    </Link>
  );

  return (
    <div className="flex flex-col gap-0">

      {/* ─── HERO ─── */}
      <section
        id="home-hero"
        ref={heroSectionRef}
        className="hero-viewport relative min-h-[100dvh] flex items-center justify-center -mx-[var(--container-gutter)] overflow-hidden select-none"
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
                speed={shouldReduceMotion ? 0 : 0.42}
                height={0.55}
                scale={1.2}
                glow={0.28}
                brightness={colors.isDark ? 0.7 : 0.5}
                layers={1}
                lightMode={!colors.isDark}
                paused={!heroEffectsActive || !!shouldReduceMotion}
                dpr={1}
                fps={isTouch ? 30 : undefined}
                mouseInteraction={!isTouch}
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

          <Suspense fallback={<h1 className="hero-wordmark font-serif leading-none tracking-tighter mb-4 text-gradient">Artville</h1>}>
            <SplitText
              text="Artville"
              tag="h1"
              splitType="chars"
              effect="flip"
              trigger="load"
              duration={0.85}
              delay={45}
              className="hero-wordmark font-serif leading-none tracking-tighter mb-4 text-gradient"
              color={colors.accent}
              accentColor={colors.accent}
            />
          </Suspense>

          <Suspense fallback={<h2 className="hero-subtitle font-accent italic text-accent leading-none tracking-tight mb-8">Gallery of Imagination</h2>}>
            <ShinyText
              text="Gallery of Imagination"
              color={colors.accent}
              shineColor={colors.isDark ? '#fff2bd' : '#5f4a12'}
              speed={4}
              delay={0.8}
              trigger="loop"
              className="hero-subtitle mb-8 block font-accent italic leading-none tracking-tight"
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
              {isTouch ? exploreLink : (
                <Magnet padding={60} magnetStrength={2.2} maxOffset={12} className="pointer-events-auto">
                  {exploreLink}
                </Magnet>
              )}
              {isTouch ? aboutLink : (
                <Magnet padding={60} magnetStrength={1.6} maxOffset={9} className="pointer-events-auto">
                  {aboutLink}
                </Magnet>
              )}
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

      <div aria-hidden="true" className="-mx-[var(--container-gutter)] my-[calc(var(--section-space)*0.35)] overflow-hidden border-y border-accent/15 py-4">
        <Suspense fallback={<div className="whitespace-nowrap py-1 font-serif text-3xl text-accent sm:text-5xl">PENCIL · PIXEL · SKETCH · DOODLE · CRAFT · PLAY ·</div>}>
          <RoomScrollVelocity
            texts={['PENCIL · PIXEL · SKETCH · DOODLE · CRAFT · PLAY']}
            velocity={22}
            damping={50}
            stiffness={400}
            numCopies={5}
            velocityMapping={{ input: [0, 1000], output: [0, 2] }}
            parallaxClassName="relative overflow-hidden"
            scrollerClassName="font-serif text-3xl font-normal tracking-normal text-accent sm:text-5xl"
            scrollerStyle={{ color: colors.accent }}
            pauseOnHover
            fadeEdges
            skewWithVelocity={0.004}
            scaleWithVelocity={0.01}
          />
        </Suspense>
      </div>

      {/* ─── EXHIBITION STATS & MANIFESTO ─── */}
      <Suspense fallback={manifesto}>
        <FadeContent
          className="w-full"
          effect="focus"
          blur={4}
          duration={0.75}
          threshold={0.15}
          once
        >
          {manifesto}
        </FadeContent>
      </Suspense>

      {/* ─── SECTION INTRO ─── */}
      <div id="curated-rooms" className="pt-[calc(var(--section-space)*0.25)] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 scroll-mt-24">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-accent" />
            {shouldReduceMotion || tier === 'low' ? (
              <span className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-accent">
                The Permanent Collection
              </span>
            ) : (
              <Suspense fallback={<span className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-accent">The Permanent Collection</span>}>
                <DecryptedText
                  text="The Permanent Collection"
                  animateOn="hover"
                  effect="scramble"
                  speed={32}
                  maxIterations={8}
                  scrambleColor={colors.accent}
                  className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-accent"
                />
              </Suspense>
            )}
          </div>
          <Suspense fallback={<h2 className="text-4xl font-serif md:text-5xl">Curated <span className="italic text-accent">Rooms</span></h2>}>
            <ScrollReveal
              mode="enter"
              effect="rise"
              splitBy="words"
              enableBlur={qualityAtLeast(tier, 'medium') && !shouldReduceMotion}
              baseOpacity={0}
              baseRotation={0}
              duration={0.8}
              containerClassName="!my-0"
              textClassName="!font-serif !text-4xl !font-normal !leading-none md:!text-5xl"
            >
              <>Curated <span className="italic text-accent">Rooms</span></>
            </ScrollReveal>
          </Suspense>
        </div>
        <p className="text-sm opacity-50 font-serif italic max-w-sm">
          Select any exhibition hall below to immerse yourself in the individual works.
        </p>
      </div>

      {/* ─── BENTO CATEGORIES GRID ─── */}
      <section className="pb-[var(--section-space)]">
        <div
          className="museum-room-grid grid grid-cols-1 gap-4 min-[768px]:grid-cols-2 min-[1100px]:grid-cols-3 md:gap-6"
          aria-label="Curated rooms"
        >
          {CATEGORIES.map((section, i) => (
            <motion.div
              key={section.id}
              className="h-[250px] min-[768px]:h-[300px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
            >
              <MotionLink
                to={`/section/${section.id}`}
                layoutId={`room-cover-${section.id}`}
                aria-label={`Explore ${section.label} exhibition`}
                className="room-card-link group relative isolate block h-full w-full overflow-hidden rounded-3xl border border-ink/10 bg-ink shadow-lg dark:border-white/10"
              >
                <Suspense
                  fallback={
                    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-ink">
                      <img
                        src={section.img}
                        alt={section.label}
                        onError={e => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop';
                        }}
                        className="absolute inset-0 h-full w-full object-cover opacity-50"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/95 via-ink/40 to-transparent p-6 sm:p-8">
                        <h3 className="font-serif text-2xl text-white md:text-3xl">{section.label}</h3>
                      </div>
                    </div>
                  }
                >
                  {isTouch ? (
                    <div className="room-cover-card relative h-full w-full overflow-hidden rounded-3xl">
                      <img
                        src={section.img}
                        alt=""
                        onError={e => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop';
                        }}
                        className="absolute inset-0 h-full w-full object-cover opacity-75"
                        loading="lazy"
                        decoding="async"
                      />
                      <RoomCardContent section={section} />
                    </div>
                  ) : <TiltedCard
                    imageSrc={section.img}
                    altText={section.label}
                    onImageError={e => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop';
                    }}
                    containerWidth="100%"
                    containerHeight="100%"
                    imageWidth="100%"
                    imageHeight="100%"
                    rotateAmplitude={
                      isTouch || shouldReduceMotion || tier === 'low'
                        ? 0
                        : tier === 'medium' ? 5 : 8
                    }
                    scaleOnHover={isTouch || shouldReduceMotion || tier === 'low' ? 1 : 1.025}
                    smoothness={0.72}
                    glare={isTouch || shouldReduceMotion || tier === 'low' ? 0 : tier === 'medium' ? 0.16 : 0.28}
                    glareColor={colors.accent}
                    shadow={isTouch || shouldReduceMotion || tier === 'low' ? 0 : 0.28}
                    parallax={isTouch || shouldReduceMotion || tier === 'low' ? 0 : 0.7}
                    gyroscope={false}
                    intro={false}
                    showTooltip={false}
                    radius="1.5rem"
                    className="room-cover-card h-full w-full"
                  >
                    <RoomCardContent section={section} />
                  </TiltedCard>
                  }
                </Suspense>
              </MotionLink>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
