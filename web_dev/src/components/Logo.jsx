import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Logo({ size = 'default', animated = true, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  // Scaled dimensions based on 'size' prop
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const scaleClass = isLarge ? 'scale-125 md:scale-150' : isSmall ? 'scale-90' : 'scale-100';

  return (
    <div 
      className={`inline-flex flex-col select-none cursor-pointer group ${scaleClass} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Wordmark Row: m - [reel] - v - i - e */}
      <div className="flex items-center overflow-hidden">
        {/* Letters container with masked slide-up */}
        <motion.div 
          className="flex items-center space-x-[2px] leading-none"
          initial={animated ? { y: '100%', opacity: 0 } : false}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Letter 'm' */}
          <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white lowercase">
            m
          </span>

          {/* Film-Reel as 'o' (1 full rotation on load, 1 slow full rotation on hover) */}
          <motion.div
            className="relative mx-[1px] flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7"
            initial={animated ? { rotate: -360, scale: 0.8 } : false}
            animate={{ 
              rotate: isHovered ? 360 : 0,
              scale: 1,
            }}
            transition={{
              rotate: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 0.6 }
            }}
          >
            <svg 
              viewBox="0 0 32 32" 
              className="w-full h-full text-white" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer rim */}
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2.5" opacity="0.6" />
              
              {/* Inner hub */}
              <circle cx="16" cy="16" r="4.5" fill="currentColor" />
              <circle cx="16" cy="16" r="2" fill="#000000" />
              
              {/* 4 Sprocket holes */}
              <circle cx="16" cy="7.5" r="2" fill="currentColor" />
              <circle cx="16" cy="24.5" r="2" fill="currentColor" />
              <circle cx="7.5" cy="16" r="2" fill="currentColor" />
              <circle cx="24.5" cy="16" r="2" fill="currentColor" />
              
              {/* Spokes */}
              <line x1="16" y1="4.5" x2="16" y2="11.5" stroke="currentColor" strokeWidth="1" opacity="0.8" />
              <line x1="16" y1="20.5" x2="16" y2="27.5" stroke="currentColor" strokeWidth="1" opacity="0.8" />
              <line x1="4.5" y1="16" x2="11.5" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.8" />
              <line x1="20.5" y1="16" x2="27.5" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.8" />
            </svg>
          </motion.div>

          {/* Letters 'v', 'i', 'e' */}
          <span className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white lowercase">
            vie
          </span>
        </motion.div>
      </div>

      {/* Bottom Subtitle: E N T E R T A I N M E N T in wide spaced small caps */}
      <div className="overflow-hidden mt-0.5">
        <motion.div
          initial={animated ? { y: '100%', opacity: 0 } : false}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[7.5px] sm:text-[8.5px] font-semibold tracking-[0.32em] text-[#8a8a8a] uppercase group-hover:text-white transition-colors duration-300"
        >
          ENTERTAINMENT
        </motion.div>
      </div>
    </div>
  );
}
