import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  GraduationCap,
  ClipboardList,
  Megaphone,
  Mail,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import schoolCrest from "@/assets/school-crest.jpeg";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/teacher/classes", label: "My Classes", icon: Users },
  { href: "/teacher/attendance", label: "Attendance", icon: CalendarCheck2 },
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
        <div
          className="fixed inset-0 z-40 bg-foreground/35 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "teacher-sidebar-surface fixed left-0 top-0 z-50 flex h-full w-60 flex-col transition-transform duration-300",
          "lg:left-5 lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:rounded-l-[22px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-primary-foreground/10 px-4 py-5">
          <Link to="/teacher" className="flex items-center gap-3" onClick={onClose}>
            <img
              src={schoolCrest}
              alt="Good Shepherd International School crest"
              className="h-11 w-11 rounded-xl object-cover ring-1 ring-primary-foreground/20"
            />
            <div className="min-w-0 leading-tight text-primary-foreground">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]">GOOD SHEPHERD</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground/86">
                INTERNATIONAL SCHOOL
              </p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
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
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-[12.5px] font-semibold transition-all",
                    isActive
                      ? "teacher-sidebar-link-active"
                      : "teacher-sidebar-link hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary-foreground" />
                  )}
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2.1} />
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
