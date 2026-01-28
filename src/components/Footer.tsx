export const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-text-muted text-sm">
            © 2026 Matthew Chrestenson
          </div>
          
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <span>Denver, CO</span>
            <span>|</span>
            <a 
              href="tel:8054528932"
              className="hover:text-accent transition-colors"
            >
              805.452.8932
            </a>
            <span>|</span>
            <a 
              href="https://linkedin.com/in/matthewchrestenson"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors flex items-center gap-1"
            >
              LinkedIn
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
