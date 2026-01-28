import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CredibilityBar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Get the width of one set of logos
    const logoSet = scrollContainer.querySelector('.logo-set') as HTMLElement;
    if (!logoSet) return;
    
    const scrollWidth = logoSet.offsetWidth;

    // Create seamless infinite scroll
    gsap.set(scrollContainer, { x: 0 });
    
    gsap.to(scrollContainer, {
      x: -scrollWidth,
      duration: 25,
      ease: 'none',
      repeat: -1,
    });

    return () => {
      gsap.killTweensOf(scrollContainer);
    };
  }, []);

  const LogoSet = ({ keyPrefix }: { keyPrefix: string }) => (
    <div className="logo-set flex items-center gap-20 md:gap-28 px-10 md:px-14">
      {logos.map((logo, index) => (
        <div 
          key={`${keyPrefix}-${index}`} 
          className="flex-shrink-0 w-28 md:w-36 flex items-center justify-center"
        >
          <img 
            src={logo.src} 
            alt={logo.alt}
            className="max-h-8 md:max-h-10 w-auto max-w-full object-contain invert opacity-60 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-10 border-y border-[#E5E5E5] overflow-hidden bg-white">
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex items-center"
          style={{ width: 'max-content' }}
        >
          <LogoSet keyPrefix="set-1" />
          <LogoSet keyPrefix="set-2" />
        </div>
      </div>
    </section>
  );
};
