import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Play, Sparkles, Tv } from 'lucide-react';
import { mockCustomRecommendations, getRecommendationsForMovie } from '../data/mockRecommenderData';
import { mockMovies } from '../data/mockMovies';
import { enhanceMoviesWithTMDB } from '../utils/tmdb';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { CINEMATIC_EASE } from '../utils/animations';

// Counting Match Score Component (Counts up from 0 to score)
function AnimatedScore({ score = 95 }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [score]);

  return <span>{val}%</span>;
}

export default function CustomRecommender({ onPlayTrailer, onOpenDetails }) {
  const [searchQuery, setSearchQuery] = useState('Inception');
  const [activeQuery, setActiveQuery] = useState('Inception');
  const [isSearching, setIsSearching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recommendations, setRecommendations] = useState(mockCustomRecommendations['Inception']);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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
      const filtered = mockMovies
        .filter(m => m.title.toLowerCase().includes(value.toLowerCase()))
        .map(m => m.title)
        .filter((val, index, self) => self.indexOf(val) === index)
        .slice(0, 6);
        
      setSuggestions(filtered);
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  };

  // Submit query to FastAPI backend
  const handleSearchSubmit = async (e, queryToSearch = searchQuery) => {
    if (e) e.preventDefault();
    const query = queryToSearch.trim();
    if (!query) return;

    setIsSearching(true);
    setActiveQuery(query);

    try {
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
            matchScore: 98 - (idx * 2),
            director: fallbackSet[idx % fallbackSet.length].director || "Recommended Director",
            mainCast: fallbackSet[idx % fallbackSet.length].mainCast || ["Lead Actor", "Supporting Cast"],
            genre: fallbackSet[idx % fallbackSet.length].genre || "Drama / Sci-Fi",
            whereToWatch: fallbackSet[idx % fallbackSet.length].whereToWatch || ["Netflix", "Apple TV"]
          }));
          
          setRecommendations(formatted);
          setIsSearching(false);
          
          const enhanced = await enhanceMoviesWithTMDB(formatted);
          setRecommendations(enhanced);
          return;
        }
      }
    } catch (err) {
      console.log('FastAPI backend offline, falling back to local dataset:', err);
    }

    setTimeout(async () => {
      const fallbackList = getRecommendationsForMovie(query).map((m, idx) => ({
        ...m,
        matchScore: 97 - (idx * 2)
      }));
      setRecommendations(fallbackList);
      setIsSearching(false);
      
      const enhanced = await enhanceMoviesWithTMDB(fallbackList);
      setRecommendations(enhanced);
    }, 600);
  };

  const handleSuggestionClick = (title) => {
    setSearchQuery(title);
    setIsDropdownOpen(false);
    handleSearchSubmit(null, title);
  };

  const renderCard = (movie, index) => (
    <motion.div
      key={`${activeQuery}-${movie.id || index}`}
      initial={{ opacity: 0, y: 35, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.65, delay: index * 0.08, ease: CINEMATIC_EASE }}
      onClick={() => onOpenDetails && onOpenDetails({ 
        ...movie, 
        posterUrl: movie.poster, 
        backdropUrl: movie.poster, 
        rating: parseFloat(movie.imdbRating) || 8.5, 
        description: `Algorithmic recommendation generated from "${activeQuery}". Directed by ${movie.director}.` 
      })}
      className="group relative flex flex-col w-full h-full bg-[#0a0a0a] border border-white/10 hover:border-white/30 rounded-xl overflow-hidden transition-all duration-400 cursor-pointer hover:-translate-y-1.5"
    >
      {/* Poster with Grayscale-to-Color Transition */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121212]">
        <img
          src={movie.poster}
          alt={movie.title}
          className="poster-grayscale w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
          loading="lazy"
        />

        {/* Minimal Rating Badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/85 text-white text-[10px] font-bold tracking-wider rounded border border-white/20 backdrop-blur-md">
          {movie.imdbRating?.replace(' / 10', '') || '8.5'}
        </div>

        {/* Live Counting Match Score Badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 text-white text-[10px] font-mono tracking-wider rounded border border-white/20 backdrop-blur-md">
          <AnimatedScore score={movie.matchScore || 96} />
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayTrailer && onPlayTrailer(movie);
            }}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="Play Trailer"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        </div>
      </div>

      {/* Movie Info Details */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-[#0a0a0a]">
        <div>
          <div className="label-caps mb-1 text-[#8a8a8a]">
            {movie.genre}
          </div>
          <h3 className="font-display font-bold text-sm text-white group-hover:text-white transition-colors truncate">
            {movie.title}
          </h3>

          <div className="text-[11px] text-[#8a8a8a] mt-2 line-clamp-1 font-mono">
            <span className="text-[#555555]">DIR: </span>
            <span className="text-white/80">{movie.director}</span>
          </div>

          <div className="text-[11px] text-[#8a8a8a] mt-1 line-clamp-1 font-mono">
            <span className="text-[#555555]">CAST: </span>
            <span className="text-white/80">{Array.isArray(movie.mainCast) ? movie.mainCast.join(', ') : movie.mainCast}</span>
          </div>
        </div>

        {/* Streaming Availability */}
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center space-x-1.5 label-caps text-[#666666] mb-1.5">
            <Tv className="w-3 h-3 text-white/70" />
            <span>AVAILABLE ON</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.isArray(movie.whereToWatch) && movie.whereToWatch.map((provider, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider bg-black border border-white/15 text-[#d4d4d4] rounded"
              >
                {provider}
              </span>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );

  return (
    <section className="mb-20 pt-6 border-t border-white/10 relative">
      
      {/* Section Header with Left-to-Right Draw Line */}
      <div className="mb-8 relative pb-4">
        <div className="flex items-center space-x-2 label-caps text-[#8a8a8a] mb-2">
          <Sparkles className="w-3 h-3 text-white" />
          <span>COSINE SIMILARITY ENGINE</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="overflow-hidden">
              <motion.h2 
                initial={{ y: '100%' }}
                whileInView={{ y: '0%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
                className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter"
              >
                RESONANCE WITH <span className="underline decoration-white/40 underline-offset-8">"{activeQuery}"</span>
              </motion.h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8a8a8a] mt-3 max-w-xl font-normal leading-relaxed">
              Calculated across 4,800+ films through TMDB tags, cast vectors, and director profiles.
            </p>
          </div>
        </div>

        {/* Thin Drawing Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: CINEMATIC_EASE }}
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left"
        />
      </div>

      {/* Input Search Form with Animated Draw Border on Focus */}
      <form onSubmit={(e) => handleSearchSubmit(e)} className="relative z-30 max-w-2xl mb-5">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8a8a8a]">
            <Search className="h-4 w-4" />
          </div>
          
          <input
            type="text"
            placeholder="Type any movie title (e.g. Interstellar, The Matrix)..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => {
              setIsInputFocused(true);
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            onBlur={() => setIsInputFocused(false)}
            className="w-full pl-11 pr-36 py-3.5 bg-black border border-white/20 rounded-full text-xs sm:text-sm font-medium tracking-wide text-white placeholder-[#666666] focus:outline-none focus:border-white transition-all duration-300 relative z-10"
          />

          {/* Animated SVG Border that draws on Focus */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-full overflow-visible">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              rx="9999"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="600"
              strokeDashoffset={isInputFocused ? "0" : "600"}
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </svg>

          <button
            type="submit"
            disabled={isSearching}
            className="btn-cinema absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 z-20 cursor-pointer"
          >
            <span>{isSearching ? 'COMPUTING...' : 'DISCOVER'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && suggestions.length > 0 && (
            <motion.div 
              ref={dropdownRef}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 text-xs"
            >
              <ul className="py-2">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-5 py-2.5 text-[#d4d4d4] hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium tracking-wide">{suggestion}</span>
                      <ArrowRight className="w-3 h-3 text-[#666666]" />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Quick Suggestion Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-10 text-xs">
        <span className="label-caps text-[#666666] mr-1">CURATED SEEDS:</span>
        {suggestionPills.map((title) => (
          <button
            key={title}
            type="button"
            onClick={() => handleSuggestionClick(title)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
              activeQuery.toLowerCase() === title.toLowerCase()
                ? 'bg-white text-black border-white'
                : 'bg-black text-[#8a8a8a] border-white/15 hover:border-white/40 hover:text-white'
            }`}
          >
            {title}
          </button>
        ))}
      </div>

      {/* Results View / AI Thinking State */}
      <div className="relative min-h-[340px]">
        {isSearching ? (
          /* AI Thinking State: 3 Pulsing Dots + Thin Scanning Line */
          <div className="relative overflow-hidden p-12 bg-[#0a0a0a] border border-white/15 rounded-2xl min-h-[340px] flex flex-col items-center justify-center space-y-4">
            
            {/* Animated Scanning Line moving vertically */}
            <div 
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_white] animate-scan-y pointer-events-none" 
            />

            {/* 3 Sequential Pulsing Dots */}
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" />
            </div>

            <div className="text-center space-y-1">
              <p className="font-display font-bold text-sm tracking-widest uppercase text-white">
                COMPUTING COSINE SIMILARITY
              </p>
              <p className="text-[11px] font-mono tracking-wider text-[#8a8a8a] uppercase">
                ANALYZING 4,800+ FILM EMBEDDINGS FOR "{activeQuery}"
              </p>
            </div>

            <style>{`
              @keyframes scan-y {
                0% { top: 0%; opacity: 0; }
                15% { opacity: 1; }
                85% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
              .animate-scan-y {
                animation: scan-y 1.5s ease-in-out infinite;
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* Desktop Grid with Blur-to-Sharp Staggered Entrance */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {recommendations.map((movie, index) => renderCard(movie, index))}
            </div>

            {/* Mobile Carousel View */}
            <div className="block sm:hidden -mx-4 px-2">
              <Swiper
                spaceBetween={14}
                slidesPerView={1.3}
                centeredSlides={true}
                loop={true}
                speed={700}
                className="w-full !py-2"
              >
                {recommendations.map((movie, index) => (
                  <SwiperSlide key={movie.id || index} className="!h-auto flex">
                    {renderCard(movie, index)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </>
        )}
      </div>

    </section>
  );
}
