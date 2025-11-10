import { useState, useEffect } from "react";
import { DAYS_OF_WEEK, type DayOfWeek, parseWorkingDays, workingDaysToApiFormat } from "@/utils/workingDays";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";

interface WorkingDaysSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
}

export const WorkingDaysSelector = ({ value, onChange, label = "Working Days" }: WorkingDaysSelectorProps) => {
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(() => {
    return value ? parseWorkingDays(value) : [];
  });

  useEffect(() => {
    if (value) {
      setSelectedDays(parseWorkingDays(value));
    }
  }, [value]);

  const handleDayToggle = (day: DayOfWeek) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day].sort((a, b) => {
          const order = DAYS_OF_WEEK.map((d) => d.value);
          return order.indexOf(a) - order.indexOf(b);
        });
    
    setSelectedDays(newSelectedDays);
    onChange(workingDaysToApiFormat(newSelectedDays));
  };

  const handleSelectAll = () => {
    if (selectedDays.length === 7) {
      setSelectedDays([]);
      onChange("");
    } else {
      const allDays = DAYS_OF_WEEK.map((d) => d.value) as DayOfWeek[];
      setSelectedDays(allDays);
      onChange(workingDaysToApiFormat(allDays));
    }
  };

  const handleSelectWeekdays = () => {
    const weekdays: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
    setSelectedDays(weekdays);
    onChange(workingDaysToApiFormat(weekdays));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectWeekdays}
            className="text-xs text-primary hover:underline"
          >
            Weekdays
          </button>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-primary hover:underline"
          >
            {selectedDays.length === 7 ? "Clear All" : "Select All"}
          </button>
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={isSelected}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {day.label}
                  </label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedDays.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedDays.map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.short).join(", ")}
        </p>
      )}
    </div>
  );
};

