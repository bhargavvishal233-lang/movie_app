import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Star, Film, Tv, Play, Info, ArrowRight } from 'lucide-react';
import { mockCustomRecommendations, getRecommendationsForMovie } from '../data/mockRecommenderData';
import { mockMovies } from '../data/mockMovies';
import { enhanceMoviesWithTMDB } from '../utils/tmdb';

export default function CustomRecommender({ onPlayTrailer, onOpenDetails }) {
  const [searchQuery, setSearchQuery] = useState('Inception');
  const [activeQuery, setActiveQuery] = useState('Inception');
  const [isSearching, setIsSearching] = useState(false);
  const [recommendations, setRecommendations] = useState(mockCustomRecommendations['Inception']);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestionPills = ["Inception", "Dune", "Interstellar", "The Dark Knight", "Oppenheimer"];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      // Filter movies from mock database that include the typed text
      const filtered = mockMovies
        .filter(m => m.title.toLowerCase().includes(value.toLowerCase()))
        .map(m => m.title)
        // Keep only unique titles in case of duplicates
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 6); // Limit to 6 suggestions
        
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  // TODO: Send query to Node.js / FastAPI backend (/recommend?movie=...)
  const handleSearchSubmit = async (e, queryToSearch = searchQuery) => {
    if (e) e.preventDefault();
    const query = queryToSearch.trim();
    if (!query) return;

    setIsSearching(true);
    setActiveQuery(query);

    try {
      // Fetch from FastAPI backend (http://localhost:8000/recommend?movie=...)
      const response = await fetch(`http://localhost:8000/recommend?movie=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.recommendations && data.recommendations.length > 0) {
          const fallbackSet = getRecommendationsForMovie(query);
          const formatted = data.recommendations.map((title, idx) => ({
            id: 200 + idx,
            title: title,
            year: fallbackSet[idx % fallbackSet.length].year || 2024,
            poster: fallbackSet[idx % fallbackSet.length].poster,
            imdbRating: fallbackSet[idx % fallbackSet.length].imdbRating || "8.5 / 10",
            director: fallbackSet[idx % fallbackSet.length].director || "Recommended Director",
            mainCast: fallbackSet[idx % fallbackSet.length].mainCast || ["Star A", "Co-Star B"],
            genre: fallbackSet[idx % fallbackSet.length].genre || "Sci-Fi / Thriller",
            whereToWatch: fallbackSet[idx % fallbackSet.length].whereToWatch || ["Netflix", "Amazon Prime Video"]
          }));
          
          // First set the formatted items (will use fallback posters while TMDB loads)
          setRecommendations(formatted);
          setIsSearching(false);
          
          // Then asynchronously fetch TMDB posters and update again
          const enhanced = await enhanceMoviesWithTMDB(formatted);
          setRecommendations(enhanced);
          return;
        }
      }
    } catch (err) {
      console.log('FastAPI backend offline, using dynamic fallback recommendations:', err);
    }

    // Dynamic local fallback if backend is offline or movie not found
    setTimeout(async () => {
      const fallbackList = getRecommendationsForMovie(query);
      setRecommendations(fallbackList);
      setIsSearching(false);
      
      const enhanced = await enhanceMoviesWithTMDB(fallbackList);
      setRecommendations(enhanced);
    }, 350);
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    setIsDropdownOpen(false);
    handleSearchSubmit(null, title);
  };

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="mb-16 bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
    >
      
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header & Subtitle */}
      <div className="relative z-10 max-w-3xl mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FastAPI & AI Recommender Engine</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Find Movies Like <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">{activeQuery || 'Your Favorite'}</span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Enter any movie you love to get 5 tailored recommendations, streaming availability, director notes, and cast info.
        </p>
      </div>

      {/* Search Bar Input */}
      <form onSubmit={(e) => handleSearchSubmit(e)} className="relative z-50 max-w-2xl mb-6">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Type a movie title (e.g., Inception, Dune, Interstellar)..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            className="w-full pl-11 pr-44 py-4 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base transition-all"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <span>{isSearching ? 'Analyzing...' : 'Get Recommendations'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && suggestions.length > 0 && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <ul className="py-2">
              {suggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-5 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors focus:outline-none focus:bg-slate-800"
                  >
                    <Search className="w-4 h-4 inline-block mr-3 text-slate-500" />
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Quick Suggestion Pills */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 mb-10 text-xs text-slate-400">
        <span className="font-semibold text-slate-500">Popular Searches:</span>
        {suggestionPills.map((title) => (
          <button
            key={title}
            type="button"
            onClick={() => handleSuggestionClick(title)}
            className={`px-3 py-1.5 rounded-full border transition-all ${
              activeQuery.toLowerCase() === title.toLowerCase()
                ? 'bg-red-600 text-white border-red-500 shadow-md font-bold'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            {title}
          </button>
        ))}
      </div>

      {/* Recommendation Results Grid / Loading State */}
      <div className="relative z-10">
        {isSearching ? (
          /* Loading Skeleton State */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-4 animate-pulse">
                <div className="aspect-[2/3] bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          /* Grid of 5 Staggered Recommendation Cards */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {recommendations.map((movie, index) => (
              <motion.div
                key={movie.id || index}
                variants={cardVariants}
                className="group relative flex flex-col bg-slate-950/90 rounded-2xl border border-slate-800/80 hover:border-red-500/60 overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-red-600/20"
              >
                {/* Poster Container */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Rating Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-950/90 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/40 backdrop-blur-md flex items-center space-x-1 shadow-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>IMDb {movie.imdbRating}</span>
                  </div>

                  {/* Year Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-slate-950/90 text-slate-300 text-[11px] font-semibold rounded-md border border-slate-800 backdrop-blur-md">
                    {movie.year}
                  </div>
                </div>

                {/* Card Content & Text Info Stagger */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
                  className="p-4 flex flex-col justify-between flex-1 space-y-3"
                >
                  <div>
                    {/* Title */}
                    <h3 className="font-bold text-base text-white group-hover:text-red-400 transition-colors line-clamp-1">
                      {movie.title}
                    </h3>
                    <p className="text-xs text-red-400 font-medium mt-0.5">
                      {movie.genre}
                    </p>

                    {/* Director Line */}
                    <div className="text-xs text-slate-300 mt-2.5 leading-tight">
                      <span className="text-slate-500 font-medium">Director: </span>
                      <strong className="text-slate-200">{movie.director}</strong>
                    </div>

                    {/* Main Cast Line */}
                    <div className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-tight">
                      <span className="text-slate-500 font-medium">Cast: </span>
                      <span className="text-slate-300">{Array.isArray(movie.mainCast) ? movie.mainCast.join(', ') : movie.mainCast}</span>
                    </div>
                  </div>

                  {/* "Where to Watch" Streaming Badges */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-semibold mb-1.5">
                      <Tv className="w-3 h-3 text-cyan-400" />
                      <span>Where to Watch:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(movie.whereToWatch) && movie.whereToWatch.map((provider, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-bold bg-slate-900 border border-cyan-500/30 text-cyan-300 rounded-md shadow-inner"
                        >
                          {provider}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center space-x-2">
                    <button
                      onClick={() => onPlayTrailer && onPlayTrailer(movie)}
                      className="flex-1 py-2 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-red-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Trailer</span>
                    </button>
                    <button
                      onClick={() => onOpenDetails && onOpenDetails({ ...movie, posterUrl: movie.poster, backdropUrl: movie.poster, rating: parseFloat(movie.imdbRating), description: `Recommended because you love ${activeQuery}. Directed by ${movie.director}.` })}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

    </motion.section>
  );
}
