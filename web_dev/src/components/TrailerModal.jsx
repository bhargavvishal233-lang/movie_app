import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { fetchMovieTrailerKey } from '../utils/tmdb';
import { CINEMATIC_EASE, stopScroll, startScroll } from '../utils/animations';

export default function TrailerModal({ movie, onClose }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;
    
    stopScroll();
    let isMounted = true;

    if (movie.trailerKey) {
      setVideoId(movie.trailerKey);
      setLoading(false);
      return () => {
        startScroll();
      };
    }
    
    async function resolveTrailer() {
      try {
        setLoading(true);

        // 1. Try TMDB videos API
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

        // 2. Try Python backend endpoint (/trailer?movie=...)
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

        if (isMounted) setVideoId(null);
      } catch (err) {
        if (isMounted) setVideoId(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    resolveTrailer();

    return () => {
      isMounted = false;
      startScroll();
    };
  }, [movie]);

  if (!movie) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
        {/* Backdrop Fade (0.3s) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.45, ease: CINEMATIC_EASE }}
          className="relative w-full max-w-5xl bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-10"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]">
            <div>
              <span className="label-caps text-[#666666]">OFFICIAL PREVIEW</span>
              <h3 className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-tight truncate">
                {movie.title}
              </h3>
            </div>
            
            <button
              onClick={onClose}
              className="group w-8 h-8 rounded-full border border-white/20 text-[#8a8a8a] hover:text-white hover:border-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>

          {/* Video Player Area */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="label-caps text-[#8a8a8a]">CONNECTING STREAM...</p>
              </div>
            ) : videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex flex-col items-center space-y-3 p-8 text-center max-w-md">
                <AlertCircle className="w-10 h-10 text-[#666666]" />
                <h4 className="font-display font-bold text-base text-white uppercase">PREVIEW ARCHIVE UNAVAILABLE</h4>
                <p className="text-xs text-[#8a8a8a] font-normal leading-relaxed">
                  No verified high-definition preview link found for "{movie.title}".
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-between text-[10px] font-mono tracking-widest text-[#666666] uppercase">
            <span>FORMAT: 1080P STREAM</span>
            <span>CINEMATIC ARCHIVE FEED</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
