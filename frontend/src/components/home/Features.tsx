import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Video, FileText, Clock, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book appointments instantly with our smart scheduling system. Choose your preferred doctor and time slot.",
  },
  {
    icon: Video,
    title: "Telemedicine",
    description: "Connect with healthcare providers remotely through secure video consultations from anywhere.",
  },
  {
    icon: FileText,
    title: "Digital Records",
    description: "Access your complete medical history, prescriptions, and lab results in one secure place.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer support and emergency consultation services whenever you need them.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Enterprise-grade security with HIPAA compliance ensuring your data stays private and protected.",
  },
  {
    icon: Smartphone,
    title: "Mobile Access",
    description: "Manage your healthcare on the go with our responsive platform accessible on any device.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 md:py-32 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-medium text-primary">What We Offer</span>
          </div>
          <h2 className="mb-4">Everything You Need for Better Health</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform brings together all essential healthcare services in one intuitive experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-glow transition-all duration-300 cursor-pointer border-primary/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="bg-gradient-primary p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
