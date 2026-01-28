export const CredibilityBar = () => {
  const credentials = ['Disney', 'National Geographic', 'Ridley Scott Associates'];

  return (
    <section className="py-12 border-y border-border bg-bg-surface">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {credentials.map((credential) => (
            <div
              key={credential}
              className="text-text-muted text-sm md:text-base font-medium"
            >
              {credential}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
