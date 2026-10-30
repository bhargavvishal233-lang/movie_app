import React, { useState } from 'react';
import { Play, Heart, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MovieCard({ 
  movie, 
  onPlayTrailer, 
  onOpenDetails, 
  isWatchlisted, 
  onToggleWatchlist
}) {
  const [imageError, setImageError] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [heartBurst, setHeartBurst] = useState(false);

  const posterSrc = movie.posterUrl || movie.poster;

  // Subtle 3D Card Tilt (Max 4deg) Following Mouse
  const handleMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Math.max(-4, Math.min(4, -y * 8)),
      rotateY: Math.max(-4, Math.min(4, x * 8))
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 500);
    onToggleWatchlist(movie);
  };

  return (
    <div 
      onClick={() => onOpenDetails && onOpenDetails(movie)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: 'transform 0.2s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className="group relative flex flex-col w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 hover:border-white/40 cursor-pointer select-none hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl will-change-transform"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121212] flex items-center justify-center">
        
        {/* Placeholder / Error State */}
        {imageError ? (
          <div className="absolute inset-0 bg-[#121212] flex flex-col items-center justify-center text-[#555555]">
            <ImageOff className="w-8 h-8 mb-2 opacity-40" />
            <span className="text-[10px] tracking-widest uppercase font-mono">No Image</span>
          </div>
        ) : (
          posterSrc && (
            <img
              src={posterSrc}
              alt={movie.title}
              onError={() => setImageError(true)}
              className="poster-grayscale w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
              loading="lazy"
            />
          )
        )}

        {/* Top Badges (Slide down from top on hover) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20 transition-transform duration-300 ease-out transform -translate-y-1 group-hover:translate-y-0">
          {/* Rating */}
          <span className="px-2 py-0.5 bg-black/85 text-white text-[10px] font-mono font-bold tracking-wider rounded border border-white/15 backdrop-blur-md">
            {movie.rating ? `★ ${movie.rating}` : 'NR'}
          </span>

          {/* Match Score */}
          {movie.matchScore && (
            <span className="px-1.5 py-0.5 bg-black/85 text-white/90 text-[9px] font-mono tracking-wider rounded border border-white/15 backdrop-blur-md">
              {movie.matchScore}%
            </span>
          )}
        </div>

        {/* Hover Slide-up Actions Drawer with Staggered Rise */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20">
          
          <div className="flex items-center justify-between gap-2">
            {/* Play Trailer Button (Rises first) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="flex-1 py-2 px-3 bg-white text-black hover:bg-white/90 font-bold text-[10px] tracking-widest uppercase rounded-lg flex items-center justify-center space-x-1.5 shadow-lg active:scale-95 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out"
              title="Play Trailer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>TRAILER</span>
            </button>

            {/* Watchlist Toggle with Ring Burst on Click */}
            <div className="relative transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 ease-out">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleHeartClick}
                className={`relative p-2 rounded-lg border transition-all ${
                  isWatchlisted
                    ? 'bg-white text-black border-white'
                    : 'bg-black/80 text-white border-white/20 hover:border-white'
                }`}
                title={isWatchlisted ? "In Watchlist" : "Save to Watchlist"}
              >
                <Heart className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
                
                {/* Ring Burst Animation */}
                <AnimatePresence>
                  {heartBurst && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-lg border-2 border-white pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

        </div>

      </div>

      {/* Card Info Details - Title block slides up on hover */}
      <div className="p-3 bg-[#0a0a0a] flex flex-col justify-between flex-grow border-t border-white/5 transform translate-y-0.5 group-hover:translate-y-0 transition-transform duration-300">
        <div>
          <h3 className="font-display font-bold text-xs text-white uppercase tracking-tight truncate group-hover:text-white" title={movie.title}>
            {movie.title}
          </h3>

          <div className="flex items-center justify-between text-[10px] text-[#8a8a8a] mt-1 font-mono">
            <span className="truncate">{movie.genre}</span>
            <span>{movie.year}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
