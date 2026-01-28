import { useState, useEffect } from 'react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-8 py-6 flex items-center justify-between">
        <a 
          href="#hero" 
          onClick={(e) => scrollToSection(e, '#hero')}
          className="text-white font-mono text-[10px] tracking-[0.2em] hover:text-accent transition-colors duration-300"
        >
          MC
        </a>

        <div className="hidden md:flex items-center gap-12 font-mono text-[10px] tracking-[0.15em]">
          <a
            href="#about"
            onClick={(e) => scrollToSection(e, '#about')}
            className="text-text-secondary hover:text-white transition-colors duration-300"
          >
            WORK
          </a>
          <a
            href="#expertise"
            onClick={(e) => scrollToSection(e, '#expertise')}
            className="text-text-secondary hover:text-white transition-colors duration-300"
          >
            CAPABILITIES
          </a>
          <a
            href="mailto:matthew@chrestenson.com"
            className="text-accent hover:text-white transition-colors duration-300"
          >
            CONTACT
          </a>
        </div>
      </div>
    </nav>
  );
};
