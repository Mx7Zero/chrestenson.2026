export const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm text-[#86868B] mb-4 uppercase tracking-wide">Get in Touch</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#1D1D1F] mb-6">
            Let's build something<br />meaningful together.
          </h2>
          <p className="text-xl text-[#6E6E73] max-w-2xl">
            AI-native execution for $100M+ projects. Investor-ready documentation. Full-stack delivery.
          </p>
        </div>

        {/* Contact Info */}
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
          className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#0077ED] transition-colors"
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
