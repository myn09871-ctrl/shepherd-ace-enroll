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
      <div className="min-h-screen flex items-center justify-center bg-[#3d7dd8]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
      </div>
    );
  }

  if (!user) return <Navigate to="/teacher/login" replace />;

  if (!teacherProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#3d7dd8]">
        <div className="text-center bg-white rounded-xl px-6 py-5">
          <h1 className="text-base font-bold text-foreground mb-1">Access Denied</h1>
          <p className="text-xs text-muted-foreground">You don't have teacher permissions.</p>
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
    <div className="min-h-screen bg-[#3d7dd8] p-0 md:p-5">
      <div className="bg-white md:rounded-2xl overflow-hidden md:shadow-2xl min-h-screen md:min-h-[calc(100vh-2.5rem)] flex">
        <TeacherSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-56 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="flex items-center justify-between px-4 md:px-6 h-14 border-b border-border/40 bg-white">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-[15px] md:text-base font-bold text-foreground truncate">
                Welcome, Mr. {lastName}!
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative h-8 w-8 rounded-full hover:bg-muted/60 flex items-center justify-center">
                <Bell className="h-[18px] w-[18px] text-foreground/80" strokeWidth={1.75} />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">3</span>
              </button>

              <button
                onClick={() => navigate("/teacher/profile")}
                className="flex items-center gap-2 rounded-full border border-border/60 pl-1 pr-3 py-0.5 hover:bg-muted/40 transition-colors"
              >
                <Avatar className="h-7 w-7">
                  {teacherProfile.avatar_url && <AvatarImage src={teacherProfile.avatar_url} alt={name} />}
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-[12px] font-medium text-foreground hidden sm:block">Mr. {lastName}</span>
              </button>

              <Button
                size="sm"
                onClick={handleLogout}
                className="text-[12px] h-8 px-4 rounded-md bg-[#1a3563] hover:bg-[#152d52] text-white font-medium"
              >
                Logout
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 bg-white overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default TeacherLayout;
