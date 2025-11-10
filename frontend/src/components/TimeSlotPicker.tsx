import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAvailableTimeSlots, type TimeSlot } from "@/lib/api";
import { format } from "date-fns";

interface TimeSlotPickerProps {
  doctorId: number | undefined;
  date: Date | undefined;
  selectedTime: string | null;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  excludeAppointmentId?: number;
}

export function TimeSlotPicker({
  doctorId,
  date,
  selectedTime,
  onTimeSelect,
  excludeAppointmentId,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const dateStr = format(date, "yyyy-MM-dd");
    getAvailableTimeSlots(doctorId, dateStr, excludeAppointmentId)
      .then((data) => {
        setSlots(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load time slots");
        setSlots([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [doctorId, date, excludeAppointmentId]);

  if (!doctorId || !date) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Please select a doctor and date first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading available time slots...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive text-center py-4">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No available time slots for this date
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Available Time Slots</p>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.startTime;
          const isDisabled = !slot.available;

          return (
            <Button
              key={slot.startTime}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              disabled={isDisabled}
              onClick={() => {
                if (slot.available) {
                  onTimeSelect(slot);
                }
              }}
              className={
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "bg-primary text-primary-foreground"
                    : ""
              }
            >
              {slot.displayTime}
            </Button>
          );
        })}
      </div>
      {slots.filter((s) => !s.available).length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          Grayed out slots are already booked
        </p>
      )}
    </div>
  );
}

