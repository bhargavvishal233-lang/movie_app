/**
 * TMDB (The Movie Database) Utility
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a `.env` file in the root of your React project (movie-recommendation-app/.env)
 * 2. Add your TMDB API key to the file like this:
 *    VITE_TMDB_API_KEY=your_api_key_here
 * 3. Restart your Vite development server for the changes to take effect.
 */

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function fetchMovieData(movieTitle) {
  if (!movieTitle || !TMDB_API_KEY) {
    if (!TMDB_API_KEY) console.warn("TMDB API Key is missing. Please add VITE_TMDB_API_KEY to your .env file.");
    return null;
  }

  try {
    const encodedTitle = encodeURIComponent(movieTitle);
    const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodedTitle}&api_key=${TMDB_API_KEY}`);
    
    if (!response.ok) {
      throw new Error('TMDB API request failed');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const firstResult = data.results[0];
      
      return {
        ...firstResult,
        posterUrl: firstResult.poster_path ? `${TMDB_IMAGE_BASE_URL}${firstResult.poster_path}` : null,
        backdropUrl: firstResult.backdrop_path ? `https://image.tmdb.org/t/p/original${firstResult.backdrop_path}` : null,
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching movie data from TMDB:", error);
    return null;
  }
}

/**
 * Helper to update a list of movies with real TMDB posters
 */
export async function enhanceMoviesWithTMDB(movies) {
  if (!TMDB_API_KEY) return movies; // Skip if no API key
  
  const enhancedMovies = await Promise.all(
    movies.map(async (movie) => {
      const tmdbData = await fetchMovieData(movie.title);
      if (tmdbData && tmdbData.posterUrl) {
        return {
          ...movie,
          posterUrl: tmdbData.posterUrl,
          poster: tmdbData.posterUrl, // CustomRecommender uses 'poster'
          backdropUrl: tmdbData.backdropUrl || movie.backdropUrl,
        };
      }
      return movie;
    })
  );
  
  return enhancedMovies;
}
