import React, { useState } from 'react';
import { Star, Play, Info, Heart, Sparkles, ImageOff } from 'lucide-react';

export default function MovieCard({ 
  movie, 
  onPlayTrailer, 
  onOpenDetails, 
  isWatchlisted, 
  onToggleWatchlist,
  onHoverCard 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleMouseEnter = (e) => {
    if (onHoverCard) {
      const rect = e.currentTarget.getBoundingClientRect();
      onHoverCard({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        isHovered: true
      });
    }
  };

  const handleMouseLeave = () => {
    if (onHoverCard) {
      onHoverCard({ x: 0, y: 0, isHovered: false });
    }
  };
  
  // Use 'poster' or 'posterUrl' interchangeably, or fallback
  const posterSrc = movie.posterUrl || movie.poster;

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col w-full h-full bg-slate-900/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800/80 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20"
    >
      
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
        
        {/* Loading Skeleton (Always renders in background, gets covered by image) */}
        {!imageError && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center z-0">
             <div className="w-10 h-10 border-4 border-slate-700 border-t-slate-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Error Fallback */}
        {imageError && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-600 z-10">
            <ImageOff className="w-12 h-12 mb-2 opacity-50" />
            <span className="text-xs font-semibold uppercase tracking-wider text-center px-4">Poster Not<br/>Available</span>
          </div>
        )}

        {/* Real Image */}
        {posterSrc && !imageError && (
          <img
            src={posterSrc}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out relative z-10"
            loading="lazy"
          />
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 z-10">
          
          {/* Top Row: AI Match Score & Watchlist Button */}
          <div className="flex items-center justify-between">
            {movie.matchScore && (
              <span className="flex items-center space-x-1 px-2 py-0.5 bg-slate-950/90 text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{movie.matchScore}% Match</span>
              </span>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(movie);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-transform active:scale-90 ${
                isWatchlisted 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-900/80 text-slate-200 hover:bg-red-600 hover:text-white'
              }`}
              title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Center Play Trailer Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 hover:scale-110 active:scale-95 transition-transform duration-200"
              title="Watch Trailer"
            >
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
          </div>

          {/* Bottom Quick Info Button */}
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(movie);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900/90 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 hover:text-white transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>

        </div>

        {/* Rating Tag (always visible on top right) */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-950/80 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 backdrop-blur-md flex items-center space-x-1 shadow-md group-hover:opacity-0 transition-opacity">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{movie.rating}</span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 flex flex-col justify-between flex-grow bg-slate-900/80 backdrop-blur-md">
        <div>
          {/* Truncated Title */}
          <h3 className="font-bold text-sm text-white truncate group-hover:text-red-400 transition-colors" title={movie.title}>
            {movie.title}
          </h3>

          {/* Genre & Subtitle Details */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span className="font-medium text-slate-400 truncate">{movie.genre}</span>
            <span className="text-[11px] text-slate-500">{movie.year}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
