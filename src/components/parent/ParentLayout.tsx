import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, LogOut, ChevronDown, Home, Users, MessageSquare, FileText, CreditCard } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-[#3d7dd8]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  if (!user) return <Navigate to="/portal/login" replace />;

  if (!parentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3d7dd8]">
        <div className="text-center max-w-md px-4 bg-white rounded-xl py-5">
          <h1 className="text-base font-bold text-foreground mb-1">Account Not Found</h1>
          <p className="text-xs text-muted-foreground mb-3">
            Your account is not linked to any student record. Please contact the school administration.
          </p>
          <Button onClick={signOut} variant="outline" size="sm">
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const firstName = parentAccount.parent_name.split(" ")[0];
  const bottomNavItems = [
    { icon: Home, label: "Dashboard", path: "/portal" },
    { icon: Users, label: "My Children", path: "/portal/profile" },
    { icon: MessageSquare, label: "Messages", path: "/portal/messages", badge: unreadCount },
    { icon: FileText, label: "Documents", path: "/portal/documents" },
    { icon: CreditCard, label: "Fees", path: "/portal/fees" },
  ];

  return (
    <div className="min-h-screen bg-[#3d7dd8] p-0 md:p-5">
      <div className="bg-white md:rounded-2xl overflow-hidden md:shadow-2xl min-h-screen md:min-h-[calc(100vh-2.5rem)] flex">
        <ParentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={currentStudent} unreadCount={unreadCount} />

        <div className="flex-1 lg:ml-56 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between px-3 md:px-5 h-14 border-b border-border/40 bg-white gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <img src={schoolCrest} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-border" />
              <div className="leading-tight hidden sm:block">
                <p className="text-[13px] font-bold text-foreground">Good Shepherd</p>
                <p className="text-[10px] text-muted-foreground">School</p>
              </div>
            </div>

            {/* Center: Parent / Student selector */}
            <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
              {students.length > 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 border border-border/60 rounded-full pl-0.5 pr-3 py-0.5 hover:bg-muted/40 transition-colors max-w-[180px]">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-[10px] font-semibold text-foreground">{firstName[0]}</span>
                      </div>
                      <span className="text-[12px] font-semibold text-foreground truncate">{firstName}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground">Switch Student</div>
                    <DropdownMenuSeparator />
                    {students.map(s => (
                      <DropdownMenuItem key={s.id} onClick={() => setCurrentStudent(s)} className={currentStudent?.id === s.id ? "bg-accent" : ""}>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {s.photo_url ? (
                              <img src={s.photo_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-semibold">{s.first_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-[11.5px] font-medium">{s.first_name} {s.surname}</p>
                            <p className="text-[9.5px] text-muted-foreground">{s.current_class}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2 border border-border/60 rounded-full pl-0.5 pr-3 py-0.5">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-foreground">{firstName[0]}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-foreground">{firstName}</span>
                </div>
              )}
            </div>

            {/* Right: Student info + Bell */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {currentStudent && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-1 ring-border">
                    {currentStudent.photo_url ? (
                      <img src={currentStudent.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-primary">{currentStudent.first_name[0]}{currentStudent.surname[0]}</span>
                    )}
                  </div>
                  <div className="hidden md:block leading-tight">
                    <p className="text-[12px] font-semibold text-foreground">{currentStudent.first_name} {currentStudent.surname}</p>
                    <p className="text-[10px] text-muted-foreground">{currentStudent.current_class}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/portal/announcements")}
                className="relative h-8 w-8 rounded-full hover:bg-muted/60 flex items-center justify-center"
              >
                <Bell className="h-[18px] w-[18px] text-foreground/80" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          <main className="flex-1 p-3 md:p-5 pb-20 lg:pb-5 bg-white overflow-auto">
            <Outlet />
          </main>

          {/* Mobile Bottom Nav */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border/60 shadow-lg">
            <div className="flex items-center justify-around h-14">
              {bottomNavItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1 relative transition-colors ${
                      isActive ? "text-[#1a3563]" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.3 : 1.8} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute top-0 right-2 h-3.5 min-w-[14px] px-0.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
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
    </div>
  );
};

export default ParentLayout;
