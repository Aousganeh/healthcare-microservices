import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Download, FileText, Loader2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HealthMetrics } from "@/components/dashboard/HealthMetrics";
import { PrescriptionList } from "@/components/dashboard/PrescriptionList";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAppointmentsByPatient, getDoctors, getHealthMetrics, getPatientByEmail, getPrescriptions } from "@/lib/api";
import type { AppointmentDetail, Doctor } from "@/types/api";

const Dashboard = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);

  const {
    data: patientDetail,
    isLoading: isLoadingPatient,
    isError: hasPatientError,
  } = useQuery({
    queryKey: ["patient", "email", user?.email],
    queryFn: () => getPatientByEmail(user!.email!),
    enabled: !!user?.email && !isAdmin && !isDoctor,
    retry: false,
  });

  const patientId = patientDetail?.id;

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
  } = useQuery({
    queryKey: ["appointments", "patient", patientId],
    queryFn: () => getAppointmentsByPatient(patientId!),
    enabled: !!patientId,
  });

  const {
    data: metrics = [],
    isLoading: isLoadingMetrics,
  } = useQuery({
    queryKey: ["health-metrics", patientId],
    queryFn: () => getHealthMetrics(patientId!),
    enabled: !!patientId,
  });

  const {
    data: prescriptions = [],
    isLoading: isLoadingPrescriptions,
  } = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: () => getPrescriptions(patientId!),
    enabled: !!patientId,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
  });

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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Patient dashboard</p>
                <h1 className="mb-2">
                  Welcome back,{" "}
                  {isLoadingPatient ? (
                    <span className="text-muted-foreground">Loading...</span>
                  ) : hasPatientError ? (
                    <span className="text-muted-foreground">{user?.username || "User"}</span>
                  ) : (
                    `${patientDetail?.name ?? ""} ${patientDetail?.surname ?? ""}`.trim() || user?.username || "Patient"
                  )}
                </h1>
                <p className="text-xl text-muted-foreground">Track appointments, medications, and health trends.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/booking">
                    Book New Appointment
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Health Metrics</h2>
              {isLoadingMetrics && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating metrics...
                </span>
              )}
            </div>
            <HealthMetrics metrics={metrics} />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-large">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-primary" />
                        Upcoming Appointments
                      </CardTitle>
                      <CardDescription>
                        Your upcoming appointments
                      </CardDescription>
                    </div>
                    {isLoadingAppointments && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.length ? (
                    upcomingAppointments.map((appointment: AppointmentDetail) => {
                      const doctorName = appointment.doctorName ?? "Assigned Doctor";
                      const appointmentDate = new Date(appointment.appointmentDate);
                      return (
                        <Card key={appointment.id} className="hover:shadow-medium transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">{doctorName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.doctorSpecialization ?? "General Practice"}
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setRescheduleDialogOpen(true);
                                }}
                              >
                                Reschedule
                              </Button>
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
                  <Button variant="hero" className="w-full" asChild>
                    <Link to="/booking">
                      Schedule New Appointment
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-large">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Care Notes
                  </CardTitle>
                  <CardDescription>Recent appointment notes and summaries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {appointments.slice(0, 3).map((appointment: AppointmentDetail) => (
                    <div
                      key={`note-${appointment.id}`}
                      className="rounded-lg border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} •{" "}
                            {appointment.doctorName ?? "Care Team"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {appointment.reason ?? "Routine consultation"}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="mr-2 h-4 w-4" />
                          Summary
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!appointments.length && (
                    <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
                      <p className="text-muted-foreground">No visit summaries yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <PrescriptionList prescriptions={prescriptions} doctors={doctors as Doctor[]} />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {selectedAppointment && (
        <RescheduleDialog
          appointment={selectedAppointment}
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["appointments", "patient", patientId] });
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;



