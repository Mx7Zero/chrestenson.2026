import { useStaggerAnimation } from '../hooks/useScrollAnimation';

export const Achievements = () => {
  const gridRef = useStaggerAnimation('.achievement-card');
  
  const achievements = [
    {
      stat: '30+ YEARS',
      description: 'Creative leadership spanning studio production and hospitality brand-building',
    },
    {
      stat: '6 VENTURES → EXIT',
      description: 'Hospitality concepts built from scratch through profitable sale',
    },
    {
      stat: '$180M-$450M',
      description: 'IP portfolio architected with 19-patent strategy and full FTO compliance',
    },
    {
      stat: 'FULL-STACK TECHNICAL',
      description: 'Built production SaaS platforms; can spec and ship, not just strategize',
    },
    {
      stat: 'INSTITUTIONAL-GRADE',
      description: 'Strategic intelligence briefs on $1B+ public companies',
    },
    {
      stat: 'STUDIO CREDENTIALS',
      description: 'Disney | National Geographic | Ridley Scott Associates',
    },
  ];

  return (
    <section id="achievements" className="py-20 md:py-32 bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12 text-center">
          Track Record
        </h2>
        
        <div ref={gridRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="achievement-card text-center p-6"
            >
              <div className="text-3xl md:text-4xl font-bold text-accent mb-4 font-mono">
                {achievement.stat}
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
