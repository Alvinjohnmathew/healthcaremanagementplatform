import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Send,
  Sparkles,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  X,
  FileText,
  RotateCcw,
  Zap,
  ExternalLink,
  Info
} from 'lucide-react';
import { NotificationLog, ElderlyProfile, Medication, Appointment } from '../types';
import { api } from '../services/api';

interface EmailNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ElderlyProfile;
  notifications: NotificationLog[];
  medications: Medication[];
  appointments: Appointment[];
  onRefreshNotifications: () => void;
}

export const EmailNotificationCenter: React.FC<EmailNotificationCenterProps> = ({
  isOpen,
  onClose,
  profile,
  notifications,
  medications,
  appointments,
  onRefreshNotifications
}) => {
  const [selectedNotification, setSelectedNotification] = useState<NotificationLog | null>(
    notifications[0] || null
  );
  const [customEmail, setCustomEmail] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async (action: 'upcoming_dose' | 'missed_alert' | 'appointment_reminder' | 'weekly_digest' | 'emergency_sos' | 'custom_test_email') => {
    setIsSimulating(true);
    setSimulationStatus(null);
    try {
      const res = await api.simulateNotification(profile.id, {
        action,
        customEmail: customEmail || undefined,
        customNotes: `Proactive simulation triggered for ${profile.preferredName}`
      });

      if (res.success && res.notification) {
        setSimulationStatus(`Notification triggered successfully: ${res.notification.subject}`);
        onRefreshNotifications();
        setSelectedNotification(res.notification);
      }
    } catch (err: any) {
      setSimulationStatus(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearAll = async () => {
    await api.clearNotifications(profile.id);
    setSelectedNotification(null);
    onRefreshNotifications();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-indigo-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Proactive Email & Alert Dispatcher</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  Live Center
                </span>
              </div>
              <p className="text-xs text-sky-100/80">
                Proactively alerting family and caretakers for {profile.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              Clear Logs
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Simulation Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                ⚡ Proactive Simulation Controls:
              </span>
              <p className="text-xs text-slate-600">
                Test the system's automated reminders, missed escalation alerts, and appointment notices:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSimulate('upcoming_dose')}
                disabled={isSimulating}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                Upcoming Dose (15m)
              </button>

              <button
                onClick={() => handleSimulate('missed_alert')}
                disabled={isSimulating}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Missed Dose Escalation
              </button>

              <button
                onClick={() => handleSimulate('appointment_reminder')}
                disabled={isSimulating}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Doctor Appointment (24h)
              </button>

              <button
                onClick={() => handleSimulate('weekly_digest')}
                disabled={isSimulating}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-300 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Weekly Family Digest
              </button>
            </div>
          </div>

          {/* Optional real email input */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 shrink-0">
              Optional Real Recipient Email:
            </span>
            <input
              type="email"
              value={customEmail}
              onChange={e => setCustomEmail(e.target.value)}
              placeholder="e.g. your-email@gmail.com (defaults to emergency contacts)"
              className="flex-1 text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            <button
              onClick={() => handleSimulate('custom_test_email')}
              disabled={isSimulating || !customEmail}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black text-white transition-all disabled:opacity-40"
            >
              Send Custom Test
            </button>
          </div>

          {simulationStatus && (
            <div className="mt-2 text-xs font-bold text-sky-800 bg-sky-100/70 py-1 px-3 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              {simulationStatus}
            </div>
          )}
        </div>

        {/* Main Content Area: Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Column: Email Notification Log List */}
          <div className="w-full md:w-96 border-r border-slate-200 overflow-y-auto bg-slate-50 p-3 space-y-2 shrink-0">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Sent Alerts ({notifications.length})
              </span>
              <span className="text-[11px] text-slate-400">Proactively captured</span>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No notifications logged yet. Trigger one above!
              </div>
            ) : (
              notifications.map(n => {
                const isSelected = selectedNotification?.id === n.id;
                const isUrgent = n.type === 'missed_alert' || n.type === 'sos_emergency';

                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNotification(n)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      isSelected
                        ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-100'
                        : isUrgent
                        ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        n.type === 'missed_alert'
                          ? 'bg-rose-100 text-rose-800'
                          : n.type === 'sos_emergency'
                          ? 'bg-red-600 text-white'
                          : n.type === 'dose_reminder'
                          ? 'bg-sky-100 text-sky-800'
                          : n.type === 'appointment_reminder'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {n.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{n.subject}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">To: {n.recipientEmail}</p>
                    <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">{n.triggerReason}</p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Full Email Preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100">
            {selectedNotification ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Meta details */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{selectedNotification.subject}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700">
                      Status: {selectedNotification.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>To:</strong> {selectedNotification.recipientName} &lt;{selectedNotification.recipientEmail}&gt;</span>
                    <span><strong>Role:</strong> {selectedNotification.recipientRole}</span>
                    <span><strong>Sent:</strong> {new Date(selectedNotification.sentAt).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong>Trigger:</strong> {selectedNotification.triggerReason}
                  </div>
                </div>

                {/* Rendered HTML Email Content */}
                <div className="p-6">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedNotification.htmlBody }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Select an email notification on the left to preview its full rendered contents.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
