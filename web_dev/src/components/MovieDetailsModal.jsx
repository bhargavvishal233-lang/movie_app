import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Heart, Calendar, Clock, Film } from 'lucide-react';
import { CINEMATIC_EASE } from '../utils/animations';

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
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [movie, onClose]);

  if (!movie) return null;

  // Title Letter Reveal Animation
  const titleLetters = Array.from(movie.title || '');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        
        {/* Backdrop Fade */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl" 
          onClick={onClose} 
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.5, ease: CINEMATIC_EASE }}
          className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-10 my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/80 text-white/80 hover:text-white hover:bg-white hover:text-black transition-all duration-200 border border-white/20 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Backdrop Poster Banner that Expands In */}
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
                    transition={{
                      duration: 0.35,
                      delay: 0.2 + index * 0.025,
                      ease: CINEMATIC_EASE
                    }}
                    style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </h2>
            </div>
          </div>

          {/* Modal Body - Sequential Fade Up */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="p-6 sm:p-8 space-y-6"
          >
            
            {/* Meta Info Row */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-xs text-[#8a8a8a] border-b border-white/10 pb-4 font-mono uppercase tracking-wider"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>YEAR: <strong className="text-white">{movie.year}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>RUNTIME: <strong className="text-white">{movie.duration}</strong></span>
              </div>
              {movie.director && (
                <div className="flex items-center space-x-2">
                  <Film className="w-3.5 h-3.5 text-white" />
                  <span>DIRECTOR: <strong className="text-white">{movie.director}</strong></span>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => {
                  onClose();
                  onPlayTrailer(movie);
                }}
                className="btn-cinema px-7 py-3 rounded-full flex items-center space-x-2.5 text-xs font-black tracking-widest uppercase shadow-xl"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY TRAILER</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`px-6 py-3 rounded-full border text-xs font-bold tracking-widest uppercase flex items-center space-x-2 transition-all ${
                  isWatchlisted
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/20 hover:border-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                <span>{isWatchlisted ? 'IN WATCHLIST' : 'SAVE TO WATCHLIST'}</span>
              </button>
            </motion.div>

            {/* Synopsis */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="label-caps mb-2 text-[#666666]">OVERVIEW & SYNOPSIS</div>
              <p className="text-sm text-[#d4d4d4] leading-relaxed font-normal">
                {movie.description || 'No detailed synopsis recorded for this title.'}
              </p>
            </motion.div>

            {/* Cast Info */}
            {movie.mainCast && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="border-t border-white/10 pt-4"
              >
                <div className="label-caps mb-2 text-[#666666]">PRINCIPAL CAST</div>
                <p className="text-xs text-[#8a8a8a] leading-relaxed">
                  {Array.isArray(movie.mainCast) ? movie.mainCast.join(', ') : movie.mainCast}
                </p>
              </motion.div>
            )}

          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
