export const Hero = () => {
  return (
    <section id="hero" className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-32">
      <div className="max-w-5xl">
        {/* Name */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-[#1D1D1F] mb-6 leading-[1.05]">
          Matthew<br />Chrestenson
        </h1>
        
        {/* Title */}
        <p className="text-2xl md:text-3xl text-[#6E6E73] font-normal mb-12 max-w-2xl leading-relaxed">
          Executive Strategist. Brand Architect. Platform Developer.
        </p>

        {/* Executive Summary - All content from Job Skills 2026 */}
        <div className="space-y-6 text-lg md:text-xl text-[#1D1D1F] max-w-3xl leading-relaxed mb-12">
          <p>
            AI-augmented strategist and brand architect with 30+ years of creative leadership, using LLMs and generative AI to accelerate research, content production, and visual asset creation at enterprise scale. Demonstrated ability to transform complex market intelligence into investor-ready documentation, brand strategies, and full-stack digital products—work that previously required teams, now executed with AI-assisted workflows.
          </p>
          <p>
            Unique combination of studio-grade production experience (Disney, National Geographic, Ridley Scott Associates), hospitality brand-building (six successful ventures from concept to exit), and current AI-first strategic advisory across health technology, hospitality, and consumer goods.
          </p>
          <p className="font-medium text-[#0071E3]">
            Not just AI-literate—AI-native: using these tools as thinking partners, not just productivity shortcuts.
          </p>
        </div>

        {/* CTA */}
        <a
          href="mailto:matthew@chrestenson.com"
          className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#0077ED] transition-colors"
        >
          Start a Conversation
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </section>
  );
};
