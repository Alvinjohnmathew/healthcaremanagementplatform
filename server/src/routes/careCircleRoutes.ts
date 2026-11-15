import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db.js';
import { CareMessage } from '../types.js';

const router = Router();

// Get care messages for profile
router.get('/profiles/:profileId/messages', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const messages = db.getCareMessages(profileId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json({ success: true, messages });
});

// Post care message
router.post('/profiles/:profileId/messages', (req: Request, res: Response) => {
  const { profileId } = req.params;
  const { senderName, senderRole, text } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({ success: false, message: 'Message text is required' });
    return;
  }

  const newMsg: CareMessage = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    profileId,
    senderName: senderName || 'Family Member',
    senderRole: senderRole || 'family',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    reactions: {}
  };

  db.addCareMessage(newMsg);
  res.status(201).json({ success: true, message: newMsg });
});

// React to message
router.post('/messages/:id/react', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reactionType } = req.body; // 'heart' | 'thumbsUp' | 'hug'

  const updated = db.reactToMessage(id, reactionType);
  if (!updated) {
    res.status(404).json({ success: false, message: 'Message not found' });
    return;
  }

  res.json({ success: true, message: updated });
});

export default router;
