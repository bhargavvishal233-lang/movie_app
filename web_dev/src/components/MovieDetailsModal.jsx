import React from 'react';
import { X, Play, Star, Sparkles, Heart, Calendar, Clock, User, Film, Tag } from 'lucide-react';

export default function MovieDetailsModal({ movie, onClose, onPlayTrailer, isWatchlisted, onToggleWatchlist }) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Backdrop click listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-white hover:bg-red-600 transition-all duration-200 border border-slate-700/60 shadow-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Backdrop Banner Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                  {movie.genre}
                </span>
                <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-full backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{movie.rating} / 10</span>
                </span>
                {movie.matchScore && (
                  <span className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-full backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{movie.matchScore}% Match</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {movie.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Quick Meta Row */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>Released: <strong>{movie.year}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span>Runtime: <strong>{movie.duration}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Film className="w-4 h-4 text-red-500" />
              <span>Director: <strong>{movie.director}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                onClose();
                onPlayTrailer(movie);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Play Trailer</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(movie)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl border font-semibold transition-all ${
                isWatchlisted
                  ? 'bg-red-600/20 border-red-500 text-red-400'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>

          {/* Storyline / Synopsis */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <span>Overview</span>
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
              {movie.description}
            </p>
          </div>

          {/* Cast */}
          {movie.cast && movie.cast.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-red-500" />
                <span>Starring Cast</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {movie.cast.map((actor, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs font-medium text-slate-200"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation Reason */}
          <div className="p-4 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/30 rounded-2xl flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Why AI Recommended This</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Based on your high interest in futuristic sci-fi narratives, stunning cinematography, and rated high-octane blockbusters.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
