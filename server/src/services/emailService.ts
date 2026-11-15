import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { NotificationLog, ElderlyProfile, Medication, Appointment } from '../types.js';

interface EmailPayload {
  profileId: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole: 'senior' | 'caretaker' | 'family' | 'all';
  subject: string;
  htmlBody: string;
  type: NotificationLog['type'];
  triggerReason: string;
  metadata?: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass }
        });
        this.isConfigured = true;
        console.log('Real SMTP Transporter configured:', host);
      } catch (err) {
        console.warn('Failed to configure SMTP transporter:', err);
      }
    } else {
      console.log('Running in Simulated / In-Memory Email Dispatch Mode (All emails captured for live inspection)');
    }
  }

  // Base method to send and log email
  async sendEmail(payload: EmailPayload): Promise<NotificationLog> {
    const { profileId, recipientName, recipientEmail, recipientRole, subject, htmlBody, type, triggerReason, metadata } = payload;
    let status: 'delivered' | 'simulated' | 'failed' = 'simulated';

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: process.env.SMTP_FROM || '"SilverCare Connect" <notifications@silvercare.health>',
          to: recipientEmail,
          subject,
          html: htmlBody
        });
        status = 'delivered';
      } catch (err) {
        console.error('SMTP sending error, fallback to simulated delivery:', err);
        status = 'failed';
      }
    }

    const logEntry: NotificationLog = {
      id: `notif-${uuidv4().slice(0, 8)}`,
      profileId,
      type,
      recipientName,
      recipientEmail,
      recipientRole,
      subject,
      htmlBody,
      sentAt: new Date().toISOString(),
      status,
      triggerReason,
      metadata
    };

    db.addNotification(logEntry);
    return logEntry;
  }

  // --- 1. Upcoming Dose Reminder ---
  async sendUpcomingDoseReminder(profile: ElderlyProfile, med: Medication, slotLabel: string, scheduledTimeStr: string, customEmail?: string) {
    const recipientEmail = customEmail || profile.emergencyContacts[0]?.email || 'caregiver@silvercare-demo.com';
    const recipientName = profile.preferredName || profile.fullName;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 24px 28px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; }
          .body { padding: 28px; }
          .pill-box { display: flex; align-items: center; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 18px; margin: 20px 0; }
          .pill-icon { width: 44px; height: 44px; border-radius: 50%; background: ${med.color || '#38bdf8'}; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1e293b; font-size: 14px; margin-right: 16px; border: 2px solid #cbd5e1; }
          .pill-name { font-size: 18px; font-weight: bold; color: #0369a1; margin: 0 0 4px 0; }
          .pill-details { font-size: 14px; color: #64748b; margin: 0; }
          .instruction-alert { background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #854d0e; margin: 16px 0; }
          .cta-btn { display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; margin-top: 12px; }
          .footer { background: #f1f5f9; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">⏰ Upcoming Dose • ${slotLabel}</span>
            <h1 class="title">Time for ${profile.preferredName}'s Medication</h1>
          </div>
          <div class="body">
            <p style="font-size: 16px; line-height: 1.5;">Hello <strong>${recipientName}</strong>,</p>
            <p>This is a proactive reminder from <strong>SilverCare Connect</strong> that your scheduled dose is due soon:</p>
            
            <div class="pill-box">
              <div class="pill-icon">Rx</div>
              <div>
                <p class="pill-name">${med.name} (${med.dosage}${med.unit})</p>
                <p class="pill-details">Shape: ${med.shape} • Color: ${med.color} • Imprint: ${med.imprint || 'None'}</p>
                <p class="pill-details" style="margin-top:4px;">Scheduled: <strong>${scheduledTimeStr}</strong></p>
              </div>
            </div>

            <div class="instruction-alert">
              <strong>Instructions:</strong> ${med.instructions}
            </div>

            ${med.warnings && med.warnings.length > 0 ? `
              <div style="background:#fee2e2; border-left:4px solid #ef4444; padding:12px 16px; border-radius:0 8px 8px 0; font-size:13px; color:#991b1b; margin-bottom:16px;">
                <strong>Safety Notice:</strong> ${med.warnings.join(' • ')}
              </div>
            ` : ''}

            <p style="font-size:14px; color:#64748b;">Please take this dose with a full glass of water. Once taken, open SilverCare to tap "Taken".</p>
          </div>
          <div class="footer">
            CareBridge 360 Healthcare Ecosystem • Proactive Senior Care & Medication Safety
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      profileId: profile.id,
      recipientName: profile.preferredName,
      recipientEmail,
      recipientRole: 'senior',
      subject: `⏰ Reminder: ${med.name} due at ${scheduledTimeStr} for ${profile.preferredName}`,
      htmlBody,
      type: 'dose_reminder',
      triggerReason: `Upcoming ${slotLabel} dose advance reminder`,
      metadata: { medicationId: med.id, slotLabel, scheduledTimeStr }
    });
  }

  // --- 2. Missed Medication Escalation Alert ---
  async sendMissedDoseAlert(profile: ElderlyProfile, med: Medication, scheduledTimeStr: string, customEmail?: string) {
    const recipients = profile.emergencyContacts.filter(c => c.canReceiveAlerts);
    const targetEmail = customEmail || (recipients.length > 0 ? recipients[0].email : 'family@silvercare-demo.com');
    const caregiverName = recipients.length > 0 ? recipients[0].name : 'Family Member';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fef2f2; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(220,38,38,0.12); border: 2px solid #fecaca; }
          .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: #ffffff; padding: 24px 28px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.3); color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; }
          .body { padding: 28px; }
          .alert-box { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 12px; padding: 18px; margin: 20px 0; }
          .call-button { display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 8px; font-size: 16px; margin-top: 12px; text-align: center; }
          .footer { background: #f8fafc; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">🚨 URGENT ADHERENCE ALERT</span>
            <h1 class="title">Missed Dose: ${med.name}</h1>
          </div>
          <div class="body">
            <p style="font-size: 16px; line-height: 1.5;">Dear <strong>${caregiverName}</strong>,</p>
            <p>Our proactive monitoring system detected that <strong>${profile.fullName} (${profile.preferredName})</strong> has not marked their scheduled medication as taken within the 30-minute grace window:</p>
            
            <div class="alert-box">
              <h3 style="margin-top:0; color:#991b1b; font-size:18px;">⚠️ Medication Details</h3>
              <p style="margin:4px 0; font-size:15px;"><strong>Medication:</strong> ${med.name} (${med.dosage}${med.unit})</p>
              <p style="margin:4px 0; font-size:15px;"><strong>Scheduled Time:</strong> ${scheduledTimeStr}</p>
              <p style="margin:4px 0; font-size:15px;"><strong>Status:</strong> Overdue / Unconfirmed</p>
              <p style="margin:4px 0; font-size:15px;"><strong>Condition Treated:</strong> ${profile.chronicConditions.join(', ')}</p>
            </div>

            <p style="font-size:15px; color:#475569;">
              We recommend giving <strong>${profile.preferredName}</strong> a quick gentle phone call to check in and verify their well-being.
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <a href="tel:${profile.emergencyContacts[0]?.phone || '6175550899'}" class="call-button">
                📞 Call ${profile.preferredName} Now (${profile.emergencyContacts[0]?.phone || 'Phone'})
              </a>
            </div>

            <p style="font-size:13px; color:#64748b; margin-top:20px;">
              Primary Physician: ${profile.primaryPhysician.name} - ${profile.primaryPhysician.phone}
            </p>
          </div>
          <div class="footer">
            CareBridge 360 Automated Care Escalation System
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      profileId: profile.id,
      recipientName: caregiverName,
      recipientEmail: targetEmail,
      recipientRole: 'family',
      subject: `🚨 Missed Dose Alert for ${profile.preferredName}: ${med.name} is Overdue`,
      htmlBody,
      type: 'missed_alert',
      triggerReason: `Grace window elapsed (30 mins) without dose confirmation`,
      metadata: { medicationId: med.id, scheduledTimeStr }
    });
  }

  // --- 3. Doctor Appointment Reminder ---
  async sendAppointmentReminder(profile: ElderlyProfile, apt: Appointment, timeframe: '24h' | '2h', customEmail?: string) {
    const targetEmail = customEmail || profile.emergencyContacts[0]?.email || 'family@silvercare-demo.com';
    const dateFormatted = new Date(apt.dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f0fdf4; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(22,101,52,0.1); border: 1px solid #bbf7d0; }
          .header { background: linear-gradient(135deg, #15803d, #166534); color: #ffffff; padding: 24px 28px; }
          .badge { display: inline-block; background: rgba(255,255,255,0.25); color: #fff; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
          .title { font-size: 24px; font-weight: bold; margin: 0; }
          .body { padding: 28px; }
          .apt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
          .checklist-item { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
          .footer { background: #f1f5f9; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">📅 Appointment Reminder • ${timeframe === '24h' ? 'Tomorrow' : 'In 2 Hours'}</span>
            <h1 class="title">${apt.title}</h1>
          </div>
          <div class="body">
            <p style="font-size: 16px;">Upcoming medical appointment for <strong>${profile.fullName}</strong>:</p>
            
            <div class="apt-box">
              <p style="margin:4px 0; font-size:16px; font-weight:bold; color:#15803d;">👨‍⚕️ ${apt.doctorName} (${apt.specialty})</p>
              <p style="margin:4px 0; font-size:14px; color:#475569;">🏥 ${apt.clinicName}</p>
              <p style="margin:4px 0; font-size:14px; color:#475569;">📍 ${apt.address}</p>
              <p style="margin:4px 0; font-size:14px; color:#475569;">📞 ${apt.phone}</p>
              <p style="margin:8px 0 0 0; font-size:16px; font-weight:bold; color:#0f172a;">⏰ Time: ${dateFormatted}</p>
              <p style="margin:4px 0; font-size:14px; color:#0284c7;">🚗 Companion/Driver: ${apt.driverOrCompanion || 'Pending arrangement'}</p>
            </div>

            <h3 style="color:#0f172a; font-size:16px; margin-top:20px;">Preparation Checklist:</h3>
            <div>
              ${apt.preparationChecklist.map(item => `
                <div class="checklist-item">
                  ${item.completed ? '✅' : '⏳'} ${item.task}
                </div>
              `).join('')}
            </div>

            ${apt.questionsForDoctor && apt.questionsForDoctor.length > 0 ? `
              <h3 style="color:#0f172a; font-size:16px; margin-top:20px;">Prepared Questions for the Doctor:</h3>
              <ul style="padding-left:20px; font-size:14px; color:#475569;">
                ${apt.questionsForDoctor.map(q => `<li>${q}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
          <div class="footer">
            CareBridge 360 Collaborative Care Platform
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      profileId: profile.id,
      recipientName: profile.preferredName,
      recipientEmail: targetEmail,
      recipientRole: 'family',
      subject: `📅 Doctor Appointment Reminder: ${apt.doctorName} on ${dateFormatted}`,
      htmlBody,
      type: 'appointment_reminder',
      triggerReason: `Proactive ${timeframe} advance appointment notification`,
      metadata: { appointmentId: apt.id, timeframe }
    });
  }

  // --- 4. Weekly Family Health & Adherence Digest ---
  async sendWeeklyDigest(profile: ElderlyProfile, customEmail?: string) {
    const targetEmail = customEmail || profile.emergencyContacts[0]?.email || 'family@silvercare-demo.com';
    const logs = db.getMedicationLogs(profile.id);
    const takenCount = logs.filter(l => l.status === 'taken').length;
    const totalCount = logs.length || 1;
    const adherenceRate = Math.round((takenCount / totalCount) * 100);

    const appointments = db.getAppointments(profile.id).filter(a => a.status === 'upcoming');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #4f46e5, #4338ca); color: #ffffff; padding: 28px; }
          .title { font-size: 26px; font-weight: bold; margin: 0; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #4f46e5; margin: 4px 0; }
          .stat-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
          .body { padding: 28px; }
          .footer { background: #f1f5f9; padding: 16px 28px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">Weekly Care Digest: ${profile.preferredName}</h1>
            <p style="margin:4px 0 0 0; opacity:0.9;">Shared family summary for the week ending Sunday</p>
          </div>
          <div class="body">
            <p style="font-size: 16px;">Here is the overall health and routine update for <strong>${profile.fullName}</strong>:</p>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number" style="color: #16a34a;">${adherenceRate}%</div>
                <div class="stat-label">Medication Adherence</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${appointments.length}</div>
                <div class="stat-label">Upcoming Appointments</div>
              </div>
            </div>

            <h3 style="color:#0f172a; margin-top:24px;">Upcoming Appointments This Week:</h3>
            ${appointments.length === 0 ? '<p style="color:#64748b;">No scheduled doctor visits this coming week.</p>' : `
              <ul style="padding-left:20px; font-size:14px; color:#475569;">
                ${appointments.map(a => `
                  <li><strong>${a.title}</strong> with ${a.doctorName} on ${new Date(a.dateTime).toLocaleDateString()} (${a.driverOrCompanion || 'Driver needed'})</li>
                `).join('')}
              </ul>
            `}

            <h3 style="color:#0f172a; margin-top:24px;">Care Circle Messages:</h3>
            <p style="font-size:14px; color:#475569;">
              Caregivers and family members shared updates this week. Everything is calm and routines are well maintained!
            </p>
          </div>
          <div class="footer">
            CareBridge 360 • Keeping Families and Caretakers Connected
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      profileId: profile.id,
      recipientName: 'Family Circle',
      recipientEmail: targetEmail,
      recipientRole: 'family',
      subject: `📊 Weekly Health Digest for ${profile.preferredName}: ${adherenceRate}% Adherence`,
      htmlBody,
      type: 'weekly_digest',
      triggerReason: 'Automated weekly Sunday family digest'
    });
  }

  // --- 5. Emergency SOS Broadcast ---
  async sendEmergencySOS(profile: ElderlyProfile, customEmail?: string) {
    const recipients = profile.emergencyContacts.filter(c => c.canReceiveAlerts);
    const targetEmail = customEmail || (recipients.length > 0 ? recipients[0].email : 'emergency@silvercare-demo.com');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #991b1b; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 25px rgba(0,0,0,0.3); border: 3px solid #dc2626; }
          .header { background: #dc2626; color: #ffffff; padding: 28px; text-align: center; }
          .title { font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .body { padding: 28px; }
          .urgent-banner { background: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
          .btn-call { display: block; background: #dc2626; color: #ffffff !important; text-align: center; padding: 16px; border-radius: 10px; font-size: 18px; font-weight: bold; text-decoration: none; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="title">🚨 EMERGENCY SOS ACTIVATED</h1>
            <p style="margin:8px 0 0 0; font-size:16px;">Immediate Family & Caregiver Alert</p>
          </div>
          <div class="body">
            <div class="urgent-banner">
              <h2 style="color:#991b1b; margin-top:0;">Elderly Individual Triggered SOS</h2>
              <p style="font-size:18px; margin:4px 0;"><strong>${profile.fullName} (${profile.preferredName})</strong></p>
              <p style="margin:4px 0; color:#475569;">📍 Address: <strong>${profile.address}</strong></p>
              <p style="margin:4px 0; color:#475569;">⏰ Timestamp: <strong>${new Date().toLocaleTimeString()} (EST)</strong></p>
            </div>

            <a href="tel:911" class="btn-call">🚨 CALL EMERGENCY SERVICES (911)</a>

            <h3 style="color:#0f172a; margin-top:20px;">Critical Medical Information for First Responders:</h3>
            <ul style="font-size:15px; color:#334155;">
              <li><strong>Blood Type:</strong> ${profile.bloodType}</li>
              <li><strong>Known Allergies:</strong> ${profile.allergies.join(', ')}</li>
              <li><strong>Active Conditions:</strong> ${profile.chronicConditions.join(', ')}</li>
              <li><strong>Primary Doctor:</strong> ${profile.primaryPhysician.name} (${profile.primaryPhysician.phone})</li>
              <li><strong>Special Notes:</strong> ${profile.medicalNotes}</li>
            </ul>

            <h3 style="color:#0f172a; margin-top:20px;">Emergency Circle Contacts:</h3>
            <div>
              ${profile.emergencyContacts.map(c => `
                <div style="padding:6px 0; border-bottom:1px solid #f1f5f9;">
                  <strong>${c.name}</strong> (${c.relation}): <a href="tel:${c.phone}">${c.phone}</a>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      profileId: profile.id,
      recipientName: 'Emergency Broadcast List',
      recipientEmail: targetEmail,
      recipientRole: 'all',
      subject: `🚨 CRITICAL EMERGENCY SOS: ${profile.preferredName} pressed emergency button!`,
      htmlBody,
      type: 'sos_emergency',
      triggerReason: 'One-click SOS Emergency activation by senior',
      metadata: { timestamp: new Date().toISOString() }
    });
  }
}

export const emailService = new EmailService();
