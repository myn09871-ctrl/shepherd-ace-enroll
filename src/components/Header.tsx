import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import schoolCrest from "@/assets/school-crest.jpeg";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#results", label: "Results" },
    { href: "#programs", label: "Programs" },
    { href: "/gallery", label: "Gallery", isRoute: true },
    { href: "/admission", label: "Admission", isRoute: true },
    { href: "#about", label: "About Us" },
    { href: "#contact", label: "Contact" },
  ];

  // Handle navigation for anchor links from any page
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== "/") {
      // Navigate to home first, then scroll to section
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Already on home, just scroll
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={schoolCrest}
              alt="Good Shepherd International School Crest"
              className="h-14 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <h1 className={`font-heading font-extrabold text-lg md:text-xl leading-tight tracking-wide uppercase transition-colors ${
                isScrolled ? "text-primary" : "text-white"
              }`}>
                Good Shepherd International School
              </h1>
              <p className={`text-xs md:text-sm font-heading italic font-medium tracking-widest transition-colors ${
                isScrolled ? "text-secondary" : "text-white/90"
              }`}>
                In God We Trust
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`font-medium transition-colors hover:text-secondary ${
                    isScrolled ? "text-foreground" : "text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={`font-medium transition-colors hover:text-secondary ${
                    isScrolled ? "text-foreground" : "text-white"
                  }`}
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:0208163186" className={`flex items-center gap-2 font-medium transition-colors ${
              isScrolled ? "text-primary" : "text-white"
            }`}>
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">0208163186</span>
            </a>
            <Button variant="hero" size="lg" asChild>
              <Link to="/admission">Enroll Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors ${isScrolled ? "text-foreground" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-card shadow-elevated border-t border-border animate-fade-in">
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-medium text-foreground hover:text-primary py-2 transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="font-medium text-foreground hover:text-primary py-2 transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <a
                  href="tel:0208163186"
                  className="flex items-center gap-2 text-primary font-medium"
                >
                  <Phone className="h-4 w-4" />
                  0208163186
                </a>
                <Button variant="hero" size="lg" asChild className="w-full">
                  <Link to="/admission">Enroll Now</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
