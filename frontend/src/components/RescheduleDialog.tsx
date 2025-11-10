import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";
import type { AppointmentDetail } from "@/types/api";
import { rescheduleAppointment, type RescheduleRequest, type TimeSlot } from "@/lib/api";

interface RescheduleDialogProps {
  appointment: AppointmentDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RescheduleDialog({ appointment, open, onOpenChange, onSuccess }: RescheduleDialogProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !selectedTimeSlot) {
      toast.error("Please select both date and time slot");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: RescheduleRequest = {
        newAppointmentDate: selectedTimeSlot.startTime,
        durationMinutes: appointment.durationMinutes || 30,
      };

      await rescheduleAppointment(appointment.id, request);
      toast.success("Appointment rescheduled successfully!");
      onSuccess();
      onOpenChange(false);
      setDate(undefined);
      setSelectedTimeSlot(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reschedule appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Choose a new date and time for your appointment with {appointment.doctorName || "the doctor"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">New Appointment Date</Label>
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
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setSelectedTimeSlot(null); // Reset time slot when date changes
                    }}
                    initialFocus
                    disabled={(currentDate) => currentDate < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {date && appointment.doctorId && (
              <div className="grid gap-2">
                <TimeSlotPicker
                  doctorId={appointment.doctorId}
                  date={date}
                  selectedTime={selectedTimeSlot?.startTime || null}
                  onTimeSelect={setSelectedTimeSlot}
                  excludeAppointmentId={appointment.id}
                />
              </div>
            )}

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium mb-1">Current Appointment</p>
              <p className="text-muted-foreground">
                {new Date(appointment.appointmentDate).toLocaleString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isSubmitting}>
              {isSubmitting ? "Rescheduling..." : "Reschedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

