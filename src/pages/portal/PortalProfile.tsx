import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParentAuth } from "@/hooks/useParentAuth";

const PortalProfile = () => {
  const { parentAccount, currentStudent: student } = useParentAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />Profile Settings
        </h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Parent Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{parentAccount?.parent_name}</p></div>
          <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{parentAccount?.email}</p></div>
          <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{parentAccount?.phone_primary || "—"}</p></div>
          <div><p className="text-xs text-muted-foreground">Relationship</p><p className="font-medium capitalize">{parentAccount?.relationship}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Student Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{student?.first_name} {student?.surname}</p></div>
          <div><p className="text-xs text-muted-foreground">Student ID</p><p className="font-medium">{student?.student_id}</p></div>
          <div><p className="text-xs text-muted-foreground">Class</p><p className="font-medium">{student?.current_class}</p></div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalProfile;
