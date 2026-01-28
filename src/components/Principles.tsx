export const Principles = () => {
  const principles = [
    {
      title: 'ACCURACY OVER APPEAL',
      description: 'Mathematical validation of all projections',
    },
    {
      title: 'TRANSPARENCY IN METHODOLOGY',
      description: 'Source validation and defensibility',
    },
    {
      title: 'SCALABLE SYSTEMS',
      description: 'Build systems that grow',
    },
    {
      title: 'TRUST THROUGH EXECUTION',
      description: 'Under-promise, over-deliver',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12 text-center">
          How I Work
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="p-6 bg-bg-primary border border-border rounded-xl hover:border-accent transition-colors"
            >
              <h3 className="text-lg font-bold text-text-primary mb-3">
                {principle.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
