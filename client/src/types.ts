export type Role = 'senior' | 'caretaker' | 'family';

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  canReceiveAlerts: boolean;
}

export interface DoctorContact {
  name: string;
  specialty: string;
  clinic: string;
  phone: string;
  email: string;
}

export interface ElderlyProfile {
  id: string;
  fullName: string;
  preferredName: string;
  age: number;
  dateOfBirth: string;
  gender: string;
  avatar: string;
  address: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  primaryPhysician: DoctorContact;
  emergencyContacts: EmergencyContact[];
  medicalNotes: string;
  passcodes: {
    seniorPin: string;
    caretakerPasscode: string;
    familyPasscode: string;
  };
  preferredLanguage: string;
  fontSizePreference: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceAssistEnabled: boolean;
  activeStatus: 'active' | 'hospitalized' | 'resting';
}

export type PillShape = 'round' | 'oval' | 'capsule' | 'square' | 'triangle' | 'liquid' | 'inhaler';

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  genericName: string;
  dosage: string;
  unit: string;
  shape: PillShape;
  color: string;
  imprint?: string;
  instructions: string;
  frequency: 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly' | 'as_needed';
  timeSlots: {
    id: string;
    time: string;
    label: 'Morning' | 'Noon' | 'Evening' | 'Bedtime';
    doseAmount: string;
  }[];
  inventoryCount: number;
  refillThreshold: number;
  lastRefillDate: string;
  prescribingDoctor: string;
  rxNumber: string;
  pharmacyInfo: {
    name: string;
    phone: string;
  };
  active: boolean;
  foodInstructions?: 'with_food' | 'before_food' | 'after_food' | 'empty_stomach' | 'anytime';
  warnings: string[];
}

export interface MedicationLog {
  id: string;
  profileId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  slotLabel: 'Morning' | 'Noon' | 'Evening' | 'Bedtime';
  status: 'taken' | 'skipped' | 'snoozed' | 'missed';
  loggedAt?: string;
  loggedByRole?: Role;
  loggedByName?: string;
  notes?: string;
  moodRating?: 'great' | 'good' | 'okay' | 'unwell' | 'pain';
  snoozedUntil?: string;
}

export interface Appointment {
  id: string;
  profileId: string;
  title: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  address: string;
  phone: string;
  dateTime: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  transportationStatus: 'needed' | 'arranged' | 'not_needed';
  driverOrCompanion?: string;
  preparationChecklist: {
    id: string;
    task: string;
    completed: boolean;
  }[];
  questionsForDoctor: string[];
  doctorSummaryNotes?: string;
  followUpDate?: string;
  reminderSent24h?: boolean;
  reminderSent2h?: boolean;
}

export interface RoutineTask {
  id: string;
  profileId: string;
  title: string;
  type: 'hydration' | 'blood_pressure' | 'blood_glucose' | 'mobility' | 'weight' | 'pulse_ox' | 'sleep';
  targetValue: number | string;
  unit: string;
  frequency: string;
  iconName: string;
  description: string;
  entries: {
    id: string;
    timestamp: string;
    value: string | number;
    notes?: string;
    loggedBy: string;
  }[];
}

export interface CareMessage {
  id: string;
  profileId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
  reactions: {
    heart?: number;
    thumbsUp?: number;
    hug?: number;
  };
}

export interface NotificationLog {
  id: string;
  profileId: string;
  type: 'dose_reminder' | 'missed_alert' | 'appointment_reminder' | 'low_refill' | 'sos_emergency' | 'weekly_digest';
  recipientName: string;
  recipientEmail: string;
  recipientRole: Role | 'all';
  subject: string;
  htmlBody: string;
  sentAt: string;
  status: 'delivered' | 'simulated' | 'failed';
  triggerReason: string;
  metadata?: Record<string, any>;
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB: string;
  severity: 'high' | 'moderate' | 'caution';
  title: string;
  description: string;
  recommendation: string;
  foodWarnings?: string[];
}
