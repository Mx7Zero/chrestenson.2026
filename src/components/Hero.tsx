import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate name letter by letter
    if (nameRef.current) {
      const text = nameRef.current.textContent || '';
      nameRef.current.textContent = '';
      
      const letters = text.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        nameRef.current?.appendChild(span);
        return span;
      });

      gsap.to(letters, {
        opacity: 1,
        duration: 0.05,
        stagger: 0.03,
        ease: 'power2.out',
      });
    }

    // Orb animation
    if (orbRef.current) {
      gsap.to(orbRef.current, {
        x: 100,
        y: -100,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, []);

  return (
    <section 
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Gradient Orb */}
      <div 
        ref={orbRef}
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(10, 132, 255, 0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 max-w-5xl px-8">
        <h1 
          ref={nameRef}
          className="text-[8vw] md:text-[120px] font-extralight text-white mb-8 leading-[0.9] tracking-[-0.05em]"
        >
          MATTHEW CHRESTENSON
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 font-mono text-xs">
          <div>
            <div className="text-text-muted mb-2">ROLE</div>
            <div className="text-white font-light">Executive Strategist</div>
          </div>
          <div>
            <div className="text-text-muted mb-2">EXPERTISE</div>
            <div className="text-white font-light">Brand Architecture</div>
          </div>
          <div>
            <div className="text-text-muted mb-2">APPROACH</div>
            <div className="text-white font-light">AI-Native Execution</div>
          </div>
        </div>

        <div className="mt-20 flex items-center gap-4">
          <div className="w-px h-12 bg-accent" />
          <p className="text-text-secondary text-sm max-w-xl leading-relaxed font-light">
            30+ years transforming complex market intelligence into<br />
            investor-ready documentation and full-stack digital products.
          </p>
        </div>

        <a
          href="mailto:matthew@chrestenson.com"
          className="inline-block mt-12 text-accent hover:text-white transition-colors duration-300 text-sm tracking-wide font-mono"
        >
          INITIATE CONSULTATION →
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="w-px h-16 bg-gradient-to-b from-accent to-transparent" />
        <div className="text-text-muted text-[10px] font-mono tracking-widest">SCROLL</div>
      </div>
    </section>
  );
};
