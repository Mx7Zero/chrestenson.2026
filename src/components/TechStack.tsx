export const TechStack = () => {
  return (
    <section className="py-32 px-8 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-20">
          <div className="text-text-muted font-mono text-sm tracking-[0.2em] mb-6">
            TECHNICAL PROFICIENCIES
          </div>
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-[-0.04em]">
            Full-Stack<br />Execution
          </h2>
        </div>

        {/* Development & Design */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-white/10">
            Development & Design
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">FRONTEND</div>
              <div className="text-text-secondary text-lg">React 18, TypeScript, Tailwind CSS, Vite, GSAP</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">BACKEND</div>
              <div className="text-text-secondary text-lg">Node.js, Express, PostgreSQL, Supabase, Redis</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">DESIGN/VIDEO</div>
              <div className="text-text-secondary text-lg">Adobe Creative Cloud (full suite), DaVinci Resolve</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">AI/CONTENT</div>
              <div className="text-text-secondary text-lg">Claude Code, Gemini, MidJourney, Runway ML, VEO 3</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">WEB PLATFORMS</div>
              <div className="text-text-secondary text-lg">Replit, Framer, Webflow, WordPress</div>
            </div>
          </div>
        </div>

        {/* Business Systems */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-white/10">
            Business Systems
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">CRM</div>
              <div className="text-text-secondary text-lg">Pipedrive, HubSpot, JobNimbus</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">ANALYTICS</div>
              <div className="text-text-secondary text-lg">Google Analytics 4, Microsoft Clarity, Search Console</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">DOCUMENTATION</div>
              <div className="text-text-secondary text-lg">Notion, Markdown, Technical specifications</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">PROJECT MGMT</div>
              <div className="text-text-secondary text-lg">Agile/Scrum, risk management, roadmap planning</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">FINANCIAL</div>
              <div className="text-text-secondary text-lg">Excel/Sheets modeling, investment memoranda</div>
            </div>
          </div>
        </div>

        {/* Healthcare & Regulatory */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-white/10">
            Healthcare & Regulatory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">STANDARDS</div>
              <div className="text-text-secondary text-lg">HL7 FHIR R4, HIPAA, CMS billing rules</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">FDA PATHWAYS</div>
              <div className="text-text-secondary text-lg">510(k), De Novo, SaMD classification</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">IP SYSTEMS</div>
              <div className="text-text-secondary text-lg">USPTO, EPO, WIPO, CNIPA</div>
            </div>
            <div className="border border-white/10 p-6">
              <div className="text-accent font-mono text-sm mb-4 font-bold">COMPLIANCE</div>
              <div className="text-text-secondary text-lg">HIPAA, AKS, Medicare billing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
