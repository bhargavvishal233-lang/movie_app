import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import 'swiper/css';
import 'swiper/css/navigation';
import { CINEMATIC_EASE } from '../utils/animations';

// Magnetic Button Component for Prev/Next Arrows
function MagneticArrowButton({ onClick, direction = 'left', disabled, buttonRef }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 22, mass: 0.5 }}
      disabled={disabled}
      className="w-9 h-9 rounded-full border border-white/20 text-white/70 hover:text-black hover:bg-white hover:border-white flex items-center justify-center transition-colors duration-200 active:scale-90 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
      aria-label={direction === 'left' ? 'Previous Slide' : 'Next Slide'}
    >
      {direction === 'left' ? (
        <ChevronLeft className="w-4 h-4 stroke-[2]" />
      ) : (
        <ChevronRight className="w-4 h-4 stroke-[2]" />
      )}
    </motion.button>
  );
}

export default function MovieCarousel({ 
  title, 
  subtitle, 
  movies = [], 
  rowIndex = 0, // 0: fade-up, 1: scale-in, 2: contrast-bloom, 3: lift-reveal
  onPlayTrailer, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (!movies.length) return null;

  // Split title letters for character-level masked slide-up
  const titleChars = Array.from(title);

  // Distinct cinematic entrance motion per row index without horizontal layout collision
  const getRowVariants = () => {
    switch (rowIndex % 4) {
      case 0:
        // Row 1: Cards fade up with smooth stagger
        return {
          hidden: { opacity: 0, y: 14 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.65, delay: i * 0.05, ease: CINEMATIC_EASE }
          })
        };
      case 1:
        // Row 2: Cards scale in gently with stagger
        return {
          hidden: { opacity: 0, scale: 0.96 },
          visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: { duration: 0.65, delay: i * 0.05, ease: CINEMATIC_EASE }
          })
        };
      case 2:
        // Row 3 (Speculative & Sci-Fi): Smooth contrast & brightness bloom with stagger
        return {
          hidden: { opacity: 0, filter: 'contrast(125%) brightness(1.2)' },
          visible: (i) => ({
            opacity: 1,
            filter: 'contrast(100%) brightness(1)',
            transition: { duration: 0.65, delay: i * 0.05, ease: CINEMATIC_EASE }
          })
        };
      case 3:
      default:
        // Row 4 (High-Octane Action): Subtle lift and scale reveal
        return {
          hidden: { opacity: 0, y: 8, scale: 0.98 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.65, delay: i * 0.05, ease: CINEMATIC_EASE }
          })
        };
    }
  };

  const rowVariants = getRowVariants();

  return (
    <section className="mb-16 relative">
      
      {/* Section Header with Letter-Level Masked Reveal + Left-to-Right Thin Draw Line */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 relative gap-2">
        <div>
          {/* Masked character-by-character slide-up for Heading */}
          <div className="overflow-hidden flex flex-wrap">
            <h2 className="font-display text-xl sm:text-3xl font-black text-white uppercase tracking-tighter inline-flex flex-wrap">
              {titleChars.map((char, index) => (
                <motion.span
                  key={index}
                  initial={{ y: '100%', opacity: 0 }}
                  whileInView={{ y: '0%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.02, 
                    ease: CINEMATIC_EASE 
                  }}
                  className="inline-block"
                  style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                  {char}
                </motion.span>
              ))}
            </h2>
          </div>

          {/* Subtitle fades in after 0.15s */}
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15, ease: CINEMATIC_EASE }}
              className="text-xs text-[#8a8a8a] mt-1 tracking-wide font-normal"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Row Arrows (< >) fade in last with magnetic hover */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35, ease: CINEMATIC_EASE }}
          className="flex items-center space-x-2 self-end sm:self-auto z-10"
        >
          <MagneticArrowButton
            buttonRef={prevRef}
            direction="left"
            disabled={isBeginning}
          />
          <MagneticArrowButton
            buttonRef={nextRef}
            direction="right"
            disabled={isEnd}
          />
        </motion.div>

        {/* Thin Divider Line that draws from left to right */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: CINEMATIC_EASE }}
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left pointer-events-none"
        />
      </div>

      {/* Swiper Slider with Stable Document Flow */}
      <div className="relative overflow-hidden py-2">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          loop={false}
          speed={550}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          onInit={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          breakpoints={{
            320: {
              slidesPerView: 1.6,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2.8,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3.8,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 4.8,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 5.6,
              spaceBetween: 24,
            },
          }}
          className="w-full"
        >
          {movies.map((movie, index) => (
            <SwiperSlide key={movie.id} className="h-auto">
              <motion.div
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={rowVariants}
                className="h-full"
              >
                <MovieCard 
                  movie={movie} 
                  onPlayTrailer={onPlayTrailer}
                  onOpenDetails={onOpenDetails}
                  isWatchlisted={watchlist.some(m => m.id === movie.id)}
                  onToggleWatchlist={onToggleWatchlist}
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

    </section>
  );
}
