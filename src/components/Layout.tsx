import { Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './Navbar';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import CustomCursor from './CustomCursor';
import MuseumPreloader from './motion/MuseumPreloader';
import VisualFilters from './motion/VisualFilters';
import RouteWipe from './motion/RouteWipe';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

const UploadFAB = lazy(() => import('./UploadFAB'));

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative bg-grain selection:bg-accent/30 selection:text-ink dark:selection:text-white">
      <ScrollProgress />
      <VisualFilters />
      <CustomCursor />
      <RouteWipe />
      <MuseumPreloader />
      <Navbar />

      <main className={`flex-1 w-full ${isHome ? 'max-w-7xl mx-auto px-6' : 'max-w-7xl mx-auto px-6 py-12'}`}>
        <LayoutGroup id="museum-routes">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, clipPath: 'inset(0 0 8% 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
              exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </LayoutGroup>
      </main>

      <Footer />
      <Suspense fallback={null}>
        <UploadFAB />
      </Suspense>
      <InstallPrompt />
    </div>
  );
}
