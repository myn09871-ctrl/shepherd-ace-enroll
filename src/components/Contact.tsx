import { MapPin, Phone, Clock, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ceremony from "@/assets/ceremony.webp";

const Contact = () => {
  const phoneNumbers = ["0208163186", "0244855184", "0242225084"];

  const levels = [
    "Crèche",
    "Nursery",
    "Kindergarten",
    "Primary",
    "Junior High School",
  ];

  return (
    <section
      id="contact"
      className="bg-background py-16 lg:py-24 scroll-mt-20 border-t border-border"
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-border pb-8 lg:pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">Contact</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              Admission is free — speak to the school
            </h2>
            <div className="rule-gold mt-6" />
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Visit the campus at Mallam, New Gbawe, or call the office during
              working hours. A member of staff will take you through class
              placement and what to bring on the first day.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 pt-10 lg:pt-12">
          {/* Details */}
          <div className="lg:col-span-7">
            <div className="border-t border-l border-border">
              {/* Location */}
              <div className="border-b border-r border-border p-5 lg:p-6 bg-card">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-accent shrink-0 mt-1" />
                  <div className="min-w-0">
                    <h3 className="font-heading text-base lg:text-lg font-semibold text-foreground">
                      Our location
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      100 metres from Mallam LAFA Police Station,
                      <br />
                      Mallam, New Gbawe, Accra, Ghana
                    </p>
                    <a
                      href="https://maps.google.com/?q=Mallam+LAFA+Police+Station+Ghana"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
                    >
                      Get directions
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Phones */}
              <div className="border-b border-r border-border p-5 lg:p-6 bg-card">
                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-accent shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base lg:text-lg font-semibold text-foreground">
                      Call the office
                    </h3>
                    <div className="mt-3 divide-y divide-border border-t border-border">
                      {phoneNumbers.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone}`}
                          className="flex items-center justify-between gap-3 py-3 group"
                        >
                          <span className="font-heading text-base lg:text-lg text-foreground">
                            {phone}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="border-b border-r border-border p-5 lg:p-6 bg-card">
                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-accent shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-base lg:text-lg font-semibold text-foreground">
                      Office hours
                    </h3>
                    <dl className="mt-3 text-sm">
                      {[
                        ["Monday – Friday", "7:00 AM – 4:00 PM"],
                        ["Saturday", "8:00 AM – 12:00 PM"],
                        ["Sunday", "Closed"],
                      ].map(([day, time]) => (
                        <div
                          key={day}
                          className="flex items-baseline justify-between gap-4 py-2 border-t border-border"
                        >
                          <dt className="text-muted-foreground">{day}</dt>
                          <dd className="text-foreground font-medium text-right">
                            {time}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolment panel */}
          <div className="lg:col-span-5">
            <div className="bg-primary text-primary-foreground">
              <img
                src={ceremony}
                alt="Good Shepherd International School ceremony"
                loading="lazy"
                className="w-full h-40 sm:h-48 object-cover"
              />
              <div className="p-6 lg:p-8">
                <p className="eyebrow text-accent">Free admission</p>
                <h3 className="mt-3 font-heading text-xl lg:text-2xl font-semibold leading-snug">
                  Admission in progress
                </h3>
                <p className="mt-3 text-sm text-primary-foreground/80 leading-relaxed">
                  Places are open across all levels for the current academic
                  year. Apply online or call the office to arrange a visit.
                </p>

                <ul className="mt-6 border-t border-primary-foreground/20">
                  {levels.map((level) => (
                    <li
                      key={level}
                      className="flex items-center gap-3 py-2.5 border-b border-primary-foreground/20 text-sm"
                    >
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      <span>{level}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-col gap-3">
                  <Button size="lg" variant="secondary" className="text-sm w-full" asChild>
                    <Link to="/admission">Apply for Admission</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-sm w-full bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    asChild
                  >
                    <a href="tel:0208163186" className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Call to enrol</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
