import { ArrowRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const steps = [
  { title: "Complete the online form", body: "Enter your child's details, parent information and health record." },
  { title: "Submit", body: "You will receive confirmation that we have your application." },
  { title: "School review", body: "We check the application and class placement." },
  { title: "Decision", body: "We contact you by email and phone." },
  { title: "Parent portal access", body: "Once admitted, you receive your parent portal login." },
];

const Admissions = () => (
  <section id="admissions" className="bg-background py-14 lg:py-20 scroll-mt-20">
    <div className="container mx-auto px-4 grid lg:grid-cols-12 gap-8 lg:gap-14">
      <div className="lg:col-span-5">
        <p className="eyebrow">Admissions</p>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-foreground">Ready to join us?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Open now, Crèche to JHS.</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="text-sm" asChild>
            <Link to="/admission" className="flex items-center gap-2">Apply for Admission <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="outline" size="lg" className="text-sm" asChild>
            <a href="#contact" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Us</a>
          </Button>
        </div>
      </div>
      <div className="lg:col-span-7">
        <p className="eyebrow !text-muted-foreground mb-2">How it works</p>
        <Accordion type="single" collapsible className="border-t border-border">
          {steps.map((s, i) => (
            <AccordionItem key={s.title} value={`s${i}`}>
              <AccordionTrigger className="text-sm font-heading font-semibold py-3 hover:no-underline">
                <span><span className="text-accent mr-3">{String(i + 1).padStart(2, "0")}</span>{s.title}</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pl-8">{s.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default Admissions;
