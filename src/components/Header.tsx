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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#programs", label: "Programmes" },
    { href: "#results", label: "Results" },
    { href: "#gallery", label: "Gallery" },
    { href: "#admissions", label: "Admissions" },
    { href: "#contact", label: "Contact" },
  ];

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const solid = isScrolled || isMobileMenuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        solid
          ? "bg-background border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <img
              src={schoolCrest}
              alt="Good Shepherd International School crest"
              className="h-9 sm:h-12 w-auto object-contain shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span
                className={`font-heading font-semibold text-[11px] sm:text-base md:text-lg leading-tight tracking-wide uppercase truncate transition-colors ${
                  solid ? "text-primary" : "text-white"
                }`}
              >
                <span className="hidden sm:inline">
                  Good Shepherd International School
                </span>
                <span className="sm:hidden">Good Shepherd Int'l School</span>
              </span>
              <span
                className={`text-[9px] sm:text-[11px] uppercase tracking-[0.18em] font-medium transition-colors ${
                  solid ? "text-accent" : "text-white/80"
                }`}
              >
                In God We Trust
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const cls = `text-sm font-medium tracking-wide transition-colors hover:text-accent ${
                solid ? "text-foreground" : "text-white"
              }`;
              return link.isRoute ? (
                <Link key={link.href} to={link.href} className={cls}>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={cls}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="tel:0208163186"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent ${
                solid ? "text-primary" : "text-white"
              }`}
            >
              <Phone className="h-4 w-4" />
              <span className="hidden lg:inline">0208163186</span>
            </a>
            <Button size="lg" className="text-sm" asChild>
              <Link to="/admission">Apply Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 -mr-2 transition-colors ${
              solid ? "text-foreground" : "text-white"
            }`}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 sm:top-20 left-0 right-0 bg-background border-t border-b border-border max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="container mx-auto px-4 py-2 flex flex-col">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium text-foreground hover:text-accent py-3.5 border-b border-border transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href)}
                    className="text-sm font-medium text-foreground hover:text-accent py-3.5 border-b border-border transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <div className="py-5 flex flex-col gap-3">
                <a
                  href="tel:0208163186"
                  className="flex items-center gap-2 text-sm text-primary font-medium"
                >
                  <Phone className="h-4 w-4" />
                  0208163186
                </a>
                <Button size="lg" asChild className="w-full text-sm">
                  <Link
                    to="/admission"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Apply Now
                  </Link>
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
