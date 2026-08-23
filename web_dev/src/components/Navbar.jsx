import React, { useState } from 'react';
import { Search, Film, Heart, User, Sparkles, Bell, ChevronDown, SlidersHorizontal, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ searchQuery, setSearchQuery, activeGenre, setActiveGenre, watchlistCount, onOpenWatchlist }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { currentUser, setIsAuthModalOpen, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={() => { setSearchQuery(''); setActiveGenre('All'); }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-300">
              <Film className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Movie<span className="text-red-500 hidden sm:inline">App</span>
              </span>
              <span className="hidden lg:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-red-950/80 text-red-400 border border-red-800/50 rounded-full">
                AI Powered
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <button 
              onClick={() => setActiveGenre('All')} 
              className={`transition-colors duration-200 ${activeGenre === 'All' && !searchQuery ? 'text-red-500 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Discover
            </button>
            <button 
              onClick={() => setActiveGenre('AI Recommended')} 
              className={`flex items-center space-x-1.5 transition-colors duration-200 ${activeGenre === 'AI Recommended' ? 'text-red-500 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>For You</span>
            </button>
            <button 
              onClick={() => setActiveGenre('Action')} 
              className={`transition-colors duration-200 ${activeGenre === 'Action' ? 'text-red-500 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Action
            </button>
            <button 
              onClick={() => setActiveGenre('Sci-Fi')} 
              className={`transition-colors duration-200 ${activeGenre === 'Sci-Fi' ? 'text-red-500 font-semibold' : 'text-slate-300 hover:text-white'}`}
            >
              Sci-Fi
            </button>
          </nav>

          {/* Search Bar & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Search Input */}
            <div className="relative w-28 sm:w-64 focus-within:w-40 sm:focus-within:w-64 transition-all duration-300">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-900/90 border border-slate-700/80 rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Watchlist Counter Button */}
            <button 
              onClick={onOpenWatchlist}
              className="relative p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors duration-200"
              title="Watchlist"
            >
              <Heart className="w-5 h-5" />
              {watchlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {watchlistCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-800/80 border border-slate-700/60 transition-colors focus:outline-none"
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt={currentUser.displayName || "User"} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                      {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">{currentUser.displayName || "Movie Buff"}</p>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="py-1">
                      <button onClick={onOpenWatchlist} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        <Heart className="w-4 h-4 mr-2 text-red-500" /> Watchlist ({watchlistCount})
                      </button>
                      <button 
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
