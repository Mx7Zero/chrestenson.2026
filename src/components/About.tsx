export const About = () => {
  return (
    <section id="about" className="py-20 md:py-32 bg-bg-primary">
      <div className="max-w-[680px] mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-8 text-center">
          Not AI-literate. AI-native.
        </h2>
        
        <div className="space-y-6 text-text-secondary leading-relaxed">
          <p>
            Unique combination of studio-grade production experience (Disney, National Geographic, 
            Ridley Scott Associates), hospitality brand-building (six successful ventures from 
            concept to exit), and current AI-first strategic advisory across health technology, 
            hospitality, and consumer goods.
          </p>
          
          <p>
            Using LLMs and generative AI to accelerate research, content production, and visual 
            asset creation at enterprise scale—work that previously required teams, now executed 
            with AI-assisted workflows.
          </p>
        </div>

        <div className="mt-12 p-6 bg-bg-surface rounded-xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Location:</span>
              <span className="ml-2 text-text-secondary">Denver, CO</span>
            </div>
            <div>
              <span className="text-text-muted">Email:</span>
              <a 
                href="mailto:matthew@chrestenson.com" 
                className="ml-2 text-accent hover:text-accent-hover transition-colors"
              >
                matthew@chrestenson.com
              </a>
            </div>
            <div>
              <span className="text-text-muted">Phone:</span>
              <a 
                href="tel:8054528932" 
                className="ml-2 text-text-secondary hover:text-accent transition-colors"
              >
                805.452.8932
              </a>
            </div>
            <div>
              <span className="text-text-muted">LinkedIn:</span>
              <a 
                href="https://linkedin.com/in/matthewchrestenson" 
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-accent hover:text-accent-hover transition-colors"
              >
                Connect →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
