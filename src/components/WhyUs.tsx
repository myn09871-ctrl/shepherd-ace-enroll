import { Award, Users, Shield, Heart } from "lucide-react";

const features = [
  { icon: Award, title: "Academic excellence" },
  { icon: Users, title: "Experienced teachers" },
  { icon: Shield, title: "Safe, supervised campus" },
  { icon: Heart, title: "Strong moral values" },
];

const WhyUs = () => (
  <section id="about" className="bg-background py-12 lg:py-16 scroll-mt-20">
    <div className="container mx-auto px-4">
      <p className="eyebrow">Why Choose GSIS</p>
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 border-t border-l border-border">
        {features.map((f) => (
          <div key={f.title} className="border-b border-r border-border p-4 lg:p-5 flex items-center gap-3">
            <f.icon className="h-5 w-5 text-accent shrink-0" />
            <span className="font-heading text-sm lg:text-base font-semibold text-foreground">{f.title}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyUs;
