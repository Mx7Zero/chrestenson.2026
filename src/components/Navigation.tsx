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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16">
          <a href="#hero" className="text-[#1D1D1F] font-semibold text-lg">
            MC
          </a>
          
          <div className="flex items-center gap-8">
            <a href="#about" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              About
            </a>
            <a href="#expertise" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Expertise
            </a>
            <a href="#contact" className="text-[#1D1D1F] hover:text-[#0071E3] transition-colors text-sm font-medium">
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
