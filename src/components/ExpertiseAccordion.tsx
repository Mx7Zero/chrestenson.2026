import { useState } from 'react';

interface ExpertiseItem {
  title: string;
  items: string[];
}

export const ExpertiseAccordion = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections: { section: string; content: ExpertiseItem[] }[] = [
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

  const expertiseSections: ExpertiseSection[] = [
    {
      section: 'Executive Leadership & Strategy',
      content: [
        {
          title: 'Corporate Strategy & Vision',
          items: [
            'Category creation at intersection of industries (longevity medicine, fitness tech, medical devices)',
            'VUCA Framework application for navigating volatile, uncertain business environments',
            'Multi-frame positioning for different audience segments without strategic contradiction',
            'Strategic optionality design preserving flexibility while establishing foundational commitments',
            'Exit strategy architecture—PE acquisition, licensing platform, FDA-cleared device, public markets',
          ],
        },
        {
          title: 'Business Transformation',
          items: [
            'IP-first business model design transforming hardware companies into licensing platforms',
            'Valuation multiple arbitrage repositioning from low-multiple (1-2x) to high-multiple (8-15x) categories',
            'Platform business development supporting OEM licensing, SaaS subscriptions, and direct sales',
            'Franchise model architecture including economics, support systems, and scalability frameworks',
          ],
        },
        {
          title: 'Business Model Innovation',
          items: [
            'Aggregator/consolidator business model development',
            'Joint venture structuring with healthcare systems, real estate developers, and strategic partners',
            'Partnership structure analysis and implementation',
            'Multi-market expansion strategy design with geographic rollout sequencing',
          ],
        },
      ],
    },
    {
      section: 'Financial Leadership',
      content: [
        {
          title: 'Corporate Finance',
          items: [
            'Investment memorandum development with institutional-grade documentation',
            'Multi-year pro forma development (3-5 year projections)',
            'Financial modeling including 24-month capital deployment projections, unit economics analysis',
            'ROI analysis using institutional stress-testing methodologies (160x+ return multiples demonstrated)',
            'Budget development across IP prosecution, clinical validation, regulatory submissions',
          ],
        },
        {
          title: 'Pricing Strategy',
          items: [
            'Veblen good positioning where price signals quality and efficacy',
            'Segment-based pricing architecture ($15K-$80K ranges across market segments)',
            'Recurring revenue modeling converting hardware sales to ARR',
            'Membership tier structuring with premium positioning',
          ],
        },
        {
          title: 'Investment Strategy',
          items: [
            'Milestone-based funding structures tied to value-creation events',
            'Risk register development with probability weighting and impact analysis',
            'Asymmetric return identification with bounded downside and exponential upside',
            'Capital expenditure planning and working capital forecasting',
            'Break-even analysis and payback period modeling (18-24 month targets)',
          ],
        },
      ],
    },
    {
      section: 'Intellectual Property & Patent Strategy',
      content: [
        {
          title: 'Patent Portfolio Development',
          items: [
            'Provisional patent and omnibus drafting with technical specifications and FTO compliance language',
            'Multi-tier patent architecture (Foundational → Diagnostic → Algorithmic → Application)',
            'Patent valuation using comparable transaction analysis ($180M-$450M portfolio estimates)',
            'Priority date strategy managing critical filing windows',
          ],
        },
        {
          title: 'Freedom-to-Operate (FTO) Analysis',
          items: [
            'Competitive patent landscape analysis (USPTO, EPO, WIPO, CNIPA)',
            'Design-around strategy development avoiding competitor claims',
            'White space identification for patent claim development',
            'IPR vulnerability audits and litigation-tested validation planning',
          ],
        },
        {
          title: 'Trademark Strategy',
          items: [
            'Brand architecture development with coherent naming conventions',
            'Trademark filing strategy for novel terminology',
            'Layered protection strategy (utility + design + trade secrets)',
          ],
        },
      ],
    },
    {
      section: 'Brand Strategy & Marketing',
      content: [
        {
          title: 'Brand Development',
          items: [
            'Built six distinct hospitality concepts that became cultural anchors',
            'Brand storytelling across food, wellness, and performance markets',
            'Brand voice development and messaging framework creation',
            'Competitive differentiation through authentic positioning',
          ],
        },
        {
          title: 'Strategic Marketing',
          items: [
            'Multi-channel campaign development and execution',
            'Budget allocation optimization ($2K/month guerrilla to $30K+ strategies)',
            'Lead generation funnel design targeting 50-150 qualified leads monthly',
            'Conversion rate optimization (20-30% chat-to-consultation targets)',
          ],
        },
        {
          title: 'Content & Creative',
          items: [
            'Documentary film series production (broadcast-quality)',
            'Podcast strategy and content ecosystem development',
            'Video-first product launch campaigns',
            'Micro-influencer program development',
          ],
        },
        {
          title: 'Digital Marketing',
          items: [
            'Local SEO strategy development',
            'Google Local Services Ads, Google Ads, Meta advertising',
            'Citation building directories',
            'Marketing automation and CRM implementation (HubSpot, Pipedrive)',
          ],
        },
      ],
    },
    {
      section: 'Product Architecture & Development',
      content: [
        {
          title: 'Technical Product Design',
          items: [
            'System architecture for integrated hardware-software platforms',
            'Metric development and scoring methodologies (proprietary diagnostic metrics)',
            'Algorithm design for real-time adaptive systems',
            'Wearable integration with commercial platforms (WHOOP, Apple Watch, Garmin, Oura)',
          ],
        },
        {
          title: 'Full-Stack Development',
          items: [
            'Frontend: React 18, TypeScript, Tailwind CSS, Progressive Web Apps',
            'Backend: Node.js, Express, PostgreSQL, Supabase, Edge Functions',
            'Architecture: Component-based design, state machine patterns, offline-first',
            'Security: Role-based access control, multi-tenant data isolation, RLS policies',
          ],
        },
        {
          title: 'Product Management',
          items: [
            'Requirements documentation and feature specification',
            'Phased roadmap planning with dependency mapping',
            'Sprint planning and development team coordination',
            'MVP scoping and iterative refinement',
          ],
        },
      ],
    },
    {
      section: 'Healthcare Industry Expertise',
      content: [
        {
          title: 'Medical Billing & Reimbursement',
          items: [
            'CPT code expertise (97110, 97112, 97116, 97530, 97150)',
            'Medicare MPPR calculations and 8-minute rule compliance',
            'Insurance reimbursement rate analysis and revenue modeling',
            'Multi-payer engine design (Medicare FFS, MA, commercial)',
          ],
        },
        {
          title: 'Clinical Operations',
          items: [
            'Physical therapy clinic operations and economics',
            'Evidence-based program design (Otago, Matter of Balance)',
            'Clinical outcomes measurement and reporting',
            'Physician referral network development',
          ],
        },
        {
          title: 'Regulatory Compliance',
          items: [
            'HIPAA technical safeguards (administrative, physical, technical controls)',
            'FDA regulatory strategy (SaMD classification, 510(k) pathway planning)',
            'Medicare fraud and abuse prevention',
            'Anti-Kickback Statute compliance and safe harbor navigation',
          ],
        },
      ],
    },
    {
      section: 'Sales & Business Development',
      content: [
        {
          title: 'B2B Enterprise Sales',
          items: [
            'High-ticket medical equipment sales ($21,500-$50,000+ per unit)',
            'Complex 8-12 month healthcare procurement cycle navigation',
            'Committee-based purchasing process management',
            'Multi-stakeholder relationship building',
          ],
        },
        {
          title: 'Sales Operations',
          items: [
            'Trial-to-close conversion strategy development',
            'Pipeline management and deal prioritization',
            'Sales process systematization and playbook development',
            'CRM administration and optimization',
          ],
        },
        {
          title: 'Deal Structuring',
          items: [
            'Equipment financing arrangement (lease, purchase, EaaS models)',
            'Contract negotiation and warranty structuring',
            'Multi-year service agreement development',
          ],
        },
      ],
    },
    {
      section: 'Industry Expertise',
      content: [
        {
          title: 'Hospitality & Food Service',
          items: [
            'Six hospitality concept launches from concept through profitable operation',
            'Head chef experience, farm-to-table operations, craft brewing',
            'P&L management and cost-control analytics',
            'Subcontractor relationship management',
          ],
        },
        {
          title: 'Health & Wellness',
          items: [
            'Longevity market analysis',
            'Exercise physiology knowledge (VO2 max, cardiorespiratory dynamics)',
            'Fall prevention and balance training protocols',
            'Senior fitness and aging-in-place market dynamics',
          ],
        },
        {
          title: 'Home Services',
          items: [
            'Kitchen and bathroom remodeling operations',
            'Three-tier pricing structure development',
            'ADA compliance and universal design principles',
            'Subcontractor operational model implementation',
          ],
        },
      ],
    },
  ];

  return (
    <section id="expertise" className="py-20 md:py-32 bg-bg-primary">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-12 text-center">
          Comprehensive Expertise
        </h2>
        
        <div className="space-y-4">
          {expertiseSections.map((section, index) => (
            <div
              key={index}
              className="border border-border rounded-xl overflow-hidden bg-bg-surface"
            >
              <button
                onClick={() => setOpenSection(openSection === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-bg-elevated transition-colors"
              >
                <h3 className="text-xl font-semibold text-text-primary">
                  {section.section}
                </h3>
                <svg
                  className={`w-5 h-5 text-accent transition-transform ${
                    openSection === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              {openSection === index && (
                <div className="px-6 pb-6 space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex}>
                      <h4 className="text-lg font-semibold text-accent mb-3">
                        {item.title}
                      </h4>
                      <ul className="space-y-2">
                        {item.items.map((point, pointIndex) => (
                          <li
                            key={pointIndex}
                            className="text-text-secondary text-sm leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-accent"
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
