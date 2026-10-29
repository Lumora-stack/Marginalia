import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Component, lazy, Suspense, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/motion/SmoothScroll';
import { QualityProvider } from './lib/quality';
import { applyThemePreference, getThemePreference } from './lib/theme';
import { SITE_NAME } from './lib/site';

const Home = lazy(() => import('./pages/PublicationHome'));
const Section = lazy(() => import('./pages/Section'));
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));
const Creative = lazy(() => import('./pages/Creative'));
const Tech = lazy(() => import('./pages/Tech'));
const Places = lazy(() => import('./pages/Places'));
const Watched = lazy(() => import('./pages/Watched'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoading() {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTimedOut(true), 1000);
    return () => window.clearTimeout(timeout);
  }, []);

  if (timedOut) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center" role="alert">
        <p className="font-serif text-lg">This exhibition is taking longer than expected to open.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-accent/50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent focus-visible:outline"
        >
          Reload exhibition
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[10001] h-px overflow-hidden bg-accent/15" role="status" aria-label="Opening exhibition">
      <span className="route-loading-progress block h-full w-1/3 bg-accent" />
    </div>
  );
}

class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The exhibition route failed to load:', error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center" role="alert">
        <p className="font-serif text-lg">This exhibition couldn’t be opened.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-accent/50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent focus-visible:outline"
        >
          Reload exhibition
        </button>
      </div>
    );
  }
}

function ScrollTriggerRefresh() {
  const location = useLocation();

  useEffect(() => {
    let active = true;
    let frame = 0;
    const refresh = () => {
      if (!active) return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        void Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
          .then(([gsapModule, triggerModule]) => {
            if (!active) return;
            gsapModule.default.registerPlugin(triggerModule.ScrollTrigger);
            triggerModule.ScrollTrigger.refresh();
          })
          .catch((error: unknown) => {
            console.error('Could not refresh exhibition scroll positions:', error);
          });
      });
    };
    const handleResourceLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement) refresh();
    };

    refresh();
    window.addEventListener('load', refresh);
    document.addEventListener('load', handleResourceLoad, true);
    window.addEventListener('artville:layoutchange', refresh);
    void document.fonts.ready.then(refresh);

    return () => {
      active = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('load', refresh);
      document.removeEventListener('load', handleResourceLoad, true);
      window.removeEventListener('artville:layoutchange', refresh);
    };
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function SystemThemeSync() {
  useEffect(() => {
    document.title = `${SITE_NAME} · A personal publication`;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      if (getThemePreference() === 'system') applyThemePreference('system');
    };
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <QualityProvider>
        <MotionConfig reducedMotion="user">
          <SmoothScroll />
          <SystemThemeSync />
          <ScrollTriggerRefresh />
          <ScrollToTop />
          <RouteErrorBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Suspense fallback={<RouteLoading />}><Home /></Suspense>} />
                <Route path="section/:id" element={<Suspense fallback={<RouteLoading />}><Section /></Suspense>} />
                <Route path="section/:id/:mode" element={<Suspense fallback={<RouteLoading />}><Section /></Suspense>} />
                <Route path="creative" element={<Suspense fallback={<RouteLoading />}><Creative /></Suspense>} />
                <Route path="creative/:id" element={<Suspense fallback={<RouteLoading />}><Section /></Suspense>} />
                <Route path="creative/:id/:mode" element={<Suspense fallback={<RouteLoading />}><Section /></Suspense>} />
                <Route path="tech" element={<Suspense fallback={<RouteLoading />}><Tech /></Suspense>} />
                <Route path="tech/:slug" element={<Suspense fallback={<RouteLoading />}><Tech /></Suspense>} />
                <Route path="places" element={<Navigate to="/places/food" replace />} />
                <Route path="places/food" element={<Suspense fallback={<RouteLoading />}><Places /></Suspense>} />
                <Route path="places/travel" element={<Suspense fallback={<RouteLoading />}><Places /></Suspense>} />
                <Route path="watched" element={<Suspense fallback={<RouteLoading />}><Watched /></Suspense>} />
                <Route path="watched/:slug" element={<Suspense fallback={<RouteLoading />}><Watched /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<RouteLoading />}><Settings /></Suspense>} />
                <Route path="settings/about" element={<Suspense fallback={<RouteLoading />}><About /></Suspense>} />
                <Route path="about" element={<Navigate to="/settings/about" replace />} />
                <Route path="admin" element={<Suspense fallback={<RouteLoading />}><Admin /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<RouteLoading />}><NotFound /></Suspense>} />
              </Route>
            </Routes>
          </RouteErrorBoundary>
        </MotionConfig>
      </QualityProvider>
    </BrowserRouter>
  );
}

export default App;
