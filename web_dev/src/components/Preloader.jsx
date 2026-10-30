import React, { useLayoutEffect, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { hasIntroPlayed, setIntroPlayed } from '../utils/introState';
import { mockMovies } from '../data/mockMovies';

gsap.registerPlugin(CustomEase);

/**
 * CINEMATIC PRELOADER CONFIGURATION
 * Developers can tweak these parameters to fine-tune the intro feel.
 */
export const PRELOADER_CONFIG = {
  // Phase 1 (Logo & Reel)
  logoDuration: 1.70,          // Duration of line draw + wordmark letters + subtitle
  handoffDuration: 0.35,       // Duration of logo scale/fade out into Scene 2
  
  // Phase 2 (Scene 2 Cinematic Sweep & Genre Roll)
  projectorDuration: 1.05,     // Projector light beam sweep from left to right (x: -5vw -> 105vw)
  wordRollDuration: 0.18,      // Duration per genre word slide-up / slide-out
  cinemaHoldDuration: 0.30,    // Duration the final solid "CINEMA" holds
  posterRevealDuration: 0.35,  // Duration of bottom clip-path reveal for posters
  posterStagger: 0.08,         // Stagger delay between poster frame reveals
  
  // Phase 3 (Exit Curtain)
  curtainDuration: 0.75,       // Duration of the monolithic curtain wipe up (translateY 0 -> -100%)
  overlapOffset: 0.30,         // Seconds before curtain finish to trigger hero entrance (headline & navbar)

  // Visual Knobs
  grainOpacity: 0.06,          // Film grain noise opacity (subtle, 0.06)
  
  // Content
  genreWords: ['SCI-FI', 'ACTION', 'DRAMA', 'THRILLER', 'ANIMATION'],
  finalWord: 'CINEMA',
};

// Fallback / preloaded movie posters for Stage 4
const PRELOADER_POSTERS = [
  {
    title: mockMovies[0]?.title || 'Dune: Part Two',
    posterUrl: mockMovies[0]?.posterUrl,
    frame: 'FRM 001',
    offsetY: '-18px'
  },
  {
    title: mockMovies[1]?.title || 'Interstellar',
    posterUrl: mockMovies[1]?.posterUrl,
    frame: 'FRM 007',
    offsetY: '18px'
  },
  {
    title: mockMovies[2]?.title || 'Blade Runner 2049',
    posterUrl: mockMovies[2]?.posterUrl,
    frame: 'FRM 014',
    offsetY: '-10px'
  },
  {
    title: mockMovies[3]?.title || 'Oppenheimer',
    posterUrl: mockMovies[3]?.posterUrl,
    frame: 'FRM 024',
    offsetY: '14px'
  }
];

export default function Preloader({ onIntroOverlap, onIntroComplete, heroImageUrl }) {
  const overlayRef = useRef(null);

  // HUD Elements
  const hudTopRef = useRef(null);
  const topLeftLabelRef = useRef(null);
  const hudBottomRef = useRef(null);
  const counterRef = useRef(null);
  const bottomRightLabelRef = useRef(null);
  const progressLineRef = useRef(null);

  // Scene 1: Logo & Reel
  const centerContentRef = useRef(null);
  const maskWrapperRef = useRef(null);
  const lineRef = useRef(null);
  const perfRef = useRef(null);
  const reelRef = useRef(null);
  const lettersRef = useRef([]);
  const subtitleRef = useRef(null);

  // Scene 2: Projector sweep, film grain, word roll, poster frames
  const scene2ContainerRef = useRef(null);
  const projectorSweepRef = useRef(null);
  const filmGrainRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const genreWordRefs = useRef([]);
  const cinemaWordRef = useRef(null);
  const postersContainerRef = useRef(null);
  const posterFrameRefs = useRef([]);

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

  // Remove the initial zero-JS HTML boot-loader overlay once React mounts
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

    // Clean, fast monolithic curtain wipe up
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

    // Respect prefers-reduced-motion: skip intro & go straight to a 0.4s fade
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      isCompletedRef.current = true;
      onIntroOverlapRef.current?.();
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          setIntroPlayed(true);
          onIntroCompleteRef.current?.();
        }
      });
      return;
    }

    // Register custom cinematic curtain ease
    try {
      CustomEase.create('curtainExit', '0.76, 0, 0.24, 1');
    } catch (e) {
      // Fallback or already registered
    }

    // Preload hero image in background so it renders instantly when curtain lifts
    if (heroImageUrl && typeof window !== 'undefined') {
      const img = new Image();
      img.src = heroImageUrl;
      if (img.decode) img.decode().catch(() => {});
    }

    const {
      logoDuration,
      handoffDuration,
      projectorDuration,
      wordRollDuration,
      cinemaHoldDuration,
      posterRevealDuration,
      posterStagger,
      curtainDuration,
      overlapOffset,
      grainOpacity,
      genreWords,
    } = PRELOADER_CONFIG;

    // Timeline Timestamps Setup (Total sequence ~3.85s)
    const tScene1Start = 0.0;
    const tScene2Start = logoDuration;                                             // ~1.70s
    const tSweepStart = tScene2Start + 0.05;                                       // ~1.75s
    const tRollStart = tScene2Start + 0.15;                                        // ~1.85s
    const tPostersStart = tRollStart + (wordRollDuration * 2);                     // ~2.21s
    const tCinemaStart = tRollStart + (genreWords.length * wordRollDuration);      // ~2.75s
    const tScene2Exit = tCinemaStart + cinemaHoldDuration;                         // ~3.05s
    const tCurtainStart = tScene2Exit + 0.05;                                      // ~3.10s
    const tHeroTrigger = tCurtainStart + curtainDuration - overlapOffset;          // ~3.55s

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          isCompletedRef.current = true;
          setIntroPlayed(true);
          onIntroCompleteRef.current?.();
        }
      });
      timelineRef.current = tl;

      // -------------------------------------------------------------
      // 0. INITIAL ZERO-STATE SETUP
      // -------------------------------------------------------------
      // Scene 1
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'center center' });
      gsap.set(perfRef.current, { opacity: 0 });
      gsap.set(lettersRef.current, { yPercent: 120, opacity: 0 });
      gsap.set(reelRef.current, { rotate: 0, scale: 0.6, opacity: 0, transformOrigin: '50% 50%' });
      gsap.set(subtitleRef.current, { opacity: 0, letterSpacing: '0.5em', y: 6 });
      gsap.set(maskWrapperRef.current, { overflow: 'hidden' });
      gsap.set(progressLineRef.current, { scaleX: 0, transformOrigin: 'left center' });

      // Scene 2
      gsap.set(scene2ContainerRef.current, { opacity: 0 });
      gsap.set(projectorSweepRef.current, { x: '-30vw', opacity: 0 });
      gsap.set(filmGrainRef.current, { opacity: 0 });
      genreWordRefs.current.forEach(el => el && gsap.set(el, { yPercent: 120, opacity: 0 }));
      gsap.set(cinemaWordRef.current, { yPercent: 120, opacity: 0 });
      posterFrameRefs.current.forEach(el => el && gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0, scale: 0.94 }));

      // -------------------------------------------------------------
      // 1. MASTER PROGRESS COUNTER & BOTTOM PROGRESS LINE (0 -> 100%)
      // -------------------------------------------------------------
      const counterProgress = { val: 0 };
      tl.to(counterProgress, {
        val: 100,
        duration: tScene2Exit,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(counterProgress.val)).padStart(3, '0') + '%';
          }
        }
      }, tScene1Start);

      tl.to(progressLineRef.current, {
        scaleX: 1,
        duration: tScene2Exit,
        ease: 'power1.inOut'
      }, tScene1Start);

      // -------------------------------------------------------------
      // 2. SCENE 1: LOGO & FILM REEL SEQUENCE
      // -------------------------------------------------------------
      // Thin white horizontal line draws from center
      tl.to(lineRef.current, {
        scaleX: 1,
        duration: 0.45,
        ease: 'power2.out'
      }, 0.0);

      // Tiny film-strip perforations fade in along the line
      tl.to(perfRef.current, {
        opacity: 0.6,
        duration: 0.35,
        ease: 'power1.out'
      }, 0.1);

      // Wordmark letters slide up one by one
      tl.to(lettersRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.04,
        ease: 'power3.out'
      }, 0.15);

      // Film reel rotates 360deg and scales into the 'o'
      tl.to(reelRef.current, {
        rotate: 360,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out'
      }, 0.15);

      // "ENTERTAINMENT" subtitle reveals with letter-spacing tightening
      tl.to(subtitleRef.current, {
        opacity: 1,
        letterSpacing: '0.32em',
        y: 0,
        duration: 0.65,
        ease: 'power2.out'
      }, 0.45);

      tl.set(maskWrapperRef.current, {
        overflow: 'visible'
      }, 0.95);

      // -------------------------------------------------------------
      // 3. SCENE 2 - STAGE 1: LOGO HAND-OFF (No black gap)
      // -------------------------------------------------------------
      // Logo and perforated line scale down and fade out
      tl.to(centerContentRef.current, {
        opacity: 0,
        scale: 0.92,
        duration: handoffDuration,
        ease: 'power2.in'
      }, tScene2Start);

      // Scene 2 container activates concurrently
      tl.to(scene2ContainerRef.current, {
        opacity: 1,
        duration: handoffDuration,
        ease: 'power2.out'
      }, tScene2Start + 0.05);

      // -------------------------------------------------------------
      // 4. SCENE 2 - STAGE 2: PROJECTOR SWEEP + FILM GRAIN & FLICKER
      // -------------------------------------------------------------
      // Vertical light line + soft white gradient trail sweeps across the screen
      tl.set(projectorSweepRef.current, { opacity: 1 }, tSweepStart);
      tl.to(projectorSweepRef.current, {
        x: '105vw',
        duration: projectorDuration,
        ease: 'power2.inOut'
      }, tSweepStart);

      // Film grain overlay reveals softly behind the sweep
      tl.to(filmGrainRef.current, {
        opacity: grainOpacity,
        duration: 0.35,
        ease: 'power1.out'
      }, tSweepStart + 0.08);

      // -------------------------------------------------------------
      // 5. SCENE 2 - STAGE 3: GENRE WORD ROLL & CORNER HUD SYNC
      // -------------------------------------------------------------
      // Sync Top-Left HUD label -> "NOW LOADING"
      tl.add(() => {
        if (topLeftLabelRef.current) {
          topLeftLabelRef.current.textContent = 'NOW LOADING';
        }
      }, tRollStart);

      // Sync Bottom-Right HUD label -> "FRAME 001/024" counting quickly to 024
      const frameCounter = { f: 1 };
      tl.to(frameCounter, {
        f: 24,
        duration: tScene2Exit - tRollStart,
        ease: 'power1.inOut',
        onUpdate: () => {
          if (bottomRightLabelRef.current) {
            bottomRightLabelRef.current.textContent = `FRAME ${String(Math.round(frameCounter.f)).padStart(3, '0')}/024`;
          }
        }
      }, tRollStart);

      // Word Roll: SCI-FI, ACTION, DRAMA, THRILLER, ANIMATION
      genreWords.forEach((word, idx) => {
        const el = genreWordRefs.current[idx];
        if (!el) return;
        const wStart = tRollStart + (idx * wordRollDuration);

        // Slide up into view from bottom mask
        tl.to(el, {
          yPercent: 0,
          opacity: 1,
          duration: wordRollDuration * 0.9,
          ease: 'power2.out'
        }, wStart);

        // Slide up and out toward top
        tl.to(el, {
          yPercent: -120,
          opacity: 0,
          duration: wordRollDuration * 0.85,
          ease: 'power2.in'
        }, wStart + wordRollDuration);
      });

      // Final Word: "CINEMA" in solid white
      tl.to(cinemaWordRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.22,
        ease: 'power3.out'
      }, tCinemaStart);

      // -------------------------------------------------------------
      // 6. SCENE 2 - STAGE 4: POSTER FRAMES FLASH (Clip-path bottom reveal)
      // -------------------------------------------------------------
      const activePosters = posterFrameRefs.current.filter(Boolean);
      tl.to(activePosters, {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 0.85,
        scale: 1,
        duration: posterRevealDuration,
        stagger: posterStagger,
        ease: 'power2.out'
      }, tPostersStart);

      // Poster frames slide up together out of view
      tl.to(activePosters, {
        yPercent: -50,
        opacity: 0,
        duration: 0.26,
        ease: 'power2.in'
      }, tCinemaStart + 0.12);

      // -------------------------------------------------------------
      // 7. SCENE 2 - STAGE 5: EXIT INTO THE HERO
      // -------------------------------------------------------------
      // Everything inside the preloader fades out quickly as counter hits 100%
      tl.to([
        scene2ContainerRef.current,
        hudTopRef.current,
        hudBottomRef.current,
        progressLineRef.current
      ], {
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in'
      }, tScene2Exit);

      // Black overlay slides up as ONE monolithic block
      tl.to(overlayRef.current, {
        yPercent: -100,
        duration: curtainDuration,
        ease: 'curtainExit'
      }, tCurtainStart);

      // Overlap by 0.30s: Trigger hero entrance right before overlay finishes lifting
      tl.add(() => {
        onIntroOverlapRef.current?.();
      }, tHeroTrigger);

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
      className="fixed inset-0 bg-black z-[9999] flex flex-col justify-center items-center pointer-events-auto select-none overflow-hidden"
    >
      {/* ========================================================= */}
      {/* TOP HUD ROW: Archive status & Skip button                 */}
      {/* ========================================================= */}
      <div 
        ref={hudTopRef} 
        className="absolute top-0 left-0 right-0 p-6 sm:p-10 flex items-center justify-between w-full pointer-events-auto z-40"
      >
        <div className="flex items-center space-x-2 text-[10px] font-mono tracking-[0.25em] text-[#8a8a8a] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span ref={topLeftLabelRef}>ARCHIVE SYSTEM</span>
        </div>

        <button
          onClick={handleSkip}
          className="text-[11px] font-mono tracking-[0.25em] text-[#8a8a8a] hover:text-white uppercase transition-colors px-2 py-1 underline-offset-4 hover:underline cursor-pointer"
          aria-label="Skip Introduction"
        >
          SKIP [ESC]
        </button>
      </div>

      {/* ========================================================= */}
      {/* SCENE 1: WORDMARK LOGO & FILM REEL                        */}
      {/* ========================================================= */}
      <div 
        ref={centerContentRef} 
        className="flex flex-col items-center justify-center my-auto w-full z-20 px-6 sm:px-10"
      >
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

      {/* ========================================================= */}
      {/* SCENE 2: CINEMATIC PROJECTOR SWEEP, WORD ROLL & POSTERS   */}
      {/* ========================================================= */}
      <div 
        ref={scene2ContainerRef} 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 overflow-hidden"
      >
        {/* Subtle Film Grain Noise Overlay with Steps Animation */}
        <div 
          ref={filmGrainRef} 
          className="absolute inset-0 pointer-events-none preloader-noise-layer animate-projector-flicker z-10"
        />

        {/* Vertical Projector Sweep Beam + Soft White Gradient Trail */}
        <div 
          ref={projectorSweepRef} 
          className="absolute inset-y-0 pointer-events-none flex items-stretch z-25"
          style={{ width: '25vw' }}
        >
          {/* Soft White Trail (Trailing left behind the line) */}
          <div 
            className="w-[calc(100%-2px)] h-full"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.08) 100%)'
            }}
          />
          {/* Thin Vertical White Light Line */}
          <div 
            className="w-[2px] h-full bg-white shadow-[0_0_20px_2px_rgba(255,255,255,0.7)]" 
          />
        </div>

        {/* Stage 4: Movie Poster Frames Flash (Behind words, z-15) */}
        <div 
          ref={postersContainerRef} 
          className="absolute inset-0 pointer-events-none flex items-center justify-around px-4 sm:px-12 md:px-20 z-15"
        >
          {PRELOADER_POSTERS.map((poster, idx) => (
            <div
              key={poster.frame}
              ref={el => (posterFrameRefs.current[idx] = el)}
              className={`relative w-[28vw] sm:w-[18vw] md:w-[13vw] max-w-[140px] aspect-[2/3] border border-white/20 bg-[#0a0a0a] overflow-hidden shadow-2xl ${
                idx >= 2 ? 'hidden sm:block' : 'block'
              }`}
              style={{
                transform: `translateY(${poster.offsetY})`,
              }}
            >
              {/* Poster Image (Grayscale with high contrast) */}
              {poster.posterUrl ? (
                <img 
                  src={poster.posterUrl} 
                  alt={poster.title}
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-80"
                  loading="eager"
                  onError={(e) => {
                    // Fallback to bordered frame if image network request drops
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}

              {/* Film Frame Metadata Tag */}
              <div className="absolute bottom-0 inset-x-0 bg-black/85 backdrop-blur-xs border-t border-white/10 px-1.5 py-1 flex items-center justify-between">
                <span className="font-mono text-[7px] tracking-widest text-white/70 uppercase">{poster.frame}</span>
                <span className="font-mono text-[6px] tracking-wider text-[#8a8a8a] uppercase truncate max-w-[65px]">{poster.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stage 3: Center Genre Word Roll (z-20) */}
        <div 
          ref={wordsContainerRef}
          className="relative h-20 sm:h-28 md:h-36 overflow-hidden flex items-center justify-center w-full z-20 px-4"
        >
          {/* Rolling Outline Genre Words */}
          {PRELOADER_CONFIG.genreWords.map((word, idx) => (
            <span
              key={word}
              ref={el => (genreWordRefs.current[idx] = el)}
              className="absolute font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.24em] uppercase text-transparent select-none whitespace-nowrap"
              style={{
                WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.85)',
              }}
            >
              {word}
            </span>
          ))}

          {/* Final Solid White "CINEMA" Word */}
          <span
            ref={cinemaWordRef}
            className="absolute font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.28em] uppercase text-white select-none whitespace-nowrap"
          >
            {PRELOADER_CONFIG.finalWord}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HUD ROW: SYS_LOAD & Calibrating Frame Counter      */}
      {/* ========================================================= */}
      <div 
        ref={hudBottomRef}
        className="absolute bottom-4 sm:bottom-6 left-0 right-0 px-6 sm:px-10 flex items-end justify-between w-full pointer-events-none z-40 font-mono"
      >
        {/* Bottom-Left: SYS_LOAD & Percentage Counter */}
        <div className="flex flex-col space-y-1">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#555555]">SYS_LOAD</span>
          <span 
            ref={counterRef} 
            className="text-xs sm:text-sm font-semibold tracking-widest text-[#8a8a8a]"
          >
            000%
          </span>
        </div>

        {/* Bottom-Right: Feed / Frame Calibration Indicator */}
        <div className="flex items-center space-x-2 text-[9px] sm:text-[10px] tracking-[0.25em] text-[#666666] uppercase">
          <span ref={bottomRightLabelRef}>CALIBRATING ARCHIVE FEED</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM PROGRESS LINE: Full-Width Thin Line                */}
      {/* ========================================================= */}
      <div 
        ref={progressLineRef} 
        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/40 z-45" 
      />

      {/* ========================================================= */}
      {/* EMBEDDED PROCEDURAL NOISE & FLICKER STYLES                */}
      {/* ========================================================= */}
      <style>{`
        @keyframes preloader-grain {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-3%, -2%); }
          40% { transform: translate(2%, 3%); }
          60% { transform: translate(-2%, 4%); }
          80% { transform: translate(3%, -3%); }
          100% { transform: translate(0, 0); }
        }

        .preloader-noise-layer {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: preloader-grain 0.22s steps(4) infinite;
        }

        @keyframes projector-flicker {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.96; }
          50% { opacity: 0.99; }
          75% { opacity: 0.95; }
        }

        .animate-projector-flicker {
          animation: projector-flicker 0.12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
