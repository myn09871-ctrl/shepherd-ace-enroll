import { useEffect, useState } from "react";
import { Download, TrendingUp, Users, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/admin/StatsCard";
import { supabase } from "@/integrations/supabase/client";

interface ProgramStats {
  program: string;
  count: number;
}

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalEnrolled, setTotalEnrolled] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [programStats, setProgramStats] = useState<ProgramStats[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Get total applications
      const { count: total } = await supabase
        .from("enrollment_applications")
        .select("*", { count: "exact", head: true });

      // Get enrolled count
      const { count: enrolled } = await supabase
        .from("enrollment_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "enrolled");

      // Get applications by program
      const { data: programs } = await supabase
        .from("enrollment_applications")
        .select("program_level");

      const programCounts: Record<string, number> = {};
      programs?.forEach((p) => {
        programCounts[p.program_level] = (programCounts[p.program_level] || 0) + 1;
      });

      const stats = Object.entries(programCounts).map(([program, count]) => ({
        program,
        count,
      }));

      setTotalApplications(total || 0);
      setTotalEnrolled(enrolled || 0);
      setConversionRate(total ? Math.round(((enrolled || 0) / total) * 100) : 0);
      setProgramStats(stats);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (type: string) => {
    // In production, this would trigger actual data export
    console.log("Exporting:", type);
  };

  const maxCount = Math.max(...programStats.map((p) => p.count), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics and data exports</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Applications"
          value={totalApplications}
          icon={FileText}
          variant="info"
        />
        <StatsCard
          title="Total Enrolled"
          value={totalEnrolled}
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          variant="default"
        />
        <StatsCard
          title="Programs Offered"
          value={programStats.length}
          icon={BarChart3}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications by Program */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-6">Applications by Program</h3>
          <div className="space-y-4">
            {programStats.map((stat) => (
              <div key={stat.program}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{stat.program}</span>
                  <span className="font-medium">{stat.count}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(stat.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-6">Application Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: "Pending", value: 45, color: "bg-blue-500" },
              { label: "Under Review", value: 30, color: "bg-yellow-500" },
              { label: "Approved", value: 20, color: "bg-green-500" },
              { label: "Rejected", value: 5, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Export Reports</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => exportData("applications")}>
            <Download className="h-4 w-4 mr-2" />
            Download Applications
          </Button>
          <Button variant="outline" onClick={() => exportData("students")}>
            <Download className="h-4 w-4 mr-2" />
            Download Enrolled Students
          </Button>
          <Button variant="outline" onClick={() => exportData("contacts")}>
            <Download className="h-4 w-4 mr-2" />
            Download Contact Info
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
