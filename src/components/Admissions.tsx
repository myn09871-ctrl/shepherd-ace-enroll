import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Admissions = () => {
  const steps = [
    {
      title: "Complete the application",
      body: "Fill in the online admission form with your child's details, parent or guardian information and health record.",
    },
    {
      title: "Submit",
      body: "Submit the completed form. You will receive confirmation that the school has received your application.",
    },
    {
      title: "The school reviews",
      body: "Administration checks the application, the age placement and any supporting documents required for the class applied for.",
    },
    {
      title: "Admission decision",
      body: "The school communicates the outcome to the parent or guardian by email and by phone.",
    },
    {
      title: "Parent portal created",
      body: "On admission, a parent portal account is created for you so you can follow results, attendance, fees and school notices.",
    },
  ];

  return (
    <section
      id="admissions"
      className="bg-muted/40 py-16 lg:py-24 scroll-mt-20 border-y border-border"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-border pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Admissions</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              Ready to Join Us?
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Admission is open for the current academic year, from Crèche
              through to Junior High School. The process is five steps and
              begins online.
            </p>
          </div>
        </div>

        {/* Five-step process */}
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-border">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-b border-r border-border p-5 lg:p-6 bg-card"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-2xl lg:text-3xl font-semibold text-accent leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-4 font-heading text-base lg:text-lg font-semibold text-foreground leading-snug">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        {/* Conversion bar */}
        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-t border-border pt-8">
          <p className="font-heading text-base lg:text-xl text-foreground max-w-xl leading-snug">
            Applications are reviewed as they arrive — earlier applications get
            first consideration for limited class places.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button size="lg" className="text-sm group" asChild>
              <Link to="/admission" className="flex items-center gap-2">
                <span>Apply for Admission</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-sm" asChild>
              <a href="#contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Contact the School</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admissions;
