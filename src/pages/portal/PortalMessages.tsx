import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PortalMessages = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />Messages
      </h1>
      <p className="text-sm text-muted-foreground">Communicate with school administration</p>
    </div>
    <Card><CardContent className="py-12 text-center">
      <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Messaging feature coming soon</p>
    </CardContent></Card>
  </div>
);

export default PortalMessages;
