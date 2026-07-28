import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';

export default function TrailerModal({ movie, onClose }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;
    
    let isMounted = true;
    
    async function fetchTrailer() {
      try {
        setLoading(true);
        // Hit our Python backend endpoint which acts as a proxy to bypass YouTube embed blocks
        const res = await fetch(`http://localhost:8000/trailer?movie=${encodeURIComponent(movie.title)}`);
        const data = await res.json();
        
        if (isMounted && data.status === "success" && data.video_id) {
          setVideoId(data.video_id);
        } else if (isMounted) {
          // Fallback to a generic search embed if backend fails or doesn't find it
          setVideoId(null);
        }
      } catch (err) {
        if (isMounted) setVideoId(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchTrailer();
    
    return () => { isMounted = false; };
  }, [movie]);

  if (!movie) return null;

  // Determine iframe source
  let iframeSrc = "";
  if (videoId) {
    iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else {
    // Ultimate fallback if backend is down
    iframeSrc = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(movie.title + " official trailer")}&autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Backdrop listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Play className="w-5 h-5 text-red-500 fill-red-500" />
            <h3 className="text-lg font-bold text-white truncate">
              {movie.title} — Official Trailer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-medium text-sm">Locating Official Trailer...</p>
            </div>
          ) : (
            <iframe
              src={iframeSrc}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

      </div>

    </div>
  );
}
