import { Palette, Code, Scissors, Anchor } from "lucide-react";
import computerLab from "@/assets/computer-lab.webp";
import graduationKids from "@/assets/graduation-kids.webp";
import studentsGroup from "@/assets/students-group.webp";
import ceremony from "@/assets/ceremony.webp";

const BeyondClassroom = () => {
  const tracks = [
    {
      icon: Palette,
      title: "Creative Arts",
      summary: "Visual art, music and drama",
      body: "Pupils work with paint, craft and performance each week, and the school's annual events give every class a stage to present what they have made and rehearsed.",
      image: graduationKids,
    },
    {
      icon: Code,
      title: "IT & Coding",
      summary: "Computing from Primary upward",
      body: "Structured computer lab sessions cover keyboard fluency, office software and introductory programming, so pupils leave JHS already comfortable with a machine.",
      image: computerLab,
    },
    {
      icon: Scissors,
      title: "Fashion Designing",
      summary: "Design and garment construction",
      body: "A practical vocational track covering measurement, pattern work and basic garment construction — real skills a pupil can carry beyond the classroom.",
      image: studentsGroup,
    },
    {
      icon: Anchor,
      title: "Naval Corps",
      summary: "Discipline, drill and leadership",
      body: "The school's cadet corps trains punctuality, bearing and teamwork through drill, parade and physical training, and represents GSIS at ceremonial occasions.",
      image: ceremony,
    },
  ];

  return (
    <section
      id="beyond-classroom"
      className="bg-background py-16 lg:py-24 scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        {/* Editorial header */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-border pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Learning Beyond the Classroom</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              What a pupil learns here
              <br className="hidden sm:block" /> is not only examinable
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Alongside the Ghana Education Service curriculum, every GSIS pupil
              takes part in practical and character training. Four tracks run
              through the school year, timetabled rather than optional.
            </p>
          </div>
        </div>

        {/* Alternating editorial rows */}
        <div className="divide-y divide-border">
          {tracks.map((track, index) => (
            <article
              key={track.title}
              className="grid lg:grid-cols-12 gap-5 lg:gap-12 py-8 lg:py-12 items-center group"
            >
              <div
                className={`lg:col-span-5 order-first ${
                  index % 2 === 1 ? "lg:order-last" : ""
                }`}
              >
                <div className="overflow-hidden">
                  <img
                    src={track.image}
                    alt={`${track.title} at Good Shepherd International School`}
                    loading="lazy"
                    className="w-full h-48 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center gap-3">
                  <track.icon className="h-4 w-4 text-accent" />
                  <span className="eyebrow !text-muted-foreground">
                    {track.summary}
                  </span>
                </div>
                <h3 className="mt-3 font-heading text-xl lg:text-2xl font-semibold text-foreground">
                  {track.title}
                </h3>
                <div className="rule-gold my-4" />
                <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {track.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeyondClassroom;
