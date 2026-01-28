import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export const CredibilityBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const isDraggingRef = useRef(false);
  const dragDataRef = useRef<{ 
    startX: number; 
    scrollX: number; 
    lastX: number;
    lastTime: number;
    velocity: number;
  } | null>(null);

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

  const getSetWidth = useCallback(() => {
    if (!scrollRef.current) return 0;
    const logoSet = scrollRef.current.querySelector('.logo-set') as HTMLElement;
    return logoSet?.offsetWidth || 0;
  }, []);

  const normalizePosition = useCallback((x: number, setWidth: number) => {
    if (setWidth === 0) return x;
    let normalized = x % setWidth;
    if (normalized > 0) normalized -= setWidth;
    return normalized;
  }, []);

  const startAutoScroll = useCallback((fromX: number) => {
    if (!scrollRef.current) return;
    
    const setWidth = getSetWidth();
    if (setWidth === 0) return;
    
    const normalizedX = normalizePosition(fromX, setWidth);
    
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    gsap.set(scrollRef.current, { x: normalizedX });
    
    animationRef.current = gsap.to(scrollRef.current, {
      x: normalizedX - setWidth,
      duration: 40,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => {
          const xNum = parseFloat(x);
          return normalizePosition(xNum, setWidth) + 'px';
        }
      }
    });
  }, [getSetWidth, normalizePosition]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (animationRef.current) {
      animationRef.current.kill();
    }
    isDraggingRef.current = true;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const currentX = gsap.getProperty(scrollRef.current, 'x') as number;
    const now = Date.now();
    
    dragDataRef.current = { 
      startX: clientX, 
      scrollX: currentX,
      lastX: clientX,
      lastTime: now,
      velocity: 0
    };
    
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grabbing';
    }
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !dragDataRef.current || !scrollRef.current) return;
    
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const now = Date.now();
    const deltaTime = now - dragDataRef.current.lastTime;
    
    // Calculate velocity for momentum
    if (deltaTime > 0) {
      const deltaX = clientX - dragDataRef.current.lastX;
      dragDataRef.current.velocity = deltaX / deltaTime * 16; // normalize to ~60fps
    }
    
    dragDataRef.current.lastX = clientX;
    dragDataRef.current.lastTime = now;
    
    const deltaX = clientX - dragDataRef.current.startX;
    const setWidth = getSetWidth();
    let newX = normalizePosition(dragDataRef.current.scrollX + deltaX, setWidth);
    
    gsap.set(scrollRef.current, { x: newX });
  }, [getSetWidth, normalizePosition]);

  // Handle drag end with momentum
  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
    
    const velocity = dragDataRef.current?.velocity || 0;
    dragDataRef.current = null;
    
    if (!scrollRef.current) return;
    
    const currentX = gsap.getProperty(scrollRef.current, 'x') as number;
    const setWidth = getSetWidth();
    
    // Apply momentum if there's velocity
    if (Math.abs(velocity) > 2) {
      const momentumDistance = velocity * 20;
      const targetX = normalizePosition(currentX + momentumDistance, setWidth);
      
      gsap.to(scrollRef.current, {
        x: targetX,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          const finalX = gsap.getProperty(scrollRef.current, 'x') as number;
          startAutoScroll(finalX);
        }
      });
    } else {
      // No momentum, just resume auto-scroll
      startAutoScroll(currentX);
    }
  }, [getSetWidth, normalizePosition, startAutoScroll]);

  // Set up drag listeners - always active
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const handleEnd = () => handleDragEnd();
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Initial auto-scroll setup
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
          className="flex-shrink-0 w-40 h-24 md:w-56 md:h-32 lg:w-64 lg:h-36 bg-[#1D1D1F] flex items-center justify-center p-3 md:p-4"
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
          className="flex items-center cursor-grab active:cursor-grabbing"
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
