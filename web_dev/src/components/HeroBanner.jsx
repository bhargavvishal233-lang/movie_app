import React from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Star, Sparkles, Heart, Clock, Calendar } from 'lucide-react';

export default function HeroBanner({ movie, onPlayTrailer, onOpenDetails, isWatchlisted, onToggleWatchlist }) {
  if (!movie) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden rounded-3xl mb-12 shadow-2xl border border-slate-800/60"
    >
      
      {/* Background Image with Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
      >
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        
        {/* Badges */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center gap-3 mb-4"
        >
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg shadow-red-600/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>#1 Featured Choice</span>
          </span>
          <span className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-full backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating} Rating</span>
          </span>
          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-full backdrop-blur-md">
            {movie.matchScore}% AI Match
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {movie.year}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> {movie.duration}
          </span>
        </motion.div>

        {/* Movie Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md mb-3 max-w-3xl leading-tight"
        >
          {movie.title}
        </motion.h1>

        {/* Genre Tags */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center space-x-2 text-xs sm:text-sm text-slate-300 mb-4 font-medium"
        >
          <span className="text-red-400 font-semibold">{movie.genre}</span>
          {movie.subGenres?.map((sub, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">{sub}</span>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Short Synopsis */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-sm sm:text-base text-slate-300 line-clamp-3 sm:line-clamp-2 max-w-2xl mb-8 leading-relaxed font-normal"
        >
          {movie.description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center gap-4"
        >
          <button
            onClick={() => onPlayTrailer(movie)}
            className="flex items-center space-x-2.5 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Watch Trailer</span>
          </button>

          <button
            onClick={() => onOpenDetails(movie)}
            className="flex items-center space-x-2 px-6 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-semibold rounded-2xl border border-slate-700 backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Info className="w-5 h-5 text-slate-300" />
            <span>More Info</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(movie)}
            className={`p-3.5 rounded-2xl border transition-all duration-200 ${
              isWatchlisted 
                ? 'bg-red-600/20 border-red-500 text-red-400' 
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title={isWatchlisted ? "Remove from Watchlist" : "Save to Watchlist"}
          >
            <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </motion.div>

      </div>

    </motion.div>
  );
}
