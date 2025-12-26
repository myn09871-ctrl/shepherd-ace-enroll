import { 
  Baby, 
  Flower2, 
  Blocks, 
  GraduationCap, 
  School,
  Palette,
  Code,
  Scissors,
  Anchor,
  ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import nurseryClass from "@/assets/nursery-class.webp";
import computerLab from "@/assets/computer-lab.webp";
import graduationKids from "@/assets/graduation-kids.webp";
import studentsGroup from "@/assets/students-group.webp";

const Programs = () => {
  const academicPrograms = [
    {
      icon: Baby,
      title: "Crèche",
      description: "Loving care for infants and toddlers in a safe, nurturing environment.",
      age: "6 months - 2 years",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Flower2,
      title: "Nursery",
      description: "Play-based learning fostering curiosity and early development.",
      age: "2 - 4 years",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Blocks,
      title: "Kindergarten",
      description: "Building foundational skills for academic readiness.",
      age: "4 - 6 years",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: School,
      title: "Primary",
      description: "Comprehensive curriculum developing core academic competencies.",
      age: "6 - 12 years",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: GraduationCap,
      title: "Junior High School",
      description: "Excellence-driven BECE preparation with 100% distinction rate.",
      age: "12 - 15 years",
      color: "bg-secondary/20 text-secondary",
    },
  ];

  const careerPrograms = [
    {
      icon: Palette,
      title: "Creative Arts",
      description: "Visual arts, music, and drama to nurture artistic talents.",
      image: graduationKids,
    },
    {
      icon: Code,
      title: "IT Coding",
      description: "Programming and digital skills for the future economy.",
      image: computerLab,
    },
    {
      icon: Scissors,
      title: "Fashion Designing",
      description: "Design principles and garment construction techniques.",
      image: studentsGroup,
    },
    {
      icon: Anchor,
      title: "Naval Corps",
      description: "Military discipline, leadership, and physical training.",
      image: nurseryClass,
    },
  ];

  return (
    <section id="programs" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 animate-fade-up">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-semibold">Our Programs</span>
          </div>
          
          <h2 className="font-heading text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-up animation-delay-100">
            Comprehensive Education from{" "}
            <span className="text-primary">Crèche to JHS</span>
          </h2>
          
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground animate-fade-up animation-delay-200">
            We offer a complete educational journey, nurturing children from their 
            earliest years through junior high school graduation.
          </p>
        </div>

        {/* Academic Programs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-10 sm:mb-16 lg:mb-20">
          {academicPrograms.map((program, index) => (
            <div
              key={program.title}
              className="group bg-card rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl ${program.color} mb-2 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <program.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </div>
              
              <h3 className="font-heading text-sm sm:text-base lg:text-xl font-bold text-foreground mb-1 sm:mb-2">
                {program.title}
              </h3>
              
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                {program.description}
              </p>
              
              <span className="inline-block text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {program.age}
              </span>
            </div>
          ))}
        </div>

        {/* Career Training Section */}
        <div className="bg-muted/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-12">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h3 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-4">
              Career Training Courses
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground max-w-2xl mx-auto">
              Beyond academics, we prepare students for the real world with 
              practical skills and vocational training.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {careerPrograms.map((program, index) => (
              <div
                key={program.title}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-24 sm:h-32 lg:h-40 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-primary-foreground">
                      <program.icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                      <h4 className="font-heading text-xs sm:text-sm lg:text-base font-bold">{program.title}</h4>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-2 sm:p-3 lg:p-4">
                  <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground line-clamp-2">
                    {program.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Button variant="default" size="lg" className="text-xs sm:text-sm" asChild>
            <Link to="/admission" className="flex items-center gap-2">
              <span>Apply for Admission</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Programs;
