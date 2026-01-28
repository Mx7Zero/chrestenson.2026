import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Zero gravity floating animation
      let velocityX = gsap.utils.random(-20, 20);
      let velocityY = gsap.utils.random(-20, 20);
      let currentX = 0;
      let currentY = 0;
      let isDraggingRef = false;
      
      const bounds = {
        left: -150,
        right: 150,
        top: -100,
        bottom: 100,
      };
      
      const updateFloat = () => {
        if (isDraggingRef || !logoRef.current) return;
        
        // Update position
        currentX += velocityX * 0.016;
        currentY += velocityY * 0.016;
        
        // Bounce off boundaries by reversing velocity
        if (currentX <= bounds.left || currentX >= bounds.right) {
          velocityX *= -0.8;
          currentX = currentX <= bounds.left ? bounds.left : bounds.right;
          // Add slight variation on bounce
          velocityY += gsap.utils.random(-5, 5);
        }
        
        if (currentY <= bounds.top || currentY >= bounds.bottom) {
          velocityY *= -0.8;
          currentY = currentY <= bounds.top ? bounds.top : bounds.bottom;
          // Add slight variation on bounce
          velocityX += gsap.utils.random(-5, 5);
        }
        
        // Slight random drift
        if (Math.random() < 0.01) {
          velocityX += gsap.utils.random(-2, 2);
          velocityY += gsap.utils.random(-2, 2);
        }
        
        // Apply transform
        gsap.set(logoRef.current, { x: currentX, y: currentY });
      };
      
      // Run animation at 60fps
      const ticker = gsap.ticker.add(updateFloat);
      
      // Drag functionality
      const logo = logoRef.current;
      if (!logo) return;
      
      let startX = 0, startY = 0, initialX = 0, initialY = 0;
      
      const handleStart = (e: MouseEvent | TouchEvent) => {
        isDraggingRef = true;
        setIsDragging(true);
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        initialX = currentX;
        initialY = currentY;
        
        logo.style.cursor = 'grabbing';
      };
      
      const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef) return;
        
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        currentX = Math.max(bounds.left, Math.min(bounds.right, initialX + deltaX));
        currentY = Math.max(bounds.top, Math.min(bounds.bottom, initialY + deltaY));
        
        gsap.set(logo, { x: currentX, y: currentY });
      };
      
      const handleEnd = (e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef) return;
        
        isDraggingRef = false;
        setIsDragging(false);
        logo.style.cursor = 'grab';
        
        // Calculate velocity from last movement for momentum
        const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.changedTouches[0].clientY : e.clientY;
        
        velocityX = (clientX - startX) * 0.3;
        velocityY = (clientY - startY) * 0.3;
      };
      
      logo.style.cursor = 'grab';
      logo.addEventListener('mousedown', handleStart as EventListener);
      logo.addEventListener('touchstart', handleStart as EventListener);
      window.addEventListener('mousemove', handleMove as EventListener);
      window.addEventListener('touchmove', handleMove as EventListener);
      window.addEventListener('mouseup', handleEnd as EventListener);
      window.addEventListener('touchend', handleEnd as EventListener);

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
      
      <div className="max-w-full relative z-10 text-center px-4">
        {/* C Logo - Hero Focal Point */}
        <div className="mb-12 flex justify-center">
          <img 
            ref={logoRef}
            src="/black-letter-c.png" 
            alt="C" 
            className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64 object-contain"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Name - Brand Hierarchy */}
        <div ref={nameRef} className="mb-8">
          {/* CHRESTENSON - Primary */}
          <h1 className="text-[10vw] md:text-[8vw] lg:text-[7vw] font-black text-[#1D1D1F] uppercase tracking-tight leading-none mb-2">
            CHRESTENSON
          </h1>
          {/* MATTHEW - Secondary with underline */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <div className="h-px w-20 bg-[#1D1D1F]" />
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-[#1D1D1F] uppercase tracking-[0.3em]">
              MATTHEW
            </p>
            <div className="h-px w-20 bg-[#1D1D1F]" />
          </div>
        </div>
        
        {/* Title */}
        <p 
          ref={titleRef}
          className="text-sm md:text-base lg:text-lg text-[#6E6E73] font-normal mb-8 tracking-[0.2em] uppercase"
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
          className="w-full max-w-5xl mx-auto mb-16"
        >
          {/* Section Label */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[#E5E5E5]" />
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#0071E3]">
              The Short Version
            </span>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[#E5E5E5]" />
          </div>
          
          {/* Summary Cards */}
          <div className="border-t border-[#E5E5E5]">
            {/* Card 1 */}
            <div className="py-8 md:py-10 border-b border-[#E5E5E5] group">
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0 w-10 h-10 border border-[#E5E5E5] flex items-center justify-center group-hover:border-[#0071E3] group-hover:bg-[#0071E3] transition-all">
                  <span className="text-xs font-mono text-[#86868B] group-hover:text-white transition-colors">01</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base text-[#424245] leading-relaxed">
                    <span className="text-[#1D1D1F] font-medium">AI-augmented strategist</span> and <span className="text-[#1D1D1F] font-medium">brand architect</span> with <span className="text-[#0071E3] font-mono text-sm">30+ years</span> of creative leadership, using LLMs and generative AI to accelerate research, content production, and visual asset creation at enterprise scale.
                  </p>
                  <p className="text-sm md:text-base text-[#6E6E73] leading-relaxed mt-3">
                    Demonstrated ability to transform complex market intelligence into investor-ready documentation, brand strategies, and full-stack digital products—work that previously required teams, now executed with AI-assisted workflows.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="py-8 md:py-10 border-b border-[#E5E5E5] group">
              <div className="flex gap-4 md:gap-6">
                <div className="flex-shrink-0 w-10 h-10 border border-[#E5E5E5] flex items-center justify-center group-hover:border-[#0071E3] group-hover:bg-[#0071E3] transition-all">
                  <span className="text-xs font-mono text-[#86868B] group-hover:text-white transition-colors">02</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base text-[#424245] leading-relaxed">
                    Unique combination of <span className="text-[#1D1D1F] font-medium">studio-grade production</span> experience and <span className="text-[#1D1D1F] font-medium">hospitality brand-building</span> with current <span className="text-[#1D1D1F] font-medium">AI-first strategic advisory</span> across health technology, hospitality, and consumer goods.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="text-xs font-mono tracking-wider text-[#86868B] border border-[#E5E5E5] px-3 py-1.5">DISNEY</span>
                    <span className="text-xs font-mono tracking-wider text-[#86868B] border border-[#E5E5E5] px-3 py-1.5">NATIONAL GEOGRAPHIC</span>
                    <span className="text-xs font-mono tracking-wider text-[#86868B] border border-[#E5E5E5] px-3 py-1.5">RIDLEY SCOTT ASSOCIATES</span>
                    <span className="text-xs font-mono tracking-wider text-[#0071E3] border border-[#0071E3]/30 px-3 py-1.5">6 VENTURES → EXIT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tagline */}
          <div className="pt-8 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-[#0071E3]/30" />
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#0071E3]">
              AI-native — not just AI-literate
            </span>
            <div className="h-px w-12 bg-[#0071E3]/30" />
          </div>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:matthew@chrestenson.com"
            className="group inline-flex items-center gap-3 bg-[#0071E3] text-white px-8 py-4 text-base font-medium hover:bg-[#0077ED] transition-all duration-300 hover:shadow-lg hover:shadow-[#0071E3]/25 hover:-translate-y-0.5"
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
            className="group inline-flex items-center gap-3 bg-[#1D1D1F] text-white px-8 py-4 text-base font-medium hover:bg-[#2D2D2F] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
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
