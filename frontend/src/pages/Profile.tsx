import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User as UserIcon, Mail, Settings, Edit2, Phone, Award, Clock, Calendar, GraduationCap, Activity, MapPin, Save } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkingDaysSelector } from "@/components/WorkingDaysSelector";
import { getDoctors, updateDoctor } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatWorkingDays, parseWorkingDays, DAYS_OF_WEEK } from "@/utils/workingDays";
import type { Doctor } from "@/types/api";
import { toast } from "sonner";

const Profile = () => {
  const { user, isDoctor } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: doctors = [],
    isLoading: isLoadingDoctors,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    enabled: isDoctor,
  });

  const doctor = useMemo(() => {
    if (!isDoctor) return null;
    return doctors.find((d: Doctor) => d.email === user?.email);
  }, [doctors, user?.email, isDoctor]);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    specialization: "",
    department: "",
    phoneNumber: "",
    qualifications: "",
    workingHoursStart: "",
    workingHoursEnd: "",
    workingDays: "",
    photoUrl: "",
  });

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
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", doctor?.id] });
      toast.success("Profile updated successfully");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update profile", {
        description: error.message,
      });
    },
  });

  const handleEditClick = () => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        surname: doctor.surname || "",
        specialization: doctor.specialization || "",
        department: doctor.department || "",
        phoneNumber: doctor.phoneNumber || "",
        qualifications: doctor.qualifications || "",
        workingHoursStart: formatTimeForInput(doctor.workingHoursStart),
        workingHoursEnd: formatTimeForInput(doctor.workingHoursEnd),
        workingDays: doctor.workingDays || "",
        photoUrl: doctor.photoUrl || "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleSave = () => {
    if (doctor) {
      updateDoctorMutation.mutate({
        name: formData.name,
        surname: formData.surname,
        specialization: formData.specialization,
        licenseNumber: doctor.licenseNumber,
        email: doctor.email,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        dutyStatus: doctor.dutyStatus,
        yearsOfExperience: doctor.yearsOfExperience,
        qualifications: formData.qualifications,
        workingHoursStart: formData.workingHoursStart,
        workingHoursEnd: formData.workingHoursEnd,
        workingDays: formData.workingDays,
        photoUrl: formData.photoUrl,
        gender: doctor.gender,
        dateOfBirth: doctor.dateOfBirth,
      });
    }
  };

  if (isLoadingDoctors && isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = doctor ? `${doctor.name?.charAt(0) ?? ""}${doctor.surname?.charAt(0) ?? ""}`.toUpperCase() : (user?.firstName && user?.lastName ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : "U");
  const experienceLabel = doctor?.yearsOfExperience != null ? `${doctor.yearsOfExperience} years experience` : "Experience N/A";

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-2">My Profile</h1>
                <p className="text-xl text-muted-foreground">
                  {isDoctor && doctor ? `Dr. ${doctor.name} ${doctor.surname}` : user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "View and manage your account information"}
                </p>
              </div>
              {isDoctor && doctor && (
                <Button variant="outline" onClick={handleEditClick}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isDoctor && doctor ? (
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
                            {doctor.specialization}
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
            ) : (
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{user?.username}</p>
                      </div>
                    </div>

                    {user?.firstName && user?.lastName && (
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {user?.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={
                                role === "ROLE_ADMIN"
                                  ? "destructive"
                                  : role === "ROLE_DOCTOR"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {role.replace("ROLE_", "")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {isDoctor && !doctor && (
                      <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <p className="text-sm text-muted-foreground">
                          Your doctor profile is being set up. Please contact an administrator.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {isDoctor && doctor && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information. All fields are editable.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name *</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workingHoursStart">Working Hours Start *</Label>
                  <Input
                    id="workingHoursStart"
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData({ ...formData, workingHoursStart: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHoursEnd">Working Hours End *</Label>
                  <Input
                    id="workingHoursEnd"
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData({ ...formData, workingHoursEnd: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Working Days</Label>
                <WorkingDaysSelector value={formData.workingDays} onChange={(value) => setFormData({ ...formData, workingDays: value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Textarea
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  rows={4}
                  placeholder="Enter your qualifications, certifications, and education..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateDoctorMutation.isPending || !formData.name || !formData.surname || !formData.specialization || !formData.workingHoursStart || !formData.workingHoursEnd}
              >
                {updateDoctorMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Profile;
