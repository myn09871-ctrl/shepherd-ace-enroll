import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Mail,
  Folder,
  Clock,
  CreditCard,
  LogOut,
  X,
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
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "parent-sidebar-surface fixed left-0 top-0 z-50 flex h-full w-56 flex-col transition-transform duration-200 ease-in-out",
          "lg:left-5 lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:rounded-l-[24px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--parent-sidebar-border))] px-4 py-5 lg:block">
          <Link to="/portal" className="flex items-center gap-3" onClick={onClose}>
            <img
              src={schoolCrest}
              alt="Good Shepherd International School crest"
              className="h-12 w-12 rounded-xl object-cover ring-1 ring-border/70"
            />
            <div className="leading-tight text-[hsl(var(--parent-sidebar-text))]">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em]">GOOD SHEPHERD</p>
              <p className="text-[11px] font-semibold">School</p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[hsl(var(--parent-sidebar-text))] hover:bg-card lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-2">
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
                    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-[12.5px] font-semibold transition-all",
                    isActive
                      ? "parent-sidebar-link-active"
                      : "parent-sidebar-link hover:bg-card hover:shadow-sm"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={2.1} />
                  <span className="flex-1">{item.label}</span>
                  {item.hasBadge && unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[hsl(var(--dashboard-badge))] px-1 text-[9px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-3 py-4">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--parent-sidebar-border))] bg-card px-3 py-2.5 text-[12px] font-semibold text-[hsl(var(--parent-sidebar-text))] transition-colors hover:bg-muted"
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
