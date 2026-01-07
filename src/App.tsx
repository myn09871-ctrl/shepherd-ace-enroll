import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ParentAuthProvider } from "@/hooks/useParentAuth";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import AdmissionForm from "./pages/AdmissionForm";
import NotFound from "./pages/NotFound";

// Admin imports - cleaned up
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Applications from "./pages/admin/Applications";
import ApplicationDetail from "./pages/admin/ApplicationDetail";
import Students from "./pages/admin/Students";
import Results from "./pages/admin/Results";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";
import Content from "./pages/admin/Content";
import Messages from "./pages/admin/Messages";
import Settings from "./pages/admin/Settings";

// Parent Portal imports - cleaned up
import PortalLogin from "./pages/portal/PortalLogin";
import ParentLayout from "./components/parent/ParentLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalAcademics from "./pages/portal/PortalAcademics";
import PortalAnnouncements from "./pages/portal/PortalAnnouncements";
import PortalDocuments from "./pages/portal/PortalDocuments";
import PortalTimetable from "./pages/portal/PortalTimetable";
import PortalMessages from "./pages/portal/PortalMessages";
import PortalProfile from "./pages/portal/PortalProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ParentAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/admission" element={<AdmissionForm />} />
              
              {/* Admin Routes - Cleaned */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="applications" element={<Applications />} />
                <Route path="applications/:id" element={<ApplicationDetail />} />
                <Route path="students" element={<Students />} />
                <Route path="results" element={<Results />} />
                <Route path="announcements" element={<AnnouncementsManagement />} />
                <Route path="content" element={<Content />} />
                <Route path="messages" element={<Messages />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Parent Portal Routes - Cleaned */}
              <Route path="/portal/login" element={<PortalLogin />} />
              <Route path="/portal" element={<ParentLayout />}>
                <Route index element={<PortalDashboard />} />
                <Route path="academics" element={<PortalAcademics />} />
                <Route path="announcements" element={<PortalAnnouncements />} />
                <Route path="documents" element={<PortalDocuments />} />
                <Route path="timetable" element={<PortalTimetable />} />
                <Route path="messages" element={<PortalMessages />} />
                <Route path="profile" element={<PortalProfile />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ParentAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
