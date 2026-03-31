import { useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/teacher/login" replace />;

  if (!teacherProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have teacher permissions.</p>
        </div>
      </div>
    );
  }

  const name = teacherProfile.full_name || "Teacher";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const lastName = name.split(" ").slice(-1)[0];

  const handleLogout = async () => {
    await signOut();
    navigate("/teacher/login");
  };

  return (
    <div className="min-h-screen bg-blue-50/30">
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <p className="text-sm font-medium text-foreground hidden sm:block">
                Welcome, {lastName}!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
              <button onClick={() => navigate("/teacher/profile")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8">
                  {teacherProfile.avatar_url && <AvatarImage src={teacherProfile.avatar_url} alt={name} />}
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium text-foreground hidden sm:block">{name}</p>
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="ml-1 text-xs gap-1.5 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
