import { useState, useEffect } from "react";
import { Bell, Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  published_at: string | null;
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicAnnouncements();
  }, []);

  const fetchPublicAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("portal_announcements")
        .select("id, title, content, category, published_at")
        .eq("visibility", "public")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "holiday":
        return "bg-green-100 text-green-800";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return null; // Don't show section if no public announcements
  }

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-card/60 backdrop-blur-lg text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/40 shadow-soft">
            <Bell className="h-4 w-4" />
            News & Updates
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Latest Announcements
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest news and updates from Good Shepherd International School
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {announcements.map((announcement, index) => (
            <Card
              key={announcement.id}
              className="group bg-white/70 dark:bg-card/70 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-card/90 hover:shadow-elevated transition-all duration-300 border-l-4 border-l-primary border-white/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <Badge className={`${getCategoryColor(announcement.category)} backdrop-blur-sm`}>
                    {announcement.category}
                  </Badge>
                  {announcement.published_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(announcement.published_at), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {announcement.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {announcement.content}
                </p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ChevronRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Announcements;
