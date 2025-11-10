import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Loader2, Users, Clock } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAppointmentsByDoctor, getDoctors } from "@/lib/api";
import type { AppointmentDetail, Doctor } from "@/types/api";

const DoctorDashboard = () => {
  const { user } = useAuth();

  // Get doctor by email
  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });

  const doctor = useMemo(() => {
    return doctors.find((d: Doctor) => d.email === user?.email);
  }, [doctors, user?.email]);

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
  } = useQuery({
    queryKey: ["appointments", "doctor", doctor?.id],
    queryFn: () => getAppointmentsByDoctor(doctor!.id),
    enabled: !!doctor?.id,
  });

  const todayAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointments.filter((appointment: AppointmentDetail) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === today.getTime();
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((appointment: AppointmentDetail) => new Date(appointment.appointmentDate) >= now)
      .sort(
        (a: AppointmentDetail, b: AppointmentDetail) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(),
      )
      .slice(0, 5);
  }, [appointments]);

  if (isLoadingDoctors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Doctor profile not found for {user?.email}. Please contact support.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Doctor dashboard</p>
                <h1 className="mb-2">
                  Welcome back, Dr. {doctor.name} {doctor.surname}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {doctor.specialization} • {doctor.department || "General Practice"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Scheduled for today</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Future appointments</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-large">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-primary" />
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Your upcoming patient appointments</CardDescription>
                  </div>
                  {isLoadingAppointments && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.length ? (
                  upcomingAppointments.map((appointment: AppointmentDetail) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    return (
                      <Card key={appointment.id} className="hover:shadow-medium transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-lg">
                                {appointment.patientName || "Patient"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.reason || "Consultation"}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm">
                                <Badge variant="secondary">
                                  {appointmentDate.toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </Badge>
                                <Badge variant="outline">
                                  {appointmentDate.toLocaleTimeString(undefined, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Badge>
                                {appointment.status && <Badge variant="outline">{appointment.status}</Badge>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                    <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;

