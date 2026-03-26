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
          "fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300 lg:translate-x-0 flex flex-col",
          "bg-[#1e3a5f] text-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <Link to="/teacher" className="flex items-center gap-3" onClick={onClose}>
            <img src={schoolCrest} alt="GSIS" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <h1 className="font-bold text-sm leading-tight">Good Shepherd</h1>
              <p className="text-xs text-blue-200">Teacher Portal</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/teacher" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white text-[#1e3a5f]"
                      : "text-blue-100 hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-500/20 transition-colors w-full"
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
