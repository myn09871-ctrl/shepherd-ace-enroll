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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-2 mb-6 animate-fade-up">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm font-semibold">Our Programs</span>
          </div>
          
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-up animation-delay-100">
            Comprehensive Education from{" "}
            <span className="text-primary">Crèche to JHS</span>
          </h2>
          
          <p className="text-lg text-muted-foreground animate-fade-up animation-delay-200">
            We offer a complete educational journey, nurturing children from their 
            earliest years through junior high school graduation.
          </p>
        </div>

        {/* Academic Programs Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
          {academicPrograms.map((program, index) => (
            <div
              key={program.title}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-fade-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${program.color} mb-4 group-hover:scale-110 transition-transform`}>
                <program.icon className="h-7 w-7" />
              </div>
              
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                {program.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3">
                {program.description}
              </p>
              
              <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {program.age}
              </span>
            </div>
          ))}
        </div>

        {/* Career Training Section */}
        <div className="bg-muted/30 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Career Training Courses
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond academics, we prepare students for the real world with 
              practical skills and vocational training.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerPrograms.map((program, index) => (
              <div
                key={program.title}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-primary-foreground">
                      <program.icon className="h-5 w-5" />
                      <h4 className="font-heading font-bold">{program.title}</h4>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {program.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="default" size="xl" asChild>
            <Link to="/admission" className="flex items-center gap-2">
              <span>Apply for Admission</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Programs;
