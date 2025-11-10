import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HealthMetrics } from "@/components/dashboard/HealthMetrics";
import { PrescriptionList } from "@/components/dashboard/PrescriptionList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Download, Clock } from "lucide-react";

const Dashboard = () => {
  const upcomingAppointments = [
    {
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiology",
      date: "Jan 28, 2025",
      time: "10:00 AM",
      type: "Follow-up",
    },
    {
      doctor: "Dr. Michael Chen",
      specialty: "General Practice",
      date: "Feb 5, 2025",
      time: "2:30 PM",
      type: "Annual Checkup",
    },
  ];

  const recentLabResults = [
    { test: "Complete Blood Count", date: "Jan 10, 2025", status: "Normal" },
    { test: "Lipid Panel", date: "Jan 10, 2025", status: "Normal" },
    { test: "Thyroid Function", date: "Dec 15, 2024", status: "Normal" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2">Welcome Back, John!</h1>
                <p className="text-xl text-muted-foreground">
                  Here's an overview of your health journey
                </p>
              </div>
              <Button variant="hero" size="lg" className="hidden md:inline-flex">
                Book New Appointment
              </Button>
            </div>
          </div>
        </section>

        {/* Health Metrics */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Your Health Metrics</h2>
            <HealthMetrics />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Appointments & Lab Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Appointments */}
              <Card className="shadow-large">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    Upcoming Appointments
                  </CardTitle>
                  <CardDescription>Your scheduled visits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <Card key={index} className="hover:shadow-medium transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{appointment.doctor}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{appointment.specialty}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="hero" className="w-full">
                    Schedule New Appointment
                  </Button>
                </CardContent>
              </Card>

              {/* Lab Results */}
              <Card className="shadow-large">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Recent Lab Results
                  </CardTitle>
                  <CardDescription>Your latest test results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentLabResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium">{result.test}</h4>
                          <p className="text-sm text-muted-foreground">{result.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-primary">{result.status}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Results
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Prescriptions */}
            <div className="lg:col-span-1">
              <PrescriptionList />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
