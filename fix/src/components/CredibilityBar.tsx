import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CredibilityBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const logos = [
    { src: '/logos/DISNEY INTERACTIVE.png', alt: 'Disney Interactive' },
    { src: '/logos/NATGEO.png', alt: 'National Geographic' },
    { src: '/logos/New_RSA_Logo_Black.png', alt: 'Ridley Scott Associates' },
    { src: '/logos/TOUCHSTONE PICTURES.png', alt: 'Touchstone Pictures' },
    { src: '/logos/WHITE.buena_vista_media_logo__2021_present__by_mattjacks2003_deoaago-pre.png', alt: 'Buena Vista' },
    { src: '/logos/ALIASWAVEFRONT.png', alt: 'Alias Wavefront' },
    { src: '/logos/PROCORE.png', alt: 'Procore' },
    { src: '/logos/KF_Logo_White_TM.webp', alt: 'KF' },
    { src: '/logos/Prime Reaction.png', alt: 'Prime Reaction' },
    { src: '/logos/balance-bar-logo-png-transparent.png', alt: 'Balance Bar' },
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    const container = containerRef.current;
    if (!scrollContainer || !container) return;

    // Duplicate logos for seamless loop
    const scrollWidth = scrollContainer.scrollWidth / 2;

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(scrollContainer, {
      x: -scrollWidth,
      duration: 30,
      ease: 'none',
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section className="py-12 border-y border-[#E5E5E5] overflow-hidden bg-white">
      <div ref={containerRef} className="relative">
        <div 
          ref={scrollRef}
          className="flex items-center gap-16 md:gap-24"
          style={{ width: 'max-content' }}
        >
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <div 
              key={`logo-1-${index}`} 
              className="flex-shrink-0 h-10 md:h-12 flex items-center justify-center"
            >
              <img 
                src={logo.src} 
                alt={logo.alt}
                className="h-full w-auto object-contain invert opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <div 
              key={`logo-2-${index}`} 
              className="flex-shrink-0 h-10 md:h-12 flex items-center justify-center"
            >
              <img 
                src={logo.src} 
                alt={logo.alt}
                className="h-full w-auto object-contain invert opacity-70 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
