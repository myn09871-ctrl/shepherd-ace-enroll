import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  academic_year: string;
  term: string | null;
  fee_type: string;
  amount: number;
  is_paid: boolean;
  payment_date: string | null;
  payment_method: string | null;
  description: string | null;
  students?: Student;
}

const feeStatuses = [
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-800" },
  { value: "partial", label: "Partially Paid", color: "bg-yellow-100 text-yellow-800" },
  { value: "unpaid", label: "Not Paid", color: "bg-red-100 text-red-800" },
];

const currentYear = new Date().getFullYear().toString();

const FeesManagement = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    academic_year: currentYear,
    term: "1",
    fee_type: "tuition",
    amount: "",
    is_paid: false,
    payment_method: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        supabase
          .from("fees")
          .select("*, students(id, student_id, first_name, surname, current_class)")
          .order("created_at", { ascending: false }),
        supabase
          .from("students")
          .select("id, student_id, first_name, surname, current_class")
          .eq("status", "active")
          .order("surname"),
      ]);

      if (feesRes.error) throw feesRes.error;
      if (studentsRes.error) throw studentsRes.error;

      setFees(feesRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load fees data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.student_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const feeData = {
        student_id: formData.student_id,
        academic_year: formData.academic_year,
        term: formData.term,
        fee_type: formData.fee_type,
        amount: parseFloat(formData.amount),
        is_paid: formData.is_paid,
        payment_method: formData.payment_method || null,
        description: formData.description || null,
        payment_date: formData.is_paid ? new Date().toISOString().split("T")[0] : null,
      };

      if (editingFee) {
        const { error } = await supabase
          .from("fees")
          .update(feeData)
          .eq("id", editingFee.id);
        if (error) throw error;
        toast.success("Fee updated successfully");
      } else {
        const { error } = await supabase.from("fees").insert(feeData);
        if (error) throw error;
        toast.success("Fee added successfully");
      }

      setShowDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving fee:", error);
      toast.error("Failed to save fee");
    }
  };

  const updatePaymentStatus = async (fee: Fee, newStatus: string) => {
    try {
      const is_paid = newStatus === "paid";
      const { error } = await supabase
        .from("fees")
        .update({
          is_paid,
          payment_date: is_paid ? new Date().toISOString().split("T")[0] : null,
          description: newStatus === "partial" ? "Partially paid" : fee.description,
        })
        .eq("id", fee.id);

      if (error) throw error;
      toast.success("Payment status updated");
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const openEditDialog = (fee: Fee) => {
    setEditingFee(fee);
    setFormData({
      student_id: fee.student_id,
      academic_year: fee.academic_year,
      term: fee.term || "1",
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      is_paid: fee.is_paid,
      payment_method: fee.payment_method || "",
      description: fee.description || "",
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingFee(null);
    setFormData({
      student_id: "",
      academic_year: currentYear,
      term: "1",
      fee_type: "tuition",
      amount: "",
      is_paid: false,
      payment_method: "",
      description: "",
    });
  };

  const getPaymentStatus = (fee: Fee) => {
    if (fee.is_paid) return "paid";
    if (fee.description?.toLowerCase().includes("partial")) return "partial";
    return "unpaid";
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = feeStatuses.find((s) => s.value === status);
    return statusInfo ? (
      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
    ) : null;
  };

  const filteredFees = fees.filter((fee) => {
    const student = fee.students;
    const matchesSearch = student
      ? `${student.first_name} ${student.surname} ${student.student_id}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : false;
    const matchesStatus =
      statusFilter === "all" || getPaymentStatus(fee) === statusFilter;
    const matchesClass =
      classFilter === "all" || student?.current_class === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map((s) => s.current_class))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
            Fees Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student fee records and payment status
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Fee Record
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {feeStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fees Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No fee records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {fee.students?.first_name} {fee.students?.surname}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fee.students?.student_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{fee.students?.current_class}</TableCell>
                    <TableCell className="capitalize">{fee.fee_type}</TableCell>
                    <TableCell>GH₵ {fee.amount.toLocaleString()}</TableCell>
                    <TableCell>Term {fee.term}</TableCell>
                    <TableCell>{getStatusBadge(getPaymentStatus(fee))}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={getPaymentStatus(fee)}
                          onValueChange={(v) => updatePaymentStatus(fee, v)}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {feeStatuses.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(fee)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Fee" : "Add Fee Record"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Select
                value={formData.student_id}
                onValueChange={(v) => setFormData({ ...formData, student_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.first_name} {s.surname} ({s.current_class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Input
                  value={formData.academic_year}
                  onChange={(e) =>
                    setFormData({ ...formData, academic_year: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select
                  value={formData.term}
                  onValueChange={(v) => setFormData({ ...formData, term: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Term 1</SelectItem>
                    <SelectItem value="2">Term 2</SelectItem>
                    <SelectItem value="3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee Type</Label>
                <Select
                  value={formData.fee_type}
                  onValueChange={(v) => setFormData({ ...formData, fee_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="examination">Examination</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (GH₵) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add any notes about this fee..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingFee ? "Update" : "Add"} Fee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeesManagement;
