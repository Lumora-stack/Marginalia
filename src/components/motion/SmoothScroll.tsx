import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let active = true;
    let cleanup = () => {};
    void Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([lenisModule, gsapModule, scrollTriggerModule]) => {
      if (!active) return;
      const Lenis = lenisModule.default;
      const gsap = gsapModule.default;
      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.05,
        smoothWheel: true,
        touchMultiplier: 1.2,
      });
      const updateScrollTrigger = () => ScrollTrigger.update();
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', updateScrollTrigger);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      let hasHeroTimeline = false;
      let destroyHeroTimeline = () => {};
      const syncHeroTimeline = () => {
        const hasHero = document.querySelector('.hero-scene-layer') && document.querySelector('#home-hero');
        if (hasHero && !hasHeroTimeline) {
          const heroTimeline = gsap.to('.hero-scene-layer', {
            scale: 1.35,
            yPercent: 22,
            opacity: 0.18,
            ease: 'none',
            scrollTrigger: {
              trigger: '#home-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
          destroyHeroTimeline = () => {
            heroTimeline.scrollTrigger?.kill();
            heroTimeline.kill();
          };
          hasHeroTimeline = true;
        } else if (!hasHero && hasHeroTimeline) {
          destroyHeroTimeline();
          destroyHeroTimeline = () => {};
          hasHeroTimeline = false;
        }
      };
      const routeObserver = new MutationObserver(syncHeroTimeline);
      routeObserver.observe(document.body, { childList: true, subtree: true });
      syncHeroTimeline();

      cleanup = () => {
        routeObserver.disconnect();
        destroyHeroTimeline();
        lenis.off('scroll', updateScrollTrigger);
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    }).catch((error: unknown) => {
      if (active) console.error('Could not initialize smooth scrolling:', error);
    });

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  return null;
}
