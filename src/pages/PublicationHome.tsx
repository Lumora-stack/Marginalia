import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Compass, Film, Palette, Sparkles, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCanvasActivity } from '../components/motion/useCanvasActivity';
import { useQuality } from '../lib/quality-context';
import { useThemeColors } from '../lib/useThemeColors';
import { SITE_NAME, SITE_TAGLINE } from '../lib/site';

const Aurora = lazy(() => import('../components/Aurora'));

const areas = [
  {
    number: '01',
    title: 'Creative Journey',
    detail: 'Pencil, pixel, sketches, crafts, and games.',
    to: '/creative',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=85&w=1000&auto=format&fit=crop',
    Icon: Palette,
    style: 'from-amber-500/15 via-orange-400/5 to-transparent',
  },
  {
    number: '02',
    title: 'Tech',
    detail: 'Topics I am learning, in my own words.',
    to: '/tech',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=85&w=1000&auto=format&fit=crop',
    Icon: Terminal,
    style: 'from-sky-500/15 via-indigo-400/5 to-transparent',
  },
  {
    number: '03',
    title: 'Explored Places',
    detail: 'Food worth finding and places worth keeping.',
    to: '/places/food',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=85&w=1000&auto=format&fit=crop',
    Icon: Compass,
    style: 'from-emerald-500/15 via-teal-400/5 to-transparent',
  },
  {
    number: '04',
    title: 'Watched',
    detail: 'Films and series, with notes from the credits.',
    to: '/watched',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=85&w=1000&auto=format&fit=crop',
    Icon: Film,
    style: 'from-fuchsia-500/15 via-rose-400/5 to-transparent',
  },
  {
    number: '05',
    title: 'Settings & About',
    detail: 'The artist, the details, and your atmosphere.',
    to: '/settings',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=85&w=1000&auto=format&fit=crop',
    Icon: Sparkles,
    style: 'from-violet-500/15 via-purple-400/5 to-transparent',
  },
];

export default function PublicationHome() {
  const { tier } = useQuality();
  const colors = useThemeColors();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const heroActive = useCanvasActivity(heroRef);
  const [effectsReady, setEffectsReady] = useState(false);
  const device = typeof navigator === 'undefined'
    ? undefined
    : navigator as Navigator & {
        deviceMemory?: number;
        hardwareConcurrency?: number;
        connection?: { saveData?: boolean; effectiveType?: string };
      };
  const effectsAllowed = tier !== 'low'
    && !reduceMotion
    && !(device?.deviceMemory !== undefined && device.deviceMemory <= 2)
    && !(device?.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 2)
    && device?.connection?.saveData !== true
    && !['slow-2g', '2g', '3g'].includes(device?.connection?.effectiveType ?? '');

  useEffect(() => {
    if (!effectsAllowed) return;
    const timer = window.setTimeout(() => setEffectsReady(true), 250);
    return () => window.clearTimeout(timer);
  }, [effectsAllowed]);

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!effectsAllowed || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const style = event.currentTarget.style;
    style.setProperty('--hero-back-x', `${(-x * 10).toFixed(1)}px`);
    style.setProperty('--hero-back-y', `${(-y * 8).toFixed(1)}px`);
    style.setProperty('--hero-mid-x', `${(x * 7).toFixed(1)}px`);
    style.setProperty('--hero-mid-y', `${(y * 6).toFixed(1)}px`);
    style.setProperty('--hero-content-x', `${(x * 3).toFixed(1)}px`);
    style.setProperty('--hero-content-y', `${(y * 2).toFixed(1)}px`);
  };

  const resetHeroPointer = (event: React.PointerEvent<HTMLElement>) => {
    const style = event.currentTarget.style;
    for (const property of ['--hero-back-x', '--hero-back-y', '--hero-mid-x', '--hero-mid-y', '--hero-content-x', '--hero-content-y']) {
      style.setProperty(property, '0px');
    }
  };

  return (
    <div className="-mt-2">
      <section
        ref={heroRef}
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={resetHeroPointer}
        className="home-hero-depth relative -mx-[var(--container-gutter)] flex min-h-[min(760px,88svh)] items-center overflow-hidden px-[var(--container-gutter)]"
      >
        <div className="home-depth-layer home-depth-layer-back" aria-hidden="true" />
        <div className="home-depth-layer home-depth-layer-middle" aria-hidden="true" />
        {effectsReady && heroActive && (
          <div className="pointer-events-none absolute inset-0 z-0 opacity-60">
            <Suspense fallback={null}>
              <Aurora
                colorStops={colors.isDark ? ['#5e4918', '#d4af37', '#382b10'] : ['#9a7b1f', '#ccb05d', '#80641c']}
                amplitude={0.45}
                blend={0.28}
                speed={0.24}
                height={0.4}
                scale={1.1}
                glow={0.18}
                brightness={colors.isDark ? 0.45 : 0.35}
                layers={1}
                lightMode={!colors.isDark}
                paused={!heroActive || !!reduceMotion}
                dpr={1}
                fps={30}
                mouseInteraction={false}
                className="absolute inset-0"
              />
            </Suspense>
          </div>
        )}
        <div className="home-depth-content relative z-10 mx-auto w-full max-w-6xl py-20 sm:py-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-paper/50 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.24em] text-accent backdrop-blur dark:bg-black/15"
          >
            <Sparkles size={13} /> A personal publication
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="editorial-wordmark max-w-4xl font-serif text-[clamp(4rem,14vw,10rem)] text-gradient"
          >
            {SITE_NAME}
          </motion.h1>
          <p className="mt-7 max-w-2xl font-serif text-xl italic leading-relaxed opacity-75 sm:text-2xl">
            {SITE_TAGLINE}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-55 sm:text-base">
            A living collection of things I make, things I learn, places I find, and stories I carry with me.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/creative" className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.16em] transition hover:border-accent/50 hover:text-accent dark:border-white/15">
              Begin exploring <ArrowUpRight size={14} />
            </Link>
            <Link to="/settings/about" className="rounded-full border border-ink/15 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.16em] transition hover:border-accent/50 hover:text-accent dark:border-white/15">
              Meet the artist
            </Link>
          </div>
          <a href="#discover" className="mt-14 inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] opacity-40 transition hover:opacity-80">
            Discover the five areas <ArrowDown size={13} />
          </a>
        </div>
      </section>

      <section id="discover" className="scroll-mt-24 py-[calc(var(--section-space)*0.6)]">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.25em] text-accent">A map of this little world</p>
            <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">Five ways in.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed opacity-55">Follow a curiosity. Each area has its own rhythm, gathered together in one place.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {areas.map((area, index) => (
            <motion.div
              key={area.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-35px' }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
            >
              <Link
                to={area.to}
                className={`publication-card group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-[1.65rem] border border-white/10 bg-gradient-to-br ${area.style} p-6 text-white transition duration-300 hover:-translate-y-0.5 hover:border-accent/50 sm:min-h-56 sm:p-7`}
              >
                <img
                  src={area.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-85"
                />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/45 to-black/85" />
                <span className="relative z-10 flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-accent">{area.number}</span>
                  <area.Icon size={19} className="text-accent transition-transform group-hover:scale-110" />
                </span>
                <span className="relative z-10">
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-serif text-2xl tracking-tight">{area.title}</span>
                    <ArrowUpRight size={15} className="shrink-0 text-accent opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-white/75">{area.detail}</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="mb-6 flex justify-end">
        <ContentPageFooter />
      </div>
    </div>
  );
}

function ContentPageFooter() {
  return <Link to="/creative" className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent hover:underline">Browse the original galleries ↗</Link>;
}
