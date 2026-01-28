export const TechStack = () => {
  // ALL Technical Proficiencies from Job Skills 2026
  const categories = [
    {
      title: 'Development & Design',
      items: [
        { label: 'Frontend', value: 'React 18, TypeScript, Tailwind CSS, Vite, GSAP' },
        { label: 'Backend', value: 'Node.js, Express, PostgreSQL, Supabase, Redis' },
        { label: 'Design/Video', value: 'Adobe Creative Cloud (full suite), DaVinci Resolve' },
        { label: 'AI/Content', value: 'Claude Code, Gemini, MidJourney, Runway ML, VEO 3' },
        { label: 'Web Platforms', value: 'Replit, Framer, Webflow, WordPress' },
      ]
    },
    {
      title: 'Business Systems',
      items: [
        { label: 'CRM', value: 'Pipedrive, HubSpot, JobNimbus' },
        { label: 'Analytics', value: 'Google Analytics 4, Microsoft Clarity, Search Console' },
        { label: 'Documentation', value: 'Notion, Markdown, Technical specifications' },
        { label: 'Project Management', value: 'Agile/Scrum, risk management, roadmap planning' },
        { label: 'Financial', value: 'Excel/Sheets modeling, investment memoranda' },
      ]
    },
    {
      title: 'Healthcare & Regulatory',
      items: [
        { label: 'Standards', value: 'HL7 FHIR R4, HIPAA, CMS billing rules' },
        { label: 'FDA Pathways', value: '510(k), De Novo, SaMD classification' },
        { label: 'IP Systems', value: 'USPTO, EPO, WIPO, CNIPA' },
        { label: 'Compliance', value: 'HIPAA, AKS, Medicare billing' },
      ]
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">Technical Proficiencies</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F]">
            Full-stack execution.<br />End-to-end delivery.
          </h2>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-white p-8 shadow-sm border border-[#E5E5E5]">
              <h3 className="text-xl font-semibold text-[#1D1D1F] mb-6">
                {category.title}
              </h3>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <p className="text-sm text-[#86868B] mb-1">{item.label}</p>
                    <p className="text-[#1D1D1F]">{item.value}</p>
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
