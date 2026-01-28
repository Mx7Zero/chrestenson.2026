export const Contact = () => {
  return (
    <section id="contact" className="py-32 px-8 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <div className="text-text-muted font-mono text-sm tracking-[0.2em] mb-8">
              INITIATE PROJECT
            </div>
            <h2 className="text-6xl md:text-8xl font-bold text-white tracking-[-0.04em] leading-[1.1] mb-12">
              Transform<br />
              Strategy Into<br />
              Execution
            </h2>
            <div className="space-y-4 text-text-secondary font-normal text-xl">
              <p>AI-native execution for $100M+ projects.</p>
              <p>Investor-ready documentation. Full-stack delivery.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-text-muted font-mono text-sm tracking-wider mb-3">
                  EMAIL
                </div>
                <a 
                  href="mailto:matthew@chrestenson.com"
                  className="text-white hover:text-accent transition-colors duration-300 text-lg font-medium"
                >
                  matthew@chrestenson.com
                </a>
              </div>
              <div>
                <div className="text-text-muted font-mono text-sm tracking-wider mb-3">
                  PHONE
                </div>
                <a 
                  href="tel:8054528932"
                  className="text-white hover:text-accent transition-colors duration-300 text-lg font-medium"
                >
                  805.452.8932
                </a>
              </div>
              <div>
                <div className="text-text-muted font-mono text-sm tracking-wider mb-3">
                  LOCATION
                </div>
                <div className="text-white text-lg font-medium">
                  Denver, CO
                </div>
              </div>
              <div>
                <div className="text-text-muted font-mono text-sm tracking-wider mb-3">
                  LINKEDIN
                </div>
                <a 
                  href="https://linkedin.com/in/matthewchrestenson"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-accent transition-colors duration-300 text-lg font-medium inline-flex items-center gap-2"
                >
                  Connect
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <a
                href="mailto:matthew@chrestenson.com"
                className="inline-flex items-center gap-3 text-accent hover:text-white transition-colors duration-300 font-mono text-lg tracking-wider font-bold"
              >
                SCHEDULE CONSULTATION
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-32 pt-12 border-t border-white/5 flex items-center justify-between">
          <div className="text-text-muted font-mono text-[9px] tracking-wider">
            © 2026 MATTHEW CHRESTENSON
          </div>
          <div className="text-text-muted font-mono text-[9px] tracking-wider">
            AI-NATIVE EXECUTION
          </div>
        </div>
      </div>
    </section>
  );
};
