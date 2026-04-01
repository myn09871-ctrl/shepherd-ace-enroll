import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, LogOut, ChevronDown, Users, Home, MessageSquare, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ParentSidebar from "./ParentSidebar";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import schoolCrest from "@/assets/school-crest.jpeg";

const ParentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    user, loading, parentAccount, currentStudent, students, setCurrentStudent, signOut,
  } = useParentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (parentAccount) {
      supabase
        .from("parent_messages")
        .select("id", { count: "exact", head: true })
        .eq("parent_account_id", parentAccount.id)
        .eq("is_read", false)
        .neq("sender_type", "parent")
        .then(({ count }) => setUnreadCount(count || 0));
    }
  }, [parentAccount, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/portal/login" replace />;

  if (!parentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-lg font-bold text-foreground mb-1">Account Not Found</h1>
          <p className="text-sm text-muted-foreground mb-3">
            Your account is not linked to any student record. Please contact the school administration.
          </p>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const bottomNavItems = [
    { icon: Home, label: "Dashboard", path: "/portal" },
    { icon: Users, label: "My Children", path: "/portal/profile" },
    { icon: MessageSquare, label: "Messages", path: "/portal/messages", badge: unreadCount },
    { icon: FileText, label: "Documents", path: "/portal/documents" },
    { icon: CreditCard, label: "Fees", path: "/portal/fees" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={currentStudent} />

      <div className="lg:ml-56">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#1a3563]">
          <div className="flex items-center justify-between px-3 h-12">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 h-8 w-8" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <img src={schoolCrest} alt="" className="h-7 w-7 rounded-full object-cover" />
                <div className="leading-tight">
                  <span className="text-[12px] font-bold text-white">Good Shepherd</span>
                  <span className="text-[10px] text-blue-200 block">School</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Student selector + info */}
              {students.length > 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 text-white text-[11px] font-medium bg-white/10 rounded-full px-2.5 py-1 hover:bg-white/20 transition-colors">
                      <span>{parentAccount.parent_name.split(" ")[0]}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground">Switch Student</div>
                    <DropdownMenuSeparator />
                    {students.map(s => (
                      <DropdownMenuItem key={s.id} onClick={() => setCurrentStudent(s)} className={currentStudent?.id === s.id ? "bg-accent" : ""}>
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {s.photo_url ? (
                              <img src={s.photo_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                            ) : (
                              <span className="text-[8px] font-medium">{s.first_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium">{s.first_name} {s.surname}</p>
                            <p className="text-[9px] text-muted-foreground">{s.current_class}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="text-[11px] text-white/80 font-medium hidden sm:block">{parentAccount.parent_name.split(" ")[0]}</span>
              )}

              {/* Student avatar + info */}
              {currentStudent && (
                <div className="flex items-center gap-1.5">
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                    {currentStudent.photo_url ? (
                      <img src={currentStudent.photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-white">{currentStudent.first_name[0]}{currentStudent.surname[0]}</span>
                    )}
                  </div>
                  <div className="hidden sm:block leading-tight">
                    <p className="text-[11px] font-semibold text-white">{currentStudent.first_name} {currentStudent.surname}</p>
                    <p className="text-[9px] text-blue-200">{currentStudent.current_class}</p>
                  </div>
                </div>
              )}

              <Button variant="ghost" size="icon" className="relative h-7 w-7 text-white hover:bg-white/10" onClick={() => navigate("/portal/announcements")}>
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <main className="p-3 md:p-5 pb-20 lg:pb-5">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/60 shadow-lg">
          <div className="flex items-center justify-around h-14">
            {bottomNavItems.map(item => {
              const isActive = location.pathname === item.path || (item.path === "/portal" && location.pathname === "/portal");
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 relative ${
                    isActive ? "text-[#1a3563]" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-[9px] font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-0.5 right-0.5 h-3.5 min-w-[14px] px-0.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default ParentLayout;
