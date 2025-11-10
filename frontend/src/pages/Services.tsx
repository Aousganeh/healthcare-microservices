import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Video, 
  HeartPulse, 
  Brain, 
  Bone, 
  Baby,
  Eye,
  Pill,
  ArrowRight
} from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Primary Care",
    description: "Comprehensive health assessments, preventive care, and treatment for common illnesses. Your first point of contact for all health concerns.",
    features: ["Annual checkups", "Vaccinations", "Health screenings", "Chronic disease management"],
  },
  {
    icon: Video,
    title: "Telemedicine",
    description: "Connect with healthcare providers from anywhere through secure video consultations. Perfect for follow-ups and minor concerns.",
    features: ["24/7 availability", "Instant prescriptions", "No travel needed", "Insurance accepted"],
  },
  {
    icon: HeartPulse,
    title: "Cardiology",
    description: "Expert care for heart health including diagnostic tests, treatment plans, and ongoing monitoring of cardiovascular conditions.",
    features: ["ECG testing", "Blood pressure management", "Heart disease prevention", "Cardiac rehabilitation"],
  },
  {
    icon: Brain,
    title: "Neurology",
    description: "Specialized treatment for neurological conditions including headaches, seizures, and movement disorders.",
    features: ["Migraine treatment", "Stroke prevention", "Memory assessment", "Sleep disorders"],
  },
  {
    icon: Bone,
    title: "Orthopedics",
    description: "Comprehensive care for bones, joints, muscles, and ligaments. From sports injuries to arthritis management.",
    features: ["Joint pain treatment", "Sports medicine", "Fracture care", "Physical therapy"],
  },
  {
    icon: Baby,
    title: "Pediatrics",
    description: "Specialized healthcare for infants, children, and adolescents focusing on growth, development, and wellness.",
    features: ["Well-child visits", "Growth monitoring", "Developmental screenings", "Immunizations"],
  },
  {
    icon: Eye,
    title: "Ophthalmology",
    description: "Complete eye care services including examinations, treatments, and surgical interventions for vision problems.",
    features: ["Vision testing", "Eye exams", "Prescription updates", "Disease screening"],
  },
  {
    icon: Pill,
    title: "Pharmacy Services",
    description: "Convenient prescription management with home delivery, medication reviews, and expert pharmaceutical advice.",
    features: ["Online refills", "Home delivery", "Medication sync", "Drug interaction checks"],
  },
];

const Services = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span className="text-sm font-medium text-primary">Our Services</span>
            </div>
            <h1 className="mb-6">Comprehensive Healthcare Services</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From primary care to specialized treatments, we offer a complete range of medical services 
              designed to meet all your healthcare needs in one convenient platform.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-glow transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="bg-gradient-primary p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base mt-2">{service.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button variant="outline" className="w-full group/btn">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book an appointment with one of our specialists or start with a general consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/booking">
                  Book Appointment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Services;
