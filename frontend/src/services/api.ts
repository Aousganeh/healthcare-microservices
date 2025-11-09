import axios, { AxiosError } from 'axios';
import type { Patient, Doctor, Appointment, AppointmentDetail, Billing, Room, Equipment } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (typeof data === 'string') return data;
    }
    if (axiosError.message) return axiosError.message;
    return `Request failed: ${axiosError.response?.status || 'Unknown error'}`;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const patientService = {
  getAll: () => api.get<Patient[]>('/patients'),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`),
  create: (patient: Patient) => api.post<Patient>('/patients', patient),
  update: (id: number, patient: Patient) => api.put<Patient>(`/patients/${id}`, patient),
  delete: (id: number) => api.delete(`/patients/${id}`),
  search: (query: string) => api.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`),
  getByRoom: (roomId: number) => api.get<Patient[]>(`/patients/room/${roomId}`),
};

export const doctorService = {
  getAll: () => api.get<Doctor[]>('/doctors'),
  getById: (id: number) => api.get<Doctor>(`/doctors/${id}`),
  create: (doctor: Doctor) => api.post<Doctor>('/doctors', doctor),
  update: (id: number, doctor: Doctor) => api.put<Doctor>(`/doctors/${id}`, doctor),
  delete: (id: number) => api.delete(`/doctors/${id}`),
  search: (query: string) => api.get<Doctor[]>(`/doctors/search?q=${encodeURIComponent(query)}`),
  getBySpecialization: (specialization: string) => api.get<Doctor[]>(`/doctors/specialization/${encodeURIComponent(specialization)}`),
  getByDepartment: (department: string) => api.get<Doctor[]>(`/doctors/department/${encodeURIComponent(department)}`),
};

export const appointmentService = {
  getAll: () => api.get<Appointment[]>('/appointments'),
  getById: (id: number) => api.get<Appointment>(`/appointments/${id}`),
  getDetails: (id: number) => api.get<AppointmentDetail>(`/appointments/${id}/details`),
  create: (appointment: Appointment) => api.post<Appointment>('/appointments', appointment),
  update: (id: number, appointment: Appointment) => api.put<Appointment>(`/appointments/${id}`, appointment),
  delete: (id: number) => api.delete(`/appointments/${id}`),
  getByPatient: (patientId: number) => api.get<Appointment[]>(`/appointments/patient/${patientId}`),
  getByDoctor: (doctorId: number) => api.get<Appointment[]>(`/appointments/doctor/${doctorId}`),
  getByStatus: (status: string) => api.get<Appointment[]>(`/appointments/status/${status}`),
  getPatientDetails: (patientId: number) => api.get<AppointmentDetail[]>(`/appointments/patient/${patientId}/details`),
  getDoctorDetails: (doctorId: number) => api.get<AppointmentDetail[]>(`/appointments/doctor/${doctorId}/details`),
};

export const billingService = {
  getAll: () => api.get<Billing[]>('/billings'),
  getById: (id: number) => api.get<Billing>(`/billings/${id}`),
  create: (billing: Billing) => api.post<Billing>('/billings', billing),
  update: (id: number, billing: Billing) => api.put<Billing>(`/billings/${id}`, billing),
  delete: (id: number) => api.delete(`/billings/${id}`),
  getByPatient: (patientId: number) => api.get<Billing[]>(`/billings/patient/${patientId}`),
  getByStatus: (status: string) => api.get<Billing[]>(`/billings/status/${status}`),
};

export const roomService = {
  getAll: () => api.get<Room[]>('/rooms'),
  getById: (id: number) => api.get<Room>(`/rooms/${id}`),
  create: (room: Room) => api.post<Room>('/rooms', room),
  update: (id: number, room: Room) => api.put<Room>(`/rooms/${id}`, room),
  delete: (id: number) => api.delete(`/rooms/${id}`),
  getByAvailability: (available: boolean) => api.get<Room[]>(`/rooms/availability/${available}`),
  getByType: (type: string) => api.get<Room[]>(`/rooms/type/${encodeURIComponent(type)}`),
};

export const equipmentService = {
  getAll: () => api.get<Equipment[]>('/equipment'),
  getById: (id: number) => api.get<Equipment>(`/equipment/${id}`),
  create: (equipment: Equipment) => api.post<Equipment>('/equipment', equipment),
  update: (id: number, equipment: Equipment) => api.put<Equipment>(`/equipment/${id}`, equipment),
  delete: (id: number) => api.delete(`/equipment/${id}`),
  getByStatus: (status: string) => api.get<Equipment[]>(`/equipment/status/${status}`),
  getByRoom: (roomId: number) => api.get<Equipment[]>(`/equipment/room/${roomId}`),
};

