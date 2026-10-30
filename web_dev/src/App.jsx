import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CustomRecommender from './components/CustomRecommender';
import MovieCarousel from './components/MovieCarousel';
import MovieCard from './components/MovieCard';
import GenreFilterBar from './components/GenreFilterBar';
import MovieDetailsModal from './components/MovieDetailsModal';
import TrailerModal from './components/TrailerModal';
import WatchlistDrawer from './components/WatchlistDrawer';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';

import { IntroProvider, useIntro } from './context/IntroContext';
import { mockMovies } from './data/mockMovies';
import { enhanceMoviesWithTMDB } from './utils/tmdb';
import { initSmoothScroll, scrollToTop, CINEMATIC_EASE } from './utils/animations';
import { Film, ArrowUp } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { introDone, isIntroActive, setIntroDone, markIntroSeen } = useIntro();

  const handleIntroOverlap = useCallback(() => {
    setIntroDone(true);
  }, [setIntroDone]);

  const handleIntroComplete = useCallback(() => {
    markIntroSeen();
  }, [markIntroSeen]);

  // Synchronously initialize with mockMovies so hero and rows are never empty on initial frame
  const [movies, setMovies] = useState(mockMovies);
  const [loading, setLoading] = useState(false);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll Progress Hook
  const { scrollYProgress, scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowBackToTop(latest > 600);
    });
  }, [scrollY]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const scrollInstance = initSmoothScroll();
    return () => {
      if (scrollInstance && scrollInstance.destroy) {
        scrollInstance.destroy();
      }
    };
  }, []);

  // Async TMDB enhancement in background (updates posters/trailers without blocking UI)
  useEffect(() => {
    let isMounted = true;
    enhanceMoviesWithTMDB(mockMovies).then((enhanced) => {
      if (isMounted && enhanced && enhanced.length > 0) {
        setMovies(enhanced);
      }
    }).catch(() => {
      // Keep mockMovies if TMDB/FastAPI is offline
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Featured Hero Movie
  const featuredMovie = movies.find(m => m.isFeatured) || movies[0] || mockMovies[0];

  // Watchlist Toggle
  const handleToggleWatchlist = (movie) => {
    setWatchlist(prev => {
      const exists = prev.some(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  // Filtered movies based on genre and search query
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = 
      activeGenre === 'All' ? true :
      activeGenre === 'AI Recommended' ? (movie.category === 'AI Recommended' || movie.isFeatured) :
      movie.genre.toLowerCase() === activeGenre.toLowerCase() || 
      (movie.subGenres && movie.subGenres.some(sg => sg.toLowerCase() === activeGenre.toLowerCase()));

    return matchesSearch && matchesGenre;
  });

  // Categorized Carousel Rows
  const aiRecommendedMovies = movies.filter(m => m.category === 'AI Recommended' || m.matchScore >= 95);
  const trendingMovies = movies.filter(m => m.rating >= 8.5);
  const sciFiMovies = movies.filter(m => m.genre === 'Sci-Fi' || (m.subGenres && m.subGenres.includes('Sci-Fi')));
  const actionMovies = movies.filter(m => m.genre === 'Action' || (m.subGenres && m.subGenres.includes('Action')));

  const isSearchOrFilterActive = searchQuery.trim() !== '' || activeGenre !== 'All';

  return (
    <div className="min-h-screen min-h-[100vh] bg-black text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-white selection:text-black">
      
      {/* 1. Website-Opening Intro Preloader */}
      {isIntroActive && (
        <Preloader 
          onIntroOverlap={handleIntroOverlap}
          onIntroComplete={handleIntroComplete}
          heroImageUrl={featuredMovie?.backdropUrl || featuredMovie?.posterUrl}
          isDataReady={!loading}
        />
      )}

      {/* 2. Top Scroll-Progress Line (scaleX tied to page scroll progress) */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: 'left center' }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-white z-[60] pointer-events-none"
      />

      {/* 3. Single Consistent Custom Cursor (z-index: 10001) */}
      <CustomCursor />

      {/* 4. Subtle Film Grain Texture Overlay */}
      <div className="film-grain" />

      {/* 5. Unified Header Stack: Fixed Navbar (top: 0, z-50) + Filter Bar (top: var(--nav-h), z-40) */}
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeGenre={activeGenre}
        setActiveGenre={setActiveGenre}
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => setWatchlistOpen(true)}
      />

      <GenreFilterBar 
        activeGenre={activeGenre}
        setActiveGenre={setActiveGenre}
        resultCount={filteredMovies.length}
        isVisible={isSearchOrFilterActive}
      />

      {/* 6. Full-Bleed Featured Hero Banner */}
      {!isSearchOrFilterActive && (
        featuredMovie ? (
          <HeroBanner 
            movie={featuredMovie}
            onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
            onOpenDetails={(movie) => setSelectedMovie(movie)}
            isWatchlisted={watchlist.some(m => m.id === featuredMovie.id)}
            onToggleWatchlist={handleToggleWatchlist}
          />
        ) : (
          <div 
            id="hero-skeleton" 
            className="relative w-full overflow-hidden mb-16 border-b border-white/10 pt-[var(--nav-h)] min-h-[100svh] min-h-screen flex flex-col justify-end pb-12 bg-black"
          >
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-4 animate-pulse">
              <div className="w-36 h-5 bg-white/10 rounded" />
              <div className="w-2/3 max-w-2xl h-14 bg-white/10 rounded" />
              <div className="w-1/2 max-w-md h-4 bg-white/5 rounded" />
              <div className="flex gap-4 pt-4">
                <div className="w-36 h-12 bg-white/15 rounded-full" />
                <div className="w-36 h-12 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        )
      )}

      {/* 7. Main Content Area */}
      <main 
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 transition-[padding-top] duration-400 ease-out"
        style={{
          paddingTop: isSearchOrFilterActive 
            ? 'calc(var(--nav-h) + var(--filter-h) + 2rem)' 
            : '0px'
        }}
      >
        
        {loading && movies.length === 0 ? (
          <div className="space-y-12 py-8">
            {[1, 2, 3].map((row) => (
              <div key={row} className="min-h-[280px] space-y-4">
                <div className="w-48 h-5 bg-white/10 rounded animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((card) => (
                    <div key={card} className="aspect-[2/3] bg-white/5 rounded-lg border border-white/10 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Filtered Grid View with Cross-Fade Transition */}
            {isSearchOrFilterActive ? (
              <section className="mb-20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
                    {searchQuery ? `SEARCH: "${searchQuery}"` : `${activeGenre} ARCHIVE`}
                  </h2>
                  <span className="label-caps font-mono text-[#8a8a8a]">
                    {filteredMovies.length} MATCHES
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {filteredMovies.length === 0 ? (
                    <motion.div 
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: CINEMATIC_EASE }}
                      className="py-24 text-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-8"
                    >
                      {/* Gentle Float Loop for Empty Icon */}
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Film className="w-10 h-10 text-[#666666] mx-auto mb-3 stroke-[1.5]" />
                      </motion.div>
                      <p className="font-display font-bold text-base uppercase text-white tracking-wider">
                        No Records Found
                      </p>
                      <p className="text-xs text-[#8a8a8a] mt-1 max-w-sm mx-auto font-normal">
                        No titles match your query across the archive. Try searching for a different keyword or director.
                      </p>
                      <button 
                        onClick={() => { setSearchQuery(''); setActiveGenre('All'); }}
                        className="mt-6 px-5 py-2.5 bg-white text-black text-xs font-black tracking-widest uppercase rounded-full hover:bg-white/90 transition-all cursor-pointer"
                      >
                        RESET FILTERS
                      </button>
                    </motion.div>
                  ) : (
                    /* Cross-Fade Grid when Filter Changes */
                    <motion.div 
                      key={`${activeGenre}-${searchQuery}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: CINEMATIC_EASE }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5"
                    >
                      {filteredMovies.map(movie => (
                        <MovieCard 
                          key={movie.id}
                          movie={movie}
                          onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                          onOpenDetails={(movie) => setSelectedMovie(movie)}
                          isWatchlisted={watchlist.some(m => m.id === movie.id)}
                          onToggleWatchlist={handleToggleWatchlist}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            ) : (
              /* Default Main Curated Homepage Content */
              <>
                {/* 1. Interactive Custom Movie Recommender (Cosine Similarity Engine) */}
                <CustomRecommender 
                  onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                  onOpenDetails={(movie) => setSelectedMovie(movie)}
                />

                <div className="space-y-6">
                  {/* 2. Row 1: Recommended Archive - Fades up with stagger (rowIndex 0) */}
                  <MovieCarousel 
                    title="Recommended Archive"
                    subtitle="Curated by similarity vectors based on your profile"
                    rowIndex={0}
                    movies={aiRecommendedMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />

                  {/* 3. Row 2: Trending Releases - Slides in from left wave (rowIndex 1) */}
                  <MovieCarousel 
                    title="Trending Releases"
                    subtitle="Highest resonance titles currently dominating global theater circuits"
                    rowIndex={1}
                    movies={trendingMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />

                  {/* 4. Row 3: Speculative & Sci-Fi - Slides in from right (rowIndex 2) */}
                  <MovieCarousel 
                    title="Speculative & Sci-Fi"
                    subtitle="Mind-bending temporal journeys and cybernetic odysseys"
                    rowIndex={2}
                    movies={sciFiMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />

                  {/* 5. Row 4: High-Octane Action - Scale-up with bottom clip-path reveal (rowIndex 3) */}
                  <MovieCarousel 
                    title="High-Octane Action"
                    subtitle="Kinetic pacing, precision choreography, and espionage"
                    rowIndex={3}
                    movies={actionMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                </div>
              </>
            )}
          </>
        )}

      </main>

      {/* 8. Signature Editorial Footer - Only rendered when intro is done */}
      {introDone && !loading && (
        <Footer />
      )}

      {/* 9. Floating "Back to Top" Button with Scale Pop (after 600px scroll) */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 w-11 h-11 rounded-full bg-white text-black border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer hover:bg-white/90 transition-colors"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 10. Modals & Drawers */}
      <AuthModal />
      
      <MovieDetailsModal 
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
        isWatchlisted={selectedMovie ? watchlist.some(m => m.id === selectedMovie.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      <TrailerModal 
        movie={activeTrailerMovie}
        onClose={() => setActiveTrailerMovie(null)}
      />

      <WatchlistDrawer 
        isOpen={watchlistOpen}
        onClose={() => setWatchlistOpen(false)}
        watchlist={watchlist}
        onRemove={handleToggleWatchlist}
        onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
        onOpenDetails={(movie) => setSelectedMovie(movie)}
      />

    </div>
  );
}

export default function App() {
  return (
    <IntroProvider>
      <MainAppContent />
    </IntroProvider>
  );
}
