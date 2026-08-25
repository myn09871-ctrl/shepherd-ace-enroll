import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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

  if (loading) {
    return (
      <section className="bg-muted/40 py-16 lg:py-24 border-y border-border">
        <div className="container mx-auto px-4">
          <p className="eyebrow">News &amp; Updates</p>
          <div className="mt-8 grid sm:grid-cols-2 border-t border-l border-border">
            {[0, 1].map((i) => (
              <div key={i} className="border-b border-r border-border p-5 lg:p-6">
                <div className="h-3 w-24 bg-border animate-pulse" />
                <div className="mt-4 h-4 w-3/4 bg-border animate-pulse" />
                <div className="mt-3 h-3 w-full bg-border animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/40 py-16 lg:py-24 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-border pb-8 lg:pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">News &amp; Updates</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              Latest Announcements
            </h2>
            <div className="rule-gold mt-6" />
          </div>
          <div className="lg:col-span-5">
            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
              Notices published by the school office. Class-specific
              announcements are sent directly to parents through the portal.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 border-t border-l border-border mt-10">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="rounded-none border-0 border-b border-r border-border shadow-none bg-card p-5 lg:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="eyebrow text-accent">
                  {announcement.category}
                </span>
                {announcement.published_at && (
                  <time
                    dateTime={announcement.published_at}
                    className="text-xs text-muted-foreground"
                  >
                    {format(new Date(announcement.published_at), "d MMM yyyy")}
                  </time>
                )}
              </div>
              <h3 className="mt-4 font-heading text-base lg:text-lg font-semibold text-foreground leading-snug">
                {announcement.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {announcement.content}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Announcements;
