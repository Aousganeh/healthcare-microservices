import type {
  Appointment,
  AppointmentPayload,
  AppointmentDetail,
  Doctor,
  HealthMetric,
  Patient,
  Prescription,
} from "@/types/api";

const API_BASE = "/api";

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(input, {
    headers,
    ...init,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getDoctors() {
  return request<Doctor[]>(`${API_BASE}/doctors`);
}

export function getPatients() {
  return request<Patient[]>(`${API_BASE}/patients`);
}

export function createAppointment(payload: AppointmentPayload) {
  return request<Appointment>(`${API_BASE}/appointments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAppointmentsByPatient(patientId: number) {
  return request<AppointmentDetail[]>(`${API_BASE}/appointments/patient/${patientId}/details`);
}

export function getHealthMetrics(patientId: number) {
  return request<HealthMetric[]>(`${API_BASE}/health-metrics/patient/${patientId}`);
}

export function getPrescriptions(patientId: number) {
  return request<Prescription[]>(`${API_BASE}/prescriptions/patient/${patientId}/active`);
}

export function getPatient(patientId: number) {
  return request<Patient>(`${API_BASE}/patients/${patientId}`);
}

export function searchDoctors(query: string) {
  return request<Doctor[]>(`${API_BASE}/doctors/search?q=${encodeURIComponent(query)}`);
}

export function getDoctorsBySpecialization(specialization: string) {
  return request<Doctor[]>(`${API_BASE}/doctors/specialization/${encodeURIComponent(specialization)}`);
}

export function getPatientByEmail(email: string) {
  return request<Patient>(`${API_BASE}/patients/email/${encodeURIComponent(email)}`);
}

export interface RescheduleRequest {
  newAppointmentDate: string; // ISO string
  durationMinutes?: number;
}

export function rescheduleAppointment(appointmentId: number, request: RescheduleRequest) {
  return request<Appointment>(`${API_BASE}/appointments/${appointmentId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
  available: boolean;
  displayTime: string; // e.g., "10:00", "10:30"
}

export function getAvailableTimeSlots(doctorId: number, date: string, excludeAppointmentId?: number) {
  const params = new URLSearchParams({ date });
  if (excludeAppointmentId) {
    params.append("excludeAppointmentId", excludeAppointmentId.toString());
  }
  return request<TimeSlot[]>(`${API_BASE}/appointments/doctors/${doctorId}/available-slots?${params.toString()}`);
}

