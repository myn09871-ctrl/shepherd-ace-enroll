import { Phone, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import schoolCrest from "@/assets/school-crest.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <img
                src={schoolCrest}
                alt="Good Shepherd International School crest"
                className="h-14 w-auto"
              />
              <div className="min-w-0">
                <p className="font-heading text-lg sm:text-xl font-semibold leading-tight">
                  Good Shepherd
                </p>
                <p className="text-sm text-primary-foreground/70">
                  International School
                </p>
              </div>
            </div>

            <div className="rule-gold my-6" />

            <p className="text-sm text-primary-foreground/75 max-w-md leading-relaxed">
              Educating children in Mallam, New Gbawe since 1992 — from Crèche
              through to Junior High School, with a record of academic
              achievement and character formation.
            </p>
            <p className="mt-5 font-heading text-base italic text-accent">
              "In God We Trust"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="eyebrow text-accent">Explore</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                { href: "#home", label: "Home" },
                { href: "#results", label: "BECE Results" },
                { href: "#programs", label: "Programmes" },
                { href: "#about", label: "About Us" },
                { href: "#contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-primary-foreground/75 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/admission"
                  className="text-primary-foreground/75 hover:text-accent transition-colors"
                >
                  Admission
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-primary-foreground/75 hover:text-accent transition-colors"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/portal/login"
                  className="text-primary-foreground/75 hover:text-accent transition-colors"
                >
                  Parent Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="eyebrow text-accent">Contact</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span className="text-primary-foreground/75 leading-relaxed">
                  100m from Mallam LAFA Police Station,
                  <br />
                  Mallam, New Gbawe, Accra
                </span>
              </li>
              {["0208163186", "0244855184", "0242225084"].map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 text-primary-foreground/75 hover:text-accent transition-colors"
                  >
                    <Phone className="h-4 w-4 text-accent shrink-0" />
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/15 mt-10 lg:mt-12 pt-6">
          <p className="w-full text-primary-foreground/55 text-xs text-center md:text-left">
            © {currentYear} Good Shepherd International School. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
