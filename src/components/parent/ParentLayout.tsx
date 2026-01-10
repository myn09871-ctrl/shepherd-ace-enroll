import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Menu, Bell, LogOut, ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ParentSidebar from "./ParentSidebar";
import { useParentAuth } from "@/hooks/useParentAuth";

const ParentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    user,
    loading,
    parentAccount,
    currentStudent,
    students,
    setCurrentStudent,
    signOut,
  } = useParentAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal/login" replace />;
  }

  if (!parentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Your account is not linked to any student record. Please contact the school administration.
          </p>
          <Button onClick={signOut} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ParentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        student={currentStudent}
      />

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between px-4 h-16">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              {/* Student Switcher - only show if multiple students */}
              {students.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {currentStudent?.first_name}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Switch Student
                    </div>
                    <DropdownMenuSeparator />
                    {students.map((student) => (
                      <DropdownMenuItem
                        key={student.id}
                        onClick={() => setCurrentStudent(student)}
                        className={currentStudent?.id === student.id ? "bg-accent" : ""}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {student.first_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {student.first_name} {student.surname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student.current_class}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>

              <div className="text-sm hidden sm:block">
                <p className="font-medium text-foreground">{parentAccount?.parent_name}</p>
                <p className="text-xs text-muted-foreground">{currentStudent?.student_id}</p>
              </div>
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

export default ParentLayout;
