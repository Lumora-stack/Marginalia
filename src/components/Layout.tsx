import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import UploadFAB from './UploadFAB';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import CustomCursor from './CustomCursor';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative bg-grain selection:bg-accent/30 selection:text-ink dark:selection:text-white">
      <ScrollProgress />
      <CustomCursor />
      <Navbar />

      <main className={`flex-1 w-full ${isHome ? 'max-w-7xl mx-auto px-6' : 'max-w-7xl mx-auto px-6 py-12'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <UploadFAB />
      <InstallPrompt />
    </div>
  );
}
