import { useState, useEffect } from "react";
import { Mail, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeacherAuth } from "@/hooks/useTeacherAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ParentInfo {
  id: string;
  parent_name: string;
  email: string;
  student_id: string;
  student_name: string;
  class_name: string;
}

const TeacherMessages = () => {
  const { user, assignedClasses } = useTeacherAuth();
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedParent, setSelectedParent] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    if (assignedClasses.length === 0) return;
    const classNames = assignedClasses.map(c => c.class_name);
    supabase
      .from("students")
      .select("id, first_name, surname, current_class")
      .in("current_class", classNames)
      .eq("status", "active")
      .then(async ({ data: students }) => {
        if (!students || students.length === 0) return;
        const { data: parentData } = await supabase
          .from("parent_accounts")
          .select("id, parent_name, email, student_id")
          .in("student_id", students.map(s => s.id));
        const mapped = (parentData || []).map((p: any) => {
          const student = students.find(s => s.id === p.student_id);
          return {
            ...p,
            student_name: student ? `${student.first_name} ${student.surname}` : "",
            class_name: student?.current_class || "",
          };
        });
        setParents(mapped);
      });
  }, [assignedClasses]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("parent_messages")
      .select("*")
      .or(`sender_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setMessages(data || []));
  }, [user]);

  const handleSend = async () => {
    if (!user || !subject || !message) return;
    setSending(true);

    const targetParents = selectedParent
      ? parents.filter(p => p.id === selectedParent)
      : selectedClass
        ? parents.filter(p => p.class_name === selectedClass)
        : [];

    if (targetParents.length === 0) {
      toast.error("Please select a recipient");
      setSending(false);
      return;
    }

    const records = targetParents.map(p => ({
      parent_account_id: p.id,
      student_id: p.student_id,
      sender_id: user.id,
      sender_type: "teacher",
      recipient_type: "parent",
      subject,
      message,
    }));

    const { error } = await supabase.from("parent_messages").insert(records);
    if (error) toast.error("Failed to send");
    else {
      toast.success(`Message sent to ${targetParents.length} parent(s)`);
      setSubject(""); setMessage(""); setSelectedParent("");
    }
    setSending(false);
  };

  const filteredParents = selectedClass
    ? parents.filter(p => p.class_name === selectedClass)
    : parents;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Mail className="h-6 w-6" /> Messages
      </h1>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="sent">Sent ({messages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader><CardTitle className="text-lg">New Message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Filter by Class</Label>
                  <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedParent(""); }}>
                    <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {assignedClasses.map(c => <SelectItem key={c.id} value={c.class_name}>{c.class_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recipient</Label>
                  <Select value={selectedParent} onValueChange={setSelectedParent}>
                    <SelectTrigger><SelectValue placeholder="All in class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Entire Class</SelectItem>
                      {filteredParents.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.parent_name} ({p.student_name})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
              <div><Label>Message</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} /></div>
              <Button onClick={handleSend} disabled={sending}>
                <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "Send Message"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No messages sent yet</CardContent></Card>
            ) : messages.map((m: any) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{m.subject}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.message}</p>
                    </div>
                    <Badge variant={m.is_read ? "secondary" : "default"} className="text-xs">
                      {m.is_read ? "Read" : "Sent"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{format(new Date(m.created_at), "PPP p")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherMessages;
