import React, { useState } from 'react';
import {
  Heart,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Send,
  MessageCircle,
  ThumbsUp,
  Smile,
  Car,
  HelpCircle,
  Plus,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import {
  ElderlyProfile,
  Medication,
  MedicationLog,
  Appointment,
  RoutineTask,
  CareMessage
} from '../types';
import { api } from '../services/api';

interface FamilyViewProps {
  profile: ElderlyProfile;
  medications: Medication[];
  logs: MedicationLog[];
  appointments: Appointment[];
  routines: RoutineTask[];
  messages: CareMessage[];
  onRefreshData: () => void;
  onOpenDoctorReport: () => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  profile,
  medications,
  logs,
  appointments,
  routines,
  messages,
  onRefreshData,
  onOpenDoctorReport
}) => {
  const [newMsgText, setNewMsgText] = useState('');
  const [senderName, setSenderName] = useState('David Vance (Son)');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(
    appointments.find(a => a.status === 'upcoming')?.id || null
  );

  // Compute adherence
  const takenCount = logs.filter(l => l.status === 'taken').length;
  const totalCount = logs.length || 1;
  const adherenceRate = Math.round((takenCount / totalCount) * 100);

  // Check for any missed or overdue medications today
  const missedLogs = logs.filter(l => l.status === 'missed');
  const hasMissed = missedLogs.length > 0;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    await api.sendMessage(
      profile.id,
      senderName,
      'family',
      newMsgText.trim()
    );

    setNewMsgText('');
    onRefreshData();
  };

  const handleReact = async (messageId: string, type: 'heart' | 'thumbsUp' | 'hug') => {
    await api.reactToMessage(messageId, type);
    onRefreshData();
  };

  const handleVolunteerDrive = async (apt: Appointment) => {
    await api.updateAppointment(apt.id, {
      transportationStatus: 'arranged',
      driverOrCompanion: `${senderName} (Confirmed Driver)`
    });

    await api.sendMessage(
      profile.id,
      senderName,
      'family',
      `🚗 Ride Confirmed: I will be driving ${profile.preferredName} to the appointment with ${apt.doctorName} on ${new Date(apt.dateTime).toLocaleDateString()}!`
    );

    onRefreshData();
  };

  const handleAddQuestion = async (apt: Appointment) => {
    if (!newQuestionText.trim()) return;

    const updatedQuestions = [...(apt.questionsForDoctor || []), newQuestionText.trim()];
    await api.updateAppointment(apt.id, {
      questionsForDoctor: updatedQuestions
    });

    setNewQuestionText('');
    onRefreshData();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Family Peace of Mind Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile.avatar}
              alt={profile.preferredName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-lg shrink-0"
            />
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-2">
                👨‍👩‍👧 Family Circle & Peace-of-Mind Hub
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {profile.preferredName}'s Care Circle
              </h1>
              <p className="text-indigo-200 text-sm mt-1">
                Staying connected, tracking daily adherence, and coordinating doctor visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="text-center px-3">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-300">
                {adherenceRate}%
              </span>
              <span className="text-[11px] font-bold text-indigo-200 uppercase">
                Adherence Rate
              </span>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center px-3">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">
                5 Days
              </span>
              <span className="text-[11px] font-bold text-indigo-200 uppercase">
                Current Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Missed Medication Escalation Banner if any */}
      {hasMissed && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-200 text-rose-900 uppercase">
                Adherence Escalation
              </span>
              <h3 className="text-lg font-bold text-rose-900 mt-1">
                {profile.preferredName} has 1 unconfirmed / missed medication today
              </h3>
              <p className="text-xs text-rose-700">
                Automated email alerts were dispatched to family contacts. We recommend a gentle phone call.
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <a
              href={`tel:${profile.emergencyContacts[0]?.phone || '6175550899'}`}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Phone className="w-4 h-4" />
              Call {profile.preferredName}
            </a>
          </div>
        </div>
      )}

      {/* TWO COLUMNS: Left (Live Activity Feed & Routines) | Right (Care Circle Messages & Shared Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Live Activity Feed & Vitals */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Real-Time Live Activity Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900">Today's Live Care Timeline</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Real-Time Updates</span>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 5).map(log => (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                    log.status === 'taken'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : log.status === 'missed'
                      ? 'bg-rose-50/70 border-rose-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    log.status === 'taken'
                      ? 'bg-emerald-600 text-white'
                      : log.status === 'missed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {log.status === 'taken' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {log.medicationName} ({log.dosage})
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {new Date(log.loggedAt || log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5">
                      Status: <strong className="capitalize">{log.status}</strong> for {log.slotLabel} dose • Logged by: {log.loggedByName || 'Senior'}
                    </p>

                    {log.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-white/70 p-1.5 rounded-lg border border-slate-200/50">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals Summary for Family */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-black text-slate-900">Vitals & Routine Tracking</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {routines.map(r => {
                const latestEntry = r.entries[0];
                return (
                  <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-700">{r.title}</span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Target: {r.targetValue} {r.unit}
                      </span>
                    </div>

                    {latestEntry ? (
                      <div>
                        <div className="text-xl font-black text-slate-900">
                          {latestEntry.value} <span className="text-xs font-normal text-slate-500">{r.unit}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Last recorded {new Date(latestEntry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {latestEntry.notes && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">
                            "{latestEntry.notes}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No readings recorded yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Shared Appointment Companion & Love Notes */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Shared Doctor Visits & Ride Coordination */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900">Upcoming Doctor Visits</h3>
              </div>
            </div>

            <div className="space-y-4">
              {appointments.filter(a => a.status === 'upcoming').map(apt => (
                <div key={apt.id} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{apt.title}</h4>
                      <p className="text-xs text-indigo-800 font-semibold">{apt.doctorName} ({apt.specialty})</p>
                    </div>
                    <span className="text-xs font-bold bg-white text-indigo-900 px-2 py-0.5 rounded-lg border border-indigo-200">
                      {new Date(apt.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{apt.clinicName} • {apt.address}</p>

                  <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                    <span className="text-xs text-slate-700">
                      🚗 Driver: <strong>{apt.driverOrCompanion || 'Needed'}</strong>
                    </span>

                    {!apt.driverOrCompanion?.includes(senderName) && (
                      <button
                        onClick={() => handleVolunteerDrive(apt)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        I can drive Mom
                      </button>
                    )}
                  </div>

                  {/* Collaborative Questions for the Doctor */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Family Questions for Doctor:
                    </p>
                    <ul className="text-xs space-y-1 text-slate-700 list-disc pl-4">
                      {apt.questionsForDoctor?.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={e => setNewQuestionText(e.target.value)}
                        placeholder="Add a question for the doctor..."
                        className="flex-1 text-xs py-1.5 px-2.5 rounded-xl border border-indigo-200 bg-white"
                      />
                      <button
                        onClick={() => handleAddQuestion(apt)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care Circle Love Notes & Encouragement Message Board */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <h3 className="text-xl font-black text-slate-900">Care Circle Message Board</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map(msg => (
                <div key={msg.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700">{msg.text}</p>
                  
                  {/* Reactions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleReact(msg.id, 'heart')}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-600"
                    >
                      ❤️ {msg.reactions?.heart || 0}
                    </button>
                    <button
                      onClick={() => handleReact(msg.id, 'thumbsUp')}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 text-slate-600"
                    >
                      👍 {msg.reactions?.thumbsUp || 0}
                    </button>
                    <button
                      onClick={() => handleReact(msg.id, 'hug')}
                      className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 text-slate-600"
                    >
                      🤗 {msg.reactions?.hug || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Post message input */}
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMsgText}
                  onChange={e => setNewMsgText(e.target.value)}
                  placeholder={`Send an encouraging love note to ${profile.preferredName}...`}
                  className="flex-1 text-xs py-2 px-3 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newMsgText.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
