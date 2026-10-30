import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Logo from './Logo';
import { CINEMATIC_EASE } from '../utils/animations';

export default function Footer() {
  const footerRef = useRef(null);
  const [mouseGlowX, setMouseGlowX] = useState(50); // percentage 0-100%

  // Track mouse horizontally over footer for interactive reactive glow
  const handleMouseMove = (e) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setMouseGlowX(percent);
  };

  // Rising spark particles
  const particles = [
    { id: 1, left: '12%', delay: '0s', duration: '6.5s', size: '2px' },
    { id: 2, left: '26%', delay: '1.2s', duration: '7.8s', size: '2.5px' },
    { id: 3, left: '40%', delay: '0.6s', duration: '5.8s', size: '2px' },
    { id: 4, left: '55%', delay: '2.0s', duration: '8.2s', size: '3px' },
    { id: 5, left: '68%', delay: '1.4s', duration: '6.2s', size: '2px' },
    { id: 6, left: '82%', delay: '2.8s', duration: '7.2s', size: '2.5px' },
    { id: 7, left: '94%', delay: '0.4s', duration: '6.0s', size: '1.5px' },
  ];

  const socialLinks = [
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'X / Twitter', url: 'https://x.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
  ];

  return (
    <footer 
      ref={footerRef}
      onMouseMove={handleMouseMove}
      className="relative bg-black border-t border-white/10 pt-20 pb-10 overflow-hidden select-none"
    >
      
      {/* Upper Footer: Balanced 3-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Brand & Dossier Statement (Cols 1-5) */}
          <div className="md:col-span-5 max-w-sm">
            <Logo size="default" />
            <p className="text-xs text-[#8a8a8a] leading-relaxed mt-4 font-normal">
              An editorial cinematic interface and machine-learning recommendation archive powered by cosine similarity vectors across 4,800+ films.
            </p>
          </div>

          {/* Column 2: Navigation Links (Cols 6-8) */}
          <div className="md:col-span-3 flex flex-col space-y-3.5 text-xs font-semibold uppercase tracking-widest">
            <span className="label-caps text-[#555555] mb-1">ARCHIVE</span>
            <a href="#" className="group relative block overflow-hidden h-[1.25em] leading-[1.25em] text-[#d4d4d4] hover:text-white transition-colors w-fit">
              <span className="flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2">
                <span className="block h-[1.25em] leading-[1.25em]">Home</span>
                <span className="block h-[1.25em] leading-[1.25em] text-white" aria-hidden="true">Home</span>
              </span>
            </a>
            <a href="#" className="group relative block overflow-hidden h-[1.25em] leading-[1.25em] text-[#d4d4d4] hover:text-white transition-colors w-fit">
              <span className="flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2">
                <span className="block h-[1.25em] leading-[1.25em]">Movies</span>
                <span className="block h-[1.25em] leading-[1.25em] text-white" aria-hidden="true">Movies</span>
              </span>
            </a>
            <a href="#" className="group relative block overflow-hidden h-[1.25em] leading-[1.25em] text-[#d4d4d4] hover:text-white transition-colors w-fit">
              <span className="flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2">
                <span className="block h-[1.25em] leading-[1.25em]">Recommendations</span>
                <span className="block h-[1.25em] leading-[1.25em] text-white" aria-hidden="true">Recommendations</span>
              </span>
            </a>
          </div>

          {/* Column 3: CONNECT (Cols 9-12) */}
          <div className="md:col-span-4 flex flex-col space-y-3.5 text-xs font-semibold uppercase tracking-widest">
            <span className="label-caps text-[#555555] mb-1">CONNECT</span>
            {socialLinks.map((item) => (
              <a 
                key={item.label}
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center space-x-2 text-[#d4d4d4] hover:text-white transition-colors group w-fit"
              >
                <span className="block overflow-hidden h-[1.25em] leading-[1.25em]">
                  <span className="flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1/2">
                    <span className="block h-[1.25em] leading-[1.25em]">{item.label}</span>
                    <span className="block h-[1.25em] leading-[1.25em] text-white" aria-hidden="true">{item.label}</span>
                  </span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#666666] group-hover:text-white transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
              </a>
            ))}
          </div>

        </div>
      </div>

      {/* Floating Spark Particles Rising Upward */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white opacity-40 animate-pulse"
            style={{
              left: p.left,
              bottom: '4%',
              width: p.size,
              height: p.size,
              animation: `float-particle ${p.duration} infinite ease-in-out ${p.delay}`,
            }}
          />
        ))}
      </div>

      {/* SIGNATURE ELEMENT: Giant Barcode-Striped "ENTERTAINMENT" with Breathing Effect & Reactive Glow */}
      <div className="relative w-full overflow-hidden flex flex-col items-center justify-center mt-4">
        
        {/* Dynamic Horizontal Glow: Tracks Mouse X Pos */}
        <div 
          className="absolute -bottom-16 w-[45vw] h-48 rounded-full pointer-events-none transition-all duration-300 ease-out blur-3xl"
          style={{
            left: `${mouseGlowX}%`,
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle, var(--footer-glow, rgba(255, 120, 40, 0.38)) 0%, transparent 70%)`,
          }}
        />

        {/* Ambient Rising Glow on Scroll */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 0.65, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: CINEMATIC_EASE }}
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none blur-2xl"
          style={{
            background: `linear-gradient(to top, var(--footer-glow, rgba(255, 120, 40, 0.38)), transparent)`,
          }}
        />

        {/* Giant Barcode-Striped Word with Breathing Animation */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: CINEMATIC_EASE }}
          className="w-full text-center overflow-hidden px-2 relative z-20"
        >
          <span 
            className="barcode-text barcode-mask font-display font-black tracking-tighter uppercase block leading-[0.82] animate-barcode-breathe"
            style={{
              fontSize: 'clamp(2.5rem, 11.8vw, 15rem)',
            }}
          >
            ENTERTAINMENT
          </span>
        </motion.div>

      </div>

      {/* Copyright Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#555555] gap-3 relative z-20">
        <div>
          © {new Date().getFullYear()} MOVIE ENTERTAINMENT ARCHIVE. ALL RIGHTS RESERVED.
        </div>
        <div>
          STRICT MONOCHROME ARCHIVE • 60 FPS MOTION
        </div>
      </div>

      {/* Embedded Animation Styles */}
      <style>{`
        @keyframes float-particle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-240px) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes barcode-breathe {
          0%, 100% {
            filter: contrast(100%) brightness(1);
          }
          50% {
            filter: contrast(120%) brightness(1.2);
          }
        }

        .animate-barcode-breathe {
          animation: barcode-breathe 6s ease-in-out infinite;
        }
      `}</style>

    </footer>
  );
}
