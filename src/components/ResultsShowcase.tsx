const figures = [
  { value: "100%", label: "BECE distinction rate" },
  { value: "07 – 09", label: "Aggregate range" },
  { value: "7 / 7", label: "Candidates placed" },
];

const ResultsShowcase = () => (
  <section id="results" className="bg-primary text-primary-foreground py-14 lg:py-20 scroll-mt-20">
    <div className="container mx-auto px-4">
      <p className="eyebrow">Academic Results</p>
      <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold">A record to be proud of</h2>
      <div className="mt-8 grid grid-cols-3 divide-x divide-primary-foreground/15 border-y border-primary-foreground/15">
        {figures.map((f) => (
          <div key={f.label} className="py-6 px-3 sm:px-6 text-center sm:text-left">
            <p className="font-heading text-2xl sm:text-4xl font-semibold text-accent leading-none">{f.value}</p>
            <p className="mt-2 text-xs sm:text-sm text-primary-foreground/75">{f.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-primary-foreground/50">Most recent BECE cohort.</p>
    </div>
  </section>
);

export default ResultsShowcase;
