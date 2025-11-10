import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Facebook, Twitter, Instagram, Linkedin, Shield, Award, CheckCircle2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-subtle border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">HealthCare+</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Providing trusted healthcare solutions with modern technology and compassionate care.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["About Us", "Services", "Our Team", "Contact"].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {["Primary Care", "Specialist Consultations", "Telemedicine", "Lab Tests"].map((item) => (
                <li key={item}>
                  <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-muted-foreground text-sm mb-4">
              Subscribe to our newsletter for health tips and updates.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="rounded-xl" />
              <Button variant="hero">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-8 border-t border-b">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Award className="h-5 w-5 text-primary" />
            <span>ISO 27001 Certified</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span>GDPR Compliant</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 text-sm text-muted-foreground">
          <p>© 2025 HealthCare+. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};
