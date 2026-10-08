import { GraduationCap, CalendarCheck, Megaphone, FileText, Receipt, MessagesSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const items = [
  { icon: GraduationCap, title: "Report cards" },
  { icon: CalendarCheck, title: "Attendance" },
  { icon: Megaphone, title: "Announcements" },
  { icon: FileText, title: "Documents" },
  { icon: Receipt, title: "Fees" },
  { icon: MessagesSquare, title: "Messages" },
];

const ParentConnect = () => (
  <section id="parent-portal" className="bg-muted/40 py-12 lg:py-16 scroll-mt-20 border-y border-border">
    <div className="container mx-auto px-4 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
      <div className="lg:w-1/3">
        <p className="eyebrow">Parent Portal</p>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-foreground">Stay connected</h2>
        <p className="mt-2 text-sm text-muted-foreground">Follow your child's progress online, any time.</p>
        <Button size="sm" className="mt-4 text-sm" asChild>
          <Link to="/portal/login" className="flex items-center gap-2">Parent Portal <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
      <ul className="lg:flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((i) => (
          <li key={i.title} className="flex items-center gap-2 border border-border bg-card px-3 py-3 text-sm text-foreground">
            <i.icon className="h-4 w-4 text-accent shrink-0" /> {i.title}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default ParentConnect;
