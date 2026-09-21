import { motion, useScroll } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[9998] origin-left pointer-events-none transform-gpu will-change-transform"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
