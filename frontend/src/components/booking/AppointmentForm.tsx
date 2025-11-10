import { useState } from "react";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { AppointmentPayload, Doctor } from "@/types/api";

interface AppointmentFormProps {
  doctor?: Doctor;
  patientId: number;
  onSubmit: (payload: AppointmentPayload) => Promise<void>;
}

export const AppointmentForm = ({ doctor, patientId, onSubmit }: AppointmentFormProps) => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!doctor) {
      toast.error("Please select a doctor before booking.");
      return;
    }

    if (!date || !time) {
      toast.error("Please choose a date and time.");
      return;
    }

    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = setMinutes(setHours(date, hours ?? 0), minutes ?? 0);

    const payload: AppointmentPayload = {
      doctorId: doctor.id,
      patientId,
      appointmentDate: appointmentDate.toISOString(),
      reason,
      notes,
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      toast.success("Appointment booked successfully!");
      setReason("");
      setNotes("");
      setDate(undefined);
      setTime("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-large">
      <CardHeader>
        <CardTitle className="text-2xl">
          {doctor ? `Book with Dr. ${doctor.name} ${doctor.surname}` : "Select a doctor to begin"}
        </CardTitle>
        <CardDescription>
          Pick a convenient time and describe the reason for the visit.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(currentDate) => currentDate < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Appointment Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              placeholder="Follow-up, consultation, routine check-up..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information the doctor should know"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting || !doctor}>
            {isSubmitting ? "Booking..." : "Confirm Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
