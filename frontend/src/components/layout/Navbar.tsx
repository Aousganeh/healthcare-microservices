import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, Activity, LogOut, User, Shield } from "lucide-react";
import { NavLink } from "@/components/navigation/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { getDoctors, getPatientByEmail } from "@/lib/api";
import type { Doctor } from "@/types/api";

export const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isDoctor } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    data: doctors = [],
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    enabled: isDoctor,
  });

  const {
    data: patient,
  } = useQuery({
    queryKey: ["patient", "email", user?.email],
    queryFn: () => getPatientByEmail(user!.email!),
    enabled: !isDoctor && !!user?.email,
    retry: false,
  });

  const doctor = useMemo(() => {
    if (!isDoctor || !user?.email) return null;
    return doctors.find((d: Doctor) => d.email === user.email);
  }, [doctors, user?.email, isDoctor]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const getUserDisplayName = () => {
    if (!user?.firstName) {
      return user?.username || "Patient";
    }
    if (isDoctor) {
      return `Dr. ${user.firstName}`;
    }
    const gender = doctor?.gender || patient?.gender || "MALE";
    const prefix = gender === "FEMALE" ? "Ms." : "Mr.";
    return `${prefix} ${user.firstName}`;
  };

  const getUserPhoto = () => {
    if (isDoctor && doctor?.photoUrl) {
      return doctor.photoUrl;
    }
    return null;
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "P";
  };

  const displayName = getUserDisplayName();
  const userPhoto = getUserPhoto();
  const userInitials = getUserInitials();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/services", label: "Services" },
    { to: "/doctors", label: "Doctors" },
    ...(isAdmin
      ? [{ to: "/admin/dashboard", label: "Admin" }]
      : isDoctor
      ? [
          { to: "/doctor/dashboard", label: "Dashboard" },
        ]
      : [
          { to: "/booking", label: "Book Appointment" },
          { to: "/dashboard", label: "Dashboard" },
        ]),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-effect shadow-medium" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-primary p-2 rounded-xl group-hover:shadow-glow transition-all">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">HealthCare+</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
                activeClassName="text-primary font-semibold"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden md:inline-flex"
                >
                  <Link to="/profile" className="flex items-center gap-2">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt={displayName}
                        className="h-6 w-6 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-6 w-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold ${userPhoto ? "hidden" : ""}`}
                    >
                      {userInitials}
                    </div>
                    <span>{displayName}</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={logout} className="hidden md:inline-flex">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="hero" size="sm" asChild className="hidden md:inline-flex">
                  <Link to="/register">Sign Up</Link>
            </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-foreground/70 hover:bg-primary/10 hover:text-primary transition-all"
                  activeClassName="bg-primary/10 text-primary font-semibold"
                >
                  {link.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="mt-2 justify-start"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/profile" className="flex items-center gap-2">
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={displayName}
                          className="h-6 w-6 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-6 w-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold ${userPhoto ? "hidden" : ""}`}
                      >
                        {userInitials}
                      </div>
                      <span>{displayName}</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="mt-2" onClick={() => { logout(); setIsMenuOpen(false); }}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="mt-2" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="hero" className="mt-2" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/register">Sign Up</Link>
              </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
