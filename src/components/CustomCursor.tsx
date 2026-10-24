import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useQuality } from '../lib/quality-context';
import { qualityAtLeast } from '../lib/quality-types';

type TrailParticle = { x: number; y: number; life: number; vx: number; vy: number };

export default function CustomCursor() {
  const { tier } = useQuality();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorText, setCursorText] = useState('');

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -100, y: -100 });
  const particlesRef = useRef<TrailParticle[]>([]);

  const springConfig = { damping: 25, stiffness: 350 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Only enable on desktop non-touch devices
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const dragTarget = target.closest('[data-cursor="drag"]');
      const viewTarget = target.closest('.cursor-zoom-in');
      const interactive = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer, .cursor-zoom-in, [data-cursor]');
      if (interactive) {
        setIsHovered(true);
        setCursorText(dragTarget ? 'DRAG' : viewTarget ? 'VIEW' : '');
      } else {
        setIsHovered(false);
        setCursorText('');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  useEffect(() => {
    if (!isVisible || !qualityAtLeast(tier, 'medium')) return;
    const canvas = trailCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    let frame = 0;
    let previous = { ...pointerRef.current };
    let lastSpark = 0;
    const paint = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const pointer = pointerRef.current;
      const distance = Math.hypot(pointer.x - previous.x, pointer.y - previous.y);
      if (distance > 2) {
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.lineTo(pointer.x, pointer.y);
        context.strokeStyle = 'rgba(234, 194, 84, 0.34)';
        context.lineWidth = tier === 'ultra' ? 5 : 3;
        context.lineCap = 'round';
        context.shadowColor = 'rgba(234, 194, 84, 0.85)';
        context.shadowBlur = tier === 'ultra' ? 24 : 14;
        context.stroke();
        context.shadowBlur = 0;
        if (tier === 'ultra' && distance > 18 && performance.now() - lastSpark > 35) {
          particlesRef.current.push({
            x: pointer.x,
            y: pointer.y,
            vx: (Math.random() - 0.5) * 2.8,
            vy: (Math.random() - 0.5) * 2.8,
            life: 1,
          });
          lastSpark = performance.now();
        }
      }
      previous = { ...pointer };
      particlesRef.current = particlesRef.current.filter(particle => particle.life > 0.04);
      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.035;
        particle.life *= 0.94;
        context.globalAlpha = particle.life;
        context.fillStyle = '#ffe7a1';
        context.shadowColor = '#eac254';
        context.shadowBlur = 12;
        context.beginPath();
        context.arc(particle.x, particle.y, 1.8 * particle.life, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      frame = requestAnimationFrame(paint);
    };
    const spark = (event: MouseEvent) => {
      if (!qualityAtLeast(tier, 'high')) return;
      for (let index = 0; index < 16; index++) {
        const angle = (Math.PI * 2 * index) / 16;
        const speed = 1 + Math.random() * 3.5;
        particlesRef.current.push({
          x: event.clientX,
          y: event.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
        });
      }
    };
    window.addEventListener('resize', resize);
    window.addEventListener('click', spark);
    frame = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('click', spark);
      particlesRef.current = [];
    };
  }, [isVisible, tier]);

  if (!isVisible) return null;

  return (
    <>
      {qualityAtLeast(tier, 'medium') && (
        <canvas ref={trailCanvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[99997]" />
      )}
      {/* Follower Dot / Bubble */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/80 flex items-center justify-center font-mono text-[9px] tracking-widest text-accent font-bold mix-blend-difference"
        style={{
          x,
          y,
          width: isHovered ? 52 : 12,
          height: isHovered ? 52 : 12,
          backgroundColor: isHovered ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.45)',
          backdropFilter: isHovered ? 'blur(3px)' : 'none',
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), height 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease',
        }}
      >
        {cursorText}
      </motion.div>
    </>
  );
}
