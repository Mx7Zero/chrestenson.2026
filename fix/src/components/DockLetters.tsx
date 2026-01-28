import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

interface DockLettersProps {
  text: string;
  className?: string;
}

export const DockLetters = ({ text, className = '' }: DockLettersProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    lettersRef.current.forEach((letterEl) => {
      if (!letterEl) return;
      
      const rect = letterEl.getBoundingClientRect();
      const letterCenterX = rect.left + rect.width / 2;
      const letterCenterY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to letter center
      const distanceX = Math.abs(mouseX - letterCenterX);
      const distanceY = Math.abs(mouseY - letterCenterY);
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Magnification parameters - tighter range for letters
      const maxDistance = 120; // pixels - range of effect
      const maxScale = 1.3; // maximum scale
      const minScale = 1;
      
      // Calculate scale based on distance (closer = bigger)
      let scale = minScale;
      if (distance < maxDistance) {
        const normalizedDistance = distance / maxDistance;
        // Use cosine for smooth falloff (like macOS dock)
        scale = minScale + (maxScale - minScale) * (1 - normalizedDistance) * Math.cos(normalizedDistance * Math.PI / 2);
      }
      
      gsap.to(letterEl, {
        scaleX: scale,
        scaleY: scale,
        duration: 0.1,
        ease: 'power2.out',
      });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Reset all letters to normal size
    lettersRef.current.forEach((letterEl) => {
      if (!letterEl) return;
      gsap.to(letterEl, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Split text into lines and letters
  const lines = text.split('\n');
  let letterIndex = 0;

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line, lineIdx) => (
        <div key={lineIdx} className="block">
          {line.split('').map((char, charIdx) => {
            if (char === ' ') {
              return <span key={`${lineIdx}-${charIdx}`}>&nbsp;</span>;
            }
            const currentIndex = letterIndex++;
            return (
              <span
                key={`${lineIdx}-${charIdx}`}
                ref={el => { lettersRef.current[currentIndex] = el; }}
                className="inline-block origin-bottom"
                style={{ 
                  willChange: 'transform',
                  transformOrigin: 'center bottom',
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
