export const ExpertiseAccordion = () => {
  const sections = [
    {
      title: 'Executive Leadership & Strategy',
      items: [
        'Category creation at intersection of industries (longevity medicine, fitness tech, medical devices)',
        'VUCA Framework application for navigating volatile, uncertain business environments',
        'Exit strategy architecture—PE acquisition, licensing platform, FDA-cleared device, public markets',
        'IP-first business model design transforming hardware companies into licensing platforms',
        'Valuation multiple arbitrage: repositioning from 1-2x to 8-15x categories',
      ]
    },
    {
      title: 'Financial Leadership',
      items: [
        'Investment memorandum development with institutional-grade documentation',
        'Multi-year pro forma development (3-5 year projections)',
        'ROI analysis using institutional stress-testing methodologies (160x+ returns demonstrated)',
        'Segment-based pricing architecture ($15K-$80K ranges across market segments)',
        'Milestone-based funding structures tied to value-creation events',
      ]
    },
    {
      title: 'Intellectual Property & Patent Strategy',
      items: [
        'Provisional patent and omnibus drafting with technical specifications and FTO compliance',
        'Multi-tier patent architecture (Foundational → Diagnostic → Algorithmic → Application)',
        'Patent valuation using comparable transaction analysis ($180M-$450M portfolio estimates)',
        'Competitive patent landscape analysis (USPTO, EPO, WIPO, CNIPA)',
        'IPR vulnerability audits and litigation-tested validation planning',
      ]
    },
    {
      title: 'Brand Strategy & Marketing',
      items: [
        'Built six distinct hospitality concepts that became cultural anchors',
        'Brand storytelling across food, wellness, and performance markets',
        'Multi-channel campaign development and execution',
        'Lead generation funnel design targeting 50-150 qualified leads monthly',
        'Documentary film series production (broadcast-quality)',
      ]
    },
    {
      title: 'Product Architecture & Development',
      items: [
        'System architecture for integrated hardware-software platforms',
        'Frontend: React 18, TypeScript, Tailwind CSS, Progressive Web Apps',
        'Backend: Node.js, Express, PostgreSQL, Supabase, Edge Functions',
        'Wearable integration with commercial platforms (WHOOP, Apple Watch, Garmin, Oura)',
        'Requirements documentation and feature specification',
      ]
    },
    {
      title: 'Healthcare Industry Expertise',
      items: [
        'CPT code expertise (97110, 97112, 97116, 97530, 97150)',
        'Medicare MPPR calculations and 8-minute rule compliance',
        'HIPAA technical safeguards (administrative, physical, technical controls)',
        'FDA regulatory strategy (SaMD classification, 510(k) pathway planning)',
        'Physical therapy clinic operations and economics',
      ]
    },
    {
      title: 'Sales & Business Development',
      items: [
        'High-ticket medical equipment sales ($21,500-$50,000+ per unit)',
        'Complex 8-12 month healthcare procurement cycle navigation',
        'Trial-to-close conversion strategy development',
        'Equipment financing arrangement (lease, purchase, EaaS models)',
        'Multi-year service agreement development',
      ]
    },
    {
      title: 'Industry Expertise',
      items: [
        'Six hospitality concept launches from concept through profitable operation',
        'Head chef experience, farm-to-table operations, craft brewing',
        'Longevity market analysis and exercise physiology knowledge',
        'Kitchen and bathroom remodeling operations',
        'ADA compliance and universal design principles',
      ]
    },
  ];

  return (
    <section id="expertise" className="py-24 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">Comprehensive Capabilities</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F]">
            30+ years of expertise.<br />One integrated skillset.
          </h2>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-2xl md:text-3xl font-semibold text-[#1D1D1F] mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-4 text-lg text-[#1D1D1F]">
                    <span className="text-[#0071E3] mt-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
