import React from 'react';
import { genresList } from '../data/mockMovies';

export default function GenreFilterBar({ 
  activeGenre, 
  setActiveGenre, 
  resultCount, 
  isVisible = true 
}) {
  return (
    <div 
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease',
      }}
      className="fixed top-[var(--nav-h)] left-0 right-0 z-40 h-[var(--filter-h)] bg-black/85 backdrop-blur-md border-b border-white/10 flex items-center"
      aria-hidden={!isVisible}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Horizontally scrollable single-row chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1 flex-1">
          <span className="label-caps pr-3 shrink-0 border-r border-white/10 text-[#666666] hidden sm:inline-block">
            FILTER ARCHIVE
          </span>

          {genresList.map((genre) => {
            const isActive = activeGenre === genre;

            return (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full shrink-0 transition-all duration-200 border select-none ${
                  isActive
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-black text-[#8a8a8a] border-white/15 hover:border-white/40 hover:text-white'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Result Count Indicator - Hidden on small mobile to give chips full space */}
        <div className="hidden md:block text-[11px] font-mono tracking-widest text-[#8a8a8a] uppercase shrink-0">
          INDEXED: <strong className="text-white font-bold">{resultCount}</strong> TITLES
        </div>

      </div>
    </div>
  );
}
