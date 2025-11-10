import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Clock,
  MapPin,
  Calendar,
  GraduationCap,
  Activity,
  Settings,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { getDoctor, updateDoctor } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatWorkingDays, parseWorkingDays, DAYS_OF_WEEK } from "@/utils/workingDays";
import type { Doctor } from "@/types/api";
import { toast } from "sonner";

const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, isDoctor } = useAuth();
  const queryClient = useQueryClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [workingHoursStart, setWorkingHoursStart] = useState("");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("");
  const [workingDays, setWorkingDays] = useState("");

  const {
    data: doctor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctor(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading doctor profile...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">Doctor not found</p>
                <Button variant="outline" onClick={() => navigate("/doctors")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Doctors
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = `${doctor.name?.charAt(0) ?? ""}${doctor.surname?.charAt(0) ?? ""}`.toUpperCase();
  const experienceLabel =
    doctor.yearsOfExperience != null ? `${doctor.yearsOfExperience} years experience` : "Experience N/A";
  const specialization = doctor.specialization ?? "General Practice";
  const isOwnProfile = isDoctor && user?.email === doctor.email;

  const formatTimeForInput = (time?: string) => {
    if (!time) return "09:00";
    return time.substring(0, 5);
  };

  const updateDoctorMutation = useMutation({
    mutationFn: (data: Partial<Doctor>) => {
      if (!doctor?.id) {
        throw new Error("Doctor ID is required");
      }
      return updateDoctor(doctor.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
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

  const handleOpenSettings = () => {
    setWorkingHoursStart(formatTimeForInput(doctor.workingHoursStart));
    setWorkingHoursEnd(formatTimeForInput(doctor.workingHoursEnd));
    setWorkingDays(doctor.workingDays || "");
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    updateDoctorMutation.mutate({
      workingHoursStart,
      workingHoursEnd,
      workingDays,
    });
  };


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-8">
          <div className="container mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate("/doctors")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Doctors
            </Button>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {doctor.photoUrl ? (
                        <>
                          <img
                            src={doctor.photoUrl}
                            alt={`${doctor.name} ${doctor.surname}`}
                            className="h-32 w-32 rounded-full object-cover border-4 border-primary/20"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = "flex";
                              }
                            }}
                          />
                          <div className="h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold hidden">
                            {initials || <Activity className="h-16 w-16" />}
                          </div>
                        </>
                      ) : (
                        <div className="h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold">
                          {initials || <Activity className="h-16 w-16" />}
                        </div>
                      )}

                      <div>
                        <h1 className="text-2xl font-bold mb-1">
                          Dr. {doctor.name} {doctor.surname}
                        </h1>
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          {specialization}
                        </Badge>
                      </div>

                      {doctor.dutyStatus && (
                        <Badge
                          variant={doctor.dutyStatus === "ON_DUTY" ? "default" : "outline"}
                          className="text-sm"
                        >
                          {doctor.dutyStatus.replace("_", " ")}
                        </Badge>
                      )}

                      {isOwnProfile && (
                        <Button variant="outline" className="w-full" onClick={handleOpenSettings}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Working Hours
                        </Button>
                      )}

                      {isAuthenticated && !isOwnProfile && (
                        <Button variant="hero" className="w-full" asChild>
                          <Link to={`/booking?doctorId=${doctor.id}`}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Appointment
                          </Link>
                        </Button>
                      )}

                      {!isAuthenticated && (
                        <Button variant="hero" className="w-full" asChild>
                          <Link to="/login">
                            <Calendar className="h-4 w-4 mr-2" />
                            Login to Book Appointment
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Experience</p>
                          <p className="font-medium">{experienceLabel}</p>
                        </div>
                      </div>

                      {doctor.department && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{doctor.department}</p>
                          </div>
                        </div>
                      )}

                      {doctor.workingHoursStart && doctor.workingHoursEnd && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Working Hours</p>
                            <p className="font-medium">
                              {formatTimeForInput(doctor.workingHoursStart)} - {formatTimeForInput(doctor.workingHoursEnd)}
                            </p>
                          </div>
                        </div>
                      )}

                      {doctor.workingDays && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-2">Working Days</p>
                            <p className="font-medium mb-2">{formatWorkingDays(doctor.workingDays)}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {DAYS_OF_WEEK.map((day) => {
                                const selectedDays = parseWorkingDays(doctor.workingDays);
                                const isSelected = selectedDays.includes(day.value);
                                return (
                                  <Badge
                                    key={day.value}
                                    variant={isSelected ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {day.short}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {doctor.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <a href={`mailto:${doctor.email}`} className="font-medium hover:underline">
                              {doctor.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {doctor.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <a href={`tel:${doctor.phoneNumber}`} className="font-medium hover:underline">
                              {doctor.phoneNumber}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {doctor.qualifications && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Qualifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-line">{doctor.qualifications}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {isOwnProfile && (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Working Hours & Days</DialogTitle>
              <DialogDescription>
                Update your working hours and days to help patients book appointments at available times.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  />
                </div>
              </div>
              <WorkingDaysSelector value={workingDays} onChange={setWorkingDays} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={updateDoctorMutation.isPending || !workingHoursStart || !workingHoursEnd}
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
      )}
    </div>
  );
};

export default DoctorProfile;

