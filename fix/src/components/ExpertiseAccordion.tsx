import { useState } from 'react';

export const ExpertiseAccordion = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  // ALL data from Job Skills 2026 document
  const sections = [
    {
      title: 'Executive Leadership & Strategy',
      subsections: [
        {
          subtitle: 'Corporate Strategy & Vision',
          items: [
            'Category creation at intersection of industries (longevity medicine, fitness tech, medical devices)',
            'VUCA Framework application for navigating volatile, uncertain business environments',
            'Multi-frame positioning for different audience segments without strategic contradiction',
            'Strategic optionality design preserving flexibility while establishing foundational commitments',
            'Exit strategy architecture—PE acquisition, licensing platform, FDA-cleared device, public markets',
          ]
        },
        {
          subtitle: 'Business Transformation',
          items: [
            'IP-first business model design transforming hardware companies into licensing platforms',
            'Valuation multiple arbitrage repositioning from low-multiple (1-2x) to high-multiple (8-15x) categories',
            'Platform business development supporting OEM licensing, SaaS subscriptions, and direct sales',
            'Franchise model architecture including economics, support systems, and scalability frameworks',
          ]
        },
        {
          subtitle: 'Business Model Innovation',
          items: [
            'Aggregator/consolidator business model development',
            'Joint venture structuring with healthcare systems, real estate developers, and strategic partners',
            'Partnership structure analysis and implementation',
            'Multi-market expansion strategy design with geographic rollout sequencing',
          ]
        },
      ]
    },
    {
      title: 'Financial Leadership',
      subsections: [
        {
          subtitle: 'Corporate Finance',
          items: [
            'Investment memorandum development with institutional-grade documentation',
            'Multi-year pro forma development (3-5 year projections)',
            'Financial modeling including 24-month capital deployment projections, unit economics analysis',
            'ROI analysis using institutional stress-testing methodologies (160x+ return multiples demonstrated)',
            'Budget development across IP prosecution, clinical validation, regulatory submissions',
          ]
        },
        {
          subtitle: 'Pricing Strategy',
          items: [
            'Veblen good positioning where price signals quality and efficacy',
            'Segment-based pricing architecture ($15K-$80K ranges across market segments)',
            'Recurring revenue modeling converting hardware sales to ARR',
            'Membership tier structuring with premium positioning',
          ]
        },
        {
          subtitle: 'Investment Strategy',
          items: [
            'Milestone-based funding structures tied to value-creation events',
            'Risk register development with probability weighting and impact analysis',
            'Asymmetric return identification with bounded downside and exponential upside',
            'Capital expenditure planning and working capital forecasting',
            'Break-even analysis and payback period modeling (18-24 month targets)',
          ]
        },
      ]
    },
    {
      title: 'Intellectual Property & Patent Strategy',
      subsections: [
        {
          subtitle: 'Patent Portfolio Development',
          items: [
            'Provisional patent and omnibus drafting with technical specifications and FTO compliance language',
            'Multi-tier patent architecture (Foundational → Diagnostic → Algorithmic → Application)',
            'Patent valuation using comparable transaction analysis ($180M-$450M portfolio estimates)',
            'Priority date strategy managing critical filing windows',
          ]
        },
        {
          subtitle: 'Freedom-to-Operate (FTO) Analysis',
          items: [
            'Competitive patent landscape analysis (USPTO, EPO, WIPO, CNIPA)',
            'Design-around strategy development avoiding competitor claims',
            'White space identification for patent claim development',
            'IPR vulnerability audits and litigation-tested validation planning',
          ]
        },
        {
          subtitle: 'Trademark Strategy',
          items: [
            'Brand architecture development with coherent naming conventions',
            'Trademark filing strategy for novel terminology',
            'Layered protection strategy (utility + design + trade secrets)',
          ]
        },
      ]
    },
    {
      title: 'Brand Strategy & Marketing',
      subsections: [
        {
          subtitle: 'Brand Development',
          items: [
            'Built six distinct hospitality concepts that became cultural anchors',
            'Brand storytelling across food, wellness, and performance markets',
            'Brand voice development and messaging framework creation',
            'Competitive differentiation through authentic positioning',
          ]
        },
        {
          subtitle: 'Strategic Marketing',
          items: [
            'Multi-channel campaign development and execution',
            'Budget allocation optimization ($2K/month guerrilla to $30K+ strategies)',
            'Lead generation funnel design targeting 50-150 qualified leads monthly',
            'Conversion rate optimization (20-30% chat-to-consultation targets)',
          ]
        },
        {
          subtitle: 'Content & Creative',
          items: [
            'Documentary film series production (broadcast-quality)',
            'Podcast strategy and content ecosystem development',
            'Video-first product launch campaigns',
            'Micro-influencer program development',
          ]
        },
        {
          subtitle: 'Digital Marketing',
          items: [
            'Local SEO strategy development',
            'Google Local Services Ads, Google Ads, Meta advertising',
            'Citation building directories',
            'Marketing automation and CRM implementation (HubSpot, Pipedrive)',
          ]
        },
      ]
    },
    {
      title: 'Product Architecture & Development',
      subsections: [
        {
          subtitle: 'Technical Product Design',
          items: [
            'System architecture for integrated hardware-software platforms',
            'Metric development and scoring methodologies (proprietary diagnostic metrics)',
            'Algorithm design for real-time adaptive systems',
            'Wearable integration with commercial platforms (WHOOP, Apple Watch, Garmin, Oura)',
          ]
        },
        {
          subtitle: 'Full-Stack Development',
          items: [
            'Frontend: React 18, TypeScript, Tailwind CSS, Progressive Web Apps',
            'Backend: Node.js, Express, PostgreSQL, Supabase, Edge Functions',
            'Architecture: Component-based design, state machine patterns, offline-first',
            'Security: Role-based access control, multi-tenant data isolation, RLS policies',
          ]
        },
        {
          subtitle: 'Product Management',
          items: [
            'Requirements documentation and feature specification',
            'Phased roadmap planning with dependency mapping',
            'Sprint planning and development team coordination',
            'MVP scoping and iterative refinement',
          ]
        },
      ]
    },
    {
      title: 'Healthcare Industry Expertise',
      subsections: [
        {
          subtitle: 'Medical Billing & Reimbursement',
          items: [
            'CPT code expertise (97110, 97112, 97116, 97530, 97150)',
            'Medicare MPPR calculations and 8-minute rule compliance',
            'Insurance reimbursement rate analysis and revenue modeling',
            'Multi-payer engine design (Medicare FFS, MA, commercial)',
          ]
        },
        {
          subtitle: 'Clinical Operations',
          items: [
            'Physical therapy clinic operations and economics',
            'Evidence-based program design (Otago, Matter of Balance)',
            'Clinical outcomes measurement and reporting',
            'Physician referral network development',
          ]
        },
        {
          subtitle: 'Regulatory Compliance',
          items: [
            'HIPAA technical safeguards (administrative, physical, technical controls)',
            'FDA regulatory strategy (SaMD classification, 510(k) pathway planning)',
            'Medicare fraud and abuse prevention',
            'Anti-Kickback Statute compliance and safe harbor navigation',
          ]
        },
      ]
    },
    {
      title: 'Sales & Business Development',
      subsections: [
        {
          subtitle: 'B2B Enterprise Sales',
          items: [
            'High-ticket medical equipment sales ($21,500-$50,000+ per unit)',
            'Complex 8-12 month healthcare procurement cycle navigation',
            'Committee-based purchasing process management',
            'Multi-stakeholder relationship building',
          ]
        },
        {
          subtitle: 'Sales Operations',
          items: [
            'Trial-to-close conversion strategy development',
            'Pipeline management and deal prioritization',
            'Sales process systematization and playbook development',
            'CRM administration and optimization',
          ]
        },
        {
          subtitle: 'Deal Structuring',
          items: [
            'Equipment financing arrangement (lease, purchase, EaaS models)',
            'Contract negotiation and warranty structuring',
            'Multi-year service agreement development',
          ]
        },
      ]
    },
    {
      title: 'Industry Expertise',
      subsections: [
        {
          subtitle: 'Hospitality & Food Service',
          items: [
            'Six hospitality concept launches from concept through profitable operation',
            'Head chef experience, farm-to-table operations, craft brewing',
            'P&L management and cost-control analytics',
            'Subcontractor relationship management',
          ]
        },
        {
          subtitle: 'Health & Wellness',
          items: [
            'Longevity market analysis',
            'Exercise physiology knowledge (VO2 max, cardiorespiratory dynamics)',
            'Fall prevention and balance training protocols',
            'Senior fitness and aging-in-place market dynamics',
          ]
        },
        {
          subtitle: 'Home Services',
          items: [
            'Kitchen and bathroom remodeling operations',
            'Three-tier pricing structure development',
            'ADA compliance and universal design principles',
            'Subcontractor operational model implementation',
          ]
        },
      ]
    },
  ];

  return (
    <section id="expertise" className="py-24 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#E5E5E5]" />
            <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#86868B]">
              Comprehensive Capabilities
            </span>
            <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#E5E5E5]" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] tracking-tight">
            30+ years of expertise
          </h2>
          <p className="mt-2 text-xl md:text-2xl text-[#6E6E73] font-light">
            One integrated skillset
          </p>
        </div>

        {/* Accordion */}
        <div className="border-t border-[#E5E5E5]">
          {sections.map((section, index) => (
            <div key={index} className="border-b border-[#E5E5E5]">
              <button
                onClick={() => setOpenSection(openSection === index ? null : index)}
                className="w-full flex items-center justify-between py-6 md:py-8 text-left group"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <span className="text-xs font-mono text-[#0071E3] tracking-wider w-8">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                    {section.title}
                  </h3>
                </div>
                <div className={`w-8 h-8 border border-[#E5E5E5] flex items-center justify-center transition-all ${openSection === index ? 'bg-[#0071E3] border-[#0071E3]' : 'group-hover:border-[#0071E3]'}`}>
                  <svg 
                    className={`w-4 h-4 transition-transform ${openSection === index ? 'rotate-45 text-white' : 'text-[#86868B] group-hover:text-[#0071E3]'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
              
              {openSection === index && (
                <div className="pb-8 md:pb-12 pl-12 md:pl-14">
                  {section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="mb-10 last:mb-0">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-6 h-px bg-[#0071E3]" />
                        <h4 className="text-sm md:text-base font-mono tracking-wider uppercase text-[#0071E3]">
                          {subsection.subtitle}
                        </h4>
                      </div>
                      <div className="grid gap-3">
                        {subsection.items.map((item, itemIndex) => (
                          <div 
                            key={itemIndex} 
                            className="group/item flex items-start gap-4 py-3 border-l border-[#E5E5E5] pl-6 hover:border-[#0071E3] transition-colors"
                          >
                            <span className="text-xs font-mono text-[#D1D1D6] mt-1 group-hover/item:text-[#0071E3] transition-colors">
                              {String(itemIndex + 1).padStart(2, '0')}
                            </span>
                            <p className="text-sm md:text-base text-[#424245] leading-relaxed group-hover/item:text-[#1D1D1F] transition-colors">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
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
