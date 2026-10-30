import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { genresList } from '../data/mockMovies';
import { CINEMATIC_EASE } from '../utils/animations';

export default function GenreFilterBar({ 
  activeGenre, 
  setActiveGenre, 
  resultCount, 
  isVisible = true 
}) {
  return (
    <motion.div 
      initial={false}
      animate={{
        y: isVisible ? 0 : -30,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
      className="fixed top-[var(--nav-h)] left-0 right-0 z-40 h-[var(--filter-h)] bg-black/85 backdrop-blur-md border-b border-white/10 flex items-center"
      aria-hidden={!isVisible}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Horizontally scrollable single-row chips with stagger & shared glide pill */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1 flex-1">
          <span className="label-caps pr-3 shrink-0 border-r border-white/10 text-[#666666] hidden sm:inline-block">
            FILTER ARCHIVE
          </span>

          {genresList.map((genre, idx) => {
            const isActive = activeGenre === genre;

            return (
              <motion.button
                key={genre}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.04, ease: CINEMATIC_EASE }}
                onClick={() => setActiveGenre(genre)}
                className="relative px-3.5 py-1 text-[11px] tracking-wider uppercase rounded-full shrink-0 select-none transition-colors duration-200 border border-transparent"
              >
                {/* One Shared Pill that glides from old chip to new chip */}
                {isActive && (
                  <motion.span
                    layoutId="activeFilterPill"
                    className="absolute inset-0 bg-white rounded-full z-0 shadow-md"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}

                <span 
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive 
                      ? 'text-black font-bold' 
                      : 'text-[#8a8a8a] hover:text-white'
                  }`}
                >
                  {genre}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Odometer-Style Rolling Number Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 text-[11px] font-mono tracking-widest text-[#8a8a8a] uppercase shrink-0">
          <span>INDEXED:</span>
          <div className="relative h-4 overflow-hidden inline-flex items-center justify-center min-w-[2ch]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={resultCount}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.28, ease: CINEMATIC_EASE }}
                className="text-white font-bold inline-block"
              >
                {resultCount}
              </motion.span>
            </AnimatePresence>
          </div>
          <span>TITLES</span>
        </div>

      </div>
    </motion.div>
  );
}
