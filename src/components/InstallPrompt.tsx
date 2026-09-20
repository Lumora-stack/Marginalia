import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if we haven't dismissed it recently
      if (!localStorage.getItem('pwa-prompt-dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 bg-paper dark:bg-ink border border-ink/10 dark:border-white/10 shadow-2xl rounded-2xl p-6 z-50 flex gap-4 items-start"
        >
          <div className="bg-accent/10 text-accent p-3 rounded-xl flex-shrink-0">
            <Download size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg mb-1">Install Portfolio App</h3>
            <p className="text-sm opacity-70 mb-4">Add this portfolio to your home screen for fast, offline access.</p>
            <div className="flex gap-3">
              <button 
                onClick={handleInstall}
                className="flex-1 bg-ink text-paper dark:bg-paper dark:text-ink py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Install
              </button>
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 bg-ink/5 dark:bg-white/5 rounded-lg text-sm font-medium hover:bg-ink/10 dark:hover:bg-white/10 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="absolute top-4 right-4 opacity-50 hover:opacity-100">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
