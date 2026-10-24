import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import SmoothScroll from './components/motion/SmoothScroll';
import { QualityProvider } from './lib/quality';
import ScrollVelocity from './components/motion/ScrollVelocity';
import { SoundProvider } from './lib/sound';

const Home = lazy(() => import('./pages/Home'));
const Section = lazy(() => import('./pages/Section'));
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Opening exhibition">
      <span className="h-px w-20 animate-pulse bg-accent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QualityProvider>
        <SoundProvider>
          <MotionConfig reducedMotion="user">
            <SmoothScroll />
            <ScrollVelocity />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Suspense fallback={<RouteLoading />}><Home /></Suspense>} />
                <Route path="section/:id" element={<Suspense fallback={<RouteLoading />}><Section /></Suspense>} />
                <Route path="section/:id/:mode" element={<Suspense fallback={<RouteLoading />}><Section /></Suspense>} />
                <Route path="about" element={<Suspense fallback={<RouteLoading />}><About /></Suspense>} />
                <Route path="admin" element={<Suspense fallback={<RouteLoading />}><Admin /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<RouteLoading />}><NotFound /></Suspense>} />
              </Route>
            </Routes>
          </MotionConfig>
        </SoundProvider>
      </QualityProvider>
    </BrowserRouter>
  );
}

export default App;
