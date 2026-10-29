import { Outlet, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PrimaryNavigation from './PrimaryNavigation';
import TabBar from './TabBar';
import InstallPrompt from './InstallPrompt';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import MuseumPreloader from './motion/MuseumPreloader';
import VisualFilters from './motion/VisualFilters';

const UploadFAB = lazy(() => import('./UploadFAB'));

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const content = (
    <div className="min-h-screen flex flex-col relative bg-grain selection:bg-accent/30 selection:text-ink dark:selection:text-white">
      <ScrollProgress />
      <VisualFilters />
      <MuseumPreloader />
      <PrimaryNavigation />

      <main className={`site-container flex-1 w-full ${isAdmin ? '' : isHome ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0' : 'pt-[var(--section-space)] pb-[calc(var(--section-space)*0.25+5rem+env(safe-area-inset-bottom))] md:pb-[calc(var(--section-space)*0.25)]'}`}>
        <Outlet />
      </main>

      <Footer />
      <TabBar />
      <Suspense fallback={null}>
        <UploadFAB />
      </Suspense>
      <InstallPrompt />
    </div>
  );

  return content;
}
