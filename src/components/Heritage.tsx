import schoolCrest from "@/assets/school-crest.jpeg";
import ceremony from "@/assets/ceremony.webp";
import graduation1 from "@/assets/graduation-1.webp";

const Heritage = () => {
  const years = new Date().getFullYear() - 1992;

  const milestones = [
    {
      year: "1992",
      title: "The school opens",
      body: "Good Shepherd International School begins in Mallam, New Gbawe with a small group of pupils and a single guiding motto: In God We Trust.",
    },
    {
      year: "2000s",
      title: "Crèche through JHS",
      body: "The school grows into a full continuous programme, so a child admitted at crèche can complete Junior High School on the same campus with the same teachers who know them.",
    },
    {
      year: "Today",
      title: `${years} years on`,
      body: "GSIS combines a strong academic record at BECE level with practical training, sport and character formation — and keeps parents involved through the online parent portal.",
    },
  ];

  return (
    <section id="heritage" className="bg-background py-16 lg:py-24 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: editorial statement */}
          <div className="lg:col-span-5">
            <p className="eyebrow">Established 1992</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              {years}+ Years of Education
              <br />
              in New Gbawe
            </h2>
            <div className="rule-gold my-6" />
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              GSIS was founded in 1992 by educators who wanted a school where
              families in Mallam and New Gbawe could keep their children from
              crèche right through to Junior High School without moving them
              from place to place.
            </p>
            <p className="mt-4 text-sm lg:text-base text-muted-foreground leading-relaxed">
              Three decades later that is still how the school works. Class
              sizes stay small enough for teachers to know each pupil by name,
              results are tracked term by term, and the school's motto —{" "}
              <span className="italic text-foreground">"In God We Trust"</span> —
              still sets the tone for how pupils are taught to treat one another.
            </p>

            <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
              <img
                src={schoolCrest}
                alt="Good Shepherd International School crest"
                className="h-14 w-14 rounded-full object-cover border border-border"
              />
              <div>
                <p className="font-heading text-base font-semibold text-foreground">
                  Good Shepherd International School
                </p>
                <p className="text-xs text-muted-foreground">
                  Mallam, New Gbawe, Accra · Est. 1992
                </p>
              </div>
            </div>
          </div>

          {/* Right: timeline + photography */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={ceremony}
                alt="GSIS pupils at a school ceremony"
                loading="lazy"
                className="h-48 lg:h-64 w-full object-cover"
              />
              <img
                src={graduation1}
                alt="GSIS graduating class"
                loading="lazy"
                className="h-48 lg:h-64 w-full object-cover mt-8"
              />
            </div>

            <ol className="mt-10 border-l border-border">
              {milestones.map((m) => (
                <li key={m.year} className="relative pl-6 lg:pl-8 pb-8 last:pb-0">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 bg-accent" />
                  <p className="eyebrow !text-muted-foreground">{m.year}</p>
                  <h3 className="mt-1 font-heading text-lg lg:text-xl font-semibold text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {m.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Heritage;
