import { useState, useEffect } from "react";
import { Megaphone, Search, Download, Check, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParentAuth } from "@/hooks/useParentAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  attachment_url: string | null;
  requires_acknowledgment: boolean;
  published_at: string | null;
  is_acknowledged: boolean;
}

const PortalAnnouncements = () => {
  const { parentAccount } = useParentAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [parentAccount]);

  const fetchAnnouncements = async () => {
    if (!parentAccount) return;

    setLoading(true);
    
    // Fetch announcements
    const { data: announcementsData, error: announcementsError } = await supabase
      .from("portal_announcements")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (announcementsError) {
      console.error("Error fetching announcements:", announcementsError);
      setLoading(false);
      return;
    }

    // Fetch acknowledgments
    const { data: acknowledgedData } = await supabase
      .from("announcement_acknowledgments")
      .select("announcement_id")
      .eq("parent_account_id", parentAccount.id);

    const acknowledgedIds = new Set(acknowledgedData?.map(a => a.announcement_id) || []);

    const formattedAnnouncements: Announcement[] = (announcementsData || []).map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      category: a.category,
      attachment_url: a.attachment_url,
      requires_acknowledgment: a.requires_acknowledgment,
      published_at: a.published_at,
      is_acknowledged: acknowledgedIds.has(a.id),
    }));

    setAnnouncements(formattedAnnouncements);
    setLoading(false);
  };

  const acknowledgeAnnouncement = async (announcementId: string) => {
    if (!parentAccount) return;

    setAcknowledging(announcementId);
    
    const { error } = await supabase
      .from("announcement_acknowledgments")
      .insert({
        announcement_id: announcementId,
        parent_account_id: parentAccount.id,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge announcement",
        variant: "destructive",
      });
    } else {
      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId ? { ...a, is_acknowledged: true } : a
      ));
      toast({
        title: "Acknowledged",
        description: "Announcement has been acknowledged",
      });
    }
    
    setAcknowledging(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "events":
        return "bg-purple-100 text-purple-800";
      case "administrative":
        return "bg-gray-100 text-gray-800";
      case "emergency":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const unreadCount = announcements.filter(a => !a.is_acknowledged).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Announcements
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with school news and events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`transition-all ${!announcement.is_acknowledged ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getCategoryColor(announcement.category)}>
                        {announcement.category}
                      </Badge>
                      {!announcement.is_acknowledged && (
                        <Badge variant="secondary">Unread</Badge>
                      )}
                      {announcement.requires_acknowledgment && announcement.is_acknowledged && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{announcement.title}</CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {announcement.published_at && format(new Date(announcement.published_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {announcement.attachment_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={announcement.attachment_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download Attachment
                      </a>
                    </Button>
                  )}
                  
                  {announcement.requires_acknowledgment && !announcement.is_acknowledged && (
                    <Button 
                      size="sm"
                      onClick={() => acknowledgeAnnouncement(announcement.id)}
                      disabled={acknowledging === announcement.id}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {acknowledging === announcement.id ? "Acknowledging..." : "Acknowledge Receipt"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalAnnouncements;
