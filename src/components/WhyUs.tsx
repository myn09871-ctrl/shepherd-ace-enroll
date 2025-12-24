import { 
  Award, 
  Heart, 
  Users, 
  BookOpen, 
  Shield, 
  Sparkles 
} from "lucide-react";
import graduation1 from "@/assets/graduation-1.webp";
import graduation2 from "@/assets/graduation-2.webp";

const WhyUs = () => {
  const features = [
    {
      icon: Award,
      title: "Academic Excellence",
      description: "100% BECE distinction rate with all students achieving aggregate 07-09.",
    },
    {
      icon: Heart,
      title: "Holistic Development",
      description: "Nurturing mind, body, and spirit through comprehensive programs.",
    },
    {
      icon: Users,
      title: "Experienced Faculty",
      description: "Dedicated teachers committed to each child's success.",
    },
    {
      icon: BookOpen,
      title: "Modern Curriculum",
      description: "Updated syllabus with practical skills for the 21st century.",
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description: "Secure facilities with a focus on student wellbeing.",
    },
    {
      icon: Sparkles,
      title: "Moral Values",
      description: "Character building rooted in our motto: 'In God We Trust'.",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground rounded-full px-4 py-2 mb-6 animate-fade-up">
              <Heart className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">Why Choose Us</span>
            </div>
            
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-up animation-delay-100">
              Join the <span className="text-primary">Winning Team</span> for 
              Your Child's Success
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 animate-fade-up animation-delay-200">
              At Good Shepherd International School, we don't just educate – we 
              transform lives. Our proven track record of academic excellence, 
              combined with character development, creates well-rounded graduates 
              ready for the future.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex gap-4 animate-fade-up"
                  style={{ animationDelay: `${(index + 3) * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-elevated animate-slide-left">
              <img
                src={graduation1}
                alt="Graduation ceremony at Good Shepherd International School"
                className="w-full h-auto"
              />
            </div>
            
            {/* Secondary Image */}
            <div className="absolute -bottom-8 -left-8 w-2/3 rounded-2xl overflow-hidden shadow-card border-4 border-card z-20 animate-slide-left animation-delay-200">
              <img
                src={graduation2}
                alt="Students at graduation"
                className="w-full h-auto"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 right-12 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
            
            {/* Badge */}
            <div className="absolute top-8 -right-4 lg:right-4 bg-card shadow-elevated rounded-2xl p-4 z-30 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Award className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">15+</p>
                  <p className="text-xs text-muted-foreground">Years of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
