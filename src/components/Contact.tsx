export const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-32 bg-bg-primary">
      <div className="max-w-[680px] mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Let's Build Something
        </h2>
        <p className="text-xl text-text-secondary mb-12">
          Ready to transform strategy into execution?
        </p>
        
        <div className="space-y-6">
          <a
            href="mailto:matthew@chrestenson.com"
            className="inline-block px-10 py-5 bg-accent hover:bg-accent-hover 
                       text-white font-semibold rounded-lg transition-all duration-300
                       hover:scale-105 text-lg"
          >
            Book a Consultation
          </a>
          
          <p className="text-text-muted text-sm">
            Or email directly:{' '}
            <a 
              href="mailto:matthew@chrestenson.com"
              className="text-accent hover:text-accent-hover transition-colors"
            >
              matthew@chrestenson.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
