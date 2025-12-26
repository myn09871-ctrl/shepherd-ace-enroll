import { ArrowRight, Award, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import schoolCrest from "@/assets/school-crest.jpeg";
import schoolBuilding from "@/assets/school-building.webp";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${schoolBuilding})` }}
      >
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-500" />

      {/* Content */}
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-primary-foreground space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 animate-fade-up">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-accent" />
              <span className="text-xs sm:text-sm font-medium">
                100% BECE Distinction Rate
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-fade-up animation-delay-100">
              Nurturing{" "}
              <span className="text-accent">Excellence</span>
              <br />
              Building Futures
            </h1>

            {/* Motto */}
            <p className="text-sm sm:text-lg text-primary-foreground/90 italic font-heading animate-fade-up animation-delay-200">
              "In God We Trust"
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm lg:text-base text-primary-foreground/80 max-w-xl animate-fade-up animation-delay-300">
              Welcome to Good Shepherd International School, Mallam New Gbawe. 
              Where every child achieves their full potential through quality 
              education, moral values, and holistic development.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-up animation-delay-400">
              <Button variant="hero" size="default" className="text-xs sm:text-sm" asChild>
                <Link to="/admission" className="flex items-center gap-2">
                  <span>Enroll Now - FREE Admission</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="default" className="text-xs sm:text-sm" asChild>
                <a href="#programs">Explore Programs</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 pt-4 sm:pt-6 lg:pt-8 border-t border-primary-foreground/20 animate-fade-up animation-delay-500">
              <div>
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                  <span className="font-heading text-lg sm:text-xl lg:text-2xl font-bold">100%</span>
                </div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-primary-foreground/70">BECE Pass Rate</p>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                  <span className="font-heading text-lg sm:text-xl lg:text-2xl font-bold">500+</span>
                </div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-primary-foreground/70">Students</p>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-accent" />
                  <span className="font-heading text-lg sm:text-xl lg:text-2xl font-bold">15+</span>
                </div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-primary-foreground/70">Years of Excellence</p>
              </div>
            </div>
          </div>

          {/* Right Column - Crest */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-accent/30 blur-3xl rounded-full scale-75" />
              
              {/* Crest */}
              <img
                src={schoolCrest}
                alt="Good Shepherd International School Crest"
                className="relative z-10 w-80 h-auto drop-shadow-2xl animate-float"
              />
              
              {/* Decorative Ring */}
              <div className="absolute inset-0 border-4 border-primary-foreground/20 rounded-full scale-125 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
