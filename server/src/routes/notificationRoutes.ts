import { Router, Request, Response } from 'express';
import { db } from '../services/db.js';
import { emailService } from '../services/emailService.js';

const router = Router();

// Get notification logs for profile
router.get('/profiles/:profileId/notifications', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const notifications = db.getNotifications(profileId);
  res.json({ success: true, count: notifications.length, notifications });
});

// Trigger proactive email simulations or live test emails
router.post('/profiles/:profileId/simulate-notification', async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const { action, medicationId, appointmentId, customEmail, customNotes } = req.body;

  const profile = db.getProfileById(profileId);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  try {
    let result;

    if (action === 'upcoming_dose') {
      const meds = db.getMedications(profileId).filter(m => m.active);
      const targetMed = (medicationId ? meds.find(m => m.id === medicationId) : meds[0]) || meds[0];
      if (!targetMed) {
        res.status(400).json({ success: false, message: 'No active medication available to simulate' });
        return;
      }
      const slot = targetMed.timeSlots[0] || { label: 'Morning', time: '08:30' };
      result = await emailService.sendUpcomingDoseReminder(profile, targetMed, slot.label, slot.time, customEmail);
    } else if (action === 'missed_alert') {
      const meds = db.getMedications(profileId).filter(m => m.active);
      const targetMed = (medicationId ? meds.find(m => m.id === medicationId) : meds[0]) || meds[0];
      if (!targetMed) {
        res.status(400).json({ success: false, message: 'No active medication available to simulate' });
        return;
      }
      result = await emailService.sendMissedDoseAlert(profile, targetMed, '08:30 AM', customEmail);
    } else if (action === 'appointment_reminder') {
      const appointments = db.getAppointments(profileId).filter(a => a.status === 'upcoming');
      const targetApt = (appointmentId ? appointments.find(a => a.id === appointmentId) : appointments[0]) || appointments[0];
      if (!targetApt) {
        res.status(400).json({ success: false, message: 'No upcoming appointment available to simulate' });
        return;
      }
      result = await emailService.sendAppointmentReminder(profile, targetApt, '24h', customEmail);
    } else if (action === 'weekly_digest') {
      result = await emailService.sendWeeklyDigest(profile, customEmail);
    } else if (action === 'emergency_sos') {
      result = await emailService.sendEmergencySOS(profile, customEmail);
    } else if (action === 'custom_test_email') {
      if (!customEmail) {
        res.status(400).json({ success: false, message: 'Please provide a valid customEmail address' });
        return;
      }
      result = await emailService.sendEmail({
        profileId: profile.id,
        recipientName: profile.preferredName,
        recipientEmail: customEmail,
        recipientRole: 'family',
        subject: `🧪 Test Email from CareBridge 360 for ${profile.preferredName}`,
        htmlBody: `
          <div style="font-family:sans-serif;padding:24px;border-radius:12px;background:#f0f9ff;border:1px solid #bae6fd">
            <h2 style="color:#0369a1;margin-top:0;">CareBridge 360 Email Verification Successful!</h2>
            <p>This test email confirms that proactive email notifications are operating properly for <strong>${profile.fullName}</strong>.</p>
            <p style="background:#ffffff;padding:12px;border-radius:8px;border:1px solid #e2e8f0;font-size:14px;color:#475569;">
              <strong>Note:</strong> ${customNotes || 'Test trigger from Live Notification Center'}
            </p>
            <p style="font-size:13px;color:#64748b;margin-top:16px;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        `,
        type: 'dose_reminder',
        triggerReason: 'Manual test dispatch from UI Test Center'
      });
    } else {
      res.status(400).json({ success: false, message: `Unknown action: ${action}` });
      return;
    }

    res.json({
      success: true,
      message: `Proactive notification triggered successfully: ${action}`,
      notification: result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Notification simulation failed' });
  }
});

// Clear notifications
router.delete('/profiles/:profileId/notifications', (req: Request, res: Response) => {
  const { profileId } = req.params;
  db.clearNotifications(profileId);
  res.json({ success: true, message: 'Notifications cleared' });
});

// Reset database to seed
router.post('/reset-data', (req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to initial seed state successfully' });
});

export default router;
