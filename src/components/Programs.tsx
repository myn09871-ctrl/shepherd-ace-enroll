import { useEffect, useState } from "react";
import nurseryClass from "@/assets/nursery-class.webp";
import computerLab from "@/assets/computer-lab.webp";
import crecheGsis from "@/assets/gsis-creche.jpg.asset.json";
import graduation1 from "@/assets/graduation-1.webp";
import graduation2 from "@/assets/graduation-2.webp";

const stages = [
  { title: "Crèche", age: "6 months – 2 years", description: "Safe, caring full-day care with daily feedback to parents.", image: crecheGsis.url },
  { title: "Nursery", age: "2 – 4 years", description: "Play, language and number readiness.", image: nurseryClass },
  { title: "Kindergarten", age: "4 – 6 years", description: "Reading, writing and early numeracy in small groups.", image: graduation1 },
  { title: "Primary", age: "6 – 12 years", description: "Full GES curriculum plus computing and French.", image: computerLab },
  { title: "JHS", age: "12 – 15 years", description: "Focused BECE preparation with termly mock exams.", image: graduation2 },
];

const Programs = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % stages.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const s = stages[active];
  return (
    <section id="programs" className="py-14 lg:py-20 bg-muted/40 scroll-mt-20">
      <div className="container mx-auto px-4">
        <p className="eyebrow">Academic Programmes</p>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-foreground">
          From Crèche to JHS
        </h2>

        <div role="tablist" aria-label="Academic stages" className="mt-6 flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {stages.map((stage, index) => (
            <button
              key={stage.title}
              role="tab"
              aria-selected={active === index}
              onClick={() => { setActive(index); setPaused(true); }}
              className={`shrink-0 border px-4 py-2 text-sm font-medium transition-colors ${
                active === index ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary"
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>

        <div role="tabpanel" className="mt-6 grid lg:grid-cols-12 gap-5 lg:gap-10 items-center">
          <div className="lg:col-span-7 overflow-hidden">
            <img key={s.title} src={s.image} alt={`${s.title} at Good Shepherd International School`} className="w-full h-56 sm:h-72 object-cover animate-fade-in" />
          </div>
          <div className="lg:col-span-5">
            <h3 className="font-heading text-xl lg:text-2xl font-semibold text-foreground">{s.title}</h3>
            <p className="mt-1 eyebrow !text-muted-foreground">{s.age}</p>
            <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
            <div className="mt-5 flex gap-1.5">
              {stages.map((_, i) => (
                <span key={i} className={`h-1 flex-1 ${i === active ? "bg-accent" : "bg-border"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs;
