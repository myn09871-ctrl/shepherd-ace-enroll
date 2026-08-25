import { Award, Heart, Users, BookOpen, Shield, Sparkles } from "lucide-react";
import graduation1 from "@/assets/graduation-1.webp";
import graduation2 from "@/assets/graduation-2.webp";

const WhyUs = () => {
  const yearsOfExcellence = new Date().getFullYear() - 1992;

  const features = [
    {
      icon: Award,
      title: "Academic excellence",
      description:
        "A 100% BECE distinction record, with candidates placed in the aggregate 07–09 range.",
    },
    {
      icon: Heart,
      title: "Holistic development",
      description:
        "Academic work is paired with creative, physical and moral formation across every level.",
    },
    {
      icon: Users,
      title: "Experienced faculty",
      description:
        "Long-serving teachers who know each child by name and track progress class by class.",
    },
    {
      icon: BookOpen,
      title: "Modern curriculum",
      description:
        "The current national syllabus, taught with practical work and continuous assessment.",
    },
    {
      icon: Shield,
      title: "Safe environment",
      description:
        "A secured, supervised campus with daily attendance reported to parents.",
    },
    {
      icon: Sparkles,
      title: "Moral values",
      description:
        "Character formation rooted in the school motto: 'In God We Trust'.",
    },
  ];

  return (
    <section id="about" className="bg-background py-16 lg:py-24 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Statement */}
          <div className="lg:col-span-5">
            <p className="eyebrow">Why Choose GSIS</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              A record built one
              <br className="hidden sm:block" /> class at a time
            </h2>
            <div className="rule-gold my-6" />
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Good Shepherd International School has taught children in Mallam,
              New Gbawe for {yearsOfExcellence} years. The results are the
              outcome of small classes, consistent teaching and parents kept
              close to the work.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <img
                src={graduation1}
                alt="Graduation ceremony at Good Shepherd International School"
                loading="lazy"
                className="w-full h-40 sm:h-48 object-cover"
              />
              <img
                src={graduation2}
                alt="Pupils at a Good Shepherd graduation"
                loading="lazy"
                className="w-full h-40 sm:h-48 object-cover"
              />
            </div>

            <div className="mt-6 flex items-baseline gap-3 border-t border-border pt-6">
              <span className="font-heading text-3xl lg:text-4xl font-semibold text-accent leading-none">
                {yearsOfExcellence}+
              </span>
              <span className="text-sm text-muted-foreground">
                years of continuous operation, since 1992
              </span>
            </div>
          </div>

          {/* Feature grid */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 border-t border-l border-border">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="border-b border-r border-border p-5 lg:p-6"
                >
                  <feature.icon className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 font-heading text-base lg:text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
