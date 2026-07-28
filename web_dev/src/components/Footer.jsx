import React from 'react';
import { Film, Heart, Sparkles, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white">
                Movie<span className="text-red-500">App</span>
              </span>
              <p className="text-xs text-slate-400">Next-gen AI Recommendation Engine</p>
            </div>
          </div>

          {/* Technology Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>React 18 & Vite</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Tailwind CSS</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>Swiper.js</span>
            </span>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-500 text-center md:text-right">
            <p>© 2026 MovieApp. All rights reserved.</p>
            <p className="mt-1 flex items-center justify-center md:justify-end space-x-1">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for cinema lovers</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
