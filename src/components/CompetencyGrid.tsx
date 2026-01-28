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
          <div className="text-text-muted font-mono text-sm tracking-[0.2em] mb-6">
            CORE COMPETENCIES
          </div>
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-[-0.04em]">
            Expert-Level<br />Execution
          </h2>
        </div>
        
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {competencies.map((item, index) => (
            <div
              key={index}
              className="data-item bg-black p-10 hover:bg-white/[0.02] transition-colors duration-500 group"
            >
              <div className="mb-8">
                <div className="text-accent font-mono text-5xl font-bold mb-2">
                  {item.years}
                </div>
                <div className="text-text-muted font-mono text-sm tracking-wider">
                  YEARS
                </div>
              </div>
              
              <div className="mb-8">
                <div className="h-px bg-gradient-to-r from-accent/50 to-transparent" />
              </div>

              <div className="mb-6">
                <div className="text-white font-bold text-lg leading-tight">
                  {item.domain}
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <div className="text-text-secondary font-mono text-3xl font-bold">
                  {item.projects}
                </div>
                <div className="text-text-muted font-mono text-xs tracking-wider">
                  PROJECTS
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mt-px">
          <div className="bg-black p-10">
            <div className="text-accent font-mono text-5xl font-bold mb-3">$180M-$450M</div>
            <div className="text-text-secondary text-lg font-medium">IP Portfolio Valuation</div>
          </div>
          <div className="bg-black p-10">
            <div className="text-accent font-mono text-5xl font-bold mb-3">6 → EXIT</div>
            <div className="text-text-secondary text-lg font-medium">Ventures Built & Sold</div>
          </div>
          <div className="bg-black p-10">
            <div className="text-accent font-mono text-5xl font-bold mb-3">160x</div>
            <div className="text-text-secondary text-lg font-medium">ROI Demonstrated</div>
          </div>
        </div>
      </div>
    </section>
  );
};
