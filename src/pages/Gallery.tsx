import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

import schoolBuilding from "@/assets/school-building.webp";
import computerLab from "@/assets/computer-lab.webp";
import ceremony from "@/assets/ceremony.webp";
import graduation1 from "@/assets/graduation-1.webp";
import graduation2 from "@/assets/graduation-2.webp";
import graduationKids from "@/assets/graduation-kids.webp";
import nurseryClass from "@/assets/nursery-class.webp";
import studentsGroup from "@/assets/students-group.webp";

const categories = [
  { id: "all", label: "All" },
  { id: "academic", label: "Academic Activities" },
  { id: "ceremonies", label: "Ceremonies & Events" },
  { id: "students", label: "Students & Community" },
  { id: "facilities", label: "Facilities" },
];

const galleryImages = [
  { src: computerLab, alt: "Computer Lab", category: "academic" },
  { src: nurseryClass, alt: "Nursery Class", category: "academic" },
  { src: ceremony, alt: "School Ceremony", category: "ceremonies" },
  { src: graduation1, alt: "Graduation Ceremony", category: "ceremonies" },
  { src: graduation2, alt: "Graduation Day", category: "ceremonies" },
  { src: graduationKids, alt: "Young Graduates", category: "ceremonies" },
  { src: studentsGroup, alt: "Students Group Photo", category: "students" },
  { src: schoolBuilding, alt: "School Building", category: "facilities" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const filteredImages =
    activeCategory === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const navigateLightbox = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? filteredImages.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === filteredImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Our Gallery
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Explore moments captured at Good Shepherd International School
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-md z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl cursor-pointer aspect-[4/3] shadow-card hover:shadow-elevated transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-primary-foreground font-medium text-sm md:text-base">
                      {image.alt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No images found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-primary-foreground hover:text-accent transition-colors p-2"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          <button
            onClick={() => navigateLightbox("prev")}
            className="absolute left-4 text-primary-foreground hover:text-accent transition-colors p-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>

          <div className="max-w-5xl max-h-[85vh] mx-4">
            <img
              src={filteredImages[currentImageIndex]?.src}
              alt={filteredImages[currentImageIndex]?.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <p className="text-primary-foreground text-center mt-4 font-medium">
              {filteredImages[currentImageIndex]?.alt}
            </p>
          </div>

          <button
            onClick={() => navigateLightbox("next")}
            className="absolute right-4 text-primary-foreground hover:text-accent transition-colors p-2"
            aria-label="Next image"
          >
            <ChevronRight className="h-10 w-10" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-primary-foreground/80 text-sm">
            {currentImageIndex + 1} / {filteredImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
