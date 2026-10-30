import React, { useState, useLayoutEffect, useRef } from 'react';
import { Play, Info, Heart, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useIntro } from '../context/IntroContext';

export default function HeroBanner({ 
  movie, 
  onPlayTrailer, 
  onOpenDetails, 
  isWatchlisted, 
  onToggleWatchlist 
}) {
  const { introDone } = useIntro();

  const heroContainerRef = useRef(null);
  const titleContainerRef = useRef(null);
  const hasHeroAnimatedRef = useRef(false);

  const [matchCount, setMatchCount] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  // Split title words for line-by-line masked slide-up
  const titleWords = (movie?.title || '').split(' ');

  // GSAP Entrance Timeline: Runs ONLY after introDone, exactly once
  useLayoutEffect(() => {
    if (!introDone || !movie) return;

    // First time intro finishes: run full headline mask reveal + stats count-up
    if (!hasHeroAnimatedRef.current) {
      hasHeroAnimatedRef.current = true;

      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        // 1. Hero container opacity
        gsap.set(heroContainerRef.current, { opacity: 1 });

        // 2. Headline words masked slide-up
        const words = titleContainerRef.current?.querySelectorAll('.hero-title-word');
        if (words && words.length > 0) {
          tl.fromTo(words, 
            { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.06, ease: 'power3.out' },
            0.05
          );
        }

        // 3. Stats counting up
        const statsObj = { match: 0, rating: 0 };
        tl.to(statsObj, {
          match: movie.matchScore || 95,
          rating: movie.rating || 8.5,
          duration: 1.3,
          ease: 'power2.out',
          onUpdate: () => {
            setMatchCount(Math.round(statsObj.match));
            setRatingCount(Number(statsObj.rating.toFixed(1)));
          }
        }, 0.1);

        // 4. Metadata label, tags, synopsis and buttons fade up
        const fadeElements = heroContainerRef.current?.querySelectorAll('.hero-fade-elem');
        if (fadeElements && fadeElements.length > 0) {
          tl.fromTo(fadeElements,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
            0.2
          );
        }
      }, heroContainerRef);

      return () => ctx.revert();
    } else {
      // Subsequent data update (e.g. TMDB resolved after intro):
      // Smoothly update numbers and keep content visible - NO headline mask re-animation!
      setMatchCount(movie.matchScore || 95);
      setRatingCount(movie.rating || 8.5);
      gsap.to(heroContainerRef.current, { opacity: 1, duration: 0.4 });
    }
  }, [introDone, movie?.id]);

  if (!movie) {
    // While loading, hero reserves full viewport height (min-h-[100svh]) so footer never rises up
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
      className="relative w-full overflow-hidden mb-16 border-b border-white/10 pt-[var(--nav-h)] min-h-[100svh] min-h-screen flex flex-col justify-end pb-12"
    >
      
      {/* Full-Bleed Background Poster Artwork (Edge to Edge, zero black bars) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div 
          className="w-full h-full bg-cover bg-center object-cover transition-transform duration-1000 ease-out hover:scale-105"
          style={{ 
            backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: 'grayscale(50%) brightness(0.42)'
          }}
        />
        
        {/* Editorial Deep Black Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent w-full md:w-3/4 h-full" />
        
        {/* Subtle Horizontal Guide Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/[0.04] pointer-events-none" />
      </div>

      {/* Hero Content Section - Constrained to 7xl grid inside full-bleed section */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Small Caps Metadata Label with Stats Counting Up */}
        <div className="hero-fade-elem flex flex-wrap items-center gap-3 mb-4">
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

        {/* Giant Headline Revealed Line by Line from a Mask (GSAP Driven, Exactly Once) */}
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
        <div className="hero-fade-elem flex items-center space-x-2 text-xs uppercase tracking-widest text-[#8a8a8a] mb-6 font-semibold font-mono">
          <span className="text-white">{movie.genre}</span>
          {movie.subGenres?.map((sub, idx) => (
            <React.Fragment key={idx}>
              <span className="text-[#444444]">/</span>
              <span>{sub}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Short Synopsis */}
        <p className="hero-fade-elem text-sm sm:text-base text-[#8a8a8a] max-w-2xl leading-relaxed mb-8 line-clamp-3 font-normal">
          {movie.description}
        </p>

        {/* Action Buttons: Scale & Fade In */}
        <div className="hero-fade-elem flex flex-wrap items-center gap-4">
          {/* Watch Trailer - Primary Inverting Button */}
          <button
            onClick={() => onPlayTrailer(movie)}
            className="btn-cinema group px-7 py-3.5 rounded-full flex items-center space-x-3 text-xs font-black tracking-widest uppercase"
          >
            <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
            <span>PLAY TRAILER</span>
          </button>

          {/* More Info - Ghost Button with Fill-from-Bottom */}
          <button
            onClick={() => onOpenDetails(movie)}
            className="btn-ghost-cinema group px-6 py-3.5 rounded-full flex items-center space-x-2.5 text-xs font-bold tracking-widest uppercase"
          >
            <Info className="w-4 h-4 stroke-[2]" />
            <span>EXAMINE DETAILS</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Watchlist Toggle Button */}
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
        </div>

      </div>

    </div>
  );
}
