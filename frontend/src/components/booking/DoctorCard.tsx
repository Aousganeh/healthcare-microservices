import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Award } from "lucide-react";

interface DoctorCardProps {
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  experience: string;
  onBook: () => void;
}

export const DoctorCard = ({
  name,
  specialty,
  rating,
  reviews,
  location,
  availability,
  experience,
  onBook,
}: DoctorCardProps) => {
  return (
    <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">{name}</h3>
              <Badge variant="secondary" className="mb-2">
                {specialty}
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">{rating}</span>
                <span className="text-muted-foreground">({reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-primary" />
          <span>{experience} years experience</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>{availability}</span>
        </div>

        <Button 
          variant="hero" 
          className="w-full mt-4"
          onClick={onBook}
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
};
