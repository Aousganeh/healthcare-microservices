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

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
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

