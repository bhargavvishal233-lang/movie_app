/**
 * TMDB (The Movie Database) Utility
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a `.env` file in the root of your React project (movie-recommendation-app/.env)
 * 2. Add your TMDB API key to the file like this:
 *    VITE_TMDB_API_KEY=your_api_key_here
 * 3. Restart your Vite development server for the changes to take effect.
 */

const DEFAULT_TMDB_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || DEFAULT_TMDB_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function fetchMovieData(movieTitle) {
  if (!movieTitle || !TMDB_API_KEY) {
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
        tmdbId: firstResult.id,
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
 * Fetch official YouTube trailer video key for a movie from TMDB
 */
export async function fetchMovieTrailerKey(movieTitle, tmdbId = null) {
  if (!TMDB_API_KEY) return null;

  try {
    let resolvedId = tmdbId;
    
    // If we only have the title, search for the movie first
    if (!resolvedId && movieTitle) {
      const movieData = await fetchMovieData(movieTitle);
      if (movieData && movieData.id) {
        resolvedId = movieData.id;
      }
    }

    if (!resolvedId) return null;

    // Fetch movie videos from TMDB
    const videoRes = await fetch(`${TMDB_BASE_URL}/movie/${resolvedId}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
    if (!videoRes.ok) return null;

    const videoData = await videoRes.json();
    if (videoData.results && videoData.results.length > 0) {
      // Find official YouTube Trailer
      const officialTrailer = videoData.results.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      );
      if (officialTrailer && officialTrailer.key) {
        return officialTrailer.key;
      }

      // Fallback to any YouTube video (Teaser, Clip, etc.)
      const anyYoutube = videoData.results.find(
        (v) => v.site === 'YouTube' && v.key
      );
      if (anyYoutube) {
        return anyYoutube.key;
      }
    }

    return null;
  } catch (error) {
    console.warn("Could not fetch trailer from TMDB:", error);
    return null;
  }
}

/**
 * Helper to update a list of movies with real TMDB posters and trailers
 */
export async function enhanceMoviesWithTMDB(movies) {
  if (!TMDB_API_KEY) return movies;
  
  const enhancedMovies = await Promise.all(
    movies.map(async (movie) => {
      try {
        const tmdbData = await fetchMovieData(movie.title);
        if (tmdbData) {
          const trailerKey = await fetchMovieTrailerKey(movie.title, tmdbData.id);
          return {
            ...movie,
            tmdbId: tmdbData.id,
            posterUrl: tmdbData.posterUrl || movie.posterUrl,
            poster: tmdbData.posterUrl || movie.poster,
            backdropUrl: tmdbData.backdropUrl || movie.backdropUrl,
            trailerKey: trailerKey || movie.trailerKey,
          };
        }
      } catch (e) {
        // Silent catch for individual items
      }
      return movie;
    })
  );
  
  return enhancedMovies;
}
