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
  return (
    <section id="expertise" className="py-32 px-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-24">
          <div className="text-text-muted font-mono text-sm tracking-[0.2em] mb-6">
            COMPREHENSIVE CAPABILITIES
          </div>
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-[-0.04em] mb-8">
            Complete<br />Skill Set
          </h2>
          <p className="text-text-secondary text-2xl max-w-3xl">
            30+ years across studio production, hospitality, and technology.<br/>
            From concept to exit. From strategy to execution.
          </p>
        </div>

        {/* Executive Leadership & Strategy */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Executive Leadership & Strategy
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Corporate Strategy & Vision</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Category creation at intersection of industries (longevity medicine, fitness tech, medical devices)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>VUCA Framework application for navigating volatile, uncertain business environments</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Multi-frame positioning for different audience segments without strategic contradiction</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Strategic optionality design preserving flexibility while establishing foundational commitments</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Exit strategy architecture—PE acquisition, licensing platform, FDA-cleared device, public markets</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Business Transformation</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>IP-first business model design transforming hardware companies into licensing platforms</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Valuation multiple arbitrage repositioning from low-multiple (1-2x) to high-multiple (8-15x) categories</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Platform business development supporting OEM licensing, SaaS subscriptions, and direct sales</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Franchise model architecture including economics, support systems, and scalability frameworks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Leadership */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Financial Leadership
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Corporate Finance</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Investment memorandum development with institutional-grade documentation</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Multi-year pro forma development (3-5 year projections)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Financial modeling including 24-month capital deployment projections, unit economics analysis</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>ROI analysis using institutional stress-testing methodologies (160x+ return multiples demonstrated)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Budget development across IP prosecution, clinical validation, regulatory submissions</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Pricing Strategy</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Veblen good positioning where price signals quality and efficacy</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Segment-based pricing architecture ($15K-$80K ranges across market segments)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Recurring revenue modeling converting hardware sales to ARR</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Membership tier structuring with premium positioning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* IP & Patents */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Intellectual Property & Patent Strategy
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Patent Portfolio Development</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Provisional patent and omnibus drafting with technical specifications and FTO compliance language</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Multi-tier patent architecture (Foundational → Diagnostic → Algorithmic → Application)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Patent valuation using comparable transaction analysis ($180M-$450M portfolio estimates)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Priority date strategy managing critical filing windows</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Freedom-to-Operate Analysis</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Competitive patent landscape analysis (USPTO, EPO, WIPO, CNIPA)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Design-around strategy development avoiding competitor claims</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>White space identification for patent claim development</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>IPR vulnerability audits and litigation-tested validation planning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Brand & Marketing */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Brand Strategy & Marketing
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Brand Development</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Built six distinct hospitality concepts that became cultural anchors</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Brand storytelling across food, wellness, and performance markets</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Brand voice development and messaging framework creation</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Competitive differentiation through authentic positioning</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Content & Creative</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Documentary film series production (broadcast-quality)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Podcast strategy and content ecosystem development</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Video-first product launch campaigns</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Micro-influencer program development</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product & Development */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Product Architecture & Development
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Technical Product Design</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>System architecture for integrated hardware-software platforms</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Metric development and scoring methodologies (proprietary diagnostic metrics)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Algorithm design for real-time adaptive systems</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Wearable integration with commercial platforms (WHOOP, Apple Watch, Garmin, Oura)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Full-Stack Development</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Frontend: React 18, TypeScript, Tailwind CSS, Progressive Web Apps</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Backend: Node.js, Express, PostgreSQL, Supabase, Edge Functions</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Architecture: Component-based design, state machine patterns, offline-first</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Security: Role-based access control, multi-tenant data isolation, RLS policies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Healthcare */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Healthcare Industry Expertise
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Medical Billing & Reimbursement</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>CPT code expertise (97110, 97112, 97116, 97530, 97150)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Medicare MPPR calculations and 8-minute rule compliance</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Insurance reimbursement rate analysis and revenue modeling</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Multi-payer engine design (Medicare FFS, MA, commercial)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Regulatory Compliance</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>HIPAA technical safeguards (administrative, physical, technical controls)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>FDA regulatory strategy (SaMD classification, 510(k) pathway planning)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Medicare fraud and abuse prevention</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Anti-Kickback Statute compliance and safe harbor navigation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Sales & Business Development
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">B2B Enterprise Sales</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>High-ticket medical equipment sales ($21,500-$50,000+ per unit)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Complex 8-12 month healthcare procurement cycle navigation</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Committee-based purchasing process management</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Multi-stakeholder relationship building</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Sales Operations</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Trial-to-close conversion strategy development</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Pipeline management and deal prioritization</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Sales process systematization and playbook development</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>CRM administration and optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Industry Expertise */}
        <div className="mb-32">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
            Industry Expertise
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Hospitality & Food Service</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Six hospitality concept launches from concept through profitable operation</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Head chef experience, farm-to-table operations, craft brewing</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>P&L management and cost-control analytics</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Subcontractor relationship management</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-2xl font-bold text-accent mb-6">Health & Wellness</h4>
              <ul className="space-y-4 text-text-secondary text-lg">
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Longevity market analysis</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Exercise physiology knowledge (VO2 max, cardiorespiratory dynamics)</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Fall prevention and balance training protocols</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-accent font-bold text-2xl">•</span>
                  <span>Senior fitness and aging-in-place market dynamics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};


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
