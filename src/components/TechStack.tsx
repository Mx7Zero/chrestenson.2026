export const TechStack = () => {
  const stack = [
    { category: 'FRONTEND', items: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'GSAP'] },
    { category: 'BACKEND', items: ['Node.js', 'PostgreSQL', 'Supabase', 'Redis'] },
    { category: 'AI/ML', items: ['Claude', 'Gemini', 'MidJourney', 'Runway ML'] },
    { category: 'DESIGN', items: ['Adobe CC', 'DaVinci Resolve', 'Framer'] },
    { category: 'BUSINESS', items: ['Pipedrive', 'HubSpot', 'GA4', 'Notion'] },
    { category: 'HEALTHCARE', items: ['HL7 FHIR', 'HIPAA', 'FDA 510(k)', 'CMS'] },
  ];

  return (
    <section className="py-32 px-8 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-20">
          <div className="text-text-muted font-mono text-[10px] tracking-[0.2em] mb-4">
            TECHNICAL CAPABILITIES
          </div>
          <h2 className="text-5xl md:text-7xl font-extralight text-white tracking-[-0.04em]">
            Full-Stack<br />Execution
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5">
          {stack.map((category) => (
            <div
              key={category.category}
              className="bg-black p-6 hover:bg-white/[0.02] transition-colors duration-500"
            >
              <div className="text-accent font-mono text-[10px] tracking-wider mb-6">
                {category.category}
              </div>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div key={item} className="text-text-secondary text-xs font-light">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
