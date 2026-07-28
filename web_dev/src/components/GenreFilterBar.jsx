import React from 'react';
import { motion } from 'framer-motion';
import { Filter, Sparkles } from 'lucide-react';
import { genresList } from '../data/mockMovies';

export default function GenreFilterBar({ activeGenre, setActiveGenre, resultCount }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6"
    >
      
      {/* Genre Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold uppercase pr-2 shrink-0 border-r border-slate-800">
          <Filter className="w-3.5 h-3.5 text-red-500" />
          <span>Genres</span>
        </div>

        {genresList.map((genre, idx) => {
          const isActive = activeGenre === genre;
          const isAi = genre === 'AI Recommended';

          return (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-full shrink-0 transition-all duration-200 flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {isAi && <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-red-500'}`} />}
              <span>{genre}</span>
            </button>
          );
        })}
      </div>

      {/* Result Count Indicator */}
      <div className="text-xs text-slate-400 font-medium shrink-0 flex items-center space-x-2">
        <span>Showing <strong className="text-white">{resultCount}</strong> title{resultCount === 1 ? '' : 's'}</span>
      </div>

    </motion.div>
  );
}
