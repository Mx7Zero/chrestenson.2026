import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { DockText } from './DockText';
import { DockLetters } from './DockLetters';

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set([nameRef.current, titleRef.current, contactRef.current, summaryRef.current, ctaRef.current], {
        opacity: 0,
        y: 40,
      });

      // Staggered entrance animation
      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(nameRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.6')
      .to(contactRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.5')
      .to(summaryRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4')
      .to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }, '-=0.4');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const contactLinks = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Denver, CO',
      href: null,
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'matthew@chrestenson.com',
      href: 'mailto:matthew@chrestenson.com',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: '805.452.8932',
      href: 'tel:+18054528932',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      label: 'chrestenson.com',
      href: 'https://chrestenson.com',
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/matthewchrestenson',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      id="hero" 
      className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-24 py-32 relative overflow-hidden"
    >
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FAFAFA] to-[#F0F5FF] opacity-50" />
      
      <div className="max-w-5xl relative z-10 text-center">
        {/* Name */}
        <h1 
          ref={nameRef}
          className="mb-6 leading-[0.9] tracking-tight"
        >
          <DockLetters 
            text={"MATTHEW\nCHRESTENSON"}
            className="text-6xl md:text-8xl lg:text-[10rem] font-bold text-[#1D1D1F] uppercase"
          />
        </h1>
        
        {/* Title */}
        <p 
          ref={titleRef}
          className="text-xl md:text-2xl lg:text-3xl text-[#6E6E73] font-normal mb-8 tracking-tight"
        >
          Executive Strategist{' '}
          <span className="text-[#D1D1D6]">|</span>{' '}
          Brand Architect{' '}
          <span className="text-[#D1D1D6]">|</span>{' '}
          Platform Developer
        </p>

        {/* Contact Links */}
        <div 
          ref={contactRef}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-12 text-sm"
        >
          {contactLinks.map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              {link.href ? (
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 text-[#6E6E73] hover:text-[#0071E3] transition-colors duration-300 group"
                >
                  <span className="text-[#86868B] group-hover:text-[#0071E3] transition-colors duration-300">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </a>
              ) : (
                <span className="flex items-center gap-2 text-[#6E6E73]">
                  <span className="text-[#86868B]">{link.icon}</span>
                  <span>{link.label}</span>
                </span>
              )}
              {index < contactLinks.length - 1 && (
                <span className="text-[#E5E5E5] ml-4 hidden md:inline">|</span>
              )}
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div 
          ref={summaryRef}
          className="space-y-8 text-lg md:text-xl text-[#424245] w-full max-w-6xl mx-auto leading-relaxed mb-12"
        >
          {/* Cool heading treatment */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E5E5E5] to-[#0071E3]/30" />
            <span className="text-xs md:text-sm font-medium tracking-[0.3em] uppercase text-[#0071E3]">
              The Short Version
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#E5E5E5] to-[#0071E3]/30" />
          </div>
          
          <DockText className="text-left">
            <span className="font-semibold text-[#1D1D1F]">AI-augmented strategist</span> and <span className="font-semibold text-[#1D1D1F]">brand architect</span> with <span className="font-semibold text-[#1D1D1F]">30+ years</span> of creative leadership, using <span className="font-semibold text-[#1D1D1F]">LLMs and generative AI</span> to accelerate research, content production, and visual asset creation at <span className="font-semibold text-[#1D1D1F]">enterprise scale</span>. Demonstrated ability to transform complex market intelligence into <span className="font-semibold text-[#1D1D1F]">investor-ready documentation</span>, brand strategies, and <span className="font-semibold text-[#1D1D1F]">full-stack digital products</span>—work that previously required teams, now executed with AI-assisted workflows.
          </DockText>
          <DockText className="text-left">
            Unique combination of <span className="font-semibold text-[#1D1D1F]">studio-grade production</span> experience{' '}
            <span className="text-[#6E6E73]">(Disney, National Geographic, Ridley Scott Associates)</span>, 
            <span className="font-semibold text-[#1D1D1F]"> hospitality brand-building</span>{' '}
            <span className="text-[#6E6E73]">(six successful ventures from concept to exit)</span>, 
            and current <span className="font-semibold text-[#1D1D1F]">AI-first strategic advisory</span> across health technology, hospitality, and consumer goods.
          </DockText>
          <DockText className="font-medium text-[#0071E3] text-lg md:text-xl border-l-2 border-[#0071E3] pl-6 py-2 bg-gradient-to-r from-[#0071E3]/5 to-transparent text-left">
            Not just AI-literate—AI-native: using these tools as thinking partners, not just productivity shortcuts.
          </DockText>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:matthew@chrestenson.com"
            className="group inline-flex items-center gap-3 bg-[#0071E3] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[#0077ED] transition-all duration-300 hover:shadow-lg hover:shadow-[#0071E3]/25 hover:-translate-y-0.5"
          >
            <span>Start a Conversation</span>
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <a
            href="tel:+18054528932"
            className="group inline-flex items-center gap-3 bg-[#1D1D1F] text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[#2D2D2F] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Call Now</span>
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#86868B] animate-bounce">
        <span className="text-xs tracking-wider uppercase">Scroll</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};
