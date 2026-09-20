import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import UploadFAB from './UploadFAB';
import InstallPrompt from './InstallPrompt';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative bg-grain">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <Outlet />
      </main>
      <footer className="py-8 text-center text-sm opacity-60">
        &copy; {new Date().getFullYear()} Praveenkumar G. All rights reserved.
      </footer>
      <UploadFAB />
      <InstallPrompt />
    </div>
  );
}
