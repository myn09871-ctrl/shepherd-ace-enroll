import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import schoolBuilding from "@/assets/school-building.webp";

const Hero = () => {
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const years = new Date().getFullYear() - 1992;

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) {
          setScrollY(window.scrollY);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const indicators = [
    { value: `${years}+ Years`, label: "Serving Accra since 1992" },
    { value: "100% BECE Distinction*", label: "Most recent graduating class" },
    { value: "Crèche → JHS", label: "One continuous school journey" },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        id="home"
        className="relative min-h-[92vh] flex items-end overflow-hidden"
      >
        {/* Real school photography with parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${schoolBuilding})`,
            transform: `translateY(${scrollY * 0.35}px) scale(1.08)`,
          }}
        >
          <div className="absolute inset-0 bg-hero-gradient" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pt-32 pb-16 lg:pb-24 relative z-10">
          <div className="max-w-3xl text-primary-foreground">
            <p className="eyebrow !text-accent animate-fade-up">Established 1992</p>

            <h1 className="mt-4 font-heading text-3xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] animate-fade-up animation-delay-100">
              {years}+ Years of
              <br />
              Building Futures
            </h1>

            <div className="rule-gold my-6 animate-fade-up animation-delay-200" />

            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/85 max-w-xl leading-relaxed animate-fade-up animation-delay-200">
              Good Shepherd International School provides quality education,
              character development and practical learning for the next generation.
            </p>

            <p className="mt-5 flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/70 animate-fade-up animation-delay-300">
              <MapPin className="h-4 w-4 text-accent" />
              Mallam, New Gbawe, Accra
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-up animation-delay-400">
              <Button variant="hero" size="lg" className="text-sm group" asChild>
                <Link to="/admission" className="flex items-center gap-2">
                  <span>Apply for Admission</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="text-sm" asChild>
                <a href="#heritage">Explore GSIS</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility indicators */}
      <div className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/15">
            {indicators.map((item) => (
              <div key={item.value} className="py-6 sm:py-8 sm:px-8 first:sm:pl-0 last:sm:pr-0">
                <p className="font-heading text-xl lg:text-2xl font-semibold text-accent">
                  {item.value}
                </p>
                <p className="mt-1 text-xs lg:text-sm text-primary-foreground/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <p className="pb-4 text-[10px] text-primary-foreground/45">
            *Basic Education Certificate Examination results, most recent cohort.
          </p>
        </div>
      </div>
    </>
  );
};

export default Hero;
