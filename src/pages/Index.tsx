import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Heritage from "@/components/Heritage";
import ResultsShowcase from "@/components/ResultsShowcase";
import Programs from "@/components/Programs";
import WhyUs from "@/components/WhyUs";
import Announcements from "@/components/Announcements";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Header />
      <main>
        <Hero />
        <Heritage />
        <ResultsShowcase />
        <Announcements />
        <Programs />
        <WhyUs />

        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
