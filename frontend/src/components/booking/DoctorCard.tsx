import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Award, Mail, Phone } from "lucide-react";
import type { Doctor } from "@/types/api";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard = ({ doctor, onBook }: DoctorCardProps) => {
  const initials = `${doctor.name?.charAt(0) ?? ""}${doctor.surname?.charAt(0) ?? ""}`.toUpperCase();
  const experienceLabel =
    doctor.yearsOfExperience != null ? `${doctor.yearsOfExperience} years experience` : "Experience N/A";
  const specialization = doctor.specialization ?? "General Practice";

  return (
    <Card className="hover:shadow-glow transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
              {initials || <Activity className="h-8 w-8" />}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1">
                {doctor.name} {doctor.surname}
              </h3>
              <Badge variant="secondary" className="mb-2">
                {specialization}
              </Badge>
              {doctor.department && (
                <div className="text-sm text-muted-foreground">
                  Department: <span className="font-medium text-foreground">{doctor.department}</span>
              </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="h-4 w-4 text-primary" />
          <span>{experienceLabel}</span>
        </div>
        
        {doctor.email && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" />
            <span>{doctor.email}</span>
        </div>
        )}
        
        {doctor.phoneNumber && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" />
            <span>{doctor.phoneNumber}</span>
        </div>
        )}

        <Button 
          variant="hero" 
          className="w-full mt-4"
          onClick={() => onBook(doctor)}
        >
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
};
