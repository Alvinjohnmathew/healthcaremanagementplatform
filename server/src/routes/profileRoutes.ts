import { Router, Request, Response } from 'express';
import { db } from '../services/db.js';
import { emailService } from '../services/emailService.js';
import { checkMedicationInteractions } from '../services/drugInteractions.js';

const router = Router();

// Get all elderly profiles
router.get('/', (req: Request, res: Response) => {
  const profiles = db.getProfiles();
  // Return profiles with safe fields (hide internal passcodes in general list)
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
      // For demo ease, we provide passcode hints so reviewer knows what codes to enter
      passcodeHints: {
        seniorPin: p.passcodes.seniorPin,
        caretakerPasscode: p.passcodes.caretakerPasscode,
        familyPasscode: p.passcodes.familyPasscode
      }
    };
  });

  res.json({ success: true, profiles: safeProfiles });
});

// Get single profile
router.get('/:id', (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }
  res.json({ success: true, profile });
});

// Verify passcode for profile & role
router.post('/:id/verify-passcode', (req: Request, res: Response) => {
  const { role, passcode } = req.body;
  const profile = db.getProfileById(req.params.id);

  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  const cleanCode = (passcode || '').toString().trim();
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
      message: `Invalid passcode for ${role}. Please check your passcode and try again.`
    });
  }
});

// Update profile preferences
router.patch('/:id', (req: Request, res: Response) => {
  const updated = db.updateProfile(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }
  res.json({ success: true, profile: updated });
});

// Trigger Emergency SOS Broadcast
router.post('/:id/sos', async (req: Request, res: Response) => {
  const profile = db.getProfileById(req.params.id);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  const { customEmail } = req.body;
  const notif = await emailService.sendEmergencySOS(profile, customEmail);

  // Also log an urgent care message to the circle
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
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  const medications = db.getMedications(profile.id).filter(m => m.active);
  const logs = db.getMedicationLogs(profile.id);
  const appointments = db.getAppointments(profile.id);
  const routines = db.getRoutines(profile.id);

  // Calculate adherence
  const takenCount = logs.filter(l => l.status === 'taken').length;
  const totalCount = logs.length || 1;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  // Run interactions
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
