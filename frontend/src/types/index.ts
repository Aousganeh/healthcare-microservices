export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum BloodGroup {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE'
}

export enum DutyStatus {
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY',
  ON_CALL = 'ON_CALL',
  ON_LEAVE = 'ON_LEAVE'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  INSURANCE = 'INSURANCE',
  CHECK = 'CHECK'
}

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  TRY = 'TRY'
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
  ICU = 'ICU',
  OPERATION_ROOM = 'OPERATION_ROOM',
  EMERGENCY = 'EMERGENCY',
  WARD = 'WARD'
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_ORDER = 'OUT_OF_ORDER',
  RESERVED = 'RESERVED'
}

export interface Patient {
  id?: number;
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: Gender;
  email?: string;
  phoneNumber?: string;
  serialNumber?: string;
  registrationAddress?: string;
  currentAddress?: string;
  bloodGroup?: BloodGroup;
  roomId?: number;
}

export interface Doctor {
  id?: number;
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: Gender;
  email?: string;
  phoneNumber?: string;
  licenseNumber: string;
  specialization: string;
  department?: string;
  dutyStatus?: DutyStatus;
  yearsOfExperience?: number;
  qualifications?: string;
}

export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  durationMinutes?: number;
  status?: AppointmentStatus;
  notes?: string;
  reason?: string;
}

export interface AppointmentDetail extends Appointment {
  patient?: Patient;
  doctor?: Doctor;
}

export interface Billing {
  id?: number;
  amount: number;
  billingDate: string;
  dueDate?: string;
  paidDate?: string;
  invoiceNumber?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  currency?: CurrencyCode;
  tax?: number;
  discount?: number;
  insuranceId?: number;
  patientId: number;
  totalAmount: number;
}

export interface Room {
  id?: number;
  number: string;
  type: RoomType;
  capacity: number;
  floor?: number;
  currentOccupancy?: number;
  isAvailable?: boolean;
  isActive?: boolean;
}

export interface Equipment {
  id?: number;
  name: string;
  description?: string;
  status?: EquipmentStatus;
  lastMaintenanceDate?: string;
  purchaseDate: string;
  nextMaintenanceDueDate?: string;
  manufacturer?: string;
  serialNumber?: string;
  price: number;
  maintenanceIntervalDays?: number;
  roomId?: number;
}

