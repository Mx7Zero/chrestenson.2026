export const CompetencyGrid = () => {
  const competencies = [
    { domain: 'Corporate Strategy', evidence: 'VUCA framework, category creation, exit architecture' },
    { domain: 'Brand Development', evidence: 'Six hospitality brands built from concept to exit' },
    { domain: 'Financial Modeling', evidence: 'Investment memoranda, ROI analysis, capital deployment' },
    { domain: 'Patent/IP Strategy', evidence: 'Multi-patent portfolios, FTO compliance, valuation' },
    { domain: 'Product Architecture', evidence: 'Hardware-software platforms, metric development' },
    { domain: 'Technical Development', evidence: 'React/TypeScript, PostgreSQL, full-stack SaaS' },
    { domain: 'Hospitality Development', evidence: 'Concept-to-exit execution: R&D, ABC, permitting' },
    { domain: 'Market Analysis', evidence: 'Multi-segment sizing, competitive landscape' },
  ];

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
        
        {/* Competency Cards */}
        <div className="space-y-3">
          {competencies.map((item, index) => (
            <div 
              key={index} 
              className="group relative overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Number */}
                <div className="w-20 flex-shrink-0 flex items-center justify-center bg-white/[0.02] border-r border-white/5">
                  <span className="text-accent font-mono text-lg font-bold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1 flex items-center justify-between gap-8 py-8 px-10 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-500 border-b border-white/5">
                  <div className="flex items-center gap-8">
                    {/* Domain */}
                    <div className="w-64 flex-shrink-0">
                      <h3 className="text-white text-2xl font-bold group-hover:text-accent transition-colors duration-300">
                        {item.domain}
                      </h3>
                    </div>
                    
                    {/* Expert Badge */}
                    <div className="hidden md:block">
                      <span className="text-accent font-mono text-xs tracking-[0.2em] border border-accent/30 px-4 py-2">
                        EXPERT
                      </span>
                    </div>
                  </div>
                  
                  {/* Evidence */}
                  <div className="flex-1 text-right">
                    <p className="text-text-secondary text-lg">
                      {item.evidence}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-accent/50 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-accent font-mono text-5xl md:text-6xl font-bold mb-4">$180M</div>
            <div className="text-text-muted font-mono text-xs tracking-[0.2em] mb-2">TO $450M</div>
            <div className="text-white text-xl font-medium">IP Portfolio Valuation</div>
          </div>
          
          <div className="group relative p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-accent/50 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-accent font-mono text-5xl md:text-6xl font-bold mb-4">6</div>
            <div className="text-text-muted font-mono text-xs tracking-[0.2em] mb-2">VENTURES → EXIT</div>
            <div className="text-white text-xl font-medium">Built & Sold</div>
          </div>
          
          <div className="group relative p-12 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 hover:border-accent/50 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-accent font-mono text-5xl md:text-6xl font-bold mb-4">160x</div>
            <div className="text-text-muted font-mono text-xs tracking-[0.2em] mb-2">RETURN MULTIPLE</div>
            <div className="text-white text-xl font-medium">ROI Demonstrated</div>
          </div>
        </div>
      </div>
    </section>
  );
};
