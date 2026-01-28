import { useState, useEffect } from 'react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" className="text-[#1D1D1F] font-semibold text-lg">
            MC
          </a>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#credibility" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Credibility
            </a>
            <a href="#competencies" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Competencies
            </a>
            <a href="#expertise" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Expertise
            </a>
            <a href="#tech-stack" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Tech Stack
            </a>
            <a href="#contact" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6 text-[#1D1D1F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E5E5]">
            <div className="flex flex-col gap-4">
              <a href="#credibility" className="text-[#1D1D1F] text-lg" onClick={() => setIsMobileMenuOpen(false)}>Credibility</a>
              <a href="#competencies" className="text-[#1D1D1F] text-lg" onClick={() => setIsMobileMenuOpen(false)}>Competencies</a>
              <a href="#expertise" className="text-[#1D1D1F] text-lg" onClick={() => setIsMobileMenuOpen(false)}>Expertise</a>
              <a href="#tech-stack" className="text-[#1D1D1F] text-lg" onClick={() => setIsMobileMenuOpen(false)}>Tech Stack</a>
              <a href="#contact" className="text-[#1D1D1F] text-lg" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
