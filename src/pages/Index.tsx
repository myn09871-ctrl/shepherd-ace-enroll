import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Heritage from "@/components/Heritage";
import Programs from "@/components/Programs";
import BeyondClassroom from "@/components/BeyondClassroom";
import ResultsShowcase from "@/components/ResultsShowcase";
import GalleryStrip from "@/components/GalleryStrip";
import Announcements from "@/components/Announcements";
import WhyUs from "@/components/WhyUs";
import ParentConnect from "@/components/ParentConnect";
import Admissions from "@/components/Admissions";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Header />
      <main>
        <Hero />
        <Heritage />
        <Programs />
        <BeyondClassroom />
        <ResultsShowcase />
        <GalleryStrip />
        <Announcements />
        <WhyUs />
        <ParentConnect />
        <Admissions />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
