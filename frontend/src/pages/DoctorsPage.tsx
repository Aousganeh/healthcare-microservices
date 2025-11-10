import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, Award, Mail, Phone, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/lib/api";
import type { Doctor } from "@/types/api";
import { Activity } from "lucide-react";

const DoctorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");

  const {
    data: doctors = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor: Doctor) => {
      const matchesSearch =
        `${doctor.name} ${doctor.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialization ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.department ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialization =
        specializationFilter === "all" ||
        (doctor.specialization ?? "").toLowerCase() === specializationFilter.toLowerCase();
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchQuery, specializationFilter]);

  const uniqueSpecializations = useMemo(() => {
    const specializations = new Set<string>();
    doctors.forEach((doctor: Doctor) => {
      if (doctor.specialization) {
        specializations.add(doctor.specialization);
      }
    });
    return Array.from(specializations).sort();
  }, [doctors]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="mb-2">Our Doctors</h1>
            <p className="text-xl text-muted-foreground">
              Meet our experienced healthcare professionals dedicated to your well-being.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, specialization, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Specializations</option>
                  {uniqueSpecializations.map((spec) => (
                    <option key={spec} value={spec.toLowerCase()}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading doctors...</span>
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-destructive text-center">
                Unable to load doctors. Please try again later.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor: Doctor) => {
                  const initials = `${doctor.name?.charAt(0) ?? ""}${doctor.surname?.charAt(0) ?? ""}`.toUpperCase();
                  const experienceLabel =
                    doctor.yearsOfExperience != null
                      ? `${doctor.yearsOfExperience} years experience`
                      : "Experience N/A";
                  const specialization = doctor.specialization ?? "General Practice";

                  return (
                    <Card key={doctor.id} className="hover:shadow-glow transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          {doctor.photoUrl ? (
                            <>
                              <img
                                src={doctor.photoUrl}
                                alt={`${doctor.name} ${doctor.surname}`}
                                className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) {
                                    fallback.style.display = "flex";
                                  }
                                }}
                              />
                              <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold hidden">
                                {initials || <Activity className="h-10 w-10" />}
                              </div>
                            </>
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                              {initials || <Activity className="h-10 w-10" />}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">
                              Dr. {doctor.name} {doctor.surname}
                            </h3>
                            <Badge variant="secondary" className="mb-2">
                              {specialization}
                            </Badge>
                            {doctor.department && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span>{doctor.department}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Award className="h-4 w-4 text-primary" />
                          <span>{experienceLabel}</span>
                        </div>

                        {doctor.workingHoursStart && doctor.workingHoursEnd && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {doctor.workingHoursStart} - {doctor.workingHoursEnd}
                            </span>
                          </div>
                        )}

                        {doctor.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="truncate">{doctor.email}</span>
                          </div>
                        )}

                        {doctor.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>{doctor.phoneNumber}</span>
                          </div>
                        )}

                        <Button variant="hero" className="w-full mt-4" asChild>
                          <Link to={`/booking?doctorId=${doctor.id}`}>Book Appointment</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!isLoading && filteredDoctors.length === 0 && !isError && (
              <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <p className="text-muted-foreground">
                  No doctors match your filters. Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorsPage;

