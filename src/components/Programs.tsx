import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import nurseryClass from "@/assets/nursery-class.webp";
import computerLab from "@/assets/computer-lab.webp";
import graduationKids from "@/assets/graduation-kids.webp";
import studentsGroup from "@/assets/students-group.webp";
import ceremony from "@/assets/ceremony.webp";

const Programs = () => {
  const stages = [
    {
      title: "Crèche",
      age: "6 months – 2 years",
      description:
        "Full-day care in a small, supervised room. Feeding, rest and early sensory play, with daily feedback to parents.",
      image: nurseryClass,
    },
    {
      title: "Nursery",
      age: "2 – 4 years",
      description:
        "Structured play, language and number readiness. Children learn routine, sharing and self-expression before formal work begins.",
      image: graduationKids,
    },
    {
      title: "Kindergarten",
      age: "4 – 6 years",
      description:
        "Reading, writing and early numeracy taught in small groups so no child moves on before the foundation is secure.",
      image: studentsGroup,
    },
    {
      title: "Primary",
      age: "6 – 12 years",
      description:
        "The full Ghana Education Service curriculum with continuous assessment, plus computing, French and practical work each week.",
      image: computerLab,
    },
    {
      title: "Junior High School",
      age: "12 – 15 years",
      description:
        "Focused BECE preparation with termly mock examinations, ranked class reports and individual revision support for every candidate.",
      image: ceremony,
    },
  ];

  return (
    <section id="programs" className="py-16 lg:py-24 bg-muted/40 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section header — editorial two column */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-border pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Academic Programmes</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              One school, from first steps
              <br className="hidden sm:block" /> to BECE certificate
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              A child can join GSIS at six months old and leave with a Junior
              High School certificate. Five stages, one campus, and teachers who
              follow a pupil's progress across all of them.
            </p>
          </div>
        </div>

        {/* Stage rows */}
        <div className="divide-y divide-border">
          {stages.map((stage, index) => (
            <article
              key={stage.title}
              className="grid lg:grid-cols-12 gap-5 lg:gap-12 py-8 lg:py-12 items-center group"
            >
              <div className="lg:col-span-1">
                <span className="font-heading text-lg lg:text-xl text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="lg:col-span-4 order-first lg:order-none">
                <div className="overflow-hidden">
                  <img
                    src={stage.image}
                    alt={`${stage.title} pupils at Good Shepherd International School`}
                    loading="lazy"
                    className="w-full h-44 lg:h-52 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-heading text-xl lg:text-2xl font-semibold text-foreground">
                    {stage.title}
                  </h3>
                  <span className="eyebrow !text-muted-foreground">{stage.age}</span>
                </div>
                <p className="mt-3 text-sm lg:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  {stage.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-8">
          <p className="font-heading text-base lg:text-lg text-foreground">
            Admissions are open for the current academic year.
          </p>
          <Button variant="default" size="lg" className="text-sm" asChild>
            <Link to="/admission" className="flex items-center gap-2">
              <span>Apply for Admission</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Programs;
