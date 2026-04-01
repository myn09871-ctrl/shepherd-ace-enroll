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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/teacher/login" replace />;

  if (!teacherProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground mb-1">Access Denied</h1>
          <p className="text-sm text-muted-foreground">You don't have teacher permissions.</p>
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
    <div className="min-h-screen bg-[#dce6f0]">
      <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border/60">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <p className="text-[13px] font-medium text-foreground">
                Welcome, Mr. {lastName}!
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">3</span>
              </Button>
              <button onClick={() => navigate("/teacher/profile")} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Avatar className="h-7 w-7">
                  {teacherProfile.avatar_url && <AvatarImage src={teacherProfile.avatar_url} alt={name} />}
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-[12px] font-medium text-foreground hidden sm:block">Mr. {lastName}</span>
              </button>
              <Button
                size="sm"
                onClick={handleLogout}
                className="ml-1 text-[11px] h-7 px-3 gap-1 rounded-md bg-[#1a3563] hover:bg-[#152d52] text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
