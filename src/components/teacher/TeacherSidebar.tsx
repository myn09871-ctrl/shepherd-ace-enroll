import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, GraduationCap,
  ClipboardList, Megaphone, Mail, User, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import schoolCrest from "@/assets/school-crest.jpeg";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/teacher/classes", label: "My Classes", icon: Users },
  { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/teacher/results", label: "Results", icon: GraduationCap },
  { href: "/teacher/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/teacher/announcements", label: "Announcements", icon: Megaphone },
  { href: "/teacher/messages", label: "Messages", icon: Mail },
  { href: "/teacher/profile", label: "Profile", icon: User },
];

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeacherSidebar = ({ isOpen, onClose }: TeacherSidebarProps) => {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-56 z-50 transition-transform duration-300 flex flex-col",
          "bg-[#2e5fa3] text-white lg:rounded-l-2xl",
          "lg:left-5 lg:top-5 lg:h-[calc(100vh-2.5rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with crest */}
        <div className="px-4 py-5 flex items-center justify-between flex-shrink-0 border-b border-white/10">
          <Link to="/teacher" className="flex items-center gap-2.5" onClick={onClose}>
            <img src={schoolCrest} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/30" />
            <div className="leading-tight">
              <p className="font-bold text-[10px] tracking-[0.08em] uppercase">GOOD SHEPHERD</p>
              <p className="font-semibold text-[9px] tracking-[0.1em] uppercase text-blue-200/90">INTERNATIONAL SCHOOL</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.href
                : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#1a3563] text-white"
                      : "text-blue-100/85 hover:bg-white/10"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-white" />
                  )}
                  <item.icon className="h-[17px] w-[17px] flex-shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default TeacherSidebar;
