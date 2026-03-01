import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Megaphone, 
  Folder, 
  Clock, 
  Mail, 
  Settings, 
  LogOut,
  X,
  Home,
  CreditCard,
  CalendarCheck,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParentAuth } from "@/hooks/useParentAuth";
import schoolCrest from "@/assets/school-crest.jpeg";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  current_class: string;
  photo_url: string | null;
}

// Full navigation with Fees and Attendance
const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/academics", label: "Academic Performance", icon: GraduationCap },
  { href: "/portal/report-card", label: "Report Card", icon: FileText },
  { href: "/portal/fees", label: "Fees & Payments", icon: CreditCard },
  { href: "/portal/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/portal/announcements", label: "Announcements", icon: Megaphone },
  { href: "/portal/documents", label: "Documents", icon: Folder },
  { href: "/portal/timetable", label: "Timetable", icon: Clock },
  { href: "/portal/messages", label: "Messages", icon: Mail },
  { href: "/portal/profile", label: "Profile Settings", icon: Settings },
];

interface ParentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const ParentSidebar = ({ isOpen, onClose, student }: ParentSidebarProps) => {
  const location = useLocation();
  const { signOut } = useParentAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src={schoolCrest} alt="School Crest" className="h-10 w-10 rounded-full object-cover" />
            <div>
              <h2 className="font-semibold text-sm text-foreground">Parent Portal</h2>
              <p className="text-xs text-muted-foreground">Good Shepherd Int'l</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Student Card */}
        {student && (
          <div className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {student.photo_url ? (
                  <img src={student.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-primary">
                    {student.first_name[0]}{student.surname[0]}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {student.first_name} {student.surname}
                </p>
                <p className="text-xs text-muted-foreground">{student.current_class}</p>
                <p className="text-xs text-primary">{student.student_id}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/portal" && location.pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - fixed */}
        <div className="p-3 border-t border-border space-y-1 flex-shrink-0">
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Visit Website
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" 
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default ParentSidebar;
