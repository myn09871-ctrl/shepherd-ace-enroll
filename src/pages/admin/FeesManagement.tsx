import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, DollarSign, Check } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  surname: string;
  current_class: string;
}

interface Fee {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  description: string | null;
  academic_year: string;
  term: string | null;
  due_date: string | null;
  is_paid: boolean;
  payment_date: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  student?: Student;
}

const FeesManagement = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    student_id: "",
    fee_type: "tuition",
    amount: "",
    description: "",
    academic_year: "2024/2025",
    term: "Term 1",
    due_date: "",
    is_paid: false,
    payment_method: "",
    receipt_number: "",
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      // Fetch students
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, student_id, first_name, surname, current_class")
        .eq("status", "active")
        .order("surname", { ascending: true });

      if (studentError) throw studentError;
      setStudents(studentData || []);

      // Fetch fees with student info
      let feeQuery = supabase
        .from("fees")
        .select(`
          *,
          student:students (
            id,
            student_id,
            first_name,
            surname,
            current_class
          )
        `)
        .order("created_at", { ascending: false });

      if (statusFilter === "paid") {
        feeQuery = feeQuery.eq("is_paid", true);
      } else if (statusFilter === "unpaid") {
        feeQuery = feeQuery.eq("is_paid", false);
      }

      const { data: feeData, error: feeError } = await feeQuery;
      if (feeError) throw feeError;
      setFees(feeData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = fees.filter((fee) => {
    if (!fee.student) return false;
    const fullName = `${fee.student.first_name} ${fee.student.surname}`.toLowerCase();
    const studentId = fee.student.student_id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || studentId.includes(query);
  });

  const openCreateDialog = () => {
    setEditingFee(null);
    setForm({
      student_id: "",
      fee_type: "tuition",
      amount: "",
      description: "",
      academic_year: "2024/2025",
      term: "Term 1",
      due_date: "",
      is_paid: false,
      payment_method: "",
      receipt_number: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (fee: Fee) => {
    setEditingFee(fee);
    setForm({
      student_id: fee.student_id,
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      description: fee.description || "",
      academic_year: fee.academic_year,
      term: fee.term || "Term 1",
      due_date: fee.due_date || "",
      is_paid: fee.is_paid,
      payment_method: fee.payment_method || "",
      receipt_number: fee.receipt_number || "",
    });
    setIsDialogOpen(true);
  };

  const saveFee = async () => {
    if (!form.student_id || !form.amount) {
      toast({
        title: "Missing Information",
        description: "Please select a student and enter amount",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const feeData = {
        student_id: form.student_id,
        fee_type: form.fee_type,
        amount: parseFloat(form.amount),
        description: form.description || null,
        academic_year: form.academic_year,
        term: form.term || null,
        due_date: form.due_date || null,
        is_paid: form.is_paid,
        payment_date: form.is_paid ? new Date().toISOString().split("T")[0] : null,
        payment_method: form.is_paid ? form.payment_method || null : null,
        receipt_number: form.is_paid ? form.receipt_number || null : null,
      };

      if (editingFee) {
        const { error } = await supabase.from("fees").update(feeData).eq("id", editingFee.id);
        if (error) throw error;
        toast({ title: "Fee Updated" });
      } else {
        const { error } = await supabase.from("fees").insert(feeData);
        if (error) throw error;
        toast({ title: "Fee Created" });
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving fee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save fee",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (fee: Fee) => {
    try {
      const { error } = await supabase
        .from("fees")
        .update({
          is_paid: true,
          payment_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", fee.id);

      if (error) throw error;
      toast({ title: "Marked as Paid" });
      fetchData();
    } catch (error) {
      console.error("Error updating fee:", error);
      toast({
        title: "Error",
        description: "Failed to update fee",
        variant: "destructive",
      });
    }
  };

  const deleteFee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee record?")) return;

    try {
      const { error } = await supabase.from("fees").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Fee Deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast({
        title: "Error",
        description: "Failed to delete fee",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Fees Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage student fees and payments</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fees List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredFees.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No fee records found</p>
          <Button className="mt-4" onClick={openCreateDialog}>
            Add First Fee
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Student</th>
                <th className="text-left p-4 font-medium text-sm hidden md:table-cell">Fee Type</th>
                <th className="text-left p-4 font-medium text-sm">Amount</th>
                <th className="text-left p-4 font-medium text-sm hidden lg:table-cell">Due Date</th>
                <th className="text-center p-4 font-medium text-sm">Status</th>
                <th className="text-right p-4 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-sm">
                        {fee.student?.first_name} {fee.student?.surname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fee.student?.current_class} • {fee.student?.student_id}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm capitalize">{fee.fee_type}</span>
                    {fee.description && (
                      <p className="text-xs text-muted-foreground">{fee.description}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-sm">{formatCurrency(fee.amount)}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {fee.due_date ? (
                      <span className="text-sm">
                        {format(new Date(fee.due_date), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        fee.is_paid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {fee.is_paid ? "Paid" : "Unpaid"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {!fee.is_paid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsPaid(fee)}
                          title="Mark as Paid"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(fee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFee(fee.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Fee" : "Add Fee"}</DialogTitle>
            <DialogDescription>
              {editingFee ? "Update fee details" : "Create a new fee record for a student"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={form.student_id}
                onValueChange={(value) => setForm({ ...form, student_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.surname} ({student.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee Type</Label>
                <Select
                  value={form.fee_type}
                  onValueChange={(value) => setForm({ ...form, fee_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="uniform">Uniform</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="examination">Examination</SelectItem>
                    <SelectItem value="extracurricular">Extracurricular</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (GHS) *</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Fee description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select
                  value={form.academic_year}
                  onValueChange={(value) => setForm({ ...form, academic_year: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024/2025">2024/2025</SelectItem>
                    <SelectItem value="2025/2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_paid"
                checked={form.is_paid}
                onCheckedChange={(checked) => setForm({ ...form, is_paid: checked as boolean })}
              />
              <Label htmlFor="is_paid" className="text-sm">
                Mark as paid
              </Label>
            </div>

            {form.is_paid && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={form.payment_method}
                    onValueChange={(value) => setForm({ ...form, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Receipt Number</Label>
                  <Input
                    value={form.receipt_number}
                    onChange={(e) => setForm({ ...form, receipt_number: e.target.value })}
                    placeholder="RCP-001"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveFee} disabled={saving}>
              {saving ? "Saving..." : editingFee ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesManagement;
