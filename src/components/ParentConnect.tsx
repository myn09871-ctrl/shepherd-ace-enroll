import {
  GraduationCap,
  CalendarCheck,
  Megaphone,
  FileText,
  Receipt,
  MessagesSquare,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import studentsGroup from "@/assets/students-group.webp";

const ParentConnect = () => {
  const capabilities = [
    {
      icon: GraduationCap,
      title: "Results & report cards",
      body: "Termly report cards with continuous assessment, examination scores and class position.",
    },
    {
      icon: CalendarCheck,
      title: "Attendance",
      body: "Daily attendance recorded by the class teacher, visible to the parent the same day.",
    },
    {
      icon: Megaphone,
      title: "Announcements",
      body: "School notices, term dates and class-specific announcements as they are published.",
    },
    {
      icon: FileText,
      title: "Documents",
      body: "Letters, notices and downloadable PDFs issued to your child's class.",
    },
    {
      icon: Receipt,
      title: "Fees",
      body: "A clear statement of what has been paid and what is outstanding, term by term.",
    },
    {
      icon: MessagesSquare,
      title: "Messages",
      body: "Two-way messaging with the school office and your child's class teacher.",
    },
  ];

  return (
    <section
      id="parent-portal"
      className="bg-background py-16 lg:py-24 scroll-mt-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left: statement */}
          <div className="lg:col-span-5">
            <p className="eyebrow">Parent Connectivity</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              A School That
              <br />
              Stays Connected
            </h2>
            <div className="rule-gold my-6" />
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Every GSIS family receives a parent portal account when their child
              is admitted. It is not a newsletter — it is the same record the
              school keeps, opened to the parent.
            </p>
            <p className="mt-4 text-sm lg:text-base text-muted-foreground leading-relaxed">
              You do not have to wait for a term report or a phone call to know
              how your child is doing.
            </p>

            <div className="mt-8">
              <Button size="lg" className="text-sm group" asChild>
                <Link to="/portal/login" className="flex items-center gap-2">
                  <span>View Parent Portal</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <img
              src={studentsGroup}
              alt="Good Shepherd International School pupils"
              loading="lazy"
              className="mt-10 w-full h-48 lg:h-56 object-cover"
            />
          </div>

          {/* Right: capability list */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 border-t border-l border-border">
              {capabilities.map((item) => (
                <div
                  key={item.title}
                  className="border-b border-r border-border p-5 lg:p-6"
                >
                  <item.icon className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 font-heading text-base lg:text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Portal access is created by the school after a child is admitted.
              Login details are sent to the email address given on the admission
              form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParentConnect;
