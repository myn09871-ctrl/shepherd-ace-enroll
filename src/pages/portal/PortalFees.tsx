import { useState, useEffect } from "react";
import { CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const PortalFees = () => {
  const { student } = useParentAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) fetchFees();
  }, [student]);

  const fetchFees = async () => {
    if (!student) return;
    const { data } = await supabase.from("fees").select("*").eq("student_id", student.id).order("created_at", { ascending: false });
    setFees(data || []);
    setLoading(false);
  };

  const totalFees = fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const paidFees = fees.filter(f => f.is_paid).reduce((sum, f) => sum + Number(f.amount), 0);
  const pendingFees = totalFees - paidFees;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Fees & Payments
        </h1>
        <p className="text-sm text-muted-foreground">View fee breakdown and payment history</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">GH₵{totalFees.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Fees</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">GH₵{paidFees.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Paid</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className={`text-2xl font-bold ${pendingFees > 0 ? 'text-red-600' : 'text-green-600'}`}>
            GH₵{pendingFees.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Outstanding</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Fee Details</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : fees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No fee records</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="capitalize">{fee.fee_type.replace(/_/g, " ")}</TableCell>
                    <TableCell>GH₵{Number(fee.amount).toLocaleString()}</TableCell>
                    <TableCell>{fee.due_date ? format(new Date(fee.due_date), "MMM d, yyyy") : "—"}</TableCell>
                    <TableCell>
                      {fee.is_paid ? (
                        <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalFees;
