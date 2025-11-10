import { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Filter, Loader2, Search } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DoctorCard } from "@/components/booking/DoctorCard";
import { AppointmentForm } from "@/components/booking/AppointmentForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getDoctors, getPatientByEmail, createAppointment } from "@/lib/api";
import type { AppointmentPayload, Doctor } from "@/types/api";

const Booking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();

  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
    isError: hasDoctorError,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });

  useEffect(() => {
    const doctorId = searchParams.get("doctorId");
    if (doctorId && doctors.length > 0) {
      const doctor = doctors.find((d: Doctor) => d.id === Number(doctorId));
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [searchParams, doctors]);

  // Get patient by user's email
  const {
    data: patient,
    isLoading: isLoadingPatient,
    isError: hasPatientError,
  } = useQuery({
    queryKey: ["patient", "email", user?.email],
    queryFn: () => getPatientByEmail(user!.email!),
    enabled: !!user?.email,
    retry: false,
  });

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor: Doctor) => {
      const matchesSearch =
        `${doctor.name} ${doctor.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialization ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialization =
        specializationFilter === "all" ||
        (doctor.specialization ?? "").toLowerCase() === specializationFilter.toLowerCase();
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchQuery, specializationFilter]);

  const createAppointmentMutation = useMutation({
    mutationFn: (payload: AppointmentPayload) => createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "patient"] });
    },
  });

  const handleBookDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSearchParams({ doctorId: doctor.id.toString() });
  };

  const uniqueSpecializations = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((doctor: Doctor) => {
      if (doctor.specialization) {
        set.add(doctor.specialization);
      }
    });
    return Array.from(set);
  }, [doctors]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-sm font-medium text-primary">Book Appointment</span>
              </div>
              <h1 className="mb-6">Find Your Perfect Healthcare Provider</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Explore our network of specialists and secure an appointment in just a few clicks.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by doctor name or specialty..."
                    className="pl-10 h-12 rounded-xl"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {uniqueSpecializations.map((specialization) => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Available Doctors</h2>
              {(isLoadingDoctors || isLoadingPatient) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading data...
                </div>
              )}
            </div>

            {hasDoctorError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-destructive">
                Unable to load doctors. Please try again later.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor: Doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} onBook={handleBookDoctor} />
                ))}
              </div>
            )}

            {!isLoadingDoctors && filteredDoctors.length === 0 && !hasDoctorError && (
              <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                <p className="text-muted-foreground">
                  No doctors match your filters. Try adjusting your search or filters.
                </p>
              </div>
            )}

            {selectedDoctor && (
              <div className="mt-12 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Appointment Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Selected: Dr. {selectedDoctor.name} {selectedDoctor.surname}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDoctor(undefined);
                      setSearchParams({});
                    }}
                  >
                    Clear selection
                  </Button>
                </div>

                {hasPatientError ? (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive">
                    <p className="font-semibold mb-2">Patient profile not found</p>
                    <p className="text-sm">
                      Please contact support to create a patient profile for your account ({user?.email}).
                    </p>
                  </div>
                ) : isLoadingPatient ? (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Loading your profile...</p>
                  </div>
                ) : patient ? (
                  <AppointmentForm
                    doctor={selectedDoctor}
                    patientId={patient.id}
                    onSubmit={(payload) => createAppointmentMutation.mutateAsync(payload)}
                  />
                ) : null}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
