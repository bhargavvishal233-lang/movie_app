import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import MovieCard from './MovieCard';

// Swiper CSS imports
import 'swiper/css';
import 'swiper/css/navigation';

export default function MovieCarousel({ 
  title, 
  subtitle, 
  icon: Icon = Sparkles, 
  movies = [], 
  onPlayTrailer, 
  onOpenDetails, 
  watchlist = [], 
  onToggleWatchlist,
  onHoverCard
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!movies.length) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-12 relative group/carousel"
    >
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-5 h-5 text-red-500" />}
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Floating Edge Navigation Arrow Buttons */}
      <button
        ref={prevRef}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/80 border border-slate-700/80 text-white hover:text-white hover:bg-red-600 hover:border-red-500 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl opacity-75 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        ref={nextRef}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-slate-950/80 border border-slate-700/80 text-white hover:text-white hover:bg-red-600 hover:border-red-500 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-xl opacity-75 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Interactive Swiper Carousel */}
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        loop={true}
        grabCursor={true}
        speed={600}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          // Mobile: 2 slides per view
          0: {
            slidesPerView: 2,
            spaceBetween: 14,
          },
          // Tablet: 4 slides per view
          640: {
            slidesPerView: 4,
            spaceBetween: 18,
          },
          // Desktop: 6 slides per view
          1024: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
        }}
        className="w-full !py-3 !px-2 no-scrollbar"
      >
        {movies.map((movie, index) => {
          const isWatchlisted = watchlist.some((m) => m.id === movie.id);
          return (
            <SwiperSlide key={movie.id} className="!h-auto flex">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="w-full h-full"
              >
                <MovieCard
                  movie={movie}
                  onPlayTrailer={onPlayTrailer}
                  onOpenDetails={onOpenDetails}
                  isWatchlisted={isWatchlisted}
                  onToggleWatchlist={onToggleWatchlist}
                  onHoverCard={onHoverCard}
                />
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>

    </motion.section>
  );
}
