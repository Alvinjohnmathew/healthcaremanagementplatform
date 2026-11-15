import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ElderlyProfile,
  Medication,
  MedicationLog,
  Appointment,
  RoutineTask,
  CareMessage,
  NotificationLog
} from '../types.js';
import {
  initialProfiles,
  initialMedications,
  initialMedicationLogs,
  initialAppointments,
  initialRoutines,
  initialCareMessages,
  initialNotifications
} from '../data/mockData.js';

interface DatabaseSchema {
  profiles: ElderlyProfile[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  appointments: Appointment[];
  routines: RoutineTask[];
  careMessages: CareMessage[];
  notifications: NotificationLog[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          profiles: parsed.profiles || initialProfiles,
          medications: parsed.medications || initialMedications,
          medicationLogs: parsed.medicationLogs || initialMedicationLogs,
          appointments: parsed.appointments || initialAppointments,
          routines: parsed.routines || initialRoutines,
          careMessages: parsed.careMessages || initialCareMessages,
          notifications: parsed.notifications || initialNotifications
        };
      }
    } catch (err) {
      console.warn('Could not read existing database.json, initializing fresh seed data.', err);
    }

    // Default seed
    const initial: DatabaseSchema = {
      profiles: initialProfiles,
      medications: initialMedications,
      medicationLogs: initialMedicationLogs,
      appointments: initialAppointments,
      routines: initialRoutines,
      careMessages: initialCareMessages,
      notifications: initialNotifications
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private persist(): void {
    this.saveData(this.data);
  }

  // --- Profiles ---
  getProfiles(): ElderlyProfile[] {
    return this.data.profiles;
  }

  getProfileById(id: string): ElderlyProfile | undefined {
    return this.data.profiles.find(p => p.id === id);
  }

  updateProfile(id: string, updates: Partial<ElderlyProfile>): ElderlyProfile | null {
    const idx = this.data.profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.profiles[idx] = { ...this.data.profiles[idx], ...updates };
    this.persist();
    return this.data.profiles[idx];
  }

  // --- Medications ---
  getMedications(profileId?: string): Medication[] {
    if (!profileId) return this.data.medications;
    return this.data.medications.filter(m => m.profileId === profileId);
  }

  getMedicationById(id: string): Medication | undefined {
    return this.data.medications.find(m => m.id === id);
  }

  createMedication(med: Medication): Medication {
    this.data.medications.push(med);
    this.persist();
    return med;
  }

  updateMedication(id: string, updates: Partial<Medication>): Medication | null {
    const idx = this.data.medications.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.data.medications[idx] = { ...this.data.medications[idx], ...updates };
    this.persist();
    return this.data.medications[idx];
  }

  deleteMedication(id: string): boolean {
    const prevLen = this.data.medications.length;
    this.data.medications = this.data.medications.filter(m => m.id !== id);
    if (this.data.medications.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Medication Logs ---
  getMedicationLogs(profileId?: string): MedicationLog[] {
    if (!profileId) return this.data.medicationLogs;
    return this.data.medicationLogs.filter(l => l.profileId === profileId);
  }

  addMedicationLog(log: MedicationLog): MedicationLog {
    this.data.medicationLogs.push(log);
    // If taken, decrement inventory count for the medication
    if (log.status === 'taken') {
      const med = this.data.medications.find(m => m.id === log.medicationId);
      if (med && med.inventoryCount > 0) {
        med.inventoryCount -= 1;
      }
    }
    this.persist();
    return log;
  }

  updateMedicationLog(id: string, updates: Partial<MedicationLog>): MedicationLog | null {
    const idx = this.data.medicationLogs.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.medicationLogs[idx] = { ...this.data.medicationLogs[idx], ...updates };
    this.persist();
    return this.data.medicationLogs[idx];
  }

  // --- Appointments ---
  getAppointments(profileId?: string): Appointment[] {
    if (!profileId) return this.data.appointments;
    return this.data.appointments.filter(a => a.profileId === profileId);
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find(a => a.id === id);
  }

  createAppointment(apt: Appointment): Appointment {
    this.data.appointments.push(apt);
    this.persist();
    return apt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx === -1) return null;
    this.data.appointments[idx] = { ...this.data.appointments[idx], ...updates };
    this.persist();
    return this.data.appointments[idx];
  }

  deleteAppointment(id: string): boolean {
    const prevLen = this.data.appointments.length;
    this.data.appointments = this.data.appointments.filter(a => a.id !== id);
    if (this.data.appointments.length !== prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Routines ---
  getRoutines(profileId?: string): RoutineTask[] {
    if (!profileId) return this.data.routines;
    return this.data.routines.filter(r => r.profileId === profileId);
  }

  addRoutineEntry(routineId: string, entry: { id: string; timestamp: string; value: any; notes?: string; loggedBy: string }): RoutineTask | null {
    const routine = this.data.routines.find(r => r.id === routineId);
    if (!routine) return null;
    routine.entries.unshift(entry);
    this.persist();
    return routine;
  }

  createRoutine(routine: RoutineTask): RoutineTask {
    this.data.routines.push(routine);
    this.persist();
    return routine;
  }

  // --- Care Messages ---
  getCareMessages(profileId?: string): CareMessage[] {
    if (!profileId) return this.data.careMessages;
    return this.data.careMessages.filter(m => m.profileId === profileId);
  }

  addCareMessage(msg: CareMessage): CareMessage {
    this.data.careMessages.push(msg);
    this.persist();
    return msg;
  }

  reactToMessage(id: string, reactionType: 'heart' | 'thumbsUp' | 'hug'): CareMessage | null {
    const msg = this.data.careMessages.find(m => m.id === id);
    if (!msg) return null;
    if (!msg.reactions) msg.reactions = {};
    msg.reactions[reactionType] = (msg.reactions[reactionType] || 0) + 1;
    this.persist();
    return msg;
  }

  // --- Notifications ---
  getNotifications(profileId?: string): NotificationLog[] {
    if (!profileId) return this.data.notifications;
    return this.data.notifications.filter(n => n.profileId === profileId).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  addNotification(notif: NotificationLog): NotificationLog {
    this.data.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  clearNotifications(profileId?: string): void {
    if (profileId) {
      this.data.notifications = this.data.notifications.filter(n => n.profileId !== profileId);
    } else {
      this.data.notifications = [];
    }
    this.persist();
  }

  resetToSeed(): void {
    this.data = {
      profiles: JSON.parse(JSON.stringify(initialProfiles)),
      medications: JSON.parse(JSON.stringify(initialMedications)),
      medicationLogs: JSON.parse(JSON.stringify(initialMedicationLogs)),
      appointments: JSON.parse(JSON.stringify(initialAppointments)),
      routines: JSON.parse(JSON.stringify(initialRoutines)),
      careMessages: JSON.parse(JSON.stringify(initialCareMessages)),
      notifications: JSON.parse(JSON.stringify(initialNotifications))
    };
    this.persist();
  }
}

export const db = new Database();
