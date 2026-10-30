import React, { useLayoutEffect, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { hasIntroPlayed, setIntroPlayed } from '../utils/introState';

gsap.registerPlugin(CustomEase);

export default function Preloader({ onIntroOverlap, onIntroComplete, heroImageUrl }) {
  const overlayRef = useRef(null);
  const hudTopRef = useRef(null);
  const centerContentRef = useRef(null);
  const maskWrapperRef = useRef(null);
  const lineRef = useRef(null);
  const perfRef = useRef(null);
  const reelRef = useRef(null);
  const lettersRef = useRef([]);
  const subtitleRef = useRef(null);

  const timelineRef = useRef(null);
  const isExitingRef = useRef(false);
  const isCompletedRef = useRef(false);

  // Stable callback refs so changing parent references never restart effect
  const onIntroOverlapRef = useRef(onIntroOverlap);
  const onIntroCompleteRef = useRef(onIntroComplete);

  useEffect(() => {
    onIntroOverlapRef.current = onIntroOverlap;
    onIntroCompleteRef.current = onIntroComplete;
  });

  // Remove the initial HTML boot-loader overlay once React Preloader takes over
  useLayoutEffect(() => {
    const bootLoader = document.getElementById('boot-loader');
    if (bootLoader) {
      bootLoader.remove();
    }
  }, []);

  // Safe Skip function (via Click or ESC key)
  const handleSkip = () => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    isCompletedRef.current = true;

    // Trigger hero entrance immediately
    onIntroOverlapRef.current?.();

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Clean, fast wipe up
    gsap.to(overlayRef.current, {
      yPercent: -100,
      duration: 0.35,
      ease: 'power3.inOut',
      onComplete: () => {
        setIntroPlayed(true);
        onIntroCompleteRef.current?.();
      }
    });
  };

  // Keyboard listener for ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Primary Intro Sequence
  useLayoutEffect(() => {
    // If intro already played in this runtime (e.g. SPA route change), exit immediately
    if (hasIntroPlayed()) {
      onIntroOverlapRef.current?.();
      onIntroCompleteRef.current?.();
      return;
    }

    // Mark intro as started in module state
    setIntroPlayed(true);

    // Respect prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      isCompletedRef.current = true;
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        onStart: () => onIntroOverlapRef.current?.(),
        onComplete: () => {
          setIntroPlayed(true);
          onIntroCompleteRef.current?.();
        }
      });
      return;
    }

    // Register custom cinematic ease
    try {
      CustomEase.create('curtainExit', '0.76, 0, 0.24, 1');
    } catch (e) {
      // Fallback or already registered
    }

    // Background preloading of hero image & fonts
    if (heroImageUrl && typeof window !== 'undefined') {
      const img = new Image();
      img.src = heroImageUrl;
      if (img.decode) img.decode().catch(() => {});
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          isCompletedRef.current = true;
          setIntroPlayed(true);
          onIntroCompleteRef.current?.();
        }
      });
      timelineRef.current = tl;

      // 1. Initial State Setup
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'center center' });
      gsap.set(perfRef.current, { opacity: 0 });
      gsap.set(lettersRef.current, { yPercent: 120, opacity: 0 });
      gsap.set(reelRef.current, { rotate: 0, scale: 0.6, opacity: 0, transformOrigin: '50% 50%' });
      gsap.set(subtitleRef.current, { opacity: 0, letterSpacing: '0.5em', y: 6 });
      gsap.set(maskWrapperRef.current, { overflow: 'hidden' });

      // 2. 0.0s: Thin white horizontal line draws from center
      tl.to(lineRef.current, {
        scaleX: 1,
        duration: 0.5,
        ease: 'power2.out'
      }, 0);

      tl.to(perfRef.current, {
        opacity: 0.6,
        duration: 0.35,
        ease: 'power1.out'
      }, 0.1);

      // 3. 0.15s: Logo reveals within 0.2s of intro start
      // Letters slide up from mask
      tl.to(lettersRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.04,
        ease: 'power3.out'
      }, 0.15);

      // Film reel rotates 360deg and scales to 1 with zero y-jump
      tl.to(reelRef.current, {
        rotate: 360,
        scale: 1,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out'
      }, 0.15);

      // 4. 0.45s: "ENTERTAINMENT" subtitle reveals with letter-spacing tightening
      tl.to(subtitleRef.current, {
        opacity: 1,
        letterSpacing: '0.32em',
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, 0.45);

      // 5. 0.95s: Remove mask overflow clip so descenders/bottoms are never clipped
      tl.set(maskWrapperRef.current, {
        overflow: 'visible'
      }, 0.95);

      // 6. 2.1s: Exit Step 1 - Logo & top HUD fade out and scale down slightly
      tl.to([centerContentRef.current, hudTopRef.current], {
        opacity: 0,
        scale: 0.96,
        duration: 0.35,
        ease: 'power2.in'
      }, 2.1);

      // 7. 2.4s: Exit Step 2 - Black loader moves up as a single monolithic block
      tl.to(overlayRef.current, {
        yPercent: -100,
        duration: 0.75,
        ease: 'curtainExit'
      }, 2.4);

      // Overlap by 0.3s: Right as loader starts moving, begin hero entrance
      tl.add(() => {
        onIntroOverlapRef.current?.();
      }, 2.4);

    }, overlayRef);

    return () => {
      ctx.revert();
      // If unmounted before completing (React StrictMode initial dev simulation), allow Mount 2
      if (!isCompletedRef.current) {
        setIntroPlayed(false);
      }
    };
  }, []);

  return (
    <div 
      id="preloader-overlay"
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 9999,
      }}
      className="fixed inset-0 bg-black z-[9999] flex flex-col justify-center items-center p-6 sm:p-10 pointer-events-auto select-none overflow-hidden"
    >
      {/* Top HUD Row: Minimal Skip & System Indicator */}
      <div 
        ref={hudTopRef} 
        className="absolute top-0 left-0 right-0 p-6 sm:p-10 flex items-center justify-between w-full pointer-events-auto"
      >
        <div className="flex items-center space-x-2 text-[10px] font-mono tracking-[0.25em] text-[#666666] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span>ARCHIVE SYSTEM</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-[11px] font-mono tracking-[0.25em] text-[#8a8a8a] hover:text-white uppercase transition-colors px-2 py-1 underline-offset-4 hover:underline"
          aria-label="Skip Introduction"
        >
          SKIP [ESC]
        </button>
      </div>

      {/* Center Reveal: Horizontal Perforation Line & Masked Wordmark Logo */}
      <div ref={centerContentRef} className="flex flex-col items-center justify-center my-auto w-full">
        
        {/* Wordmark Container with Mask Wrapper */}
        <div 
          ref={maskWrapperRef} 
          className="relative flex items-center justify-center overflow-hidden py-1 px-4"
          style={{ lineHeight: 1.1, paddingBottom: '0.25em' }}
        >
          <div className="flex items-center space-x-1 sm:space-x-1.5 leading-none">
            {/* Letter 'm' */}
            <span 
              ref={(el) => (lettersRef.current[0] = el)} 
              className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white lowercase inline-block"
            >
              m
            </span>

            {/* Film-Reel as 'o' (Inline, baseline-aligned, zero y-jump) */}
            <div 
              ref={reelRef}
              className="relative mx-1 inline-flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 self-center shrink-0"
              style={{ transformOrigin: '50% 50%' }}
            >
              <svg viewBox="0 0 32 32" className="w-full h-full text-white block" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2.5" opacity="0.6" />
                <circle cx="16" cy="16" r="4.5" fill="currentColor" />
                <circle cx="16" cy="16" r="2" fill="#000000" />
                <circle cx="16" cy="7.5" r="2" fill="currentColor" />
                <circle cx="16" cy="24.5" r="2" fill="currentColor" />
                <circle cx="7.5" cy="16" r="2" fill="currentColor" />
                <circle cx="24.5" cy="16" r="2" fill="currentColor" />
                <line x1="16" y1="4.5" x2="16" y2="11.5" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                <line x1="16" y1="20.5" x2="16" y2="27.5" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                <line x1="4.5" y1="16" x2="11.5" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.8" />
                <line x1="20.5" y1="16" x2="27.5" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.8" />
              </svg>
            </div>

            {/* Letter 'v' */}
            <span 
              ref={(el) => (lettersRef.current[1] = el)} 
              className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white lowercase inline-block"
            >
              v
            </span>

            {/* Letter 'i' */}
            <span 
              ref={(el) => (lettersRef.current[2] = el)} 
              className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white lowercase inline-block"
            >
              i
            </span>

            {/* Letter 'e' */}
            <span 
              ref={(el) => (lettersRef.current[3] = el)} 
              className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white lowercase inline-block"
            >
              e
            </span>
          </div>
        </div>

        {/* Subtitle: E N T E R T A I N M E N T */}
        <div 
          ref={subtitleRef} 
          className="text-[9px] sm:text-[11px] font-semibold tracking-[0.32em] text-[#8a8a8a] uppercase mt-2 select-none"
        >
          ENTERTAINMENT
        </div>

        {/* Thin Horizontal Drawing Line with Film-Strip Perforations */}
        <div className="relative w-full max-w-md mx-auto my-6 flex items-center justify-center">
          <div 
            ref={lineRef} 
            className="w-full h-[1px] bg-white/40" 
          />
          <div 
            ref={perfRef} 
            className="absolute inset-x-0 flex justify-between items-center px-2 pointer-events-none"
          >
            {[...Array(9)].map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 bg-white/30 rounded-xs" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
