import React from 'react';
import { X, Heart, Play, Trash2, Star } from 'lucide-react';

export default function WatchlistDrawer({ isOpen, onClose, watchlist = [], onRemove, onPlayTrailer, onOpenDetails }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-bold text-white">Your Watchlist</h2>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full">
                {watchlist.length}
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {watchlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <Heart className="w-12 h-12 text-slate-700 mb-3" />
                <p className="font-semibold text-slate-300">Your Watchlist is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Click the heart icon on any movie card to save it for later.
                </p>
              </div>
            ) : (
              watchlist.map((movie) => (
                <div 
                  key={movie.id} 
                  className="flex items-center space-x-4 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl group hover:border-slate-700 transition-all"
                >
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title} 
                    className="w-16 h-22 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{movie.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <span className="text-red-400">{movie.genre}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 mr-1" /> {movie.rating}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-3">
                      <button 
                        onClick={() => { onClose(); onPlayTrailer(movie); }}
                        className="flex items-center space-x-1 text-xs font-bold text-red-500 hover:text-red-400"
                      >
                        <Play className="w-3.5 h-3.5 fill-red-500" />
                        <span>Trailer</span>
                      </button>
                      <button 
                        onClick={() => { onClose(); onOpenDetails(movie); }}
                        className="text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(movie)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
