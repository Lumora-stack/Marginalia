import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_NAME } from '../lib/site';

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = 'pwa-prompt-dismissed';

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && navigator.standalone === true);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const syncInstalledState = () => {
      if (!isAppInstalled()) return;
      setDeferredPrompt(null);
      setShowPrompt(false);
    };
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setError('');
      if (!isAppInstalled() && !sessionStorage.getItem(DISMISSED_KEY)) {
        setShowPrompt(true);
      }
    };
    const handleInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setInstalling(false);
      sessionStorage.removeItem(DISMISSED_KEY);
    };

    syncInstalledState();
    displayMode.addEventListener('change', syncInstalledState);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      displayMode.removeEventListener('change', syncInstalledState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt || installing) return;
    setInstalling(true);
    setError('');
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
      if (outcome === 'dismissed') sessionStorage.setItem(DISMISSED_KEY, 'true');
    } catch (installError) {
      console.error('Could not start the app installation prompt:', installError);
      setError('The install dialog could not be opened. Try installing from your browser menu.');
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem(DISMISSED_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.section
          role="dialog"
          aria-label={`Install ${SITE_NAME}`}
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 32, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50 mx-auto grid max-w-md grid-cols-[auto_1fr_auto] items-start gap-4 rounded-2xl border border-ink/10 bg-paper p-5 text-ink shadow-2xl dark:border-white/15 dark:bg-[#101114] dark:text-white sm:bottom-8 sm:right-8 sm:left-auto sm:mx-0"
        >
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Download size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-lg leading-tight">{`Install ${SITE_NAME}`}</h2>
            <p className="mt-1 text-sm leading-relaxed opacity-70">
              Add Artville to your home screen for quick access and offline viewing.
            </p>
            {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={installing}
                  className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:opacity-85 disabled:cursor-wait disabled:opacity-60 dark:bg-paper dark:text-ink"
                >
                  {installing ? 'Opening…' : 'Install'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-paper transition hover:opacity-85 dark:bg-paper dark:text-ink"
                >
                  Got it
                </button>
              )}
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg px-4 py-2 text-sm font-medium opacity-70 transition hover:bg-ink/5 hover:opacity-100 dark:hover:bg-white/10"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="rounded-full p-1.5 opacity-55 transition hover:bg-ink/5 hover:opacity-100 dark:hover:bg-white/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
