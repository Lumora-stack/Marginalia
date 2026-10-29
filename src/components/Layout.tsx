import { Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import PrimaryNavigation from './PrimaryNavigation';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import MuseumPreloader from './motion/MuseumPreloader';
import VisualFilters from './motion/VisualFilters';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { useQuality } from '../lib/quality-context';
import { qualityAtLeast } from '../lib/quality-types';
import { useThemeColors } from '../lib/useThemeColors';

const UploadFAB = lazy(() => import('./UploadFAB'));
const ClickSpark = lazy(() => import('./ClickSpark'));
const TargetCursor = lazy(() => import('./TargetCursor'));
const Noise = lazy(() => import('./Noise'));

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const { tier } = useQuality();
  const colors = useThemeColors();
  const shouldReduceMotion = useReducedMotion();
  const [compactMotion, setCompactMotion] = useState(() =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(pointer: coarse)').matches),
  );
  const [finePointer, setFinePointer] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setCompactMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const content = (
    <div className="min-h-screen flex flex-col relative bg-grain selection:bg-accent/30 selection:text-ink dark:selection:text-white">
      <ScrollProgress />
      <VisualFilters />
      {finePointer && tier !== 'low' && !shouldReduceMotion && (
        <Suspense fallback={null}>
          <TargetCursor
            targetSelector="a, button, [role='button'], input, select, textarea, .cursor-zoom-in, [data-cursor-label]"
            cursorColor={colors.accent}
            cursorColorOnTarget={colors.isDark ? '#fff2bd' : '#29271f'}
            spinDuration={2.6}
            size={32}
            padding={5}
            blendMode="normal"
            showLabel
          />
        </Suspense>
      )}
      {finePointer && qualityAtLeast(tier, 'medium') && !shouldReduceMotion && (
        <Suspense fallback={null}>
          <Noise
            fixed
            opacity={0.025}
            size={1}
            fps={tier === 'medium' ? 4 : tier === 'high' ? 7 : 10}
            blendMode={colors.isDark ? 'overlay' : 'multiply'}
            contrast={0.32}
            zIndex={30}
          />
        </Suspense>
      )}
      <MuseumPreloader />
      <PrimaryNavigation />

      <main className={`site-container flex-1 w-full ${isAdmin ? '' : isHome ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0' : 'pt-[var(--section-space)] pb-[calc(var(--section-space)*0.25+5rem+env(safe-area-inset-bottom))] md:pb-[calc(var(--section-space)*0.25)]'}`}>
        <LayoutGroup id="museum-routes">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={shouldReduceMotion ? false : {
                opacity: 0,
                y: 16,
                ...(compactMotion ? {} : { filter: 'blur(4px)' }),
              }}
              animate={{
                opacity: 1,
                y: 0,
                ...(compactMotion ? {} : { filter: 'blur(0px)' }),
                transition: {
                  duration: shouldReduceMotion ? 0 : compactMotion ? 0.25 : 0.35,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              exit={{
                opacity: 0,
                y: shouldReduceMotion ? 0 : -12,
                transition: {
                  duration: shouldReduceMotion ? 0 : compactMotion ? 0.15 : 0.2,
                  ease: 'easeIn',
                },
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </LayoutGroup>
      </main>

      <Footer />
      <TabBar />
      <Suspense fallback={null}>
        <UploadFAB />
      </Suspense>
      <InstallPrompt />
    </div>
  );

  return (
    finePointer && tier !== 'low' && !shouldReduceMotion ? (
      <Suspense fallback={content}>
        <ClickSpark
          sparkColor={[colors.accent, colors.isDark ? '#fff2bd' : '#5e4812']}
          sparkSize={7}
          sparkRadius={28}
          sparkCount={6}
          sparkWidth={1.5}
          duration={420}
          glow={0.35}
          className="min-h-screen"
        >
          {content}
        </ClickSpark>
      </Suspense>
    ) : content
  );
}
