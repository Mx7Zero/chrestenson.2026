import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    
    tl.from(nameRef.current, { opacity: 0, y: 30, duration: 0.8 })
      .from(taglineRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from(descRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
      .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
  }, []);

  return (
    <section 
      id="hero"
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-bg-primary px-6 pt-20"
    >
      <div className="max-w-4xl text-center">
        <h1 
          ref={nameRef}
          className="text-5xl md:text-7xl font-bold text-text-primary mb-6 tracking-tight"
        >
          MATTHEW CHRESTENSON
        </h1>
        <p 
          ref={taglineRef}
          className="text-lg md:text-xl text-text-secondary mb-4"
        >
          Executive Strategist | Brand Architect | Platform Developer
        </p>
        <p 
          ref={descRef}
          className="text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          AI-augmented strategist with 30+ years of creative leadership. 
          Transforming complex market intelligence into investor-ready documentation, 
          brand strategies, and full-stack digital products.
        </p>
        <div ref={ctaRef}>
          <a 
            href="mailto:matthew@chrestenson.com"
            className="inline-block px-8 py-4 bg-accent hover:bg-accent-hover 
                       text-white font-medium rounded-lg transition-all duration-300
                       hover:scale-105"
          >
            Book a Consultation
          </a>
        </div>
      </div>
    </section>
  );
};
