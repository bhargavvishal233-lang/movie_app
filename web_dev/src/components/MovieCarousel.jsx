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
      transition={{ type: 'spring', stiffness: 250, damping: 20, mass: 0.5 }}
      disabled={disabled}
      className="w-8 h-8 rounded-full border border-white/20 text-white/70 hover:text-black hover:bg-white hover:border-white flex items-center justify-center transition-colors duration-200 active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
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
  rowIndex = 0, // 0: fade-up, 1: slide-left, 2: slide-right, 3: scale-up
  onPlayTrailer, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!movies.length) return null;

  // Determine row-specific entrance animation variant
  const getRowVariants = () => {
    switch (rowIndex % 4) {
      case 0:
        // Row 1: Fades up with stagger
        return {
          hidden: { opacity: 0, y: 40 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.65, delay: i * 0.06, ease: CINEMATIC_EASE }
          })
        };
      case 1:
        // Row 2: Slides in from the left
        return {
          hidden: { opacity: 0, x: -70 },
          visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, delay: i * 0.05, ease: CINEMATIC_EASE }
          })
        };
      case 2:
        // Row 3: Slides in from the right
        return {
          hidden: { opacity: 0, x: 70 },
          visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, delay: i * 0.05, ease: CINEMATIC_EASE }
          })
        };
      case 3:
      default:
        // Row 4: Scale-up with stagger
        return {
          hidden: { opacity: 0, scale: 0.9, y: 20 },
          visible: (i) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.65, delay: i * 0.06, ease: CINEMATIC_EASE }
          })
        };
    }
  };

  const rowVariants = getRowVariants();

  return (
    <section className="mb-16 relative">
      
      {/* Section Header with Masked Title Reveal + Left-to-Right Thin Draw Line */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 relative gap-2">
        <div>
          {/* Masked character/word slide-up for Heading */}
          <div className="overflow-hidden">
            <motion.h2 
              initial={{ y: '100%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
              className="font-display text-xl sm:text-3xl font-black text-white uppercase tracking-tighter"
            >
              {title}
            </motion.h2>
          </div>

          {subtitle && (
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xs text-[#8a8a8a] mt-1 tracking-wide font-normal"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Magnetic Navigation Arrows */}
        <div className="flex items-center space-x-2 self-end sm:self-auto z-10">
          <MagneticArrowButton
            buttonRef={prevRef}
            direction="left"
          />
          <MagneticArrowButton
            buttonRef={nextRef}
            direction="right"
          />
        </div>

        {/* Thin Divider Line that draws from left to right */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: CINEMATIC_EASE }}
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10 origin-left pointer-events-none"
        />
      </div>

      {/* Swiper Slider with Row-Specific Motion */}
      <div>
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          loop={true}
          speed={700}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            0: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 3.5,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 6,
              spaceBetween: 18,
            },
          }}
          className="w-full !py-2 !px-1 no-scrollbar"
        >
          {movies.map((movie, index) => {
            const isWatchlisted = watchlist.some((m) => m.id === movie.id);
            return (
              <SwiperSlide key={movie.id} className="!h-auto flex">
                <motion.div
                  variants={rowVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={index}
                  viewport={{ once: true }}
                  className="w-full h-full"
                >
                  <MovieCard
                    movie={movie}
                    onPlayTrailer={onPlayTrailer}
                    onOpenDetails={onOpenDetails}
                    isWatchlisted={isWatchlisted}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

    </section>
  );
}
