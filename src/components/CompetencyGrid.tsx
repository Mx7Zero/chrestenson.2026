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

  const metrics = [
    { value: '$180M–$450M', label: 'IP Portfolio Valuation' },
    { value: '6 Ventures', label: 'Built & Sold to Exit' },
    { value: '160x ROI', label: 'Demonstrated Returns' },
  ];

  return (
    <section id="about" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">Core Competencies</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F]">
            Expert-level execution<br />across eight domains.
          </h2>
        </div>

        {/* Competency List */}
        <div className="space-y-0 mb-24">
          {competencies.map((item, index) => (
            <div 
              key={index} 
              className="py-6 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-8"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-[#1D1D1F]">
                {item.domain}
              </h3>
              <p className="text-lg text-[#6E6E73] md:text-right max-w-xl">
                {item.evidence}
              </p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E5E5]">
              <div className="text-4xl md:text-5xl font-semibold text-[#0071E3] mb-2">
                {metric.value}
              </div>
              <div className="text-lg text-[#6E6E73]">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
