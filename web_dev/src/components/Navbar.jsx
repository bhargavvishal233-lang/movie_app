import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ChevronDown, LogOut, Menu, X } from 'lucide-react';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Active indicator dot state & refs
  const [dotX, setDotX] = useState(0);
  const dotRef = useRef(null);
  const navContainerRef = useRef(null);
  const linkRefs = useRef([]);
  const isFirstMount = useRef(true);

  // Performance refs to prevent re-rendering on every scroll tick
  const isVisibleRef = useRef(true);
  const isScrolledRef = useRef(false);
  const lastScrollYRef = useRef(0);

  const { currentUser, setIsAuthModalOpen, logout } = useAuth();

  const navLinks = [
    { label: 'Discover', genre: 'All' },
    { label: 'For You', genre: 'AI Recommended' },
    { label: 'Sci-Fi', genre: 'Sci-Fi' },
    { label: 'Action', genre: 'Action' },
  ];

  const activeIndex = searchQuery ? -1 : navLinks.findIndex((l) => l.genre === activeGenre);

  // Compute active link X position using layout-relative offsetLeft & offsetWidth
  const updateDotPosition = useCallback((animate = true) => {
    if (activeIndex < 0) return;
    const linkEl = linkRefs.current[activeIndex];
    if (!linkEl) return;

    // x = link.offsetLeft + link.offsetWidth / 2 - 2 (layout-relative, independent of navbar transform or page scroll)
    const targetX = linkEl.offsetLeft + linkEl.offsetWidth / 2 - 2;

    if (dotRef.current) {
      if (!animate) {
        dotRef.current.style.transition = 'none';
        dotRef.current.style.transform = `translateX(${targetX}px)`;
        void dotRef.current.offsetHeight; // force reflow
        dotRef.current.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease';
      } else {
        dotRef.current.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease';
        dotRef.current.style.transform = `translateX(${targetX}px)`;
      }
    }
    setDotX(targetX);
  }, [activeIndex]);

  // Position indicator on active link change and initial mount
  useLayoutEffect(() => {
    if (isFirstMount.current) {
      updateDotPosition(false);
      isFirstMount.current = false;
    } else {
      updateDotPosition(true);
    }
  }, [updateDotPosition]);

  // Keep indicator aligned on window resize and font load
  useEffect(() => {
    const handleResize = () => {
      updateDotPosition(false);
    };

    window.addEventListener('resize', handleResize);

    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateDotPosition(false);
      });
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [updateDotPosition]);

  // Optimized Scroll Detection with directional hysteresis to prevent jitter/jumping
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only trigger state update when crossing 40px threshold
      const nextScrolled = currentScrollY > 40;
      if (nextScrolled !== isScrolledRef.current) {
        isScrolledRef.current = nextScrolled;
        setIsScrolled(nextScrolled);
      }

      const delta = currentScrollY - lastScrollYRef.current;

      // Ignore micro-jitter (< 8px)
      if (Math.abs(delta) < 8) return;

      if (delta > 0 && currentScrollY > 120) {
        // Scrolling down: hide navbar smoothly
        if (isVisibleRef.current) {
          isVisibleRef.current = false;
          setIsVisible(false);
        }
      } else if (delta < -10 || currentScrollY <= 40) {
        // Scrolling up or at top: reveal navbar
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          setIsVisible(true);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        transition={{ duration: 0.55, ease: CINEMATIC_EASE }}
        className={`fixed top-0 left-0 right-0 z-50 h-[var(--nav-h)] flex items-center transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-xl border-b border-white/15 shadow-2xl' 
            : 'bg-black/80 backdrop-blur-md border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo with 1 full rotation on load & hover */}
            <div 
              onClick={() => { setSearchQuery(''); setActiveGenre('All'); }}
              className="flex items-center cursor-pointer"
            >
              <Logo size="default" />
            </div>

            {/* Desktop Navigation Links with Clipped Roll-Over & Layout-Relative Sliding Dot */}
            <nav 
              ref={navContainerRef}
              className="hidden md:flex items-center space-x-10 text-xs font-semibold uppercase tracking-widest relative"
            >
              {navLinks.map((link, idx) => {
                const isActive = activeGenre === link.genre && !searchQuery;
                return (
                  <button
                    key={link.label}
                    ref={(el) => (linkRefs.current[idx] = el)}
                    onClick={() => handleLinkClick(link.genre)}
                    className={`group relative flex flex-col items-center py-1 transition-colors cursor-pointer ${
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
                  </button>
                );
              })}

              {/* EXACTLY ONE Active Indicator Dot: Fixed Y, layout-relative X */}
              <span 
                ref={dotRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: '-8px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  pointerEvents: 'none',
                  willChange: 'transform',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: `translateX(${dotX}px)`,
                  opacity: activeIndex >= 0 ? 1 : 0,
                }}
                aria-hidden="true"
              />
            </nav>

            {/* Actions: Search, Watchlist, Auth */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              
              {/* Search Input with Self-Drawing Focus Border */}
              <div className="relative w-32 sm:w-56 focus-within:w-44 sm:focus-within:w-64 transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8a8a8a]">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="SEARCH ARCHIVE..."
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 pr-7 py-1.5 text-[11px] font-medium tracking-wider uppercase bg-black/60 rounded-full text-white placeholder-[#666666] transition-all duration-300 focus:outline-none ${
                    searchFocused ? 'border border-white ring-1 ring-white/30' : 'border border-white/15'
                  }`}
                />
                {/* Subtle Drawing Line Accent */}
                <span 
                  className={`absolute bottom-0 left-3 right-3 h-[1px] bg-white transition-transform duration-300 origin-center pointer-events-none ${
                    searchFocused ? 'scale-x-100 opacity-80' : 'scale-x-0 opacity-0'
                  }`} 
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#8a8a8a] hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Watchlist Counter Button with Scale Pop */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={onOpenWatchlist}
                className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title="Watchlist"
              >
                <Heart className="w-4 h-4 stroke-[1.8]" />
                {watchlistCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {watchlistCount}
                  </motion.span>
                )}
              </motion.button>

              {/* User Profile / Auth Button with Bottom Fill on Hover */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center space-x-1.5 p-1 rounded-full border border-white/20 hover:border-white transition-colors cursor-pointer"
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
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: CINEMATIC_EASE }}
                        className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/15 rounded-xl shadow-2xl py-2 z-50 text-xs"
                      >
                        <div className="px-4 py-2.5 border-b border-white/10">
                          <p className="font-bold text-white tracking-wide truncate">{currentUser.displayName || "Member"}</p>
                          <p className="text-[10px] text-[#8a8a8a] truncate mt-0.5">{currentUser.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { setProfileOpen(false); onOpenWatchlist(); }}
                            className="w-full text-left flex items-center px-4 py-2 text-[#d4d4d4] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
                          >
                            <Heart className="w-3.5 h-3.5 mr-2" /> Watchlist ({watchlistCount})
                          </button>
                          <button
                            onClick={() => { setProfileOpen(false); logout(); }}
                            className="w-full text-left flex items-center px-4 py-2 text-[#8a8a8a] hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Sign In Button: Fills from bottom on hover */
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="group relative overflow-hidden px-4 py-1.5 border border-white rounded-full text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <span className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
                    Sign In
                  </span>
                </button>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/80 hover:text-white cursor-pointer"
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => handleLinkClick(link.genre)}
                  className={`text-left text-2xl font-black uppercase tracking-tight flex items-center justify-between cursor-pointer ${
                    activeGenre === link.genre ? 'text-white' : 'text-[#8a8a8a]'
                  }`}
                >
                  <span>{link.label}</span>
                  {activeGenre === link.genre && <span className="w-2 h-2 rounded-full bg-white" />}
                </motion.button>
              ))}
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col space-y-4">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenWatchlist(); }}
                className="flex items-center space-x-2 text-sm uppercase tracking-wider text-[#d4d4d4] cursor-pointer"
              >
                <Heart className="w-4 h-4" />
                <span>Saved Watchlist ({watchlistCount})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
