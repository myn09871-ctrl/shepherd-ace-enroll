import { Phone, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import schoolCrest from "@/assets/school-crest.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={schoolCrest}
                alt="Good Shepherd International School Crest"
                className="h-16 w-auto"
              />
              <div>
                <h3 className="font-heading text-2xl font-bold">
                  Good Shepherd
                </h3>
                <p className="text-primary-foreground/70">
                  International School
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/70 mb-6 max-w-md">
              Nurturing academic excellence and moral values since our founding. 
              Join us in shaping tomorrow's leaders with a foundation of faith, 
              knowledge, and character.
            </p>
            <p className="font-heading text-lg italic text-primary-foreground/80">
              "In God We Trust"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "#home", label: "Home" },
                { href: "#results", label: "BECE Results" },
                { href: "#programs", label: "Programs" },
                { href: "#about", label: "About Us" },
                { href: "#contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/admission"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Admission
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/70">
                  100m from Mallam LAFA Police Station,
                  <br />Mallam, New Gbawe, Accra
                </span>
              </li>
              <li>
                <a
                  href="tel:0208163186"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                  0208163186
                </a>
              </li>
              <li>
                <a
                  href="tel:0244855184"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                  0244855184
                </a>
              </li>
              <li>
                <a
                  href="tel:0242225084"
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  <Phone className="h-5 w-5 text-secondary flex-shrink-0" />
                  0242225084
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8">
          <p className="w-full text-primary-foreground/50 text-sm text-center md:text-left">
            © {currentYear} Good Shepherd International School. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
