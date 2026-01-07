import { GraduationCap, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Results = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">Results Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage student academic results and report cards</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The results management module is under development. You'll be able to post grades, 
            generate report cards, and track academic performance here.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expected: Next Academic Term</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Results;
