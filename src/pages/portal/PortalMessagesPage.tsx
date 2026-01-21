import { useState, useEffect } from "react";
import { Mail, Send, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  id: string;
  subject: string;
  message: string;
  sender_type: string;
  is_read: boolean;
  created_at: string;
}

const PortalMessagesPage = () => {
  const { parentAccount, currentStudent, user } = useParentAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    if (parentAccount) {
      fetchMessages();
      
      // Set up realtime subscription
      const channel = supabase
        .channel("parent-messages")
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "parent_messages",
            filter: `parent_account_id=eq.${parentAccount.id}`
          },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [parentAccount]);

  const fetchMessages = async () => {
    if (!parentAccount) return;
    try {
      const { data, error } = await supabase
        .from("parent_messages")
        .select("*")
        .eq("parent_account_id", parentAccount.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (message: Message) => {
    if (message.is_read || message.sender_type === "parent") return;

    try {
      await supabase
        .from("parent_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", message.id);
      fetchMessages();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message);
    setShowCompose(false);
  };

  const handleSend = async () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    if (!parentAccount || !currentStudent) {
      toast.error("Unable to send message");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("parent_messages").insert({
        student_id: currentStudent.id,
        parent_account_id: parentAccount.id,
        sender_id: user?.id,
        sender_type: "parent",
        recipient_type: "admin",
        subject,
        message: messageBody,
        is_read: false,
      });

      if (error) throw error;

      toast.success("Message sent successfully");
      setShowCompose(false);
      setSubject("");
      setMessageBody("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read && m.sender_type === "admin").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Messages
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Communicate with school administration
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCompose(true);
            setSelectedMessage(null);
          }}
          size="sm"
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Message List */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inbox</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        !msg.is_read && msg.sender_type === "admin" ? "bg-primary/5" : ""
                      } ${selectedMessage?.id === msg.id ? "bg-muted" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm truncate ${
                                !msg.is_read && msg.sender_type === "admin"
                                  ? "font-semibold"
                                  : ""
                              }`}
                            >
                              {msg.subject}
                            </p>
                            {msg.sender_type === "parent" && (
                              <Badge variant="outline" className="text-xs">
                                Sent
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {msg.message.substring(0, 40)}...
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(msg.created_at), "MMM d")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Detail / Compose */}
          <Card className="md:col-span-2">
            {showCompose ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowCompose(false)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-base">New Message</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Type your message here..."
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button onClick={handleSend} disabled={sending} className="gap-2">
                    <Send className="h-4 w-4" />
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </CardContent>
              </>
            ) : selectedMessage ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div>
                    <CardTitle className="text-base">{selectedMessage.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedMessage.sender_type === "admin" ? "From: School Admin" : "To: School Admin"} •{" "}
                      {format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                </CardContent>
              </>
            ) : (
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Mail className="h-10 w-10 mx-auto mb-3" />
                  <p className="text-sm">Select a message to view</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default PortalMessagesPage;
