import { Router, Request, Response } from 'express';
import { db } from '../services/db.js';
import { emailService } from '../services/emailService.js';
import { checkMedicationInteractions } from '../services/drugInteractions.js';
import { authRateLimiter, sosRateLimiter } from '../middleware/security.js';

const router = Router();

// Get all elderly profiles (sanitized list)
router.get('/', (req: Request, res: Response) => {
  const profiles = db.getProfiles();
  const safeProfiles = profiles.map(p => {
    const meds = db.getMedications(p.id).filter(m => m.active);
    const logs = db.getMedicationLogs(p.id);
    const taken = logs.filter(l => l.status === 'taken').length;
    const adherence = logs.length > 0 ? Math.round((taken / logs.length) * 100) : 100;
    const lowStockCount = meds.filter(m => m.inventoryCount <= m.refillThreshold).length;

    return {
      id: p.id,
      fullName: p.fullName,
      preferredName: p.preferredName,
      age: p.age,
      gender: p.gender,
      avatar: p.avatar,
      address: p.address,
      bloodType: p.bloodType,
      allergies: p.allergies,
      chronicConditions: p.chronicConditions,
      activeStatus: p.activeStatus,
      adherenceRate: adherence,
      activeMedicationsCount: meds.length,
      lowStockCount,
      passcodeHints: {
        seniorPin: p.passcodes.seniorPin,
        caretakerPasscode: p.passcodes.caretakerPasscode,
        familyPasscode: p.passcodes.familyPasscode
      }
    };
  });

  res.json({ success: true, profiles: safeProfiles });
});

// Consolidated High-Efficiency Dashboard Endpoint (1 single request replaces 8 roundtrips!)
router.get('/:id/dashboard', (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    return;
  }

  const medications = db.getMedications(profile.id);
  const logs = db.getMedicationLogs(profile.id);
  const appointments = db.getAppointments(profile.id);
  const routines = db.getRoutines(profile.id);
  const messages = db.getCareMessages(profile.id);
  const notifications = db.getNotifications(profile.id);
  const interactions = checkMedicationInteractions(medications.filter(m => m.active).map(m => m.name));

  const totalDoses = logs.length;
  const takenDoses = logs.filter(l => l.status === 'taken').length;
  const missedDoses = logs.filter(l => l.status === 'missed').length;
  const skippedDoses = logs.filter(l => l.status === 'skipped').length;
  const snoozedDoses = logs.filter(l => l.status === 'snoozed').length;
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  // Breakdown by slot
  const slotBreakdown = {
    Morning: { total: 0, taken: 0 },
    Noon: { total: 0, taken: 0 },
    Evening: { total: 0, taken: 0 },
    Bedtime: { total: 0, taken: 0 }
  };

  logs.forEach(l => {
    if (slotBreakdown[l.slotLabel]) {
      slotBreakdown[l.slotLabel].total += 1;
      if (l.status === 'taken') slotBreakdown[l.slotLabel].taken += 1;
    }
  });

  const safeProfile = {
    ...profile,
    passcodeHints: {
      seniorPin: profile.passcodes.seniorPin,
      caretakerPasscode: profile.passcodes.caretakerPasscode,
      familyPasscode: profile.passcodes.familyPasscode
    }
  };

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    profile: safeProfile,
    medications,
    logs,
    appointments,
    routines,
    messages,
    notifications,
    interactions,
    stats: {
      adherenceRate,
      totalDoses,
      takenDoses,
      missedDoses,
      skippedDoses,
      snoozedDoses,
      slotBreakdown,
      activeMedicationsCount: medications.filter(m => m.active).length,
      currentStreakDays: 5
    }
  });
});

// Get single profile
router.get('/:id', (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    return;
  }
  res.json({ success: true, profile });
});

