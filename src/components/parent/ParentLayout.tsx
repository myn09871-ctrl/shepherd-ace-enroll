import { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  Home,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ParentSidebar from "./ParentSidebar";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import schoolCrest from "@/assets/school-crest.jpeg";

const ParentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const {
    user,
    loading,
    parentAccount,
    currentStudent,
    students,
    setCurrentStudent,
    signOut,
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
      <div className="dashboard-shell flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/portal/login" replace />;

  if (!parentAccount) {
    return (
      <div className="dashboard-shell flex min-h-screen items-center justify-center px-4">
        <div className="parent-card w-full max-w-md rounded-2xl px-5 py-6 text-center">
          <h1 className="text-sm font-bold text-foreground">Account Not Found</h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Your account is not linked to any student record. Please contact the school administration.
          </p>
          <Button onClick={signOut} variant="outline" size="sm" className="mt-4">
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const selectedStudent = currentStudent ?? students[0] ?? null;
  const selectedStudentName = selectedStudent
    ? `${selectedStudent.first_name} ${selectedStudent.surname}`
    : "Select Student";

  const bottomNavItems = [
    { icon: Home, label: "Dashboard", path: "/portal" },
    { icon: Users, label: "My Children", path: "/portal/profile" },
    { icon: MessageSquare, label: "Messages", path: "/portal/messages", badge: unreadCount },
    { icon: FileText, label: "Documents", path: "/portal/documents" },
    { icon: CreditCard, label: "Fees", path: "/portal/fees" },
  ];

  return (
    <div className="dashboard-shell min-h-screen p-0 md:p-5">
      <div className="dashboard-frame flex min-h-screen overflow-hidden md:min-h-[calc(100vh-2.5rem)] md:rounded-[24px]">
        <ParentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          student={currentStudent}
          unreadCount={unreadCount}
        />

        <div className="flex min-w-0 flex-1 flex-col lg:ml-56">
          <header className="dashboard-topbar flex h-[64px] items-center justify-between gap-2 px-3 md:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              <p className="hidden text-[11px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--dashboard-ink))] md:block">
                GOOD SHEPHERD INTERNATIONAL SCHOOL
              </p>
            </div>

            <div className="flex min-w-0 flex-1 justify-center">
              {students.length > 1 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="dashboard-compact-card flex w-full max-w-[240px] items-center gap-2 rounded-full px-2 py-1.5 text-left transition-colors hover:bg-card">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {selectedStudent?.photo_url ? (
                          <img
                            src={selectedStudent.photo_url}
                            alt={selectedStudentName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span>{selectedStudent?.first_name?.[0] ?? "S"}</span>
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-[hsl(var(--dashboard-ink))]">
                        {selectedStudentName}
                      </span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-[280px] rounded-2xl p-1.5">
                    {students.map((student) => {
                      const isActive = selectedStudent?.id === student.id;
                      return (
                        <DropdownMenuItem
                          key={student.id}
                          onClick={() => setCurrentStudent(student)}
                          className={`rounded-xl px-2 py-2 ${isActive ? "bg-accent/60" : ""}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                              {student.photo_url ? (
                                <img
                                  src={student.photo_url}
                                  alt={`${student.first_name} ${student.surname}`}
                                  className="h-9 w-9 rounded-full object-cover"
                                />
                              ) : (
                                <span>{student.first_name[0]}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-semibold text-foreground">
                                {student.first_name} {student.surname}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{student.current_class}</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={() => navigate("/portal/profile")} className="rounded-xl px-2 py-2 text-[12px] font-semibold">
                      Manage My Children
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="dashboard-compact-card flex w-full max-w-[240px] items-center gap-2 rounded-full px-2 py-1.5 shadow-sm">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {selectedStudent?.photo_url ? (
                      <img
                        src={selectedStudent.photo_url}
                        alt={selectedStudentName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span>{selectedStudent?.first_name?.[0] ?? "S"}</span>
                    )}
                  </div>
                  <span className="truncate text-[11.5px] font-semibold text-[hsl(var(--dashboard-ink))]">{selectedStudentName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/portal/announcements")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-card shadow-sm transition-colors hover:bg-muted"
              >
                <Bell className="h-[18px] w-[18px] text-[hsl(var(--dashboard-ink))]" strokeWidth={1.9} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[hsl(var(--dashboard-badge))] px-1 text-[9px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-transparent px-3 py-3 pb-20 md:px-5 md:py-5 lg:pb-5">
            <div className="dashboard-route-shell">
              <Outlet />
            </div>
          </main>

          <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[hsl(var(--parent-card-border))] bg-card/95 backdrop-blur lg:hidden">
            <div className="flex h-15 items-center justify-around px-1 py-1">
              {bottomNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-colors ${
                      isActive ? "text-primary" : "text-[hsl(var(--dashboard-soft-ink))]"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.9} />
                    <span className="max-w-[62px] truncate text-[10px] font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[hsl(var(--dashboard-badge))] px-0.5 text-[8px] font-bold text-primary-foreground">
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
