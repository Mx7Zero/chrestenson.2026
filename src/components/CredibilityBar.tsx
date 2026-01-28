export const CredibilityBar = () => {
  const studios = ['Disney', 'National Geographic', 'Ridley Scott Associates'];

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 border-y border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-[#86868B] mb-6 uppercase tracking-wide">Studio Experience</p>
        <div className="flex flex-wrap gap-8 md:gap-16">
          {studios.map((studio) => (
            <span key={studio} className="text-2xl md:text-3xl font-semibold text-[#1D1D1F]">
              {studio}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
