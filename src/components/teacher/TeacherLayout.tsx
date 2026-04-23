import { useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import TeacherSidebar from "./TeacherSidebar";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, teacherProfile, signOut } = useTeacherAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="dashboard-shell flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/teacher/login" replace />;

  if (!teacherProfile) {
    return (
      <div className="dashboard-shell flex min-h-screen items-center justify-center px-4">
        <div className="dashboard-panel w-full max-w-sm rounded-2xl px-6 py-6 text-center">
          <h1 className="text-sm font-bold text-foreground">Access Denied</h1>
          <p className="mt-1 text-xs text-muted-foreground">You do not have teacher access for this portal.</p>
        </div>
      </div>
    );
  }

  const name = teacherProfile.full_name || "Teacher";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const lastName = name.split(" ").slice(-1)[0];

  const handleLogout = async () => {
    await signOut();
    navigate("/teacher/login");
  };

  return (
    <div className="dashboard-shell min-h-screen p-0 md:p-5">
      <div className="dashboard-frame flex min-h-screen overflow-hidden md:min-h-[calc(100vh-2.5rem)] md:rounded-[24px]">
        <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
          <header className="dashboard-topbar flex h-[64px] items-center justify-between px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="truncate text-[13px] font-bold uppercase tracking-[0.04em] text-[hsl(var(--dashboard-ink))] md:text-[14px]">
                Welcome, Mr. {lastName}!
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card transition-colors hover:bg-muted"
              >
                <Bell className="h-[18px] w-[18px] text-[hsl(var(--dashboard-ink))]" strokeWidth={1.9} />
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[hsl(var(--dashboard-badge))] px-1 text-[9px] font-bold text-primary-foreground">
                  3
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/teacher/profile")}
                className="flex items-center gap-2 rounded-full border border-border/80 bg-card px-1.5 py-1 shadow-sm transition-colors hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  {teacherProfile.avatar_url && <AvatarImage src={teacherProfile.avatar_url} alt={name} />}
                  <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                  <span className="hidden pr-1 text-[11px] font-semibold text-[hsl(var(--dashboard-ink))] sm:block">
                  Mr. {lastName}
                </span>
              </button>

              <Button
                size="sm"
                onClick={handleLogout}
                className="h-9 rounded-full px-4 text-[11px] font-semibold text-primary-foreground shadow-sm"
              >
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-transparent px-3 py-3 md:px-6 md:py-5">
            <div className="dashboard-route-shell">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;
