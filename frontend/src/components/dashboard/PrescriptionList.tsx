import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Clock, Download } from "lucide-react";

const prescriptions = [
  {
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "Jan 15, 2025",
    endDate: "Apr 15, 2025",
    status: "active",
  },
  {
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    prescribedBy: "Dr. Michael Chen",
    startDate: "Dec 1, 2024",
    endDate: "Mar 1, 2025",
    status: "active",
  },
  {
    name: "Vitamin D3",
    dosage: "1000 IU",
    frequency: "Once daily",
    prescribedBy: "Dr. Sarah Johnson",
    startDate: "Nov 1, 2024",
    endDate: "Feb 1, 2025",
    status: "expiring",
  },
];

export const PrescriptionList = () => {
  return (
    <Card className="shadow-large">
      <CardHeader>
        <CardTitle className="text-2xl">Active Prescriptions</CardTitle>
        <CardDescription>Your current medications and dosages</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {prescriptions.map((prescription, index) => (
          <Card key={index} className="hover:shadow-medium transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{prescription.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                  </div>
                </div>
                
                <Badge 
                  variant={prescription.status === "active" ? "default" : "secondary"}
                  className={prescription.status === "expiring" ? "bg-accent text-accent-foreground" : ""}
                >
                  {prescription.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {prescription.startDate} - {prescription.endDate}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Prescribed by <span className="font-medium text-foreground">{prescription.prescribedBy}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download Prescription
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};
