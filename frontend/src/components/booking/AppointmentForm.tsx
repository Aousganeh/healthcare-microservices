import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";

import type { AppointmentPayload, Doctor } from "@/types/api";
import type { TimeSlot } from "@/lib/api";

interface AppointmentFormProps {
  doctor?: Doctor;
  patientId: number;
  onSubmit: (payload: AppointmentPayload) => Promise<void>;
}

export const AppointmentForm = ({ doctor, patientId, onSubmit }: AppointmentFormProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!doctor) {
      toast.error("Please select a doctor before booking.");
      return;
    }

    if (!date || !selectedTimeSlot) {
      toast.error("Please choose a date and time slot.");
      return;
    }

    const payload: AppointmentPayload = {
      doctorId: doctor.id,
      patientId,
      appointmentDate: selectedTimeSlot.startTime,
      durationMinutes: 30,
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
      setSelectedTimeSlot(null);
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
          <div className="space-y-2">
            <Label>Appointment Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                  onSelect={(newDate) => {
                    setDate(newDate || undefined);
                    setSelectedTimeSlot(null); // Reset time slot when date changes
                    if (newDate) {
                      setCalendarOpen(false); // Close popover after date selection
                    }
                  }}
                    initialFocus
                  disabled={(currentDate) => currentDate < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

          {date && doctor && (
            <div className="space-y-2">
              <TimeSlotPicker
                doctorId={doctor.id}
                date={date}
                selectedTime={selectedTimeSlot?.startTime || null}
                onTimeSelect={setSelectedTimeSlot}
              />
            </div>
          )}

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
