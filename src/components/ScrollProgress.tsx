import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-[9998] origin-left pointer-events-none"
      style={{ scaleX }}
    />
  );
}
