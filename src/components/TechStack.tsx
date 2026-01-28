export const TechStack = () => {
  const techCategories = [
    {
      category: 'Development & Design',
      items: [
        { label: 'Frontend', tools: 'React 18, TypeScript, Tailwind CSS, Vite, GSAP' },
        { label: 'Backend', tools: 'Node.js, Express, PostgreSQL, Supabase, Redis' },
        { label: 'Design/Video', tools: 'Adobe Creative Cloud (full suite), DaVinci Resolve' },
        { label: 'AI/Content', tools: 'Claude Code, Gemini, MidJourney, Runway ML, VEO 3' },
        { label: 'Web Platforms', tools: 'Replit, Framer, Webflow, WordPress' },
      ],
    },
    {
      category: 'Business Systems',
      items: [
        { label: 'CRM', tools: 'Pipedrive, HubSpot, JobNimbus' },
        { label: 'Analytics', tools: 'Google Analytics 4, Microsoft Clarity, Search Console' },
        { label: 'Documentation', tools: 'Notion, Markdown, Technical specifications' },
        { label: 'Project Management', tools: 'Agile/Scrum, risk management, roadmap planning' },
        { label: 'Financial', tools: 'Excel/Sheets modeling, investment memoranda' },
      ],
    },
    {
      category: 'Healthcare & Regulatory',
      items: [
        { label: 'Standards', tools: 'HL7 FHIR R4, HIPAA, CMS billing rules' },
        { label: 'FDA Pathways', tools: '510(k), De Novo, SaMD classification' },
        { label: 'IP Systems', tools: 'USPTO, EPO, WIPO, CNIPA' },
        { label: 'Compliance', tools: 'HIPAA, AKS, Medicare billing' },
      ],
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12 text-center">
          Technical Stack
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {techCategories.map((category) => (
            <div
              key={category.category}
              className="bg-bg-primary border border-border rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold text-accent mb-6">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.label}>
                    <div className="text-sm font-medium text-text-primary mb-1">
                      {item.label}
                    </div>
                    <div className="text-sm text-text-secondary leading-relaxed">
                      {item.tools}
                    </div>
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
