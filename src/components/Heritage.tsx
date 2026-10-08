import ceremony from "@/assets/ceremony.webp";
import graduation1 from "@/assets/graduation-1.webp";

const Heritage = () => {
  const years = new Date().getFullYear() - 1992;
  return (
    <section id="heritage" className="bg-background py-14 lg:py-20 scroll-mt-20">
      <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow">Established 1992</p>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-foreground">
            {years}+ years in New Gbawe
          </h2>
          <div className="rule-gold my-5" />
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
            One campus from crèche to JHS, small classes, and a motto that still guides us —{" "}
            <span className="italic text-foreground">"In God We Trust"</span>.
          </p>
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 gap-3">
          <img src={ceremony} alt="GSIS pupils at a school ceremony" loading="lazy" className="h-40 lg:h-56 w-full object-cover" />
          <img src={graduation1} alt="GSIS graduating class" loading="lazy" className="h-40 lg:h-56 w-full object-cover" />
        </div>
      </div>
    </section>
  );
};

export default Heritage;
