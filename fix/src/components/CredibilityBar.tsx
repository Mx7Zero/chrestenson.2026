import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CredibilityBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; scrollX: number } | null>(null);

  const logos = [
    { src: '/logos/DISNEY INTERACTIVE.png', alt: 'Disney Interactive' },
    { src: '/logos/NATGEO.png', alt: 'National Geographic' },
    { src: '/logos/New_RSA_Logo_Black.png', alt: 'Ridley Scott Associates' },
    { src: '/logos/TOUCHSTONE PICTURES.png', alt: 'Touchstone Pictures' },
    { src: '/logos/WHITE.buena_vista_media_logo__2021_present__by_mattjacks2003_deoaago-pre.png', alt: 'Buena Vista' },
    { src: '/logos/ALIASWAVEFRONT.png', alt: 'Alias Wavefront' },
    { src: '/logos/PROCORE.png', alt: 'Procore' },
    { src: '/logos/KF_Logo_White_TM.webp', alt: 'Kate Farms' },
    { src: '/logos/Prime Reaction.png', alt: 'Prime Reaction' },
    { src: '/logos/balance-bar-logo-png-transparent.png', alt: 'Balance Bar' },
  ];

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const currentX = gsap.getProperty(scrollRef.current, 'x') as number;
    dragStartRef.current = { x: clientX, scrollX: currentX };
  };

  // Handle drag move
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !scrollRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragStartRef.current.x;
    let newX = dragStartRef.current.scrollX + deltaX;
    
    // Get the width of one set for wrapping
    const logoSet = scrollRef.current.querySelector('.logo-set') as HTMLElement;
    if (logoSet) {
      const setWidth = logoSet.offsetWidth;
      // Wrap around
      if (newX > 0) newX = newX - setWidth;
      if (newX < -setWidth) newX = newX + setWidth;
    }
    
    gsap.set(scrollRef.current, { x: newX });
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStartRef.current = null;
    
    // Resume auto-scroll from current position
    if (scrollRef.current && animationRef.current) {
      const currentX = gsap.getProperty(scrollRef.current, 'x') as number;
      const logoSet = scrollRef.current.querySelector('.logo-set') as HTMLElement;
      if (logoSet) {
        const setWidth = logoSet.offsetWidth;
        // Calculate remaining distance and normalize position
        const normalizedX = ((currentX % setWidth) + setWidth) % setWidth;
        const remainingDistance = setWidth - normalizedX;
        
        gsap.set(scrollRef.current, { x: -setWidth + remainingDistance });
        animationRef.current.invalidate().restart();
      }
    }
  };

  // Set up drag listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Get the width of one set of logos
    const logoSet = scrollContainer.querySelector('.logo-set') as HTMLElement;
    if (!logoSet) return;
    
    const scrollWidth = logoSet.offsetWidth;

    // Create seamless infinite scroll using modifiers
    gsap.set(scrollContainer, { x: 0 });
    
    animationRef.current = gsap.to(scrollContainer, {
      x: -scrollWidth,
      duration: 40,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => {
          // Wrap around seamlessly
          const xNum = parseFloat(x);
          return (xNum % scrollWidth) + 'px';
        }
      }
    });

    return () => {
      gsap.killTweensOf(scrollContainer);
    };
  }, []);

  const LogoSet = ({ keyPrefix }: { keyPrefix: string }) => (
    <div className="logo-set flex items-center gap-2 md:gap-3">
      {logos.map((logo, index) => (
        <div 
          key={`${keyPrefix}-${index}`} 
          className="flex-shrink-0 w-32 h-20 md:w-44 md:h-24 lg:w-52 lg:h-28 bg-[#1D1D1F] rounded-sm flex items-center justify-center p-4 md:p-5"
        >
          <img 
            src={logo.src} 
            alt={logo.alt}
            className="max-w-full max-h-full w-auto h-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-8 md:py-10 overflow-hidden bg-[#1D1D1F]">
      <div className="relative">
        <div 
          ref={scrollRef}
          className={`flex items-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ width: 'max-content', touchAction: 'none' }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <LogoSet keyPrefix="set-1" />
          <LogoSet keyPrefix="set-2" />
          <LogoSet keyPrefix="set-3" />
        </div>
      </div>
    </section>
  );
};
