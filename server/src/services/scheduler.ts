import { db } from './db.js';
import { emailService } from './emailService.js';
import { Medication, ElderlyProfile, Appointment, MedicationLog } from '../types.js';

class ProactiveScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('Proactive Healthcare Scheduler started (30s polling cycle)');
    
    // Check every 30 seconds
    this.intervalId = setInterval(() => {
      this.runPeriodicCheck();
    }, 30000);

    // Initial check on startup
    this.runPeriodicCheck();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  async runPeriodicCheck() {
    try {
      const profiles = db.getProfiles();
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeVal = currentHours * 60 + currentMinutes;

      for (const profile of profiles) {
        await this.checkProfileMedications(profile, currentTimeVal, now);
        await this.checkProfileAppointments(profile, now);
        await this.checkLowInventory(profile);
      }
    } catch (err) {
      console.error('Error during proactive scheduler run:', err);
    }
  }

  // Check medication schedules vs logs
  private async checkProfileMedications(profile: ElderlyProfile, currentTimeVal: number, now: Date) {
    const meds = db.getMedications(profile.id).filter(m => m.active);
    const todayLogs = db.getMedicationLogs(profile.id).filter(l => {
      const logDate = new Date(l.scheduledTime).toDateString();
      return logDate === now.toDateString();
    });

    const notifs = db.getNotifications(profile.id);

    for (const med of meds) {
      for (const slot of med.timeSlots) {
        const [slotH, slotM] = slot.time.split(':').map(Number);
        const slotTimeVal = slotH * 60 + slotM;

        // Check 1: Upcoming Dose Reminder (within 15 minutes before scheduled dose)
        const diffBefore = slotTimeVal - currentTimeVal;
        if (diffBefore >= 0 && diffBefore <= 15) {
          const alreadyReminded = notifs.some(n => 
            n.type === 'dose_reminder' &&
            n.metadata?.medicationId === med.id &&
            n.metadata?.slotLabel === slot.label &&
            new Date(n.sentAt).toDateString() === now.toDateString()
          );

          if (!alreadyReminded) {
            await emailService.sendUpcomingDoseReminder(profile, med, slot.label, slot.time);
          }
        }

        // Check 2: Missed Dose Escalation (> 30 minutes past scheduled time without a taken log)
        const diffPast = currentTimeVal - slotTimeVal;
        if (diffPast > 30) {
          const matchingLog = todayLogs.find(l => 
            l.medicationId === med.id && 
            l.slotLabel === slot.label
          );

          if (!matchingLog || matchingLog.status === 'missed') {
            const alreadyEscalated = notifs.some(n => 
              n.type === 'missed_alert' &&
              n.metadata?.medicationId === med.id &&
              n.metadata?.scheduledTimeStr === slot.time &&
              new Date(n.sentAt).toDateString() === now.toDateString()
            );

            if (!alreadyEscalated) {
              // Add a missed log if none existed
              if (!matchingLog) {
                const missedLog: MedicationLog = {
                  id: `log-missed-${Date.now()}-${med.id}`,
                  profileId: profile.id,
                  medicationId: med.id,
                  medicationName: `${med.name} ${med.dosage}${med.unit}`,
                  dosage: `${med.dosage}${med.unit}`,
                  scheduledTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotH, slotM).toISOString(),
                  slotLabel: slot.label,
                  status: 'missed',
                  loggedAt: new Date().toISOString(),
                  notes: 'Auto-marked missed by CareBridge adherence monitoring system'
                };
                db.addMedicationLog(missedLog);
              }
              await emailService.sendMissedDoseAlert(profile, med, slot.time);
            }
          }
        }
      }
    }
  }

  // Check upcoming appointments
  private async checkProfileAppointments(profile: ElderlyProfile, now: Date) {
    const appointments = db.getAppointments(profile.id).filter(a => a.status === 'upcoming');
    const nowMs = now.getTime();

    for (const apt of appointments) {
      const aptTime = new Date(apt.dateTime).getTime();
      const diffHours = (aptTime - nowMs) / (1000 * 60 * 60);

      // 24 hour reminder
      if (diffHours > 0 && diffHours <= 24 && !apt.reminderSent24h) {
        await emailService.sendAppointmentReminder(profile, apt, '24h');
        db.updateAppointment(apt.id, { reminderSent24h: true });
      }

      // 2 hour reminder
      if (diffHours > 0 && diffHours <= 2 && !apt.reminderSent2h) {
        await emailService.sendAppointmentReminder(profile, apt, '2h');
        db.updateAppointment(apt.id, { reminderSent2h: true });
      }
    }
  }

  // Check low refill inventory
  private async checkLowInventory(profile: ElderlyProfile) {
    const meds = db.getMedications(profile.id).filter(m => m.active);
    const notifs = db.getNotifications(profile.id);
    const today = new Date().toDateString();

    for (const med of meds) {
      if (med.inventoryCount <= med.refillThreshold) {
        const alreadyWarnedToday = notifs.some(n =>
          n.type === 'low_refill' &&
          n.metadata?.medicationId === med.id &&
          new Date(n.sentAt).toDateString() === today
        );

        if (!alreadyWarnedToday) {
          const recipient = profile.emergencyContacts.find(c => c.canReceiveAlerts) || profile.emergencyContacts[0];
          await emailService.sendEmail({
            profileId: profile.id,
            recipientName: recipient?.name || 'Caregiver',
            recipientEmail: recipient?.email || 'caregiver@silvercare-demo.com',
            recipientRole: 'family',
            subject: `⚠️ Low Prescription Refill Notice: ${med.name} (${med.inventoryCount} pills left)`,
            htmlBody: `
              <div style="font-family:sans-serif;padding:20px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a">
                <h2 style="color:#b45309;margin-top:0">Refill Needed for ${profile.preferredName}</h2>
                <p>Medication: <strong>${med.name} (${med.dosage}${med.unit})</strong></p>
                <p>Only <strong>${med.inventoryCount} pills left</strong> in stock. Refill threshold is ${med.refillThreshold}.</p>
                <p>Pharmacy: <strong>${med.pharmacyInfo.name}</strong> • Phone: ${med.pharmacyInfo.phone}</p>
                <p>Prescription #: ${med.rxNumber} (Prescribed by ${med.prescribingDoctor})</p>
              </div>
            `,
            type: 'low_refill',
            triggerReason: `Inventory count (${med.inventoryCount}) at or below threshold (${med.refillThreshold})`,
            metadata: { medicationId: med.id, inventoryCount: med.inventoryCount }
          });
        }
      }
    }
  }
}

export const scheduler = new ProactiveScheduler();
