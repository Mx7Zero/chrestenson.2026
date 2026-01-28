import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only show custom cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      
      // Outer ring follows with slight lag
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: 'power2.out',
      });
      
      // Inner dot follows instantly
      gsap.set(dot, {
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Detect hoverable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.style.cursor === 'pointer' ||
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-grab') ||
        target.classList.contains('cursor-pointer');
      
      setIsPointer(!!isClickable);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <>
      {/* Hide default cursor */}
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      {/* Outer ring - Blue */}
      <div
        ref={cursorRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9999]
          -translate-x-1/2 -translate-y-1/2
          transition-opacity duration-200
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div 
          className={`
            rounded-full border-2 border-[#0071E3]
            transition-all duration-200 ease-out
            ${isPointer ? 'w-12 h-12 bg-[#0071E3]/10' : 'w-8 h-8'}
          `}
        />
      </div>
      
      {/* Inner dot - Black */}
      <div
        ref={cursorDotRef}
        className={`
          fixed top-0 left-0 pointer-events-none z-[9999]
          -translate-x-1/2 -translate-y-1/2
          transition-opacity duration-200
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div 
          className={`
            rounded-full bg-[#1D1D1F]
            transition-all duration-200 ease-out
            ${isPointer ? 'w-2 h-2' : 'w-3 h-3'}
          `}
        />
      </div>
    </>
  );
};
