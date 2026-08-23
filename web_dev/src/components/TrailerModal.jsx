import React, { useState, useEffect } from 'react';
import { X, Play, ExternalLink, AlertCircle, Film } from 'lucide-react';
import { fetchMovieTrailerKey } from '../utils/tmdb';

export default function TrailerModal({ movie, onClose }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;
    
    let isMounted = true;

    // 1. Direct trailer key on the movie object (e.g. from mockMovies or pre-enhanced data)
    if (movie.trailerKey) {
      setVideoId(movie.trailerKey);
      setLoading(false);
      return;
    }
    
    async function resolveTrailer() {
      try {
        setLoading(true);

        // 2. Try TMDB videos API
        try {
          const tmdbTrailerKey = await fetchMovieTrailerKey(movie.title, movie.tmdbId || movie.id);
          if (isMounted && tmdbTrailerKey) {
            setVideoId(tmdbTrailerKey);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("TMDB trailer lookup failed, trying backend...", e);
        }

        // 3. Try Python backend endpoint (/trailer?movie=...)
        try {
          const res = await fetch(`http://localhost:8000/trailer?movie=${encodeURIComponent(movie.title)}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.status === "success" && data.video_id) {
              setVideoId(data.video_id);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Backend trailer endpoint unreachable", e);
        }

        // If all resolution methods fail
        if (isMounted) {
          setVideoId(null);
        }
      } catch (err) {
        if (isMounted) setVideoId(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    resolveTrailer();
    
    return () => { isMounted = false; };
  }, [movie]);

  if (!movie) return null;

  // Direct YouTube URLs
  const directYoutubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`;

  const iframeSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Backdrop listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5 min-w-0 pr-4">
            <div className="p-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-red-500" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {movie.title} <span className="text-slate-400 font-normal text-xs sm:text-sm">— Official Trailer</span>
            </h3>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Open directly in YouTube button */}
            <a
              href={directYoutubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-600/20 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-500/40 text-xs font-semibold transition-all shadow-sm"
              title="Open video on YouTube.com"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open on YouTube</span>
            </a>

            {/* Close modal button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-medium text-sm">Locating Official Trailer...</p>
            </div>
          ) : iframeSrc ? (
            <iframe
              src={iframeSrc}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            /* Fallback screen if embedding is unavailable */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
              {movie.backdropUrl && (
                <img
                  src={movie.backdropUrl}
                  alt={movie.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-sm"
                />
              )}
              <div className="relative z-10 max-w-md flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <Film className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{movie.title}</h4>
                  <p className="text-sm text-slate-400">
                    Watch the full official trailer and clips directly on YouTube.
                  </p>
                </div>
                <a
                  href={directYoutubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch on YouTube</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Helper Note */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Video blocked or not playing?</span>
          </div>
          <a
            href={directYoutubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 hover:text-red-300 font-medium flex items-center space-x-1 underline underline-offset-2"
          >
            <span>Watch directly on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>

    </div>
  );
}
