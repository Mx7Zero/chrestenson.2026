import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const Hero = () => {
  const containerRef = useRef<HTMLElement>(null);
  const firstNameRef = useRef<HTMLDivElement>(null);
  const lastNameRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate first name letter by letter
    const animateName = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current) {
        const text = ref.current.textContent || '';
        ref.current.textContent = '';
        
        const letters = text.split('').map((char) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.opacity = '0';
          span.style.display = 'inline-block';
          ref.current?.appendChild(span);
          return span;
        });

        return letters;
      }
      return [];
    };

    const firstLetters = animateName(firstNameRef);
    const lastLetters = animateName(lastNameRef);

    gsap.to(firstLetters, {
      opacity: 1,
      duration: 0.05,
      stagger: 0.03,
      ease: 'power2.out',
    });

    gsap.to(lastLetters, {
      opacity: 1,
      duration: 0.05,
      stagger: 0.03,
      delay: 0.25,
      ease: 'power2.out',
    });

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

      <div className="relative z-10 max-w-6xl px-8">
        <h1 className="text-[12vw] md:text-[140px] font-bold text-white mb-12 leading-[0.85] tracking-[-0.06em]">
          <div ref={firstNameRef}>MATTHEW</div>
          <div ref={lastNameRef}>CHRESTENSON</div>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 font-mono text-base">
          <div>
            <div className="text-text-muted mb-3 text-sm">ROLE</div>
            <div className="text-white font-medium text-xl">Executive Strategist</div>
          </div>
          <div>
            <div className="text-text-muted mb-3 text-sm">EXPERTISE</div>
            <div className="text-white font-medium text-xl">Brand Architecture</div>
          </div>
          <div>
            <div className="text-text-muted mb-3 text-sm">APPROACH</div>
            <div className="text-white font-medium text-xl">AI-Native Execution</div>
          </div>
        </div>

        <div className="mt-24 max-w-4xl">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-1 h-full bg-accent flex-shrink-0" />
            <p className="text-text-secondary text-xl leading-relaxed font-normal">
              AI-augmented strategist and brand architect with 30+ years of creative leadership, using LLMs and generative AI to accelerate research, content production, and visual asset creation at enterprise scale. Demonstrated ability to transform complex market intelligence into investor-ready documentation, brand strategies, and full-stack digital products—work that previously required teams, now executed with AI-assisted workflows.
            </p>
          </div>
          <div className="flex items-start gap-6">
            <div className="w-1 h-full bg-accent flex-shrink-0" />
            <p className="text-text-secondary text-xl leading-relaxed font-normal">
              Unique combination of studio-grade production experience (Disney, National Geographic, Ridley Scott Associates), hospitality brand-building (six successful ventures from concept to exit), and current AI-first strategic advisory across health technology, hospitality, and consumer goods. Not just AI-literate—AI-native: using these tools as thinking partners, not just productivity shortcuts.
            </p>
          </div>
        </div>

        <a
          href="mailto:matthew@chrestenson.com"
          className="inline-block mt-16 text-accent hover:text-white transition-colors duration-300 text-lg tracking-wide font-mono font-bold"
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
