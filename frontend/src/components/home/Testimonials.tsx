import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    content: "HealthCare+ transformed how I manage my family's health. Booking appointments is effortless, and the doctors are incredibly professional.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Regular User",
    content: "The telemedicine feature is a game-changer. I can consult with specialists without leaving home. Highly recommend!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Patient",
    content: "Having all my medical records in one place gives me peace of mind. The platform is secure and easy to navigate.",
    rating: 5,
  },
];

export const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-medium text-primary">Testimonials</span>
          </div>
          <h2 className="mb-4">What Our Patients Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who trust us with their healthcare journey.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-8 md:p-12">
              <Quote className="h-12 w-12 text-primary/20 mb-6" />
              
              <div className="mb-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonials[current].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl mb-6 leading-relaxed">
                  "{testimonials[current].content}"
                </p>
              </div>

              <div>
                <div className="font-semibold text-lg">{testimonials[current].name}</div>
                <div className="text-muted-foreground">{testimonials[current].role}</div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === current ? "w-8 bg-primary" : "w-2 bg-primary/30"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="rounded-full"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
