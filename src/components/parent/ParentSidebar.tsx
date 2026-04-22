import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Mail, Folder, Clock, CreditCard, LogOut, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  current_class: string;
  photo_url: string | null;
}

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/profile", label: "My Children", icon: Users },
  { href: "/portal/messages", label: "Messages", icon: Mail, hasBadge: true },
  { href: "/portal/documents", label: "Documents", icon: Folder },
  { href: "/portal/timetable", label: "Timetable", icon: Clock },
  { href: "/portal/fees", label: "Fees", icon: CreditCard },
];

interface ParentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  unreadCount?: number;
}

const ParentSidebar = ({ isOpen, onClose, unreadCount = 0 }: ParentSidebarProps) => {
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
          "bg-[#eaf0f7] text-[#1a3563] border-r border-[#d4dde9]",
          "lg:left-5 lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:rounded-l-2xl lg:border-r-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-end px-3 pt-3 flex-shrink-0">
          <Button variant="ghost" size="icon" className="text-[#1a3563] hover:bg-black/5 h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-[#1a3563] text-white shadow-sm"
                      : "text-[#1a3563]/85 hover:bg-white/70"
                  )}
                >
                  <item.icon className="h-[17px] w-[17px] flex-shrink-0" strokeWidth={2} />
                  <span className="flex-1">{item.label}</span>
                  {item.hasBadge && unreadCount > 0 && (
                    <span className="h-4 min-w-[16px] px-1 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 flex-shrink-0">
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-[12.5px] font-medium text-[#1a3563] bg-white border border-[#d4dde9] hover:bg-white/80 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;
