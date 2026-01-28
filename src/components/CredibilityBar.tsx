export const CredibilityBar = () => {
  const credentials = ['DISNEY', 'NATIONAL GEOGRAPHIC', 'RIDLEY SCOTT ASSOCIATES'];

  return (
    <section className="py-24 px-8 border-t border-white/5">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="font-mono text-[10px] tracking-[0.2em] text-text-muted">
            STUDIO CREDENTIALS
          </div>
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            {credentials.map((credential) => (
              <div
                key={credential}
                className="flex items-center gap-3"
              >
                <div className="w-1 h-1 rounded-full bg-accent" />
                <div className="text-text-secondary text-xs tracking-wide font-light">
                  {credential}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
