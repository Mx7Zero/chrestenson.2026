import { useState } from 'react';

export const Contact = () => {
  const [hoveredPrinciple, setHoveredPrinciple] = useState<number | null>(null);
  
  // Professional Attributes from Job Skills 2026
  const attributes = [
    {
      title: 'Leadership Style',
      code: 'LS',
      items: [
        'Data-driven decision-making with rigorous verification standards',
        'Emphasis on verifiable, defensible claims',
        'Direct communication with specificity over theory',
        'Action-oriented recommendations with practical execution focus',
      ]
    },
    {
      title: 'Work Philosophy',
      code: 'WP',
      items: [
        'Process systematization and documentation-driven operations',
        'MVP-first mentality with scaling framework',
        'Continuous improvement and iterative refinement',
        'Compliance-first approach to regulated industries',
      ]
    },
    {
      title: 'Core Principles',
      code: 'CP',
      items: [
        'Accuracy over appeal — Mathematical validation of all projections',
        'Transparency in methodology — Source validation and defensibility',
        'Scalable approach development — Build systems that grow',
        'Trust through execution — Under-promise, over-deliver',
      ]
    },
  ];

  // Key Achievements from Job Skills 2026
  const achievements = [
    { stat: 'Financial Modeling', desc: 'Unit economics, capital structure, investor-ready projections', icon: '◈' },
    { stat: '6 Ventures → Exit', desc: 'Hospitality concepts built from scratch through profitable sale', icon: '◆' },
    { stat: 'Full-Stack Technical', desc: 'Built production SaaS platforms; can spec and ship', icon: '◇' },
    { stat: 'Institutional Analysis', desc: 'Strategic intelligence briefs on $1B+ public companies', icon: '◈' },
    { stat: 'Studio Production', desc: 'Disney, National Geographic, Ridley Scott Associates', icon: '◆' },
    { stat: 'Patent Architecture', desc: '19-patent strategy with full FTO compliance', icon: '◇' },
  ];

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Professional Attributes */}
        <div className="mb-32">
          {/* Header */}
          <div className="mb-16 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-[#E5E5E5]" />
              <span className="text-xs font-mono tracking-[0.3em] uppercase text-[#0071E3]">
                How I Work
              </span>
              <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-[#E5E5E5]" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#1D1D1F] tracking-tight">
              Principled execution
            </h2>
            <p className="mt-2 text-xl md:text-2xl text-[#6E6E73] font-light">
              Verified results
            </p>
          </div>
          
          {/* Three Column Layout with Lines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-[#E5E5E5]">
            {attributes.map((attr, index) => (
              <div 
                key={index} 
                className={`py-10 md:py-12 ${index < 2 ? 'md:border-r md:border-[#E5E5E5]' : ''} ${index > 0 ? 'border-t md:border-t-0 border-[#E5E5E5]' : ''}`}
                onMouseEnter={() => setHoveredPrinciple(index)}
                onMouseLeave={() => setHoveredPrinciple(null)}
              >
                <div className="md:px-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 border flex items-center justify-center transition-all duration-300 ${hoveredPrinciple === index ? 'border-[#0071E3] bg-[#0071E3]' : 'border-[#E5E5E5]'}`}>
                      <span className={`text-xs font-mono tracking-wider transition-colors duration-300 ${hoveredPrinciple === index ? 'text-white' : 'text-[#86868B]'}`}>
                        {attr.code}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-[#1D1D1F]">
                      {attr.title}
                    </h3>
                  </div>
                  
                  {/* Items with thin left border */}
                  <div className="space-y-0">
                    {attr.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className="group flex items-start gap-4 py-4 border-l-2 border-[#E5E5E5] pl-5 hover:border-[#0071E3] transition-colors"
                      >
                        <span className="text-[10px] font-mono text-[#D1D1D6] mt-0.5 group-hover:text-[#0071E3] transition-colors">
                          {String(itemIndex + 1).padStart(2, '0')}
                        </span>
                        <p className="text-sm text-[#6E6E73] leading-relaxed group-hover:text-[#1D1D1F] transition-colors">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Achievements - Horizontal Scroll on Mobile */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-10">
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#0071E3]">
              Track Record
            </span>
            <div className="h-px flex-1 bg-[#E5E5E5]" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-[#E5E5E5]">
            {achievements.map((item, index) => (
              <div 
                key={index} 
                className="bg-white p-6 md:p-8 group hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="text-2xl text-[#0071E3] mb-4 opacity-30 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </div>
                <h4 className="text-sm md:text-base font-medium text-[#1D1D1F] mb-2 leading-tight">
                  {item.stat}
                </h4>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div id="get-in-touch" className="border-t border-[#E5E5E5] pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left - CTA */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-[#0071E3]">
                  Get in Touch
                </span>
                <div className="h-px flex-1 bg-[#E5E5E5] lg:hidden" />
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold text-[#1D1D1F] tracking-tight mb-4">
                Let's build something<br />meaningful together
              </h2>
              <p className="text-base text-[#6E6E73] mb-8 max-w-md">
                AI-native execution for complex projects. Investor-ready documentation. Full-stack delivery.
              </p>
              <a
                href="mailto:matthew@chrestenson.com"
                className="inline-flex items-center gap-3 bg-[#0071E3] text-white px-8 py-4 text-base font-medium hover:bg-[#0077ED] transition-all group"
              >
                <span>Schedule Consultation</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
            
            {/* Right - Contact Details */}
            <div className="lg:border-l lg:border-[#E5E5E5] lg:pl-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-l-2 border-[#E5E5E5] pl-5 hover:border-[#0071E3] transition-colors">
                  <p className="text-xs font-mono tracking-wider uppercase text-[#86868B] mb-2">Email</p>
                  <a 
                    href="mailto:matthew@chrestenson.com" 
                    className="text-sm md:text-base text-[#1D1D1F] hover:text-[#0071E3] transition-colors break-words"
                  >
                    matthew@chrestenson.com
                  </a>
                </div>
                <div className="border-l-2 border-[#E5E5E5] pl-5 hover:border-[#0071E3] transition-colors">
                  <p className="text-xs font-mono tracking-wider uppercase text-[#86868B] mb-2">Phone</p>
                  <a 
                    href="tel:8054528932" 
                    className="text-sm md:text-base text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
                  >
                    805.452.8932
                  </a>
                </div>
                <div className="border-l-2 border-[#E5E5E5] pl-5 hover:border-[#0071E3] transition-colors">
                  <p className="text-xs font-mono tracking-wider uppercase text-[#86868B] mb-2">Location</p>
                  <p className="text-sm md:text-base text-[#1D1D1F]">Denver, CO</p>
                </div>
                <div className="border-l-2 border-[#E5E5E5] pl-5 hover:border-[#0071E3] transition-colors">
                  <p className="text-xs font-mono tracking-wider uppercase text-[#86868B] mb-2">LinkedIn</p>
                  <a 
                    href="https://www.linkedin.com/in/chrestenson"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm md:text-base text-[#0071E3] hover:text-[#0077ED] transition-colors inline-flex items-center gap-1"
                  >
                    Connect
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[#E5E5E5] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono tracking-wider text-[#86868B]">
            © 2026 MATTHEW CHRESTENSON
          </p>
          <p className="text-xs font-mono tracking-wider text-[#D1D1D6]">
            DESIGNED WITH AI-ASSISTED WORKFLOWS
          </p>
        </div>
      </div>
    </section>
  );
};
