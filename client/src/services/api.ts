import {
  ElderlyProfile,
  Medication,
  MedicationLog,
  Appointment,
  RoutineTask,
  CareMessage,
  NotificationLog,
  DrugInteraction,
  Role
} from '../types';

const API_BASE = '/api';

export const api = {
  // Profiles
  async getProfiles() {
    const res = await fetch(`${API_BASE}/profiles`);
    return res.json();
  },

  async getProfile(id: string) {
    const res = await fetch(`${API_BASE}/profiles/${id}`);
    return res.json();
  },

  async verifyPasscode(id: string, role: Role, passcode: string) {
    const res = await fetch(`${API_BASE}/profiles/${id}/verify-passcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, passcode })
    });
    return res.json();
  },

  async updateProfile(id: string, updates: Partial<ElderlyProfile>) {
    const res = await fetch(`${API_BASE}/profiles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async triggerSOS(id: string, customEmail?: string) {
    const res = await fetch(`${API_BASE}/profiles/${id}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customEmail })
    });
    return res.json();
  },

  async getClinicalReport(id: string) {
    const res = await fetch(`${API_BASE}/profiles/${id}/clinical-report`);
    return res.json();
  },

  // Medications
  async getMedications(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/medications`);
    return res.json();
  },

  async addMedication(profileId: string, medData: Partial<Medication>) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medData)
    });
    return res.json();
  },

  async updateMedication(id: string, updates: Partial<Medication>) {
    const res = await fetch(`${API_BASE}/medications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteMedication(id: string) {
    const res = await fetch(`${API_BASE}/medications/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getInteractions(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/interactions`);
    return res.json();
  },

  // Logs
  async getLogs(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/logs`);
    return res.json();
  },

  async logDose(profileId: string, logData: Partial<MedicationLog> & { snoozeMinutes?: number }) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    return res.json();
  },

  async getAdherenceStats(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/adherence-stats`);
    return res.json();
  },

  // Appointments
  async getAppointments(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/appointments`);
    return res.json();
  },

  async addAppointment(profileId: string, aptData: Partial<Appointment>) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aptData)
    });
    return res.json();
  },

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteAppointment(id: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Routines
  async getRoutines(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/routines`);
    return res.json();
  },

  async addRoutineEntry(routineId: string, value: any, notes?: string, loggedBy?: string) {
    const res = await fetch(`${API_BASE}/routines/${routineId}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, notes, loggedBy })
    });
    return res.json();
  },

  // Care Circle Messages
  async getMessages(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/messages`);
    return res.json();
  },

  async sendMessage(profileId: string, senderName: string, senderRole: Role, text: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, senderRole, text })
    });
    return res.json();
  },

  async reactToMessage(messageId: string, reactionType: 'heart' | 'thumbsUp' | 'hug') {
    const res = await fetch(`${API_BASE}/messages/${messageId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType })
    });
    return res.json();
  },

  // Notifications & Email Center
  async getNotifications(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/notifications`);
    return res.json();
  },

  async simulateNotification(profileId: string, payload: {
    action: 'upcoming_dose' | 'missed_alert' | 'appointment_reminder' | 'weekly_digest' | 'emergency_sos' | 'custom_test_email';
    medicationId?: string;
    appointmentId?: string;
    customEmail?: string;
    customNotes?: string;
  }) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/simulate-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async clearNotifications(profileId: string) {
    const res = await fetch(`${API_BASE}/profiles/${profileId}/notifications`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async resetData() {
    const res = await fetch(`${API_BASE}/reset-data`, {
      method: 'POST'
    });
    return res.json();
  }
};
