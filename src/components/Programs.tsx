// NOTE: Several of these images are placeholders due to limited real photography.
// Replace via the admin Gallery upload system as authentic photos of each specific
// class/activity become available.
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import nurseryClass from "@/assets/nursery-class.webp";
import computerLab from "@/assets/computer-lab.webp";
// Crèche: licensed stock of a nursery room with a cot and soft toys, no people
// (Pexels #4030073, Pexels License). Not a GSIS room.
import crecheNursery from "@/assets/creche-nursery.webp";
import graduation1 from "@/assets/graduation-1.webp";
import graduation2 from "@/assets/graduation-2.webp";

const Programs = () => {
  const [active, setActive] = useState(0);
  const stages = [
    {
      title: "Crèche",
      age: "6 months – 2 years",
      description:
        "Full-day care in a small, supervised room. Feeding, rest and early sensory play, with daily feedback to parents.",
      image: crecheNursery,
    },
    {
      title: "Nursery",
      age: "2 – 4 years",
      description:
        "Structured play, language and number readiness. Children learn routine, sharing and self-expression before formal work begins.",
      image: nurseryClass,
    },
    {
      title: "Kindergarten",
      age: "4 – 6 years",
      description:
        "Reading, writing and early numeracy taught in small groups so no child moves on before the foundation is secure.",
      image: graduation1,
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
      image: graduation2,
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

        {/* Stage selector */}
        <div role="tablist" aria-label="Academic stages" className="mt-8 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {stages.map((stage, index) => (
            <button
              key={stage.title}
              role="tab"
              id={`stage-tab-${index}`}
              aria-selected={active === index}
              aria-controls="stage-panel"
              onClick={() => setActive(index)}
              className={`shrink-0 border px-4 py-2 text-sm font-medium transition-colors ${
                active === index
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary"
              }`}
            >
              <span className="font-heading mr-2 opacity-70">{String(index + 1).padStart(2, "0")}</span>
              {stage.title}
            </button>
          ))}
        </div>

        <div
          id="stage-panel"
          role="tabpanel"
          aria-labelledby={`stage-tab-${active}`}
          className="mt-8 grid lg:grid-cols-12 gap-6 lg:gap-12 items-center"
        >
          <div className="lg:col-span-6 overflow-hidden">
            <img
              key={stages[active].title}
              src={stages[active].image}
              alt={`${stages[active].title} at Good Shepherd International School`}
              className="w-full h-56 sm:h-72 lg:h-80 object-cover animate-fade-in"
            />
          </div>
          <div className="lg:col-span-6">
            <span className="font-heading text-lg text-accent">
              {String(active + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-heading text-2xl lg:text-3xl font-semibold text-foreground">
              {stages[active].title}
            </h3>
            <p className="mt-1 eyebrow !text-muted-foreground">{stages[active].age}</p>
            <p className="mt-4 text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xl">
              {stages[active].description}
            </p>
          </div>
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
