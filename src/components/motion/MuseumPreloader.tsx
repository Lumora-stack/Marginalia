import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function MuseumPreloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const duration = shouldReduceMotion ? 180 : coarsePointer ? 420 : 850;
    const timeout = window.setTimeout(() => setVisible(false), duration);
    const failsafe = window.setTimeout(() => setVisible(false), 1500);
    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      setProgress(Math.min(100, Math.round(((performance.now() - startedAt) / duration) * 100)));
    }, 60);
    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(failsafe);
      window.clearInterval(interval);
    };
  }, [shouldReduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0.1 : 0.2 } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0c0c0e] text-[#f0ede6]"
          aria-label="Opening the museum"
          role="status"
        >
          <div className="relative mb-8 flex h-24 w-20 items-center justify-center border border-accent/60">
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0, transformOrigin: 'top' }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: 0.12, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-y-0 left-0 w-1/2 origin-top border-r border-accent/40 bg-[#11100e]"
            />
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0, transformOrigin: 'top' }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: 0.12, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-y-0 right-0 w-1/2 origin-top bg-[#11100e]"
            />
            <span className="font-serif text-xl text-accent">A</span>
          </div>
          <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.3em] text-accent">
            Opening the museum <span className="ml-2 tabular-nums">{progress}%</span>
          </p>
          <div className="h-px w-36 overflow-hidden bg-white/10">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: shouldReduceMotion ? 0.05 : 0.72, ease: 'easeInOut' }}
              className="block h-full origin-left bg-accent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
