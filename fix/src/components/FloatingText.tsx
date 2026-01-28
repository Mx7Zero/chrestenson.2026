import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface FloatingTextProps {
  children: React.ReactNode;
  className?: string;
}

export const FloatingText = ({ children, className = '' }: FloatingTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    // Get dimensions
    const updateAnimation = () => {
      const containerWidth = container.offsetWidth;
      const textWidth = text.offsetWidth;
      const maxX = Math.max(0, containerWidth - textWidth - 20); // 10px padding each side
      
      // Random starting position
      const startX = Math.random() * maxX;
      gsap.set(text, { x: startX });

      // Create bouncing animation
      const animateX = () => {
        const currentX = gsap.getProperty(text, 'x') as number;
        // Random target - either towards left or right edge
        const goRight = Math.random() > 0.5;
        const targetX = goRight 
          ? Math.min(maxX, currentX + 20 + Math.random() * 40)
          : Math.max(0, currentX - 20 - Math.random() * 40);
        
        const duration = 3 + Math.random() * 4; // 3-7 seconds

        gsap.to(text, {
          x: targetX,
          duration,
          ease: 'sine.inOut',
          onComplete: animateX,
        });
      };

      animateX();
    };

    // Small delay to ensure proper measurement
    const timer = setTimeout(updateAnimation, 100);

    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(text);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <span 
        ref={textRef} 
        className="inline-block whitespace-nowrap"
        style={{ willChange: 'transform' }}
      >
        {children}
      </span>
    </div>
  );
};
