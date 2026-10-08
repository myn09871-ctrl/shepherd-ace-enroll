// NOTE: Creative Arts and Fashion images are royalty-free object stock (no people).
// Naval Corps uses a real GSIS cadet corps photo.
import { Palette, Code, Scissors, Anchor } from "lucide-react";
import computerLab from "@/assets/computer-lab.webp";
import navalCadets from "@/assets/gsis-naval-cadets.jpg.asset.json";
import creativeArtsMaterials from "@/assets/creative-arts-materials.webp";
import fashionSewingMaterials from "@/assets/fashion-sewing-materials.webp";

const tracks = [
  { icon: Palette, title: "Creative Arts", summary: "Visual art, music and drama", image: creativeArtsMaterials },
  { icon: Code, title: "IT & Coding", summary: "Computing from Primary upward", image: computerLab },
  { icon: Scissors, title: "Fashion Designing", summary: "Design and garment making", image: fashionSewingMaterials },
  { icon: Anchor, title: "Naval Corps", summary: "Discipline, drill and leadership", image: navalCadets.url },
];

const BeyondClassroom = () => {
  const loop = [...tracks, ...tracks];
  return (
    <section id="beyond-classroom" className="bg-background py-14 lg:py-20 scroll-mt-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="eyebrow">Learning Beyond the Classroom</p>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-foreground">
          What pupils learn here
        </h2>
      </div>
      <div className="mt-8 group">
        <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <article key={i} className="w-64 sm:w-72 shrink-0 border border-border bg-card" aria-hidden={i >= tracks.length}>
              <img src={t.image} alt={t.title} loading="lazy" className="h-40 sm:h-44 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <t.icon className="h-4 w-4 text-accent" />
                  <h3 className="font-heading text-base font-semibold text-foreground">{t.title}</h3>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeyondClassroom;
