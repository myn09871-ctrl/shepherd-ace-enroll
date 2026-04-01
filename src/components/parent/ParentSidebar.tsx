import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, Megaphone, Folder, Clock,
  Mail, LogOut, X, CreditCard, CalendarCheck, FileText, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import { cn } from "@/lib/utils";
import schoolCrest from "@/assets/school-crest.jpeg";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  current_class: string;
  photo_url: string | null;
}

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/profile", label: "My Children", icon: Users },
  { href: "/portal/messages", label: "Messages", icon: Mail },
  { href: "/portal/documents", label: "Documents", icon: Folder },
  { href: "/portal/timetable", label: "Timetable", icon: Clock },
  { href: "/portal/fees", label: "Fees", icon: CreditCard },
];

interface ParentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const ParentSidebar = ({ isOpen, onClose, student }: ParentSidebarProps) => {
  const location = useLocation();
  const { signOut } = useParentAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-56 flex flex-col transition-transform duration-200 ease-in-out",
          "bg-[#1a3563] text-white",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src={schoolCrest} alt="GSIS" className="h-9 w-9 rounded-full object-cover border border-white/20" />
            <div className="leading-tight">
              <p className="font-bold text-[12px]">Good Shepherd</p>
              <p className="text-[10px] text-blue-200">School</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-1">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== "/portal" && location.pathname.startsWith(item.href));
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
                  {item.href === "/portal/messages" && (
                    <span className="ml-auto h-4 min-w-[16px] px-1 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-white/80 hover:bg-white/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;
