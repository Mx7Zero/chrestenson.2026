export const Contact = () => {
  // Professional Attributes from Job Skills 2026
  const attributes = [
    {
      title: 'Leadership Style',
      items: [
        'Data-driven decision-making with rigorous verification standards',
        'Emphasis on verifiable, defensible claims',
        'Direct communication with specificity over theory',
        'Action-oriented recommendations with practical execution focus',
      ]
    },
    {
      title: 'Work Philosophy',
      items: [
        'Process systematization and documentation-driven operations',
        'MVP-first mentality with scaling framework',
        'Continuous improvement and iterative refinement',
        'Compliance-first approach to regulated industries',
      ]
    },
    {
      title: 'Core Principles',
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
    { stat: 'Financial Modeling', desc: 'Unit economics, capital structure, investor-ready projections' },
    { stat: '6 Ventures → Exit', desc: 'Hospitality concepts built from scratch through profitable sale' },
    { stat: 'Full-Stack Technical', desc: 'Built production SaaS platforms; can spec and ship, not just strategize' },
    { stat: '$180M-$450M IP Portfolio', desc: 'Architected 19-patent strategy with full FTO compliance' },
    { stat: 'Institutional-Grade Analysis', desc: 'Strategic intelligence briefs on $1B+ public companies' },
    { stat: 'Studio Production', desc: 'Disney, National Geographic, Ridley Scott Associates' },
  ];

  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Professional Attributes */}
        <div className="mb-24">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">How I Work</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] mb-12">
            Principled execution.<br />Verified results.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {attributes.map((attr, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-[#1D1D1F] mb-4">{attr.title}</h3>
                <ul className="space-y-2">
                  {attr.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-[#6E6E73] text-sm leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="mb-24">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">Track Record</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item, index) => (
              <div key={index} className="bg-[#F5F5F7] p-6">
                <h4 className="text-lg font-semibold text-[#0071E3] mb-2">{item.stat}</h4>
                <p className="text-[#6E6E73] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-16">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">Get in Touch</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] mb-6">
            Let's build something<br />meaningful together.
          </h2>
          <p className="text-xl text-[#6E6E73] max-w-2xl mb-12">
            AI-native execution for complex projects. Investor-ready documentation. Full-stack delivery.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div>
            <p className="text-sm text-[#86868B] mb-2">Email</p>
            <a 
              href="mailto:matthew@chrestenson.com" 
              className="text-lg text-[#0071E3] hover:underline"
            >
              matthew@chrestenson.com
            </a>
          </div>
          <div>
            <p className="text-sm text-[#86868B] mb-2">Phone</p>
            <a 
              href="tel:8054528932" 
              className="text-lg text-[#1D1D1F]"
            >
              805.452.8932
            </a>
          </div>
          <div>
            <p className="text-sm text-[#86868B] mb-2">Location</p>
            <p className="text-lg text-[#1D1D1F]">Denver, CO</p>
          </div>
          <div>
            <p className="text-sm text-[#86868B] mb-2">LinkedIn</p>
            <a 
              href="https://linkedin.com/in/matthewchrestenson"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-[#0071E3] hover:underline"
            >
              Connect →
            </a>
          </div>
        </div>

        {/* CTA */}
        <a
          href="mailto:matthew@chrestenson.com"
          className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-8 py-4 text-lg font-medium hover:bg-[#0077ED] transition-colors"
        >
          Schedule Consultation
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[#E5E5E5]">
          <p className="text-sm text-[#86868B]">
            © 2026 Matthew Chrestenson. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};
