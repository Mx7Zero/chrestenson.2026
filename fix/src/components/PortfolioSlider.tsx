import { useEffect, useRef, useCallback, useState } from 'react';
import gsap from 'gsap';

export const PortfolioSlider = () => {
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const portfolioImages = [
    '01_FoodBox Mockup.png',
    '03_Carton Box Mock-up 235x160x70.png',
    '03_Coffee_Stationery_Mockup.png',
    'Artboard 1.png',
    'BAGJAX-red.blk-matte_stand_up_pouch_mockup.png',
    'BAGJAX.sellsheet .png',
    'BOX_TUBE_MOCKUP.png',
    'BUDAH RAMEN.png',
    'Beverage.ad.tall.lineup.png',
    'CAN_MOCKUP.png',
    'CreoleFactory.roux.web.png',
    'DRNK.BEER.16oz.can.crop.png',
    'Energy Drink Can Mockup_01.png',
    'Huevos Vaqueros.color.png',
    'Kraft Snack Bar Mockup.png',
    'MUG.COMP.png',
    'MULTI-BRAND AND CO-BRAND STRATEGY.png',
    'PIZZA-BOX-TOP.png',
    'PVR Kiln Dried Oak.png',
    'Pay_up.swill.eat.png',
    'R&B logo.png',
    'SOCIAL.LIGHT.png',
    'SRIRACHAUCE.png',
    'Skate decks.png',
    'Srira-Chamoy.individual.mockup.vx.png',
    'Srira-Chamoy.individual.mockup.vxX.png',
    'Table-Tent-Mock-up-Template-Vol.6.png',
    'Vintage-American-Ale-72.png',
    'Yankee Noodle 11.17.png',
    'albert.mockup.png',
    'all in one_Carton Box Mock-up 235x160x70.png',
    'bag-matte-template.orange.png',
    'bag-matte-template.png',
    'bagloc.keepitfresh.png',
    'brew.2.png',
    'conv.store.bag-05.png',
    'dark_logo_tweek.png',
    'dopago.png',
    'drnck.mockup.png',
    'goodbark.png',
    'hiivr.biz.card-02.png',
    'salt grill..ARTISANai.png',
    'seed salsa.png',
    'street heat.png',
    'table.tent.png',
    'tshirt.png',
    'urban(re)move-01.png',
    'van and bike.png',
  ];

  const getSetWidth = useCallback(() => {
    if (!scrollRef.current) return 0;
    const imageSet = scrollRef.current.querySelector('.portfolio-set') as HTMLElement;
    return imageSet?.offsetWidth || 0;
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
    
    animationRef.curr+ setWidth,
      duration: 10edX - setWidth,
      duration: 60,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      startAutoScroll(0);
    }, 100);

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleTouchEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startAutoScroll, handleDragMove, handleDragEnd]);

  return (
    <>
      <section className="relative bg-white overflow-hidden">
        <div className="relative overflow-hidden cursor-grab active:cursor-grabbing">
          <div 
            ref={scrollRef}
            className="flex will-change-transform"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            {[0, 1, 2].map((setIndex) => (
              <div 
                key={setIndex} 
                className="portfolio-set flex shrink-0"
              >
                {portfolioImages.map((image, idx) => (
                  <div 
                    key={`${setIndex}-${idx}`} 
                    className="relative h-[200px] w-[200px] shrink-0 overflow-hidden bg-white hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                    onClick={(e) => {
                      if (!isDraggingRef.current) {
                        e.stopPropagation();
                        setSelectedImage(image);
                      }
                    }}
                  >
                    <img
                      src={`/portfolio/${encodeURIComponent(image)}`}
                      alt={`Portfolio item ${idx + 1}`}
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl font-light hover:text-[#0071E3] transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="relative max-w-[90vw] max-h-[90vh] p-4">
            <img
              src={`/portfolio/${encodeURIComponent(selectedImage)}`}
              alt="Portfolio detail"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      
    </section>
  );
};
