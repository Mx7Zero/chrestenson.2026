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

        {/* All sections visible - no accordion */}
        <div className="space-y-32">
          
          {/* Executive Leadership & Strategy */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Executive Leadership & Strategy
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Corporate Strategy & Vision</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Category creation at intersection of industries</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>VUCA Framework application for volatile environments</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Multi-frame positioning for different audiences</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Business Transformation</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>M&A execution and post-merger integration</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Business model innovation and revenue optimization</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Organizational design and change management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Financial Leadership */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Financial Leadership
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Corporate Finance</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Financial modeling and investor presentations</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Capital allocation and ROI optimization</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Unit economics and margin improvement</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Pricing Strategy</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Value-based pricing architecture</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Subscription and recurring revenue models</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Dynamic pricing and revenue management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Brand Strategy & Marketing */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Brand Strategy & Marketing
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Brand Development</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Brand positioning and narrative architecture</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Visual identity and design systems</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Content strategy and storytelling</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Growth Marketing</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Performance marketing and conversion optimization</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Customer acquisition and retention strategies</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Analytics and attribution modeling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Product & Technology */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Product & Technology
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Product Strategy</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Product roadmap and feature prioritization</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>User experience and interface design</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>A/B testing and experimentation frameworks</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Technical Implementation</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Full-stack development (React, Node.js, Python)</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>AI/ML integration and automation</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Cloud infrastructure and DevOps</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sales & Business Development */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Sales & Business Development
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Enterprise Sales</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Complex deal structuring and negotiation</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Sales playbook development</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Proposal development and RFP responses</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Partnership Development</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Strategic alliance formation</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Channel partner programs</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Co-marketing and joint ventures</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Healthcare Industry Expertise */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Healthcare Industry Expertise
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Healthcare Operations</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Clinical workflow optimization</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>HIPAA compliance and data security</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Telehealth platform development</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Medical Innovation</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Medical device commercialization</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>FDA regulatory strategy</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Clinical trial design and execution</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* IP & Patent Strategy */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              IP & Patent Strategy
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Patent Development</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Patent application drafting and prosecution</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Prior art research and landscape analysis</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Freedom to operate assessments</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">IP Monetization</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Licensing strategy and deal negotiation</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Patent portfolio valuation</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Trade secret protection frameworks</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Industry Expertise */}
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 pb-6 border-b border-white/10">
              Industry Expertise
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Healthcare & Life Sciences</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Longevity medicine and preventive care</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Digital health platforms</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Medical device innovation</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-2xl font-bold text-accent mb-6">Entertainment & Hospitality</h4>
                <ul className="space-y-4 text-text-secondary text-lg">
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Studio production and post-production</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Luxury hospitality operations</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-accent font-bold text-2xl">•</span>
                    <span>Experience design and customer journey</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
