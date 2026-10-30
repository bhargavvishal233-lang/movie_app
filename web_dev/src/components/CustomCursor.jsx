import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef(null);

  useEffect(() => {
    // Check if device is touch-primary or user prefers reduced motion
    const touchCheck = 
      'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia('(pointer: coarse)').matches;
      
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (touchCheck || prefersReducedMotion) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check for interactive elements
      const target = e.target;
      const isClickable = Boolean(
        target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [onclick]')
      );
      setIsHoveringClickable(isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Responsive light lerp factor (0.25) - snappy, smooth, no sluggish trailing
    const lerp = (start, end, factor) => start + (end - start) * factor;

    const render = () => {
      // 1. Center dot follows instantly with zero delay
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // 2. Ring follows with light lerp (0.25 factor)
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.25);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.25);

      // Snap to exact mouse position when nearly settled so it is 100% centered
      if (Math.abs(ringPos.current.x - mousePos.current.x) < 0.1) {
        ringPos.current.x = mousePos.current.x;
      }
      if (Math.abs(ringPos.current.y - mousePos.current.y) < 0.1) {
        ringPos.current.y = mousePos.current.y;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${isHoveringClickable ? 1.25 : 1})`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible, isHoveringClickable]);

  if (isTouch) return null;

  return (
    <div 
      className={`fixed top-0 left-0 pointer-events-none z-[10001] transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ mixBlendMode: 'difference' }}
      aria-hidden="true"
    >
      {/* Instant Center Dot (5px) - Exactly centered at pointer */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[5px] h-[5px] rounded-full bg-white pointer-events-none"
      />

      {/* Thin Inertia Ring (30px) - Centered with light lerp & subtle 1.25 scale on clickables */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-[30px] h-[30px] rounded-full border pointer-events-none transition-[border-color] duration-150 ease-out ${
          isHoveringClickable ? 'border-white' : 'border-white/70'
        }`}
      />
    </div>
  );
}