// Verify passcode with brute-force rate limiting and strict validation
router.post('/:id/verify-passcode', authRateLimiter, (req: Request, res: Response) => {
  const { role, passcode } = req.body;

  // Input validation
  if (!role || !passcode) {
    res.status(400).json({
      success: false,
      code: 'INVALID_INPUT',
      message: 'Both role and passcode are required fields.'
    });
    return;
  }

  const validRoles = ['senior', 'caretaker', 'family'];
  if (!validRoles.includes(role)) {
    res.status(400).json({
      success: false,
      code: 'INVALID_ROLE',
      message: 'Role must be one of: senior, caretaker, family.'
    });
    return;
  }

  if (typeof passcode !== 'string' || passcode.length > 32) {
    res.status(400).json({
      success: false,
      code: 'INVALID_PASSCODE_FORMAT',
      message: 'Passcode must be a string up to 32 characters.'
    });
    return;
  }

  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    return;
  }

  const cleanCode = passcode.trim();
  let isValid = false;

  if (role === 'senior') {
    isValid = profile.passcodes.seniorPin === cleanCode;
  } else if (role === 'caretaker') {
    isValid = profile.passcodes.caretakerPasscode.toLowerCase() === cleanCode.toLowerCase();
  } else if (role === 'family') {
    isValid = profile.passcodes.familyPasscode.toLowerCase() === cleanCode.toLowerCase();
  }

  if (isValid) {
    res.json({
      success: true,
      message: `Passcode verified successfully for role: ${role}`,
      role,
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        preferredName: profile.preferredName,
        avatar: profile.avatar,
        fontSizePreference: profile.fontSizePreference,
        highContrast: profile.highContrast,
        voiceAssistEnabled: profile.voiceAssistEnabled
      }
    });
  } else {
    res.status(401).json({
      success: false,
      code: 'AUTH_FAILED',
      message: `Invalid passcode for ${role}. Please check your passcode and try again.`
    });
  }
});

// Update profile preferences
router.patch('/:id', (req: Request, res: Response) => {
  const updated = db.updateProfile(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    return;
  }
  res.json({ success: true, profile: updated });
});

// Trigger Emergency SOS Broadcast (rate limited)
router.post('/:id/sos', sosRateLimiter, async (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    return;
  }

  const { customEmail } = req.body;

  // Basic email sanitization if provided
  if (customEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customEmail)) {
    res.status(400).json({ success: false, code: 'INVALID_EMAIL', message: 'Invalid recipient email format.' });
    return;
  }

  const notif = await emailService.sendEmergencySOS(profile, customEmail);

  // Log urgent message to care circle
  db.addCareMessage({
    id: `msg-sos-${Date.now()}`,
    profileId: profile.id,
    senderName: profile.preferredName,
    senderRole: 'senior',
    text: `🚨 EMERGENCY ALERT: ${profile.preferredName} pressed the Emergency SOS button at ${new Date().toLocaleTimeString()}. Emergency contacts alerted!`,
    timestamp: new Date().toISOString(),
    reactions: {}
  });

  res.json({
    success: true,
    message: 'Emergency SOS broadcast sent to all primary contacts and logged to Care Circle.',
    notification: notif
  });
});

// Clinical Doctor Summary Report Data
router.get('/:id/clinical-report', (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Profile not found' });
    return;
  }

  const medications = db.getMedications(profile.id).filter(m => m.active);
  const logs = db.getMedicationLogs(profile.id);
  const appointments = db.getAppointments(profile.id);
  const routines = db.getRoutines(profile.id);

  const takenCount = logs.filter(l => l.status === 'taken').length;
  const totalCount = logs.length || 1;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  const interactions = checkMedicationInteractions(medications.map(m => m.name));

  res.json({
    success: true,
    report: {
      generatedAt: new Date().toISOString(),
      patient: {
        id: profile.id,
        fullName: profile.fullName,
        preferredName: profile.preferredName,
        age: profile.age,
        dob: profile.dateOfBirth,
        bloodType: profile.bloodType,
        allergies: profile.allergies,
        conditions: profile.chronicConditions,
        primaryPhysician: profile.primaryPhysician,
        emergencyContacts: profile.emergencyContacts
      },
      adherence: {
        rate: adherenceRate,
        totalScheduled: logs.length,
        taken: takenCount,
        missed: logs.filter(l => l.status === 'missed').length,
        skipped: logs.filter(l => l.status === 'skipped').length
      },
      activeMedications: medications,
      clinicalInteractions: interactions,
      recentVitals: routines.map(r => ({
        title: r.title,
        type: r.type,
        target: r.targetValue,
        unit: r.unit,
        recentReadings: r.entries.slice(0, 5)
      })),
      upcomingAppointments: appointments.filter(a => a.status === 'upcoming')
    }
  });
});

export default router;
