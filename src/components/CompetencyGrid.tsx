export const CompetencyGrid = () => {
  const competencies = [
    { domain: 'Corporate Strategy', proficiency: 'Expert', evidence: 'VUCA framework, category creation, exit architecture' },
    { domain: 'Brand Development', proficiency: 'Expert', evidence: 'Six hospitality brands built from concept to exit' },
    { domain: 'Financial Modeling', proficiency: 'Expert', evidence: 'Investment memoranda, ROI analysis, capital deployment' },
    { domain: 'Patent/IP Strategy', proficiency: 'Expert', evidence: 'Multi-patent portfolios, FTO compliance, valuation' },
    { domain: 'Product Architecture', proficiency: 'Expert', evidence: 'Hardware-software platforms, metric development' },
    { domain: 'Technical Development', proficiency: 'Expert', evidence: 'React/TypeScript, PostgreSQL, full-stack SaaS' },
    { domain: 'Hospitality Development', proficiency: 'Expert', evidence: 'Concept-to-exit execution: R&D, ABC, permitting' },
    { domain: 'Market Analysis', proficiency: 'Expert', evidence: 'Multi-segment sizing, competitive landscape' },
  ];

  return (
    <section id="about" className="py-32 px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-16">
          <div className="text-text-muted font-mono text-sm tracking-[0.2em] mb-6">
            CORE COMPETENCIES
          </div>
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-[-0.04em]">
            Competency<br />Matrix
          </h2>
        </div>
        
        {/* Table */}
        <div className="border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 bg-white/5 border-b border-white/10">
            <div className="col-span-3 p-6">
              <span className="text-accent font-mono text-sm tracking-wider font-bold">DOMAIN</span>
            </div>
            <div className="col-span-2 p-6 border-l border-white/10">
              <span className="text-accent font-mono text-sm tracking-wider font-bold">PROFICIENCY</span>
            </div>
            <div className="col-span-7 p-6 border-l border-white/10">
              <span className="text-accent font-mono text-sm tracking-wider font-bold">EVIDENCE</span>
            </div>
          </div>

          {/* Rows */}
          {competencies.map((item, index) => (
            <div 
              key={index} 
              className="grid grid-cols-12 border-b border-white/10 last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="col-span-3 p-6">
                <span className="text-white font-bold text-lg">{item.domain}</span>
              </div>
              <div className="col-span-2 p-6 border-l border-white/10 flex items-center">
                <span className="bg-accent/20 text-accent px-4 py-2 rounded font-mono text-sm font-bold">
                  {item.proficiency}
                </span>
              </div>
              <div className="col-span-7 p-6 border-l border-white/10">
                <span className="text-text-secondary text-lg">{item.evidence}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 mt-16">
          <div className="bg-black border border-white/10 p-10 text-center">
            <div className="text-accent font-mono text-4xl md:text-5xl font-bold mb-3">$180M–$450M</div>
            <div className="text-text-secondary text-lg font-medium">IP Portfolio Valuation</div>
          </div>
          <div className="bg-black border border-white/10 p-10 text-center">
            <div className="text-accent font-mono text-4xl md:text-5xl font-bold mb-3">6 → EXIT</div>
            <div className="text-text-secondary text-lg font-medium">Ventures Built & Sold</div>
          </div>
          <div className="bg-black border border-white/10 p-10 text-center">
            <div className="text-accent font-mono text-4xl md:text-5xl font-bold mb-3">160x</div>
            <div className="text-text-secondary text-lg font-medium">ROI Demonstrated</div>
          </div>
        </div>
      </div>
    </section>
  );
};
