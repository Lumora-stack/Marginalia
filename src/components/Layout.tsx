import { Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './Navbar';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import MuseumPreloader from './motion/MuseumPreloader';
import VisualFilters from './motion/VisualFilters';
import RouteWipe from './motion/RouteWipe';
import { LayoutGroup, useReducedMotion } from 'framer-motion';
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
  const { tier } = useQuality();
  const colors = useThemeColors();
  const shouldReduceMotion = useReducedMotion();

  const content = (
    <div className="min-h-screen flex flex-col relative bg-grain selection:bg-accent/30 selection:text-ink dark:selection:text-white">
      <ScrollProgress />
      <VisualFilters />
      {tier !== 'low' && !shouldReduceMotion && (
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
      {qualityAtLeast(tier, 'medium') && !shouldReduceMotion && (
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
      <RouteWipe />
      <MuseumPreloader />
      <Navbar />

      <main className={`site-container flex-1 w-full ${isHome ? '' : 'pt-[var(--section-space)] pb-[calc(var(--section-space)*0.25)]'}`}>
        <LayoutGroup id="museum-routes">
          <Outlet />
        </LayoutGroup>
      </main>

      <Footer />
      <Suspense fallback={null}>
        <UploadFAB />
      </Suspense>
      <InstallPrompt />
    </div>
  );

  return (
    <Suspense fallback={content}>
      <ClickSpark
        sparkColor={[colors.accent, colors.isDark ? '#fff2bd' : '#5e4812']}
        sparkSize={7}
        sparkRadius={28}
        sparkCount={tier === 'ultra' ? 9 : 6}
        sparkWidth={1.5}
        duration={420}
        glow={0.35}
        disabled={tier === 'low' || !!shouldReduceMotion}
        className="min-h-screen"
      >
        {content}
      </ClickSpark>
    </Suspense>
  );
}
