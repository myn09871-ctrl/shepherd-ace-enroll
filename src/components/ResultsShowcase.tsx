import graduation2 from "@/assets/graduation-2.webp";

const ResultsShowcase = () => {
  const figures = [
    {
      value: "100%",
      label: "Distinction rate",
      note: "Every candidate in the most recent BECE cohort passed with distinction.",
    },
    {
      value: "07 – 09",
      label: "Aggregate range",
      note: "The full spread of aggregates achieved across the cohort.",
    },
    {
      value: "7 / 7",
      label: "Candidates presented",
      note: "All candidates presented were placed, none referred or withdrawn.",
    },
  ];

  const strengths = [
    {
      title: "Termly mock examinations",
      body: "JHS candidates sit full mock papers each term under examination conditions, so nothing about the BECE format is unfamiliar on the day.",
    },
    {
      title: "Ranked, tracked reporting",
      body: "Every pupil's continuous assessment and end-of-term scores are recorded and ranked, and parents see the same report through the parent portal.",
    },
    {
      title: "Individual revision support",
      body: "Teachers work subject by subject with candidates whose mock performance slips, rather than teaching only to the middle of the class.",
    },
  ];

  return (
    <section id="results" className="bg-primary text-primary-foreground py-16 lg:py-24 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-primary-foreground/15 pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Academic Results</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
              A 100% BECE distinction
              <br className="hidden sm:block" /> record to defend
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm lg:text-base text-primary-foreground/75 leading-relaxed">
              The Basic Education Certificate Examination is the measure that
              matters at the end of Junior High School. GSIS presents small
              cohorts and prepares each candidate individually.
            </p>
          </div>
        </div>

        {/* Headline figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/15">
          {figures.map((figure) => (
            <div
              key={figure.label}
              className="py-8 lg:py-10 sm:px-8 first:sm:pl-0 last:sm:pr-0"
            >
              <p className="font-heading text-3xl lg:text-5xl font-semibold text-accent leading-none">
                {figure.value}
              </p>
              <p className="mt-3 font-heading text-base lg:text-lg font-semibold">
                {figure.label}
              </p>
              <p className="mt-2 text-xs lg:text-sm text-primary-foreground/65 leading-relaxed">
                {figure.note}
              </p>
            </div>
          ))}
        </div>

        {/* How the record is built */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 border-t border-primary-foreground/15 pt-10 lg:pt-14">
          <div className="lg:col-span-5">
            <img
              src={graduation2}
              alt="Good Shepherd International School graduating class"
              loading="lazy"
              className="w-full h-56 lg:h-80 object-cover"
            />
          </div>

          <div className="lg:col-span-7">
            <h3 className="font-heading text-lg lg:text-2xl font-semibold">
              How that record is built
            </h3>
            <div className="rule-gold my-5" />
            <ol className="divide-y divide-primary-foreground/12">
              {strengths.map((item, index) => (
                <li key={item.title} className="py-5 first:pt-0 last:pb-0 flex gap-5">
                  <span className="font-heading text-base lg:text-lg text-accent shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h4 className="font-heading text-base lg:text-lg font-semibold">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 text-sm text-primary-foreground/70 leading-relaxed max-w-2xl">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="mt-10 text-[11px] text-primary-foreground/45 max-w-3xl">
          Figures refer to the most recent BECE cohort. Individual candidate
          index numbers and subject grades are confidential and are released only
          to the pupil's parent or guardian through the parent portal.
        </p>
      </div>
    </section>
  );
};

export default ResultsShowcase;
