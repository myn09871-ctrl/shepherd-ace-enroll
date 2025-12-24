import { useState, useEffect } from "react";
import { Send, FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface SentEmail {
  id: string;
  recipient_email: string;
  subject: string;
  sent_at: string;
}

const Messages = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [recipientType, setRecipientType] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, emailsRes] = await Promise.all([
        supabase.from("email_templates").select("*").order("name"),
        supabase.from("sent_emails").select("*").order("sent_at", { ascending: false }).limit(50),
      ]);

      setTemplates(templatesRes.data || []);
      setSentEmails(emailsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setBody(template.body);
    toast({
      title: "Template Loaded",
      description: `"${template.name}" template has been loaded`,
    });
  };

  const handleSend = async () => {
    if (!subject || !body) {
      toast({
        title: "Missing Fields",
        description: "Please fill in subject and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    // Simulate sending - in production, you'd call an edge function
    setTimeout(() => {
      setSending(false);
      toast({
        title: "Email Queued",
        description: "Your message has been queued for sending",
      });
      setSubject("");
      setBody("");
      setCustomEmail("");
    }, 1500);
  };

  const formatTemplateName = (name: string) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">Send emails to parents and manage communications</p>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="sent">
            <History className="h-4 w-4 mr-2" />
            Sent Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recipients</label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_applicants">All Applicants</SelectItem>
                    <SelectItem value="all_enrolled">All Enrolled Parents</SelectItem>
                    <SelectItem value="pending_applicants">Pending Applicants</SelectItem>
                    <SelectItem value="custom">Custom Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === "custom" && (
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="parent@example.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message here..."
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSend} disabled={sending}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? "Sending..." : "Send Now"}
                </Button>
                <Button variant="outline">Schedule Send</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold">{formatTemplateName(template.name)}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{template.subject}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {template.body.substring(0, 150)}...
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => useTemplate(template)}>
                      Use Template
                    </Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {sentEmails.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No emails sent yet
              </div>
            ) : (
              sentEmails.map((email) => (
                <div key={email.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {email.recipient_email}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(email.sent_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
