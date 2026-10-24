import { useEffect, useRef } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useQuality } from '../../lib/quality-context';
import { useMuseumSound } from '../../lib/sound-context';

const FAILSAFE_MS = 1500;

export default function RouteWipe() {
  const { pathname } = useLocation();
  const { tier } = useQuality();
  const previousPath = useRef(pathname);
  const sound = useMuseumSound();
  const playSound = useRef(sound.play);
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    playSound.current = sound.play;
  }, [sound.play]);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    if (tier === 'low' || reducedMotion) return;

    playSound.current('whoosh');
    controls.stop();
    controls.set({ scaleY: 0, transformOrigin: 'center' });

    let finished = false;
    const timeout = window.setTimeout(() => {
      finished = true;
      controls.stop();
      controls.set({ scaleY: 0 });
    }, FAILSAFE_MS);

    void controls.start({
      scaleY: [0, 1, 1, 0],
      transition: {
        duration: 0.9,
        times: [0, 0.38, 0.48, 1],
        ease: [0.76, 0, 0.24, 1],
      },
    }).then(() => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      controls.set({ scaleY: 0 });
    });

    return () => {
      finished = true;
      window.clearTimeout(timeout);
      controls.stop();
      controls.set({ scaleY: 0 });
    };
  }, [controls, pathname, reducedMotion, tier]);

  if (tier === 'low' || reducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      initial={{ scaleY: 0 }}
      animate={controls}
      className="route-gold-curtain pointer-events-none fixed inset-0 z-[10000]"
      style={{ transformOrigin: 'center' }}
    />
  );
}
