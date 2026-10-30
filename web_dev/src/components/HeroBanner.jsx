import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Play, Info, Heart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useIntro } from '../context/IntroContext';
import { CINEMATIC_EASE, GSAP_CINEMATIC_EASE } from '../utils/animations';

gsap.registerPlugin(ScrollTrigger);

// Reusable Magnetic Hover Container (Moves up to 8px toward cursor)
function MagneticHover({ children, strength = 0.22, className = '' }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) * strength;
    const y = (clientY - (rect.top + rect.height / 2)) * strength;
    setPos({ x: Math.max(-8, Math.min(8, x)), y: Math.max(-8, Math.min(8, y)) });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.5 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function HeroBanner({ 
  movie, 
  onPlayTrailer, 
  onOpenDetails, 
  isWatchlisted, 
  onToggleWatchlist 
}) {
  const { introDone } = useIntro();

  const heroContainerRef = useRef(null);
  const bgImageRef = useRef(null);
  const titleContainerRef = useRef(null);
  const lastMovieIdRef = useRef(null);

  const [matchCount, setMatchCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  // Split title words for line-by-line masked slide-up
  const titleWords = (movie?.title || '').split(' ');

  // GSAP Entrance & Parallax Timeline
  useLayoutEffect(() => {
    if (!introDone || !movie) return;

    const isInitialRun = lastMovieIdRef.current === null;
    const isMovieSwitch = lastMovieIdRef.current !== null && lastMovieIdRef.current !== movie.id;
    lastMovieIdRef.current = movie.id;

    const ctx = gsap.context(() => {
      // 1. Ken Burns background scaling
      if (bgImageRef.current) {
        // Slow Ken Burns over 8s (scale 1.12 to 1.0)
        gsap.fromTo(bgImageRef.current,
          { scale: 1.12 },
          { scale: 1.0, duration: 8, ease: 'power1.out' }
        );
      }

      const tl = gsap.timeline();

      // 2. Headline words masked slide-up
      const words = titleContainerRef.current?.querySelectorAll('.hero-title-word');
      if (words && words.length > 0) {
        tl.fromTo(words, 
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.05, ease: GSAP_CINEMATIC_EASE },
          isInitialRun ? 0.05 : 0.0
        );
      }

      // 3. Stats counting up
      const statsObj = { match: 0, rating: 0 };
      tl.to(statsObj, {
        match: movie.matchScore || 95,
        rating: movie.rating || 8.5,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          setMatchCount(Math.round(statsObj.match));
          setRatingCount(Number(statsObj.rating.toFixed(1)));
        }
      }, 0.1);

      // 4. Tags & synopsis rise (fade + 12px rise)
      const textElems = heroContainerRef.current?.querySelectorAll('.hero-text-elem');
      if (textElems && textElems.length > 0) {
        tl.fromTo(textElems,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: GSAP_CINEMATIC_EASE },
          0.2
        );
      }

      // 5. Buttons scale in from 0.9 with stagger
      const buttonElems = heroContainerRef.current?.querySelectorAll('.hero-btn-elem');
      if (buttonElems && buttonElems.length > 0) {
        tl.fromTo(buttonElems,
          { opacity: 0, scale: 0.9, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.65, stagger: 0.08, ease: GSAP_CINEMATIC_EASE },
          0.35
        );
      }

      // 6. Bottom label ("FOUND SIMILARITY ENGINE") fades in
      const engineLabel = heroContainerRef.current?.querySelector('.hero-engine-label');
      if (engineLabel) {
        tl.fromTo(engineLabel,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          0.5
        );
      }
    }, heroContainerRef);

    return () => ctx.revert();
  }, [introDone, movie?.id]);

  if (!movie) {
    return (
      <div 
        id="hero-skeleton" 
        className="relative w-full overflow-hidden mb-16 border-b border-white/10 pt-[var(--nav-h)] min-h-[100svh] min-h-screen flex flex-col justify-end pb-12 bg-black"
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 animate-pulse">
          <div className="w-36 h-5 bg-white/10 rounded" />
          <div className="w-2/3 max-w-2xl h-14 bg-white/10 rounded" />
          <div className="w-1/2 max-w-md h-4 bg-white/5 rounded" />
          <div className="flex gap-4 pt-4">
            <div className="w-36 h-12 bg-white/15 rounded-full" />
            <div className="w-36 h-12 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="hero-banner"
      ref={heroContainerRef}
      style={{ 
        opacity: introDone ? 1 : 0, 
        transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)' 
      }}
      className="relative w-full overflow-hidden mb-16 border-b border-white/10 pt-[var(--nav-h)] min-h-[100svh] min-h-screen flex flex-col justify-end pb-12 select-none"
    >
      {/* Full-Bleed Background Poster with Ken Burns & Scroll Parallax */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div 
          ref={bgImageRef}
          className="w-full h-full bg-cover bg-center object-cover will-change-transform"
          style={{ 
            backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'grayscale(55%) brightness(0.40)'
          }}
        />
        
        {/* Editorial Deep Black Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent w-full md:w-3/4 h-full" />
        
        {/* Subtle Horizontal Guide Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.04] pointer-events-none" />
      </div>

      {/* Hero Content Section */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Metadata Badges & Live Stats Counter */}
        <div className="hero-text-elem flex flex-wrap items-center gap-3 mb-4">
          <span className="label-caps px-2.5 py-1 border border-white/20 bg-black/60 rounded-sm text-white">
            FEATURED ARCHIVE
          </span>
          <span className="label-caps text-[#8a8a8a]">
            {movie.year}
          </span>
          <span className="text-[#555555]">•</span>
          <span className="label-caps text-[#8a8a8a]">
            {movie.duration}
          </span>
          <span className="text-[#555555]">•</span>
          <span className="label-caps text-white font-mono">
            ★ {ratingCount > 0 ? ratingCount : '0.0'}
          </span>
          <span className="text-[#555555]">•</span>
          <span className="label-caps text-white font-mono">
            {matchCount}% MATCH
          </span>
        </div>

        {/* Giant Headline Line by Line Masked Reveal */}
        <div ref={titleContainerRef} className="mb-4 max-w-4xl flex flex-wrap gap-x-4 gap-y-1">
          {titleWords.map((word, idx) => (
            <div key={idx} className="overflow-hidden inline-block py-1">
              <span className="hero-title-word font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.92] inline-block">
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Genre Tags */}
        <div className="hero-text-elem flex items-center space-x-2 text-xs uppercase tracking-widest text-[#8a8a8a] mb-6 font-semibold font-mono">
          <span className="text-white">{movie.genre}</span>
          {movie.subGenres?.map((sub, idx) => (
            <React.Fragment key={idx}>
              <span className="text-[#444444]">/</span>
              <span>{sub}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Short Synopsis */}
        <p className="hero-text-elem text-sm sm:text-base text-[#8a8a8a] max-w-2xl leading-relaxed mb-8 line-clamp-3 font-normal">
          {movie.description}
        </p>

        {/* Action Buttons: Magnetic Hover & Fill from Bottom */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Watch Trailer - Primary Inverting Button with Fill-from-Bottom */}
          <MagneticHover className="hero-btn-elem">
            <button
              onClick={() => onPlayTrailer(movie)}
              className="group relative overflow-hidden px-7 py-3.5 rounded-full border border-white text-xs font-black tracking-widest uppercase flex items-center space-x-3 transition-colors duration-300"
            >
              <span className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              <Play className="w-4 h-4 relative z-10 fill-current text-white group-hover:text-black transition-colors duration-300" />
              <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
                PLAY TRAILER
              </span>
            </button>
          </MagneticHover>

          {/* More Info - Ghost Button with Magnetic Hover */}
          <MagneticHover className="hero-btn-elem">
            <button
              onClick={() => onOpenDetails(movie)}
              className="group relative overflow-hidden px-6 py-3.5 rounded-full border border-white/25 bg-black/60 hover:border-white text-xs font-bold tracking-widest uppercase flex items-center space-x-2.5 text-white transition-all duration-300"
            >
              <Info className="w-4 h-4 stroke-[2]" />
              <span>EXAMINE DETAILS</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </MagneticHover>

          {/* Watchlist Toggle Button */}
          <MagneticHover className="hero-btn-elem">
            <button
              onClick={() => onToggleWatchlist(movie)}
              className={`p-3.5 rounded-full border transition-all duration-300 ${
                isWatchlisted
                  ? 'bg-white text-black border-white'
                  : 'bg-black/60 border-white/20 text-white/80 hover:text-white hover:border-white'
              }`}
              title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Heart className={`w-4 h-4 stroke-[2] ${isWatchlisted ? 'fill-black' : ''}`} />
            </button>
          </MagneticHover>
        </div>

        {/* Bottom Similarity Engine Status Label */}
        <div className="hero-engine-label text-[10px] font-mono tracking-[0.25em] text-[#666666] uppercase">
          <span>FOUND SIMILARITY ENGINE • COSINE RANK 0.98</span>
        </div>

      </div>

    </div>
  );
}
