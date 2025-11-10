import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Shield, Heart } from "lucide-react";
import heroImage from "@/assets/hero-healthcare.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your health, our priority</span>
            </div>
            
            <h1 className="mb-6 leading-tight">
              Modern Healthcare,
              <span className="block gradient-text">Made Simple</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              Experience seamless healthcare with our integrated platform. Book appointments, consult specialists, 
              and manage your health—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button variant="hero" size="lg" className="group" asChild>
                <Link to="/booking">
                  Book Appointment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild>
                <Link to="/services">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground">Happy Patients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">200+</div>
                <div className="text-sm text-muted-foreground">Expert Doctors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-1">99%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-3xl overflow-hidden shadow-large">
              <img 
                src={heroImage} 
                alt="Modern healthcare facility" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 glass-effect p-4 rounded-2xl shadow-large animate-pulse-glow hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-primary p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">Quick Booking</div>
                  <div className="text-xs text-muted-foreground">24/7 Available</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 glass-effect p-4 rounded-2xl shadow-large hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="bg-accent p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">Secure & Private</div>
                  <div className="text-xs text-muted-foreground">HIPAA Compliant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
