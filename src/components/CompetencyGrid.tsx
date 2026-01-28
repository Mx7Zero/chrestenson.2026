import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const CompetencyGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  const competencies = [
    { domain: 'Corporate Strategy', years: 30, projects: 47 },
    { domain: 'Brand Development', years: 30, projects: 6 },
    { domain: 'Financial Modeling', years: 15, projects: 180 },
    { domain: 'Patent/IP Strategy', years: 5, projects: 19 },
    { domain: 'Product Architecture', years: 8, projects: 12 },
    { domain: 'Technical Development', years: 8, projects: 24 },
    { domain: 'Hospitality Operations', years: 30, projects: 6 },
    { domain: 'Market Analysis', years: 30, projects: 89 },
  ];

  useEffect(() => {
    if (!gridRef.current) return;

    const items = gridRef.current.querySelectorAll('.data-item');
    
    gsap.from(items, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 70%',
      },
    });
  }, []);

  return (
    <section id="about" className="py-32 px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-20">
          <div className="text-text-muted font-mono text-[10px] tracking-[0.2em] mb-4">
            CORE COMPETENCIES
          </div>
          <h2 className="text-5xl md:text-7xl font-extralight text-white tracking-[-0.04em]">
            Expert-Level<br />Execution
          </h2>
        </div>
        
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {competencies.map((item, index) => (
            <div
              key={index}
              className="data-item bg-black p-8 hover:bg-white/[0.02] transition-colors duration-500 group"
            >
              <div className="mb-6">
                <div className="text-accent font-mono text-3xl font-light mb-1">
                  {item.years}
                </div>
                <div className="text-text-muted font-mono text-[10px] tracking-wider">
                  YEARS
                </div>
              </div>
              
              <div className="mb-6">
                <div className="h-px bg-gradient-to-r from-accent/50 to-transparent" />
              </div>

              <div className="mb-4">
                <div className="text-white font-light text-sm leading-tight">
                  {item.domain}
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-text-secondary font-mono text-xl font-light">
                  {item.projects}
                </div>
                <div className="text-text-muted font-mono text-[9px] tracking-wider">
                  PROJECTS
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mt-px">
          <div className="bg-black p-8">
            <div className="text-accent font-mono text-4xl font-light mb-2">$180M-$450M</div>
            <div className="text-text-secondary text-sm font-light">IP Portfolio Valuation</div>
          </div>
          <div className="bg-black p-8">
            <div className="text-accent font-mono text-4xl font-light mb-2">6 → EXIT</div>
            <div className="text-text-secondary text-sm font-light">Ventures Built & Sold</div>
          </div>
          <div className="bg-black p-8">
            <div className="text-accent font-mono text-4xl font-light mb-2">160x</div>
            <div className="text-text-secondary text-sm font-light">ROI Demonstrated</div>
          </div>
        </div>
      </div>
    </section>
  );
};
