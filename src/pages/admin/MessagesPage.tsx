import { useState, useEffect, useRef } from "react";
import { Plus, Search, Send, Mail, Users, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  student_id: string;
  parent_account_id: string | null;
  sender_id: string | null;
  sender_type: string;
  recipient_type: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  students?: {
    id: string;
    first_name: string;
    surname: string;
    current_class: string;
  };
  parent_accounts?: {
    id: string;
    parent_name: string;
    email: string;
  };
}

interface Parent {
  id: string;
  parent_name: string;
  email: string;
  student_id: string;
  students?: {
    first_name: string;
    surname: string;
    current_class: string;
  };
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Compose form state
  const [recipientType, setRecipientType] = useState<string>("single");
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    fetchData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel("admin-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parent_messages" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, parentsRes] = await Promise.all([
        supabase
          .from("parent_messages")
          .select("*, students(id, first_name, surname, current_class), parent_accounts(id, parent_name, email)")
          .order("created_at", { ascending: false }),
        supabase
          .from("parent_accounts")
          .select("id, parent_name, email, student_id, students(first_name, surname, current_class)")
          .eq("is_active", true),
      ]);

      if (messagesRes.error) throw messagesRes.error;
      if (parentsRes.error) throw parentsRes.error;

      setMessages(messagesRes.data || []);
      setParents(parentsRes.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !messageBody.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    if (recipientType === "single" && !selectedParent) {
      toast.error("Please select a recipient");
      return;
    }

    if (recipientType === "class" && !selectedClass) {
      toast.error("Please select a class");
      return;
    }

    setSending(true);
    try {
      let targetParents: Parent[] = [];

      if (recipientType === "single") {
        const parent = parents.find((p) => p.id === selectedParent);
        if (parent) targetParents = [parent];
      } else if (recipientType === "class") {
        targetParents = parents.filter(
          (p) => p.students?.current_class === selectedClass
        );
      } else {
        targetParents = parents;
      }

      if (targetParents.length === 0) {
        toast.error("No recipients found");
        return;
      }

      const messageRecords = targetParents.map((parent) => ({
        student_id: parent.student_id,
        parent_account_id: parent.id,
        sender_id: user?.id,
        sender_type: "admin",
        recipient_type: "parent",
        subject,
        message: messageBody,
        is_read: false,
      }));

      const { error } = await supabase.from("parent_messages").insert(messageRecords);

      if (error) throw error;

      toast.success(`Message sent to ${targetParents.length} recipient(s)`);
      setShowComposeDialog(false);
      resetComposeForm();
      fetchData();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (message: Message) => {
    if (message.is_read || message.sender_type === "admin") return;

    try {
      await supabase
        .from("parent_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", message.id);
      fetchData();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message);
  };

  const resetComposeForm = () => {
    setRecipientType("single");
    setSelectedParent("");
    setSelectedClass("");
    setSubject("");
    setMessageBody("");
  };

  const uniqueClasses = [...new Set(parents.map((p) => p.students?.current_class).filter(Boolean))].sort();

  const inboxMessages = messages.filter((m) => m.sender_type === "parent");
  const sentMessages = messages.filter((m) => m.sender_type === "admin");
  const unreadCount = inboxMessages.filter((m) => !m.is_read).length;

  const filteredInbox = inboxMessages.filter((m) =>
    `${m.subject} ${m.parent_accounts?.parent_name || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const filteredSent = sentMessages.filter((m) =>
    `${m.subject} ${m.parent_accounts?.parent_name || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">
            Messages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Communicate with parents
          </p>
        </div>
        <Button onClick={() => setShowComposeDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Compose Message
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Tabs defaultValue="inbox" className="h-full flex flex-col">
                <TabsList className="mx-4 mb-2">
                  <TabsTrigger value="inbox" className="gap-2">
                    Inbox
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>

                <TabsContent value="inbox" className="flex-1 m-0">
                  <ScrollArea className="h-[450px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      </div>
                    ) : filteredInbox.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No messages
                      </div>
                    ) : (
                      filteredInbox.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => openMessage(msg)}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                            !msg.is_read ? "bg-primary/5" : ""
                          } ${selectedMessage?.id === msg.id ? "bg-muted" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm truncate ${!msg.is_read ? "font-semibold" : ""}`}>
                                {msg.parent_accounts?.parent_name || "Unknown"}
                              </p>
                              <p className="text-sm text-foreground truncate">{msg.subject}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {msg.message.substring(0, 50)}...
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
                </TabsContent>

                <TabsContent value="sent" className="flex-1 m-0">
                  <ScrollArea className="h-[450px]">
                    {filteredSent.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No sent messages
                      </div>
                    ) : (
                      filteredSent.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => setSelectedMessage(msg)}
                          className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedMessage?.id === msg.id ? "bg-muted" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm truncate">
                                To: {msg.parent_accounts?.parent_name || "Unknown"}
                              </p>
                              <p className="text-sm text-foreground truncate">{msg.subject}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {format(new Date(msg.created_at), "MMM d")}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            {selectedMessage ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedMessage.sender_type === "admin" ? "To: " : "From: "}
                        {selectedMessage.parent_accounts?.parent_name || "Unknown"} •{" "}
                        {selectedMessage.students?.first_name} {selectedMessage.students?.surname} (
                        {selectedMessage.students?.current_class})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    {selectedMessage.sender_type === "parent" && (
                      <Badge variant={selectedMessage.is_read ? "secondary" : "default"}>
                        {selectedMessage.is_read ? "Read" : "Unread"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto py-6">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a message to view</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Recipient Type */}
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={recipientType} onValueChange={setRecipientType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Single Parent
                    </div>
                  </SelectItem>
                  <SelectItem value="class">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Entire Class
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Parents
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Selection */}
            {recipientType === "single" && (
              <div className="space-y-2">
                <Label>Select Parent</Label>
                <Select value={selectedParent} onValueChange={setSelectedParent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {parents.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.parent_name} ({p.students?.first_name} {p.students?.surname})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recipientType === "class" && (
              <div className="space-y-2">
                <Label>Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClasses.map((c) => (
                      <SelectItem key={c} value={c!}>
                        {c} ({parents.filter((p) => p.students?.current_class === c).length} parents)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {recipientType === "all" && (
              <p className="text-sm text-muted-foreground">
                This message will be sent to all {parents.length} registered parents.
              </p>
            )}

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesPage;
