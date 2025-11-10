export interface Doctor {
  id?: number;
  name: string;
  surname: string;
  specialization: string;
  department?: string;
  dutyStatus?: string;
  yearsOfExperience?: number;
  email?: string;
  phoneNumber?: string;
  qualifications?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string;
  photoUrl?: string;
  licenseNumber?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface Patient {
  id: number;
  name: string;
  surname: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  gender?: string;
  serialNumber?: string;
  registrationAddress?: string;
  currentAddress?: string;
  roomId?: number;
}

export interface AppointmentPayload {
  patientId: number;
  doctorId: number;
  appointmentDate: string; // ISO string
  durationMinutes?: number;
  status?: string;
  notes?: string;
  reason?: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  durationMinutes?: number;
  status?: string;
  notes?: string;
  reason?: string;
}

export interface AppointmentDetail extends Appointment {
  doctorId: number;
  doctorName?: string;
  doctorSpecialization?: string;
  patientName?: string;
  patientEmail?: string;
}

export interface HealthMetric {
  id: number;
  patientId: number;
  recordedAt: string;
  systolicBloodPressure?: number;
  diastolicBloodPressure?: number;
  heartRate?: number;
  bloodSugarMgDl?: number;
  temperatureCelsius?: number;
  oxygenSaturation?: number;
  weightKg?: number;
}

export type PrescriptionStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";

export interface Prescription {
  id: number;
  patientId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  status: PrescriptionStatus;
  startDate?: string;
  endDate?: string;
  lastRefillDate?: string;
  nextRefillDate?: string;
  prescribingDoctorId?: number;
  notes?: string;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}
