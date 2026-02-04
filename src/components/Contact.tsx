import { 
  MapPin, 
  Phone, 
  Clock, 
  ArrowRight,
  MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ceremony from "@/assets/ceremony.webp";

const Contact = () => {
  const phoneNumbers = [
    "0208163186",
    "0244855184",
    "0242225084",
  ];

  return (
    <section id="contact" className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-br from-muted/50 via-background to-primary/5">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-card/60 backdrop-blur-lg text-primary rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 animate-fade-up border border-white/40 shadow-soft">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm font-semibold">Get In Touch</span>
          </div>
          
          <h2 className="font-heading text-xl sm:text-2xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 animate-fade-up animation-delay-100">
            Admission is{" "}
            <span className="text-accent">FREE</span> – 
            <span className="text-primary"> Rush Now!</span>
          </h2>
          
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground animate-fade-up animation-delay-200">
            Take the first step towards your child's bright future. 
            Contact us today to learn more about enrollment opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Location Card */}
            <div className="bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-2xl p-6 shadow-card border border-white/40 animate-fade-up animation-delay-300 hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-inner">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    Our Location
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    100 meters from Mallam LAFA Police Station,
                    <br />Mallam, New Gbawe, Accra, Ghana
                  </p>
                  <a
                    href="https://maps.google.com/?q=Mallam+LAFA+Police+Station+Ghana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                  >
                    Get Directions
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Phone Numbers Card */}
            <div className="bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-2xl p-6 shadow-card border border-white/40 animate-fade-up animation-delay-400 hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center shadow-inner">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold text-foreground mb-4">
                    Call Us Now
                  </h3>
                  <div className="space-y-3">
                    {phoneNumbers.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-muted/50 backdrop-blur-sm hover:bg-primary/10 transition-colors group border border-white/30"
                      >
                        <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-foreground text-lg">
                          {phone}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="bg-white/70 dark:bg-card/70 backdrop-blur-xl rounded-2xl p-6 shadow-card border border-white/40 animate-fade-up animation-delay-500 hover:shadow-elevated transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center shadow-inner">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                    Office Hours
                  </h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p><span className="font-medium text-foreground">Monday - Friday:</span> 7:00 AM - 4:00 PM</p>
                    <p><span className="font-medium text-foreground">Saturday:</span> 8:00 AM - 12:00 PM</p>
                    <p><span className="font-medium text-foreground">Sunday:</span> Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="lg:sticky lg:top-28">
            <div className="relative bg-hero-gradient rounded-3xl overflow-hidden shadow-elevated animate-fade-up animation-delay-300">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary-foreground rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary-foreground rounded-full translate-x-1/3 translate-y-1/3" />
              </div>

              <div className="relative p-8 lg:p-10 text-primary-foreground">
                {/* Image */}
                <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <img
                    src={ceremony}
                    alt="School ceremony"
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold mb-4">
                  FREE ADMISSION
                </div>

                <h3 className="font-heading text-2xl lg:text-3xl font-bold mb-4">
                  Admission In Progress
                </h3>

                <p className="text-primary-foreground/80 mb-8">
                  Don't miss this opportunity to give your child the best 
                  education. Join the Good Shepherd family today and watch 
                  them excel!
                </p>

                <ul className="space-y-3 mb-8">
                  {["Crèche", "Nursery", "Kindergarten", "Primary", "Junior High School"].map((level) => (
                    <li key={level} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">{level}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="hero" size="xl" className="w-full" asChild>
                  <a href="tel:0208163186" className="flex items-center justify-center gap-2">
                    <Phone className="h-5 w-5" />
                    <span>Call to Enroll Now</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
