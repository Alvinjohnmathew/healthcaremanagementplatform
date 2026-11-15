import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db.js';
import { Appointment } from '../types.js';

const router = Router();

// Get appointments for profile
router.get('/profiles/:profileId/appointments', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const appointments = db.getAppointments(profileId).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  res.json({ success: true, appointments });
});

// Create appointment
router.post('/profiles/:profileId/appointments', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const profile = db.getProfileById(profileId);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  const newApt: Appointment = {
    id: `apt-${uuidv4().slice(0, 8)}`,
    profileId,
    title: req.body.title,
    doctorName: req.body.doctorName || 'Doctor',
    specialty: req.body.specialty || 'General Practice',
    clinicName: req.body.clinicName || 'Medical Center',
    address: req.body.address || profile.address,
    phone: req.body.phone || '(617) 555-0100',
    dateTime: req.body.dateTime || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    transportationStatus: req.body.transportationStatus || 'needed',
    driverOrCompanion: req.body.driverOrCompanion || '',
    preparationChecklist: req.body.preparationChecklist || [
      { id: `pc-${uuidv4().slice(0, 6)}`, task: 'Bring current medication list', completed: false }
    ],
    questionsForDoctor: req.body.questionsForDoctor || [],
    doctorSummaryNotes: '',
    reminderSent24h: false,
    reminderSent2h: false
  };

  db.createAppointment(newApt);

  // Notify care circle
  db.addCareMessage({
    id: `msg-apt-${Date.now()}`,
    profileId,
    senderName: 'System Calendar',
    senderRole: 'caretaker',
    text: `📅 New doctor appointment scheduled: "${newApt.title}" with ${newApt.doctorName} on ${new Date(newApt.dateTime).toLocaleDateString()} at ${new Date(newApt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    timestamp: new Date().toISOString(),
    reactions: {}
  });

  res.status(201).json({ success: true, appointment: newApt });
});

// Update appointment
router.put('/appointments/:id', (req: Request, res: Response) => {
  const updated = db.updateAppointment(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }
  res.json({ success: true, appointment: updated });
});

// Delete appointment
router.delete('/appointments/:id', (req: Request, res: Response) => {
  const success = db.deleteAppointment(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Appointment not found' });
    return;
  }
  res.json({ success: true, message: 'Appointment removed' });
});

export default router;
