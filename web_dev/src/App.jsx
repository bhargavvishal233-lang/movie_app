import React, { useState, useEffect } from 'react';
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
import NebulaParticles3D from './components/NebulaParticles3D';

import { mockMovies } from './data/mockMovies';
import { enhanceMoviesWithTMDB } from './utils/tmdb';
import { Sparkles, Flame, Rocket, Zap, Search, Film } from 'lucide-react';

export default function App() {
  // TODO: Fetch from Node.js backend (/api/recommendations)
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistOpen, setWatchlistOpen] = useState(false);

  // 3D Particle Hover State
  const [hoveredCardPos, setHoveredCardPos] = useState({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState(false);

  useEffect(() => {
    // TODO: Fetch from Node.js backend (/api/recommendations)
    // Example:
    // fetch('/api/recommendations')
    //   .then(res => res.json())
    //   .then(data => setMovies(data))
    //   .catch(err => console.error('Error fetching backend recommendations:', err));
    
    // Simulate loading local data
    const loadMovies = async () => {
      setMovies(mockMovies);
      setLoading(false);
      
      // Asynchronously fetch real TMDB posters and update the UI
      const enhancedMovies = await enhanceMoviesWithTMDB(mockMovies);
      setMovies(enhancedMovies);
    };
    
    loadMovies();
  }, []);

  const handleCardHover = ({ x, y, isHovered }) => {
    setHoveredCardPos({ x, y });
    setIsCardHovered(isHovered);
  };

  // Featured Hero Movie (First item or designated featured)
  const featuredMovie = movies.find(m => m.isFeatured) || movies[0];

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
      activeGenre === 'All' || 
      movie.genre === activeGenre ||
      (movie.subGenres && movie.subGenres.includes(activeGenre)) ||
      (activeGenre === 'AI Recommended' && movie.category === 'AI Recommended');

    return matchesSearch && matchesGenre;
  });

  // Categorized Carousel Subsets
  const aiRecommendedMovies = movies.filter(m => m.category === 'AI Recommended' || m.matchScore >= 95);
  const trendingMovies = movies.filter(m => m.category === 'Trending Blockbusters' || m.rating >= 8.5);
  const sciFiMovies = movies.filter(m => m.genre === 'Sci-Fi' || (m.subGenres && m.subGenres.includes('Sci-Fi')));
  const actionMovies = movies.filter(m => m.genre === 'Action' || (m.subGenres && m.subGenres.includes('Action')));

  const isSearchOrFilterActive = searchQuery.trim() !== '' || activeGenre !== 'All';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* R3F Nebulous Interactive 3D Particle Cloud Background */}
      <NebulaParticles3D 
        hoveredCardPos={hoveredCardPos} 
        isHovered={isCardHovered} 
      />

      {/* App Content Layer (Floating above 3D particle background) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Sticky Header Navbar */}
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeGenre={activeGenre}
          setActiveGenre={setActiveGenre}
          watchlistCount={watchlist.length}
          onOpenWatchlist={() => setWatchlistOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          
          {loading ? (
            // Loading Skeleton
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              <p className="text-slate-400 text-sm font-medium">Loading recommendations...</p>
            </div>
          ) : (
            <>
              {/* Show Featured Hero Banner when no search query is active */}
              {!isSearchOrFilterActive && featuredMovie && (
                <HeroBanner 
                  movie={featuredMovie}
                  onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                  onOpenDetails={(movie) => setSelectedMovie(movie)}
                  isWatchlisted={watchlist.some(m => m.id === featuredMovie.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              )}

              {/* Genre Filter Bar */}
              <GenreFilterBar 
                activeGenre={activeGenre}
                setActiveGenre={setActiveGenre}
                resultCount={filteredMovies.length}
              />

              {/* Interactive Custom Movie Recommender & Details Section */}
              <CustomRecommender 
                onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                onOpenDetails={(movie) => setSelectedMovie(movie)}
              />

              {/* If Search Query or Specific Genre Filter is active, display grid view */}
              {isSearchOrFilterActive ? (
                <section className="mb-16">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Search className="w-5 h-5 text-red-500" />
                    <span>
                      {searchQuery ? `Search Results for "${searchQuery}"` : `${activeGenre} Movies`}
                    </span>
                  </h2>

                  {filteredMovies.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl">
                      <Film className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="font-semibold text-slate-200">No movies found matching your criteria</p>
                      <button 
                        onClick={() => { setSearchQuery(''); setActiveGenre('All'); }}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredMovies.map(movie => (
                        <MovieCard 
                          key={movie.id}
                          movie={movie}
                          onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                          onOpenDetails={(movie) => setSelectedMovie(movie)}
                          isWatchlisted={watchlist.some(m => m.id === movie.id)}
                          onToggleWatchlist={handleToggleWatchlist}
                          onHoverCard={handleCardHover}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ) : (
                /* Default Main Homepage Carousels */
                <>
                  {/* 1. AI Personalized Recommendations */}
                  <MovieCarousel 
                    title="Recommended for You"
                    subtitle="Curated by AI based on your viewing history & taste profile"
                    icon={Sparkles}
                    movies={aiRecommendedMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    onHoverCard={handleCardHover}
                  />

                  {/* 2. Trending Blockbusters */}
                  <MovieCarousel 
                    title="Trending Blockbusters"
                    subtitle="Most watched titles across cinema and streaming today"
                    icon={Flame}
                    movies={trendingMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    onHoverCard={handleCardHover}
                  />

                  {/* 3. Top Rated Sci-Fi */}
                  <MovieCarousel 
                    title="Top Rated Sci-Fi & Cyberpunk"
                    subtitle="Mind-bending futuristic journeys and space odysseys"
                    icon={Rocket}
                    movies={sciFiMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    onHoverCard={handleCardHover}
                  />

                  {/* 4. Action Packed Thrillers */}
                  <MovieCarousel 
                    title="High Octane Action & Thrillers"
                    subtitle="Adrenaline-pumping action blockbusters and mystery thrillers"
                    icon={Zap}
                    movies={actionMovies}
                    onPlayTrailer={(movie) => setActiveTrailerMovie(movie)}
                    onOpenDetails={(movie) => setSelectedMovie(movie)}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    onHoverCard={handleCardHover}
                  />
                </>
              )}
            </>
          )}

        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Modals & Drawers */}
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
