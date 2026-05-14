export const CredibilityBar = () => {
  const studios = [
    { name: 'Disney', url: 'https://www.disney.com' },
    { name: 'National Geographic', url: 'https://www.nationalgeographic.com' },
    { name: 'Ridley Scott Associates', url: 'https://www.rsa-films.com' }
  ];

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 border-y border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-[#86868B] mb-6 uppercase tracking-wide">Studio Experience</p>
        <div className="flex flex-wrap gap-8 md:gap-16">
          {studios.map((studio) => (
            <a
              key={studio.name}
              href={studio.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl md:text-3xl font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
              title={`Visit ${studio.name}`}
            >
              {studio.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
