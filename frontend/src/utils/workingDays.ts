export const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number]["value"];

export function parseWorkingDays(workingDays?: string): DayOfWeek[] {
  if (!workingDays) return [];
  
  const days = workingDays.split(",").map((d) => d.trim().toUpperCase());
  const validDays: DayOfWeek[] = [];
  
  for (const day of days) {
    if (day === "MON-FRI" || day === "MONDAY-FRIDAY") {
      validDays.push("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY");
    } else if (DAYS_OF_WEEK.some((d) => d.value === day)) {
      validDays.push(day as DayOfWeek);
    }
  }
  
  return [...new Set(validDays)];
}

export function formatWorkingDays(workingDays?: string): string {
  if (!workingDays) return "Not specified";
  
  const days = parseWorkingDays(workingDays);
  if (days.length === 0) return "Not specified";
  
  const dayLabels = days.map((day) => {
    const dayInfo = DAYS_OF_WEEK.find((d) => d.value === day);
    return dayInfo?.label || day;
  });
  
  if (days.length === 7) return "Every day";
  if (days.length === 5 && 
      days.includes("MONDAY") && 
      days.includes("TUESDAY") && 
      days.includes("WEDNESDAY") && 
      days.includes("THURSDAY") && 
      days.includes("FRIDAY")) {
    return "Monday - Friday";
  }
  
  return dayLabels.join(", ");
}

export function formatWorkingDaysShort(workingDays?: string): string {
  if (!workingDays) return "N/A";
  
  const days = parseWorkingDays(workingDays);
  if (days.length === 0) return "N/A";
  
  const dayLabels = days.map((day) => {
    const dayInfo = DAYS_OF_WEEK.find((d) => d.value === day);
    return dayInfo?.short || day.substring(0, 3);
  });
  
  if (days.length === 7) return "Every day";
  if (days.length === 5 && 
      days.includes("MONDAY") && 
      days.includes("TUESDAY") && 
      days.includes("WEDNESDAY") && 
      days.includes("THURSDAY") && 
      days.includes("FRIDAY")) {
    return "Mon - Fri";
  }
  
  return dayLabels.join(", ");
}

export function workingDaysToApiFormat(days: DayOfWeek[]): string {
  if (days.length === 0) return "";
  
  if (days.length === 5 && 
      days.includes("MONDAY") && 
      days.includes("TUESDAY") && 
      days.includes("WEDNESDAY") && 
      days.includes("THURSDAY") && 
      days.includes("FRIDAY")) {
    return "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY";
  }
  
  return days.join(",");
}

