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

export function getDoctor(doctorId: number) {
  return request<Doctor>(`${API_BASE}/doctors/${doctorId}`);
}

export function createDoctor(doctor: Partial<Doctor>) {
  return request<Doctor>(`${API_BASE}/doctors`, {
    method: "POST",
    body: JSON.stringify(doctor),
  });
}

export function updateDoctor(doctorId: number, doctor: Partial<Doctor>) {
  return request<Doctor>(`${API_BASE}/doctors/${doctorId}`, {
    method: "PUT",
    body: JSON.stringify(doctor),
  });
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

export function getAppointmentsByDoctor(doctorId: number) {
  return request<AppointmentDetail[]>(`${API_BASE}/appointments/doctor/${doctorId}/details`);
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

export async function getPatientByEmail(email: string): Promise<Patient | null> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/patients/email/${encodeURIComponent(email)}`, {
    headers,
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<Patient>;
}

export interface RescheduleRequest {
  newAppointmentDate: string; // ISO string
  durationMinutes?: number;
}

export function rescheduleAppointment(appointmentId: number, rescheduleRequest: RescheduleRequest) {
  return request<Appointment>(`${API_BASE}/appointments/${appointmentId}/reschedule`, {
    method: "PATCH",
    body: JSON.stringify(rescheduleRequest),
  });
}

export function approveAppointment(appointmentId: number) {
  return request<Appointment>(`${API_BASE}/appointments/${appointmentId}/approve`, {
    method: "PATCH",
  });
}

export function rejectAppointment(appointmentId: number, reason?: string) {
  return request<Appointment>(`${API_BASE}/appointments/${appointmentId}/reject`, {
    method: "PATCH",
    body: reason ? JSON.stringify({ reason }) : undefined,
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

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

export function getAllUsers() {
  return request<User[]>(`${API_BASE}/auth/users`);
}

export function updateUserRole(email: string, role: string) {
  return request<{ email: string; roles: string[] }>(`${API_BASE}/auth/users/${encodeURIComponent(email)}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export function addRoleToUser(email: string, role: string) {
  return request<{ email: string; roles: string[] }>(`${API_BASE}/auth/users/${encodeURIComponent(email)}/role`, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

