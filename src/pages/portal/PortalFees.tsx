import { useState, useEffect } from "react";
import { CreditCard, Check, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";

interface Fee {
  id: string;
  academic_year: string;
  term: string | null;
  fee_type: string;
  amount: number;
  is_paid: boolean;
  payment_date: string | null;
  description: string | null;
}

const PortalFees = () => {
  const { currentStudent: student } = useParentAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (student) fetchFees();
  }, [student]);

  const fetchFees = async () => {
    if (!student) return;
    try {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .eq("student_id", student.id)
        .order("academic_year", { ascending: false })
        .order("term", { ascending: false });

      if (error) throw error;
      setFees(data || []);
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (fee: Fee) => {
    if (fee.is_paid) return "paid";
    if (fee.description?.toLowerCase().includes("partial")) return "partial";
    return "unpaid";
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          icon: Check,
          className: "bg-green-100 text-green-800",
          iconColor: "text-green-600",
        };
      case "partial":
        return {
          label: "Partially Paid",
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800",
          iconColor: "text-yellow-600",
        };
      default:
        return {
          label: "Not Paid",
          icon: AlertCircle,
          className: "bg-red-100 text-red-800",
          iconColor: "text-red-600",
        };
    }
  };

  const totalDue = fees.filter((f) => !f.is_paid).reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter((f) => f.is_paid).reduce((sum, f) => sum + f.amount, 0);

  // Group fees by academic year and term
  const groupedFees = fees.reduce((acc, fee) => {
    const key = `${fee.academic_year} - Term ${fee.term || "N/A"}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(fee);
    return acc;
  }, {} as Record<string, Fee[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Fee Status
        </h1>
        <p className="text-sm text-muted-foreground">View your fee payment status</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Total Paid</p>
                    <p className="text-lg font-bold text-green-800">
                      GH₵ {totalPaid.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${totalDue > 0 ? "from-red-50 to-red-100 border-red-200" : "from-gray-50 to-gray-100 border-gray-200"}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${totalDue > 0 ? "bg-red-500/20" : "bg-gray-500/20"}`}>
                    <AlertCircle className={`h-5 w-5 ${totalDue > 0 ? "text-red-600" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <p className={`text-xs ${totalDue > 0 ? "text-red-700" : "text-gray-700"}`}>Outstanding</p>
                    <p className={`text-lg font-bold ${totalDue > 0 ? "text-red-800" : "text-gray-800"}`}>
                      GH₵ {totalDue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fee Records */}
          {fees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No fee records found</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedFees).map(([period, periodFees]) => (
              <Card key={period}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{period}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {periodFees.map((fee) => {
                    const status = getPaymentStatus(fee);
                    const statusDetails = getStatusDetails(status);
                    const StatusIcon = statusDetails.icon;

                    return (
                      <div
                        key={fee.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${status === "paid" ? "bg-green-100" : status === "partial" ? "bg-yellow-100" : "bg-red-100"}`}>
                            <StatusIcon className={`h-4 w-4 ${statusDetails.iconColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm capitalize">{fee.fee_type}</p>
                            {fee.description && (
                              <p className="text-xs text-muted-foreground">{fee.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">GH₵ {fee.amount.toLocaleString()}</p>
                          <Badge className={statusDetails.className}>
                            {statusDetails.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default PortalFees;
