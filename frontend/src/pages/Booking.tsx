import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DoctorCard } from "@/components/booking/DoctorCard";
import { AppointmentForm } from "@/components/booking/AppointmentForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    rating: 4.9,
    reviews: 127,
    location: "Downtown Medical Center",
    availability: "Available Today",
    experience: "15",
  },
  {
    name: "Dr. Michael Chen",
    specialty: "General Practice",
    rating: 4.8,
    reviews: 203,
    location: "Northside Clinic",
    availability: "Next Available: Tomorrow",
    experience: "12",
  },
  {
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    rating: 5.0,
    reviews: 156,
    location: "Children's Health Center",
    availability: "Available Today",
    experience: "10",
  },
  {
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    rating: 4.7,
    reviews: 89,
    location: "Sports Medicine Clinic",
    availability: "Next Available: 2 days",
    experience: "18",
  },
];

const Booking = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookDoctor = (doctorName: string) => {
    setSelectedDoctor(doctorName);
    // Scroll to form
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-hero py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="text-sm font-medium text-primary">Book Appointment</span>
              </div>
              <h1 className="mb-6">Find Your Perfect Healthcare Provider</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Search from our network of expert doctors and book your appointment instantly.
              </p>

              {/* Search Bar */}
              <div className="flex gap-3 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by doctor name or specialty..."
                    className="pl-10 h-12 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48 h-12 rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="general">General Practice</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Doctors List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Available Doctors</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => (
                <DoctorCard
                  key={index}
                  {...doctor}
                  onBook={() => handleBookDoctor(doctor.name)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section id="booking-form" className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {selectedDoctor && (
                <div className="mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-muted-foreground">Booking appointment with</p>
                  <p className="font-semibold text-lg text-primary">{selectedDoctor}</p>
                </div>
              )}
              <AppointmentForm />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Booking;
