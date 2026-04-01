import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, CalendarCheck, GraduationCap,
  ClipboardList, Megaphone, Mail, User, LogOut, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { cn } from "@/lib/utils";
import schoolCrest from "@/assets/school-crest.jpeg";

const navItems = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
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
  const { signOut } = useTeacherAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-56 z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col",
          "bg-[#1a3563] text-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with crest */}
        <div className="px-4 py-5 flex items-center justify-between flex-shrink-0">
          <Link to="/teacher" className="flex items-center gap-2.5" onClick={onClose}>
            <img src={schoolCrest} alt="GSIS" className="h-9 w-9 rounded-full object-cover border border-white/20" />
            <div className="leading-tight">
              <p className="font-bold text-[11px] tracking-wide uppercase">GOOD SHEPHERD</p>
              <p className="font-bold text-[10px] tracking-wide uppercase text-blue-200">INTERNATIONAL SCHOOL</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-1">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/teacher" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-white text-[#1a3563] font-semibold"
                      : "text-blue-100/90 hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-red-300 hover:bg-red-500/20 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;
