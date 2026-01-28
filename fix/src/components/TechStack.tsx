import { useState } from 'react';

export const TechStack = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  
  // ALL Technical Proficiencies from Job Skills 2026
  const categories = [
    {
      title: 'Development & Design',
      code: 'DEV',
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
      code: 'BIZ',
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
      code: 'REG',
      items: [
        { label: 'Standards', value: 'HL7 FHIR R4, HIPAA, CMS billing rules' },
        { label: 'FDA Pathways', value: '510(k), De Novo, SaMD classification' },
        { label: 'IP Systems', value: 'USPTO, EPO, WIPO, CNIPA' },
        { label: 'Compliance', value: 'HIPAA, AKS, Medicare billing' },
      ]
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-[#1D1D1F] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#424245]" />
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#0071E3]">
              Technical Proficiencies
            </span>
            <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#424245]" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
            Full-stack execution
          </h2>
          <p className="mt-2 text-xl md:text-2xl text-[#86868B] font-light">
            End-to-end delivery
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex border border-[#424245]">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setActiveCategory(index)}
                className={`
                  px-6 md:px-10 py-4 text-sm md:text-base font-mono tracking-wider uppercase transition-all
                  ${activeCategory === index 
                    ? 'bg-[#0071E3] text-white' 
                    : 'text-[#86868B] hover:text-white hover:bg-[#2D2D2F]'}
                  ${index > 0 ? 'border-l border-[#424245]' : ''}
                `}
              >
                <span className="hidden md:inline">{category.title}</span>
                <span className="md:hidden">{category.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Category Content */}
        <div className="border border-[#424245]">
          {/* Category Header */}
          <div className="border-b border-[#424245] p-6 md:p-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-[#0071E3] tracking-wider">
                {String(activeCategory + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl md:text-2xl font-medium text-white">
                {categories[activeCategory].title}
              </h3>
            </div>
            <span className="text-xs font-mono text-[#424245] tracking-widest">
              {categories[activeCategory].items.length} SKILLS
            </span>
          </div>
          
          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {categories[activeCategory].items.map((item, itemIndex) => (
              <div 
                key={itemIndex}
                className={`
                  p-6 md:p-8 group hover:bg-[#2D2D2F] transition-colors
                  ${itemIndex % 3 !== 2 ? 'lg:border-r lg:border-[#424245]' : ''}
                  ${itemIndex % 2 !== 1 ? 'md:border-r md:border-[#424245] lg:border-r-0' : 'md:border-r-0'}
                  ${itemIndex < categories[activeCategory].items.length - 1 ? 'border-b border-[#424245]' : ''}
                  ${itemIndex < categories[activeCategory].items.length - 2 ? 'md:border-b' : 'md:border-b-0'}
                  ${itemIndex < categories[activeCategory].items.length - 3 ? 'lg:border-b' : 'lg:border-b-0'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 border border-[#424245] flex items-center justify-center flex-shrink-0 group-hover:border-[#0071E3] transition-colors">
                    <span className="text-xs font-mono text-[#424245] group-hover:text-[#0071E3] transition-colors">
                      {String(itemIndex + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono tracking-wider uppercase text-[#0071E3] mb-2">
                      {item.label}
                    </p>
                    <p className="text-sm md:text-base text-[#E5E5E5] leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-mono text-[#0071E3] mb-1">14</div>
              <div className="text-xs font-mono tracking-wider uppercase text-[#86868B]">Core Skills</div>
            </div>
            <div className="w-px h-12 bg-[#424245]" />
            <div>
              <div className="text-3xl md:text-4xl font-mono text-[#0071E3] mb-1">3</div>
              <div className="text-xs font-mono tracking-wider uppercase text-[#86868B]">Domains</div>
            </div>
            <div className="w-px h-12 bg-[#424245]" />
            <div>
              <div className="text-3xl md:text-4xl font-mono text-[#0071E3] mb-1">30+</div>
              <div className="text-xs font-mono tracking-wider uppercase text-[#86868B]">Years</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
