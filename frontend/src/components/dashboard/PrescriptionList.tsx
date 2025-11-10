import { format } from "date-fns";
import { Pill, Clock, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doctor, Prescription } from "@/types/api";

interface PrescriptionListProps {
  prescriptions: Prescription[];
  doctors: Doctor[];
}

function formatDateRange(start?: string, end?: string) {
  if (!start && !end) {
    return "No schedule information";
  }
  const startText = start ? format(new Date(start), "MMM d, yyyy") : "N/A";
  const endText = end ? format(new Date(end), "MMM d, yyyy") : "N/A";
  return `${startText} - ${endText}`;
}

export const PrescriptionList = ({ prescriptions, doctors }: PrescriptionListProps) => {
  if (!prescriptions.length) {
    return (
      <Card className="shadow-large">
        <CardHeader>
          <CardTitle className="text-2xl">Active Prescriptions</CardTitle>
          <CardDescription>Your current medications and dosages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
            <p className="text-muted-foreground">
              No prescriptions on file. Prescribed medications will appear here once added by your care team.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const doctorLookup = new Map(doctors.map((doctor) => [doctor.id, `${doctor.name} ${doctor.surname}`.trim() || "Clinic"]));

  return (
    <Card className="shadow-large">
      <CardHeader>
        <CardTitle className="text-2xl">Active Prescriptions</CardTitle>
        <CardDescription>Medications currently prescribed for this patient</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {prescriptions.map((prescription) => {
          const doctorName = prescription.prescribingDoctorId
            ? doctorLookup.get(prescription.prescribingDoctorId) ?? "Care Team"
            : "Care Team";
          const status = prescription.status?.toLowerCase() ?? "active";

          return (
            <Card key={prescription.id} className="hover:shadow-medium transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                      <h4 className="font-semibold text-lg">{prescription.medicationName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                  </div>
                </div>
                
                <Badge 
                      variant={status === "active" ? "default" : "secondary"}
                      className={
                        status === "on_hold"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-200"
                          : status === "completed"
                          ? "bg-secondary text-secondary-foreground"
                          : undefined
                      }
                >
                      {status.replace("_", " ")}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                    <span>{formatDateRange(prescription.startDate, prescription.endDate)}</span>
                </div>
                <div className="text-muted-foreground">
                    Prescribed by <span className="font-medium text-foreground">{doctorName}</span>
                </div>
                  {prescription.notes && <p className="text-muted-foreground">{prescription.notes}</p>}
              </div>

                <Button variant="outline" size="sm" className="w-full mt-4" type="button">
                <Download className="h-4 w-4 mr-2" />
                Download Prescription
              </Button>
            </CardContent>
          </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};
