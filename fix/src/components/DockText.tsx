import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';

interface DockTextProps {
  children: React.ReactNode;
  className?: string;
}

export const DockText = ({ children, className = '' }: DockTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  // Convert children to array of words
  const getWords = (children: React.ReactNode): { text: string; bold: boolean }[] => {
    const words: { text: string; bold: boolean }[] = [];
    
    const processNode = (node: React.ReactNode, isBold: boolean = false) => {
      if (typeof node === 'string') {
        node.split(/(\s+)/).forEach(word => {
          if (word.trim()) {
            words.push({ text: word, bold: isBold });
          } else if (word) {
            words.push({ text: word, bold: false }); // spaces
          }
        });
      } else if (Array.isArray(node)) {
        node.forEach(child => processNode(child, isBold));
      } else if (node && typeof node === 'object' && 'props' in node) {
        const element = node as React.ReactElement;
        // Check if it's a span with font-semibold (bold text)
        const isBoldElement = element.props?.className?.includes('font-semibold') || 
                             element.props?.className?.includes('font-bold');
        processNode(element.props.children, isBold || isBoldElement);
      }
    };
    
    processNode(children);
    return words;
  };

  const words = getWords(children);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    wordsRef.current.forEach((wordEl) => {
      if (!wordEl) return;
      
      const rect = wordEl.getBoundingClientRect();
      const wordCenterX = rect.left + rect.width / 2;
      const wordCenterY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to word center
      const distanceX = Math.abs(mouseX - wordCenterX);
      const distanceY = Math.abs(mouseY - wordCenterY);
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      
      // Magnification parameters
      const maxDistance = 150; // pixels - range of effect
      const maxScale = 1.25; // maximum scale
      const minScale = 1;
      
      // Calculate scale based on distance (closer = bigger)
      let scale = minScale;
      if (distance < maxDistance) {
        const normalizedDistance = distance / maxDistance;
        // Use cosine for smooth falloff (like macOS dock)
        scale = minScale + (maxScale - minScale) * (1 - normalizedDistance) * Math.cos(normalizedDistance * Math.PI / 2);
      }
      
      gsap.to(wordEl, {
        scaleX: scale,
        scaleY: scale,
        duration: 0.15,
        ease: 'power2.out',
      });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Reset all words to normal size
    wordsRef.current.forEach((wordEl) => {
      if (!wordEl) return;
      gsap.to(wordEl, {
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

  let wordIndex = 0;

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, idx) => {
        // Skip rendering spaces as separate spans with refs
        if (!word.text.trim()) {
          return <span key={idx}>{word.text}</span>;
        }
        
        const currentIndex = wordIndex++;
        return (
          <span
            key={idx}
            ref={el => { wordsRef.current[currentIndex] = el; }}
            className={`inline-block origin-bottom align-bottom ${word.bold ? 'font-semibold text-[#1D1D1F]' : ''}`}
            style={{ 
              willChange: 'transform',
              transformOrigin: 'center bottom',
              display: 'inline-block',
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};
