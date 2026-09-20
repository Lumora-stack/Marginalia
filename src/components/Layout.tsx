import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import UploadFAB from './UploadFAB';
import InstallPrompt from './InstallPrompt';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative bg-grain">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-8 text-center text-sm opacity-60">
        &copy; {new Date().getFullYear()} Artville Gallery of Imagination. All rights reserved.
      </footer>
      <UploadFAB />
      <InstallPrompt />
    </div>
  );
}
