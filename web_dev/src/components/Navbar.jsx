import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ChevronDown, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useIntro } from '../context/IntroContext';
import Logo from './Logo';
import { CINEMATIC_EASE } from '../utils/animations';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  activeGenre, 
  setActiveGenre, 
  watchlistCount, 
  onOpenWatchlist 
}) {
  const { introDone } = useIntro();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { currentUser, setIsAuthModalOpen, logout } = useAuth();

  // Scroll detection: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: 'Discover', genre: 'All' },
    { label: 'For You', genre: 'AI Recommended' },
    { label: 'Sci-Fi', genre: 'Sci-Fi' },
    { label: 'Action', genre: 'Action' },
  ];

  const handleLinkClick = (genre) => {
    setActiveGenre(genre);
    if (searchQuery) setSearchQuery('');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: introDone ? (isVisible ? 0 : -100) : -100, 
          opacity: introDone ? 1 : 0 
        }}
        transition={{ duration: 0.5, ease: CINEMATIC_EASE }}
        className="fixed top-0 left-0 right-0 z-50 h-[var(--nav-h)] bg-black/85 backdrop-blur-md border-b border-white/10 flex items-center"
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo */}
            <div 
              onClick={() => { setSearchQuery(''); setActiveGenre('All'); }}
              className="flex items-center cursor-pointer"
            >
              <Logo size="default" />
            </div>

            {/* Desktop Navigation Links with Clean Single-Line Roll-Over */}
            <nav className="hidden md:flex items-center space-x-10 text-xs font-semibold uppercase tracking-widest">
              {navLinks.map((link) => {
                const isActive = activeGenre === link.genre && !searchQuery;
                return (
                  <button
                    key={link.label}
                    onClick={() => handleLinkClick(link.genre)}
                    className={`group relative flex flex-col items-center py-1 transition-colors ${
                      isActive ? 'text-white' : 'text-[#8a8a8a] hover:text-white'
                    }`}
                  >
                    {/* Fixed Height One-Line Roll-over Stack */}
                    <span className="block overflow-hidden h-[1.25em] leading-[1.25em]">
                      <span className="flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2">
                        <span className="block h-[1.25em] leading-[1.25em]">{link.label}</span>
                        <span className="block h-[1.25em] leading-[1.25em] text-white" aria-hidden="true">{link.label}</span>
                      </span>
                    </span>

                    {/* Active Indicator Micro-Dot */}
                    {isActive && (
                      <motion.span 
                        layoutId="activeNavDot"
                        className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-white pointer-events-none"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Actions: Search, Watchlist, Auth */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              
              {/* Minimalist Search Input */}
              <div className="relative w-32 sm:w-56 focus-within:w-44 sm:focus-within:w-64 transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8a8a8a]">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="SEARCH ARCHIVE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-[11px] font-medium tracking-wider uppercase bg-black/60 border border-white/15 rounded-full text-white placeholder-[#666666] focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a8a8a] hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Watchlist Counter Button */}
              <button
                onClick={onOpenWatchlist}
                className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Watchlist"
              >
                <Heart className="w-4 h-4 stroke-[1.8]" />
                {watchlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {watchlistCount}
                  </span>
                )}
              </button>

              {/* User Profile / Auth Button */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-1.5 p-1 rounded-full border border-white/20 hover:border-white transition-colors"
                  >
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Profile" 
                        className="w-7 h-7 rounded-full object-cover grayscale hover:grayscale-0 transition-all" 
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-[11px] font-black">
                        {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <ChevronDown className="w-3 h-3 text-[#8a8a8a]" />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/15 rounded-xl shadow-2xl py-2 z-50 text-xs"
                      >
                        <div className="px-4 py-2.5 border-b border-white/10">
                          <p className="font-bold text-white tracking-wide truncate">{currentUser.displayName || "Member"}</p>
                          <p className="text-[10px] text-[#8a8a8a] truncate mt-0.5">{currentUser.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { setProfileOpen(false); onOpenWatchlist(); }}
                            className="w-full text-left flex items-center px-4 py-2 text-[#d4d4d4] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
                          >
                            <Heart className="w-3.5 h-3.5 mr-2" /> Watchlist ({watchlistCount})
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); logout(); }}
                            className="w-full text-left flex items-center px-4 py-2 text-[#8a8a8a] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider text-[11px]"
                          >
                            <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-bold tracking-widest uppercase rounded-full transition-all duration-200"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>
      </motion.header>

      {/* Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.5, ease: CINEMATIC_EASE }}
            className="fixed inset-0 z-40 bg-black flex flex-col justify-between p-8 pt-28 md:hidden"
          >
            <div className="flex flex-col space-y-6">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#8a8a8a]">Navigation</span>
              {navLinks.map((link, idx) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
                  onClick={() => handleLinkClick(link.genre)}
                  className="flex items-center justify-between text-2xl font-black uppercase tracking-tight text-white hover:text-[#8a8a8a] transition-colors text-left"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-5 h-5 text-[#8a8a8a]" />
                </motion.button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6">
              <Logo size="small" />
              <p className="text-[10px] text-[#8a8a8a] uppercase tracking-widest mt-2">
                © {new Date().getFullYear()} MOVIE ENTERTAINMENT. ALL RIGHTS RESERVED.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
