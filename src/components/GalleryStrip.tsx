import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  file_url: string;
  file_name: string;
  caption: string | null;
  category: string;
}

const GalleryStrip = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, file_url, file_name, caption, category")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(8);

      if (!active) return;

      if (error) {
        console.error("Error loading gallery images:", error);
        setFailed(true);
      } else {
        setImages(data ?? []);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  // Nothing to show and nothing went wrong — keep the page clean.
  if (!loading && !failed && images.length === 0) return null;

  return (
    <section id="gallery" className="bg-muted/40 py-16 lg:py-24 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-16 items-end border-b border-border pb-10">
          <div className="lg:col-span-7">
            <p className="eyebrow">School Life</p>
            <h2 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground leading-tight">
              Photographs from
              <br className="hidden sm:block" /> around the campus
            </h2>
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 font-heading text-sm lg:text-base font-semibold text-primary hover:text-accent transition-colors"
            >
              View the full gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 pt-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-40 lg:h-56 bg-border/60 animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {failed && !loading && (
          <p className="pt-10 text-sm text-muted-foreground">
            School photographs could not be loaded right now. Please try again
            shortly or visit the{" "}
            <Link to="/gallery" className="text-primary underline">
              gallery page
            </Link>
            .
          </p>
        )}

        {!loading && !failed && images.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 pt-10">
            {images.map((image) => (
              <figure key={image.id} className="group overflow-hidden relative">
                <img
                  src={image.file_url}
                  alt={image.caption?.trim() || image.file_name}
                  loading="lazy"
                  className="w-full h-40 lg:h-56 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {image.caption?.trim() && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-primary/85 text-primary-foreground text-[11px] lg:text-xs px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.caption.trim()}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GalleryStrip;
