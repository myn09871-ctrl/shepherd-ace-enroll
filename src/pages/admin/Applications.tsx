import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Eye, Check, X, MessageSquare, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/admin/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInYears } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  reference_number: string;
  student_first_name: string;
  student_surname: string;
  student_dob: string;
  program_level: string;
  status: string;
  created_at: string;
}

const Applications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [programFilter, setProgramFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, programFilter]);

  const fetchApplications = async () => {
    try {
      let query = supabase
        .from("enrollment_applications")
        .select("id, reference_number, student_first_name, student_surname, student_dob, program_level, status, created_at")
        .order("created_at", { ascending: false });

      // Status filter logic
      if (statusFilter === "active") {
        // Active = all except archived
        query = query.neq("status", "archived");
      } else if (statusFilter === "archived") {
        query = query.eq("status", "archived");
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (programFilter !== "all") {
        query = query.eq("program_level", programFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("enrollment_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Application has been ${newStatus === "archived" ? "archived" : `marked as ${newStatus}`}`,
      });

      fetchApplications();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApp) return;

    try {
      // First delete related admin notes
      await supabase
        .from("admin_notes")
        .delete()
        .eq("application_id", selectedApp.id);

      // Then delete the application
      const { error } = await supabase
        .from("enrollment_applications")
        .delete()
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast({
        title: "Application Deleted",
        description: "The application has been permanently deleted",
      });

      setDeleteDialogOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete application",
        variant: "destructive",
      });
    }
  };

  const filteredApplications = applications.filter((app) => {
    const fullName = `${app.student_first_name} ${app.student_surname}`.toLowerCase();
    const refNumber = app.reference_number.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || refNumber.includes(query);
  });

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground mt-1">Manage enrollment applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or reference number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active (Not Archived)</SelectItem>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">New</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            <SelectItem value="Creche">Creche</SelectItem>
            <SelectItem value="Nursery">Nursery</SelectItem>
            <SelectItem value="Kindergarten">Kindergarten</SelectItem>
            <SelectItem value="Primary">Primary</SelectItem>
            <SelectItem value="JHS">JHS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No applications found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id} className={app.status === "archived" ? "opacity-60" : ""}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.student_first_name} {app.student_surname}
                    </TableCell>
                    <TableCell>{calculateAge(app.student_dob)} yrs</TableCell>
                    <TableCell>{app.program_level}</TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="View Details">
                          <Link to={`/admin/applications/${app.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {app.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateStatus(app.id, "approved")}
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => updateStatus(app.id, "rejected")}
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {app.status !== "archived" && app.status !== "enrolled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => updateStatus(app.id, "archived")}
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        {(app.status === "archived" || app.status === "rejected") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setSelectedApp(app);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Message">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the application for{" "}
              <strong>{selectedApp?.student_first_name} {selectedApp?.student_surname}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Applications;
