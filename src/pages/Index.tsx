import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ResultsShowcase from "@/components/ResultsShowcase";
import Programs from "@/components/Programs";
import WhyUs from "@/components/WhyUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <Header />
      <main>
        <Hero />
        <ResultsShowcase />
        <Programs />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
