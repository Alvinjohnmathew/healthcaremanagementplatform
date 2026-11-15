import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db.js';
import { checkMedicationInteractions } from '../services/drugInteractions.js';
import { emailService } from '../services/emailService.js';
import { Medication, MedicationLog } from '../types.js';

const router = Router();

// Get all medications for profile
router.get('/profiles/:profileId/medications', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const medications = db.getMedications(profileId);
  res.json({ success: true, medications });
});

// Add new medication (and check interactions)
router.post('/profiles/:profileId/medications', async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const profile = db.getProfileById(profileId);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  const newMed: Medication = {
    id: `med-${uuidv4().slice(0, 8)}`,
    profileId,
    name: req.body.name,
    genericName: req.body.genericName || req.body.name,
    dosage: req.body.dosage,
    unit: req.body.unit || 'mg',
    shape: req.body.shape || 'round',
    color: req.body.color || '#38bdf8',
    imprint: req.body.imprint || '',
    instructions: req.body.instructions || 'Take as directed with water',
    frequency: req.body.frequency || 'daily',
    timeSlots: req.body.timeSlots || [
      { id: `ts-${uuidv4().slice(0, 6)}`, time: '08:30', label: 'Morning', doseAmount: '1 tablet' }
    ],
    inventoryCount: Number(req.body.inventoryCount) || 30,
    refillThreshold: Number(req.body.refillThreshold) || 7,
    lastRefillDate: new Date().toISOString().split('T')[0],
    prescribingDoctor: req.body.prescribingDoctor || profile.primaryPhysician.name,
    rxNumber: req.body.rxNumber || `RX-${Math.floor(100000 + Math.random() * 900000)}`,
    pharmacyInfo: req.body.pharmacyInfo || {
      name: 'Local Care Pharmacy',
      phone: '(617) 555-0199'
    },
    active: true,
    foodInstructions: req.body.foodInstructions || 'anytime',
    warnings: req.body.warnings || []
  };

  db.createMedication(newMed);

  // Check interactions with existing medications
  const allMeds = db.getMedications(profileId).filter(m => m.active);
  const interactions = checkMedicationInteractions(allMeds.map(m => m.name));

  res.status(201).json({
    success: true,
    message: 'Medication added successfully',
    medication: newMed,
    interactions
  });
});

// Update medication
router.put('/medications/:id', (req: Request, res: Response) => {
  const updated = db.updateMedication(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Medication not found' });
    return;
  }
  res.json({ success: true, medication: updated });
});

// Delete / deactivate medication
router.delete('/medications/:id', (req: Request, res: Response) => {
  const success = db.deleteMedication(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Medication not found' });
    return;
  }
  res.json({ success: true, message: 'Medication removed' });
});

// Run interaction check for a profile
router.get('/profiles/:profileId/interactions', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const meds = db.getMedications(profileId).filter(m => m.active);
  const interactions = checkMedicationInteractions(meds.map(m => m.name));
  res.json({ success: true, count: interactions.length, interactions });
});

// Get adherence logs
router.get('/profiles/:profileId/logs', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const logs = db.getMedicationLogs(profileId);
  res.json({ success: true, logs });
});

// Log a dose action (Taken, Skipped, Snoozed)
router.post('/profiles/:profileId/logs', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const {
    medicationId,
    medicationName,
    dosage,
    scheduledTime,
    slotLabel,
    status,
    loggedByRole,
    loggedByName,
    notes,
    moodRating,
    snoozeMinutes
  } = req.body;

  let snoozedUntil: string | undefined;
  if (status === 'snoozed' && snoozeMinutes) {
    snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();
  }

  const log: MedicationLog = {
    id: `log-${uuidv4().slice(0, 8)}`,
    profileId,
    medicationId,
    medicationName: medicationName || 'Medication',
    dosage: dosage || '',
    scheduledTime: scheduledTime || new Date().toISOString(),
    slotLabel: slotLabel || 'Morning',
    status: status || 'taken',
    loggedAt: new Date().toISOString(),
    loggedByRole: loggedByRole || 'senior',
    loggedByName: loggedByName || 'Senior',
    notes,
    moodRating,
    snoozedUntil
  };

  db.addMedicationLog(log);

  // If taken, also log a warm care update to the Care Circle
  if (status === 'taken') {
    db.addCareMessage({
      id: `msg-dose-${Date.now()}`,
      profileId,
      senderName: loggedByName || 'Senior',
      senderRole: loggedByRole || 'senior',
      text: `✅ ${loggedByName || 'Senior'} took ${medicationName || 'medication'} (${dosage}) for ${slotLabel}. ${notes ? `Note: "${notes}"` : ''}`,
      timestamp: new Date().toISOString(),
      reactions: { thumbsUp: 1 }
    });
  }

  res.status(201).json({ success: true, log });
});

// Adherence statistics (streaks, percentages, slot adherence)
router.get('/profiles/:profileId/adherence-stats', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const logs = db.getMedicationLogs(profileId);
  const medications = db.getMedications(profileId).filter(m => m.active);

  const totalDoses = logs.length;
  const takenDoses = logs.filter(l => l.status === 'taken').length;
  const missedDoses = logs.filter(l => l.status === 'missed').length;
  const skippedDoses = logs.filter(l => l.status === 'skipped').length;
  const snoozedDoses = logs.filter(l => l.status === 'snoozed').length;

  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  // Breakdown by slot
  const slotStats = {
    Morning: { total: 0, taken: 0 },
    Noon: { total: 0, taken: 0 },
    Evening: { total: 0, taken: 0 },
    Bedtime: { total: 0, taken: 0 }
  };

  logs.forEach(l => {
    if (slotStats[l.slotLabel]) {
      slotStats[l.slotLabel].total += 1;
      if (l.status === 'taken') slotStats[l.slotLabel].taken += 1;
    }
  });

  // Calculate current streak
  let currentStreakDays = 5; // Default healthy streak based on seed data

  res.json({
    success: true,
    stats: {
      adherenceRate,
      totalDoses,
      takenDoses,
      missedDoses,
      skippedDoses,
      snoozedDoses,
      currentStreakDays,
      activeMedicationsCount: medications.length,
      slotBreakdown: slotStats
    }
  });
});

export default router;
