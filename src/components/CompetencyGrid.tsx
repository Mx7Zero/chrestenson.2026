import { useStaggerAnimation } from '../hooks/useScrollAnimation';

export const CompetencyGrid = () => {
  const gridRef = useStaggerAnimation('.competency-card');
  
  const competencies = [
    {
      domain: 'Corporate Strategy',
      level: 'Expert',
      evidence: 'VUCA framework, category creation, exit architecture',
    },
    {
      domain: 'Brand Development',
      level: 'Expert',
      evidence: 'Six hospitality brands built from concept to exit',
    },
    {
      domain: 'Financial Modeling',
      level: 'Expert',
      evidence: 'Investment memoranda, ROI analysis, capital deployment',
    },
    {
      domain: 'Patent/IP Strategy',
      level: 'Expert',
      evidence: 'Multi-patent portfolios, FTO compliance, valuation',
    },
    {
      domain: 'Product Architecture',
      level: 'Expert',
      evidence: 'Hardware-software platforms, metric development',
    },
    {
      domain: 'Technical Development',
      level: 'Expert',
      evidence: 'React/TypeScript, PostgreSQL, full-stack SaaS',
    },
    {
      domain: 'Hospitality Development',
      level: 'Expert',
      evidence: 'Concept-to-exit: R&D, ABC licensing, permitting',
    },
    {
      domain: 'Market Analysis',
      level: 'Expert',
      evidence: 'Multi-segment sizing, competitive landscape',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12 text-center">
          Expert-Level Execution
        </h2>
        
        <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {competencies.map((competency) => (
            <div
              key={competency.domain}
              className="competency-card p-6 bg-bg-primary border border-border rounded-xl hover:bg-bg-elevated transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {competency.domain}
              </h3>
              <div className="mb-3">
                <span className="font-mono text-sm text-accent font-medium">
                  {competency.level}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {competency.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
