import { useState } from 'react';

interface ExpertiseItem {
  title: string;
  items: string[];
}

interface ExpertiseSection {
  section: string;
  content: ExpertiseItem[];
}

export const ExpertiseAccordion = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections: ExpertiseSection[] = [
    {
      section: 'Executive Leadership',
      content: [
        {
          title: 'Corporate Strategy',
          items: [
            'Category creation at industry intersections',
            'VUCA framework application',
            'Exit strategy architecture (PE, licensing, FDA, public markets)',
            'Valuation multiple arbitrage (1-2x → 8-15x)',
          ],
        },
      ],
    },
    {
      section: 'Financial Engineering',
      content: [
        {
          title: 'Corporate Finance',
          items: [
            'Investment memoranda (institutional-grade)',
            'Multi-year pro forma development (3-5 year)',
            'ROI analysis (160x+ return multiples)',
            'Unit economics and capital deployment',
          ],
        },
      ],
    },
    {
      section: 'IP & Patent Strategy',
      content: [
        {
          title: 'Portfolio Development',
          items: [
            'Multi-tier patent architecture',
            'Portfolio valuation ($180M-$450M)',
            'FTO analysis (USPTO, EPO, WIPO, CNIPA)',
            'Design-around strategy development',
          ],
        },
      ],
    },
    {
      section: 'Product & Development',
      content: [
        {
          title: 'Full-Stack Engineering',
          items: [
            'Frontend: React 18, TypeScript, Tailwind, PWA',
            'Backend: Node.js, PostgreSQL, Supabase',
            'System architecture for hardware-software platforms',
            'Security: RBAC, multi-tenant isolation, RLS',
          ],
        },
      ],
    },
    {
      section: 'Healthcare & Regulatory',
      content: [
        {
          title: 'Clinical Operations',
          items: [
            'CPT code expertise (97110, 97112, 97116, 97530, 97150)',
            'Medicare MPPR and 8-minute rule compliance',
            'FDA regulatory strategy (SaMD, 510(k))',
            'HIPAA technical safeguards',
          ],
        },
      ],
    },
    {
      section: 'Enterprise Sales',
      content: [
        {
          title: 'B2B Sales Operations',
          items: [
            'High-ticket equipment sales ($21.5K-$50K+)',
            '8-12 month healthcare procurement cycles',
            'Committee-based purchasing management',
            'Multi-stakeholder relationship building',
          ],
        },
      ],
    },
  ];

  return (
    <section id="expertise" className="py-32 px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-20">
          <div className="text-text-muted font-mono text-[10px] tracking-[0.2em] mb-4">
            DOMAIN EXPERTISE
          </div>
          <h2 className="text-5xl md:text-7xl font-extralight text-white tracking-[-0.04em]">
            Comprehensive<br />Capabilities
          </h2>
        </div>
        
        <div className="space-y-px">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-black border-t border-white/5 hover:bg-white/[0.01] transition-colors duration-300"
            >
              <button
                onClick={() => setOpenSection(openSection === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-accent font-mono text-xs">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-white text-xl font-light tracking-tight group-hover:text-accent transition-colors duration-300">
                    {section.section}
                  </h3>
                </div>
                <div className={`transition-transform duration-300 ${openSection === index ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {openSection === index && (
                <div className="px-8 pb-8">
                  <div className="pl-14">
                    {section.content.map((item, itemIndex) => (
                      <div key={itemIndex} className="mb-6">
                        <div className="text-text-muted font-mono text-[10px] tracking-wider mb-4">
                          {item.title.toUpperCase()}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {item.items.map((point, pointIndex) => (
                            <div
                              key={pointIndex}
                              className="flex items-start gap-3 text-text-secondary text-sm font-light"
                            >
                              <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                              <div>{point}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
