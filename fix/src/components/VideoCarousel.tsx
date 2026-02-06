import { useEffect, useRef, useCallback, useState } from 'react';
import gsap from 'gsap';

export const VideoCarousel = () => {
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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const youtubeVideos = [
    'bRqUW6SlVAo',
    'fObkyhG69xU',
    'jk1HvfuEdQg',
    'Cl5qBOxF9bA',
    'Z-oCI4fgXaE',
    'VOFNcF2oM48',
    '03Y21bR3HAA',
  ];

  const getSetWidth = useCallback(() => {
    if (!scrollRef.current) return 0;
    const videoSet = scrollRef.current.querySelector('.video-set') as HTMLElement;
    return videoSet?.offsetWidth || 0;
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
    
    // Same as portfolio but opposite direction - videos scroll left to right
    animationRef.current = gsap.to(scrollRef.current, {
      x: normalizedX + setWidth,
      duration: 100,
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

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !dragDataRef.current || !scrollRef.current) return;
    
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - dragDataRef.current.startX;
    const newX = dragDataRef.current.scrollX + deltaX;
    
    const now = Date.now();
    const timeDelta = now - dragDataRef.current.lastTime;
    if (timeDelta > 0) {
      const positionDelta = clientX - dragDataRef.current.lastX;
      dragDataRef.current.velocity = positionDelta / timeDelta;
      dragDataRef.current.lastX = clientX;
      dragDataRef.current.lastTime = now;
    }
    
    gsap.set(scrollRef.current, { x: newX });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDraggingRef.current || !dragDataRef.current) return;
    
    isDraggingRef.current = false;
    
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
    
    const currentX = gsap.getProperty(scrollRef.current, 'x') as number;
    const velocity = dragDataRef.current.velocity;
    const momentum = velocity * 200;
    const targetX = currentX + momentum;
    
    if (Math.abs(velocity) > 0.1) {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      
      animationRef.current = gsap.to(scrollRef.current, {
        x: targetX,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          const finalX = gsap.getProperty(scrollRef.current, 'x') as number;
          startAutoScroll(finalX);
        }
      });
    } else {
      startAutoScroll(currentX);
    }
    
    dragDataRef.current = null;
  }, [startAutoScroll]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) {
      setMouseX(e.clientX);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const getScale = (index: number): number => {
    if (mouseX === null) return 1;
    
    const item = itemRefs.current[index];
    if (!item) return 1;
    
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    const distance = Math.abs(mouseX - itemCenter);
    const maxDistance = 300;
    
    if (distance > maxDistance) return 1;
    
    const normalizedDistance = distance / maxDistance;
    const easedDistance = 1 - Math.pow(normalizedDistance, 2);
    const scale = 1 + easedDistance * 0.25;
    
    return scale;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      startAutoScroll(0);
    }, 100);

    const handleMouseMoveDoc = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMoveDoc);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
      document.removeEventListener('mousemove', handleMouseMoveDoc);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startAutoScroll, handleDragMove, handleDragEnd]);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        setSelectedVideo(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

  return (
    <>
      <section 
        className="relative bg-white overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: 'scaleX(-1)' }}
      >
        <div className="relative overflow-hidden cursor-grab active:cursor-grabbing">
          <div 
            ref={scrollRef}
            className="flex will-change-transform items-end"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{ minHeight: '180px' }}
          >
            {[0, 1, 2].map((setIndex) => (
              <div 
                key={setIndex} 
                className="video-set flex shrink-0 items-end"
              >
                {youtubeVideos.map((videoId, idx) => {
                  const globalIndex = setIndex * youtubeVideos.length + idx;
                  const scale = getScale(globalIndex);
                  
                  return (
                    <div 
                      key={`${setIndex}-${idx}`}
                      ref={(el) => itemRefs.current[globalIndex] = el}
                      className="relative shrink-0 overflow-visible transition-all duration-150 ease-out cursor-pointer group"
                      style={{
                        width: '320px',
                        height: '180px',
                        transform: `scaleX(-1) scale(${scale})`,
                        transformOrigin: 'bottom center',
                        willChange: 'transform',
                        zIndex: Math.round(scale * 100)
                      }}
                      onClick={(e) => {
                        if (!isDraggingRef.current) {
                          e.stopPropagation();
                          setSelectedVideo(videoId);
                        }
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        draggable="false"
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault doesn't exist
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('hqdefault')) {
                            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300">
                        <div className="opacity-50 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                          <svg 
                            className="w-16 h-16 text-white drop-shadow-lg"
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl font-light hover:text-[#0071E3] transition-colors z-10"
            onClick={() => setSelectedVideo(null)}
          >
            ×
          </button>
          <div 
            className="relative w-full max-w-5xl aspect-video p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};
