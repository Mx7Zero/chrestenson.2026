import { useState, useEffect } from 'react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Expertise', href: '#expertise' },
    { label: 'Work', href: '#achievements' },
    { label: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-bg-primary/95 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <a 
          href="#hero" 
          onClick={(e) => scrollToSection(e, '#hero')}
          className="text-text-primary font-bold text-lg tracking-tight hover:text-accent transition-colors"
        >
          MATTHEW CHRESTENSON
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="text-text-secondary hover:text-accent transition-colors text-sm font-medium"
            >
              {item.label}
            </a>
          ))}
          <a
            href="mailto:matthew@chrestenson.com"
            className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
          >
            Book a Call
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bg-surface border-t border-border">
          <div className="px-6 py-4 space-y-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="block text-text-secondary hover:text-accent transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="mailto:matthew@chrestenson.com"
              className="block px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-center transition-colors"
            >
              Book a Call
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
