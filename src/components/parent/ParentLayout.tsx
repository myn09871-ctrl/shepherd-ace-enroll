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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/portal/login" replace />;

  if (!parentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Your account is not linked to any student record. Please contact the school administration.
          </p>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const bottomNavItems = [
    { icon: Home, label: "Home", path: "/portal" },
    { icon: Users, label: "Children", path: "/portal/profile" },
    { icon: MessageSquare, label: "Messages", path: "/portal/messages", badge: unreadCount },
    { icon: FileText, label: "Docs", path: "/portal/documents" },
    { icon: CreditCard, label: "Fees", path: "/portal/fees" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={currentStudent} />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between px-3 h-14">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">GS</span>
                </div>
                <span className="text-sm font-semibold text-foreground hidden sm:block">Good Shepherd School</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Student Switcher */}
              {students.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                        {currentStudent?.photo_url ? (
                          <img src={currentStudent.photo_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-bold">{currentStudent?.first_name?.[0]}</span>
                        )}
                      </div>
                      <span className="hidden sm:inline">{currentStudent?.first_name}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground">Switch Student</div>
                    <DropdownMenuSeparator />
                    {students.map(s => (
                      <DropdownMenuItem key={s.id} onClick={() => setCurrentStudent(s)} className={currentStudent?.id === s.id ? "bg-accent" : ""}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {s.photo_url ? (
                              <img src={s.photo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-medium">{s.first_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{s.first_name} {s.surname}</p>
                            <p className="text-[10px] text-muted-foreground">{s.current_class}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={() => navigate("/portal/announcements")}>
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-destructive rounded-full" />
                )}
              </Button>
            </div>
          </div>

          {/* Student Info Bar */}
          {currentStudent && (
            <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 border-t border-border">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {currentStudent.photo_url ? (
                  <img src={currentStudent.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">{currentStudent.first_name[0]}{currentStudent.surname[0]}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {currentStudent.first_name} {currentStudent.surname}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {currentStudent.current_class} • {currentStudent.student_id}
                </p>
              </div>
            </div>
          )}
        </header>

        <main className="p-3 md:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
          <div className="flex items-center justify-around h-14">
            {bottomNavItems.map(item => {
              const isActive = location.pathname === item.path || (item.path === "/portal" && location.pathname === "/portal");
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 relative ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[9px] font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-0.5 right-0 h-4 min-w-[16px] px-1 bg-destructive text-destructive-foreground rounded-full text-[8px] font-bold flex items-center justify-center">
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
