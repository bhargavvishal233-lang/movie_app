// Shared Cinematic Animation Utilities & Motion Variants
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CINEMATIC_EASE = [0.22, 1, 0.36, 1];
export const GSAP_CINEMATIC_EASE = 'power3.out';

let globalLenis = null;
let rafTickerHandler = null;

export const getLenis = () => globalLenis;

export const stopScroll = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  if (globalLenis) {
    globalLenis.stop();
  }
};

export const startScroll = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
  if (globalLenis) {
    globalLenis.start();
  }
};

export const refreshScroll = () => {
  if (globalLenis) {
    globalLenis.resize();
  }
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
};

export const scrollToTop = () => {
  if (globalLenis) {
    globalLenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  } else if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

export const initSmoothScroll = () => {
  // Check for reduced motion preference
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return { destroy: () => {} };

  // Destroy any existing instance before initializing a new one
  if (globalLenis) {
    if (rafTickerHandler) {
      gsap.ticker.remove(rafTickerHandler);
      rafTickerHandler = null;
    }
    globalLenis.destroy();
    globalLenis = null;
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
  });

  globalLenis = lenis;

  // Synchronize Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  rafTickerHandler = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(rafTickerHandler);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy: () => {
      if (rafTickerHandler) {
        gsap.ticker.remove(rafTickerHandler);
        rafTickerHandler = null;
      }
      lenis.destroy();
      if (globalLenis === lenis) {
        globalLenis = null;
      }
    }
  };
};

// Masked Slide-up for Headlines
export const maskedRevealVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: (custom = 0) => ({
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.85,
      delay: custom * 0.1,
      ease: CINEMATIC_EASE,
    }
  })
};

// Fade & Subtle Slide
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      delay: custom * 0.08,
      ease: CINEMATIC_EASE,
    }
  })
};

// Staggered Container
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};
