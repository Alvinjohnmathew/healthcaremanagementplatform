import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db.js';
import { RoutineTask } from '../types.js';

const router = Router();

// Get routines for profile
router.get('/profiles/:profileId/routines', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const routines = db.getRoutines(profileId);
  res.json({ success: true, routines });
});

// Add an entry to a routine (e.g., drank 1 glass of water, took BP)
router.post('/routines/:id/entries', (req: Request, res: Response) => {
  const { id } = req.params;
  const { value, notes, loggedBy } = req.body;

  const entry = {
    id: `re-${uuidv4().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    value,
    notes,
    loggedBy: loggedBy || 'Senior'
  };

  const updated = db.addRoutineEntry(id, entry);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Routine not found' });
    return;
  }

  // If this is a vital check like BP or Blood Glucose, also notify the care circle
  if (updated.type === 'blood_pressure' || updated.type === 'blood_glucose') {
    db.addCareMessage({
      id: `msg-vital-${Date.now()}`,
      profileId: updated.profileId,
      senderName: loggedBy || 'Care Routine',
      senderRole: 'caretaker',
      text: `📊 Vital Logged: ${updated.title} recorded as ${value} ${updated.unit}. ${notes ? `("${notes}")` : ''}`,
      timestamp: new Date().toISOString(),
      reactions: { thumbsUp: 1 }
    });
  }

  res.status(201).json({ success: true, routine: updated, entry });
});

// Create new routine
router.post('/profiles/:profileId/routines', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const profile = db.getProfileById(profileId);
  if (!profile) {
    res.status(404).json({ success: false, message: 'Profile not found' });
    return;
  }

  const newRoutine: RoutineTask = {
    id: `rt-${uuidv4().slice(0, 8)}`,
    profileId,
    title: req.body.title,
    type: req.body.type || 'hydration',
    targetValue: req.body.targetValue || 6,
    unit: req.body.unit || 'units',
    frequency: req.body.frequency || 'Daily',
    iconName: req.body.iconName || 'Activity',
    description: req.body.description || '',
    entries: []
  };

  db.createRoutine(newRoutine);
  res.status(201).json({ success: true, routine: newRoutine });
});

export default router;
