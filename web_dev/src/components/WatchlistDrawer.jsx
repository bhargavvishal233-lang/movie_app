import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Play, Trash2 } from 'lucide-react';
import { CINEMATIC_EASE } from '../utils/animations';

export default function WatchlistDrawer({ 
  isOpen, 
  onClose, 
  watchlist = [], 
  onRemove, 
  onPlayTrailer, 
  onOpenDetails 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: CINEMATIC_EASE }}
              className="w-screen max-w-md bg-black border-l border-white/15 shadow-2xl flex flex-col"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]">
                <div className="flex items-center space-x-3">
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <h2 className="font-display font-black text-sm uppercase tracking-widest text-white">
                    WATCHLIST ARCHIVE
                  </h2>
                  <span className="px-2 py-0.5 bg-white text-black text-[9px] font-mono font-bold rounded-full">
                    {watchlist.length}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-white/20 text-[#8a8a8a] hover:text-white hover:border-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {watchlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#8a8a8a] py-16">
                    <Heart className="w-10 h-10 text-[#333333] mb-3 stroke-[1.5]" />
                    <p className="font-display font-bold text-sm uppercase text-white tracking-wider">No Titles Saved</p>
                    <p className="text-xs text-[#666666] mt-1 max-w-xs leading-relaxed">
                      Tag movies with the heart icon to curate your personal viewing dossier.
                    </p>
                  </div>
                ) : (
                  watchlist.map((movie) => (
                    <div 
                      key={movie.id} 
                      className="flex items-center space-x-3 p-3 bg-[#0a0a0a] border border-white/10 rounded-xl group hover:border-white/30 transition-all"
                    >
                      <img 
                        src={movie.posterUrl || movie.poster} 
                        alt={movie.title} 
                        className="poster-grayscale w-14 h-20 object-cover rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-xs uppercase text-white truncate">{movie.title}</h4>
                        <div className="flex items-center space-x-2 text-[10px] text-[#8a8a8a] font-mono mt-1">
                          <span>{movie.genre}</span>
                          <span>•</span>
                          <span>★ {movie.rating}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 mt-2">
                          <button
                            onClick={() => {
                              onClose();
                              onPlayTrailer(movie);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-white hover:underline flex items-center space-x-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>TRAILER</span>
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenDetails(movie);
                            }}
                            className="text-[10px] font-bold uppercase tracking-wider text-[#8a8a8a] hover:text-white"
                          >
                            DETAILS
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemove(movie)}
                        className="p-2 text-[#666666] hover:text-white transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
