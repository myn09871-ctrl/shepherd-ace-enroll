import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_name: string;
  due_date: string | null;
  term: string | null;
  created_at: string;
}

const PortalAssignments = () => {
  const { currentStudent } = useParentAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!currentStudent) return;
    supabase
      .from("assignments")
      .select("*")
      .eq("class_name", currentStudent.current_class)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAssignments((data || []) as Assignment[]));
  }, [currentStudent]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BookOpen className="h-6 w-6" /> Assignments
      </h1>

      {assignments.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No assignments yet</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  {a.due_date && (
                    <Badge variant={new Date(a.due_date) < new Date() ? "destructive" : "outline"}>
                      Due: {format(new Date(a.due_date), "PPP")}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                <p className="text-xs text-muted-foreground mt-2">{a.term}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalAssignments;
