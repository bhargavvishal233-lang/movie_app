import React, { useState } from 'react';
import { Play, Heart, ImageOff } from 'lucide-react';

export default function MovieCard({ 
  movie, 
  onPlayTrailer, 
  onOpenDetails, 
  isWatchlisted, 
  onToggleWatchlist
}) {
  const [imageError, setImageError] = useState(false);

  const posterSrc = movie.posterUrl || movie.poster;

  return (
    <div 
      onClick={() => onOpenDetails && onOpenDetails(movie)}
      className="group relative flex flex-col w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/10 hover:border-white/30 cursor-pointer select-none transition-all duration-400 ease-out hover:-translate-y-1.5"
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

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
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

        {/* Hover Slide-up Actions Drawer */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20">
          
          <div className="flex items-center justify-between gap-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 ease-out">
            {/* Play Trailer Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="flex-1 py-2 px-3 bg-white text-black hover:bg-white/90 font-bold text-[10px] tracking-widest uppercase rounded-lg flex items-center justify-center space-x-1.5 transition-colors shadow-lg active:scale-95"
              title="Play Trailer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>TRAILER</span>
            </button>

            {/* Watchlist Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(movie);
              }}
              className={`p-2 rounded-lg border transition-all active:scale-90 ${
                isWatchlisted
                  ? 'bg-white text-black border-white'
                  : 'bg-black/80 text-white border-white/20 hover:border-white'
              }`}
              title={isWatchlisted ? "In Watchlist" : "Save to Watchlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

        </div>

      </div>

      {/* Card Info Details - Rating / Genre slide-up metadata */}
      <div className="p-3 bg-[#0a0a0a] flex flex-col justify-between flex-grow border-t border-white/5">
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
