import { useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, User as UserIcon, Mail, Settings } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Doctor } from "@/types/api";

const Profile = () => {
  const { user, isDoctor } = useAuth();
  const navigate = useNavigate();
  const hasNavigatedRef = useRef(false);

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

  useEffect(() => {
    if (isDoctor && doctor?.id && !isLoadingDoctors && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      navigate(`/doctors/${doctor.id}`);
    }
  }, [isDoctor, doctor?.id, isLoadingDoctors, navigate]);

  if (isLoadingDoctors && isDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isDoctor && doctor) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-20">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="mb-2">My Profile</h1>
            <p className="text-xl text-muted-foreground">View and manage your account information</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

