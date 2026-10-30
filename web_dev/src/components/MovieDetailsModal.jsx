import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Heart, Calendar, Clock, Film } from 'lucide-react';
import { CINEMATIC_EASE, stopScroll, startScroll } from '../utils/animations';

export default function MovieDetailsModal({ 
  movie, 
  onClose, 
  onPlayTrailer, 
  isWatchlisted, 
  onToggleWatchlist 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (movie) {
      stopScroll();
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      startScroll();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  // Title Letter Reveal Animation
  const titleLetters = Array.from(movie.title || '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        
        {/* Backdrop Fade (0.3s) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl" 
          onClick={onClose} 
        />

        {/* Modal Container: Scale from 0.95 + translateY 30, fast 0.3s exit */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.45, ease: CINEMATIC_EASE }}
          className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-10 my-8"
        >
          {/* Close Button with 90deg rotation on hover */}
          <button
            onClick={onClose}
            className="group absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 text-white/80 hover:text-white hover:bg-white hover:text-black transition-all duration-200 border border-white/20 flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
          </button>

          {/* Backdrop Poster Banner */}
          <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-black">
            <motion.img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.7 }}
              transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
              className="w-full h-full object-cover filter brightness-[0.6] grayscale hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex flex-wrap items-center gap-2 mb-2"
              >
                <span className="label-caps px-2.5 py-1 bg-black/80 border border-white/20 text-white rounded">
                  {movie.genre}
                </span>
                <span className="label-caps px-2.5 py-1 bg-black/80 border border-white/20 text-white rounded font-mono">
                  ★ {movie.rating} / 10
                </span>
                {movie.matchScore && (
                  <span className="label-caps px-2.5 py-1 bg-white text-black font-bold rounded">
                    {movie.matchScore}% MATCH
                  </span>
                )}
              </motion.div>

              {/* Title Letters Reveal in Sequence */}
              <h2 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter flex flex-wrap">
                {titleLetters.map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1 + index * 0.02, ease: CINEMATIC_EASE }}
                    className="inline-block"
                    style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h2>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Meta Items Staggered */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: CINEMATIC_EASE }}
              className="flex flex-wrap items-center gap-6 text-xs text-[#8a8a8a] border-b border-white/10 pb-6 font-mono"
            >
              {movie.year && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <span>{movie.year}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span>{movie.duration}</span>
                </div>
              )}
              {movie.director && (
                <div className="flex items-center space-x-2">
                  <Film className="w-4 h-4 text-white" />
                  <span>DIR: <strong className="text-white font-bold">{movie.director}</strong></span>
                </div>
              )}
            </motion.div>

            {/* Synopsis */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28, ease: CINEMATIC_EASE }}
            >
              <h4 className="label-caps text-[#666666] mb-2">ARCHIVAL DOSSIER</h4>
              <p className="text-sm sm:text-base text-[#d4d4d4] leading-relaxed font-normal">
                {movie.description || "Archival analysis unavailable. High-confidence recommendation based on semantic similarity clusters."}
              </p>
            </motion.div>

            {/* Cast & Crew Tags */}
            {movie.cast && movie.cast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: CINEMATIC_EASE }}
              >
                <h4 className="label-caps text-[#666666] mb-2">KEY CAST</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-black/60 border border-white/10 rounded-full text-xs text-[#8a8a8a] font-mono"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Modal Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease: CINEMATIC_EASE }}
              className="pt-4 flex flex-wrap items-center gap-4 border-t border-white/10"
            >
              <button
                onClick={() => {
                  onClose();
                  onPlayTrailer(movie);
                }}
                className="group relative overflow-hidden px-6 py-3 border border-white rounded-full text-xs font-bold tracking-widest uppercase flex items-center space-x-2 cursor-pointer"
              >
                <span className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                <Play className="w-4 h-4 fill-current relative z-10 text-white group-hover:text-black transition-colors duration-300" />
                <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
                  PLAY PREVIEW
                </span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`px-5 py-3 rounded-full border text-xs font-bold tracking-widest uppercase flex items-center space-x-2 transition-all cursor-pointer ${
                  isWatchlisted
                    ? 'bg-white text-black border-white'
                    : 'bg-black/60 border-white/20 text-white hover:border-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-black' : ''}`} />
                <span>{isWatchlisted ? 'IN WATCHLIST' : 'ADD TO WATCHLIST'}</span>
              </button>
            </motion.div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
