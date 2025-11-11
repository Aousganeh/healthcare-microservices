import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, Users, Clock, Settings, CheckCircle, XCircle, CalendarClock } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkingDaysSelector } from "@/components/WorkingDaysSelector";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { getAppointmentsByDoctor, getDoctors, updateDoctor, approveAppointment, rejectAppointment } from "@/lib/api";
import type { AppointmentDetail, Doctor } from "@/types/api";
import { toast } from "sonner";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState("");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("");
  const [workingDays, setWorkingDays] = useState("");

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
      .filter(
        (appointment: AppointmentDetail) =>
          new Date(appointment.appointmentDate) >= now && appointment.status !== "PENDING" && appointment.status !== "REJECTED" && appointment.status !== "CANCELLED"
      )
      .sort(
        (a: AppointmentDetail, b: AppointmentDetail) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(),
      )
      .slice(0, 5);
  }, [appointments]);

  const pendingAppointments = useMemo(() => {
    return appointments.filter((appointment: AppointmentDetail) => appointment.status === "PENDING");
  }, [appointments]);

  const allAppointments = useMemo(() => {
    return [...appointments].sort(
      (a: AppointmentDetail, b: AppointmentDetail) =>
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime(),
    );
  }, [appointments]);

  const updateDoctorMutation = useMutation({
    mutationFn: (data: Partial<Doctor>) => updateDoctor(doctor!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Working hours and days updated successfully");
      setIsSettingsOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update working hours", {
        description: error.message,
      });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (appointmentId: number) => approveAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "doctor"] });
      toast.success("Appointment approved successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to approve appointment", {
        description: error.message,
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: number; reason?: string }) =>
      rejectAppointment(appointmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "doctor"] });
      toast.success("Appointment rejected");
    },
    onError: (error: Error) => {
      toast.error("Failed to reject appointment", {
        description: error.message,
      });
    },
  });

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);

  const handleOpenSettings = () => {
    if (doctor) {
      setWorkingHoursStart(doctor.workingHoursStart || "09:00");
      setWorkingHoursEnd(doctor.workingHoursEnd || "17:00");
      setWorkingDays(doctor.workingDays || "");
      setIsSettingsOpen(true);
    }
  };

  const handleSaveSettings = () => {
    if (doctor) {
      const workingDaysEmpty = !workingDays || workingDays.trim() === "";
      updateDoctorMutation.mutate({
        name: doctor.name,
        surname: doctor.surname,
        specializationId: doctor.specializationId || 0,
        licenseNumber: doctor.licenseNumber,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        department: doctor.department,
        dutyStatus: doctor.dutyStatus,
        yearsOfExperience: doctor.yearsOfExperience,
        qualifications: doctor.qualifications,
        workingHoursStart: workingDaysEmpty ? "" : workingHoursStart,
        workingHoursEnd: workingDaysEmpty ? "" : workingHoursEnd,
        workingDays,
        photoUrl: doctor.photoUrl,
        gender: doctor.gender,
        dateOfBirth: doctor.dateOfBirth,
      });
    }
  };

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
                  {doctor.specializationName || doctor.specialization || "N/A"} • {doctor.department || "General Practice"}
                </p>
              </div>
              <Button variant="outline" onClick={handleOpenSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Update Working Hours
              </Button>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingAppointments.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

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

            {pendingAppointments.length > 0 && (
              <Card className="shadow-large mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <Clock className="h-6 w-6 text-primary" />
                        Pending Appointments
                      </CardTitle>
                      <CardDescription>Appointments waiting for your approval</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {pendingAppointments.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingAppointments.map((appointment: AppointmentDetail) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    return (
                      <Card key={appointment.id} className="hover:shadow-medium transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <h4 className="font-semibold text-lg">
                                {appointment.patientName || "Patient"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.reason || "Consultation"}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm mt-2">
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
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                  PENDING
                                </Badge>
                              </div>
                              {appointment.patientEmail && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {appointment.patientEmail}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveMutation.mutate(appointment.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setRescheduleDialogOpen(true);
                                }}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                <CalendarClock className="h-4 w-4 mr-2" />
                                Reschedule
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMutation.mutate({ appointmentId: appointment.id })}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            )}

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
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-1 flex-1">
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

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Working Hours & Days</DialogTitle>
            <DialogDescription>
              Update your working hours and days to help patients book appointments at available times.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">
                  Start Time {workingDays && workingDays.trim() !== "" ? "*" : ""}
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  disabled={!workingDays || workingDays.trim() === ""}
                  required={workingDays && workingDays.trim() !== ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">
                  End Time {workingDays && workingDays.trim() !== "" ? "*" : ""}
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  disabled={!workingDays || workingDays.trim() === ""}
                  required={workingDays && workingDays.trim() !== ""}
                />
              </div>
            </div>
            <WorkingDaysSelector 
              value={workingDays} 
              onChange={(value) => {
                setWorkingDays(value);
                if (!value || value.trim() === "") {
                  setWorkingHoursStart("");
                  setWorkingHoursEnd("");
                }
              }} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={
                updateDoctorMutation.isPending || 
                (workingDays && workingDays.trim() !== "" && (!workingHoursStart || !workingHoursEnd))
              }
            >
              {updateDoctorMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedAppointment && (
        <RescheduleDialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          appointment={selectedAppointment}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["appointments", "doctor"] });
            setRescheduleDialogOpen(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;

