import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Volume2,
  Mic,
  Clock,
  Sparkles,
  Smile,
  AlertTriangle,
  Calendar,
  Droplets,
  Heart,
  Footprints,
  Phone,
  ThumbsUp,
  HelpCircle,
  RotateCw
} from 'lucide-react';
import { ElderlyProfile, Medication, MedicationLog, Appointment, RoutineTask } from '../types';
import { VoiceAssistant } from '../services/voiceAssistant';
import { api } from '../services/api';

interface SeniorViewProps {
  profile: ElderlyProfile;
  medications: Medication[];
  logs: MedicationLog[];
  appointments: Appointment[];
  routines: RoutineTask[];
  onRefreshData: () => void;
  onOpenEmergencyModal: () => void;
  voiceEnabled: boolean;
}

export const SeniorView: React.FC<SeniorViewProps> = ({
  profile,
  medications,
  logs,
  appointments,
  routines,
  onRefreshData,
  onOpenEmergencyModal,
  voiceEnabled
}) => {
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'okay' | 'unwell' | 'pain' | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [takingMedId, setTakingMedId] = useState<string | null>(null);

  // Today's date string
  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Today's upcoming doctor appointment if any
  const upcomingAppointment = appointments.find(a => {
    const aptDate = new Date(a.dateTime);
    const now = new Date();
    return a.status === 'upcoming' && (aptDate.getTime() - now.getTime()) < 48 * 60 * 60 * 1000;
  });

  // Calculate doses for today
  const activeMeds = medications.filter(m => m.active);

  // Slots
  const slots: Array<'Morning' | 'Noon' | 'Evening' | 'Bedtime'> = ['Morning', 'Noon', 'Evening', 'Bedtime'];

  // Check if a medication in a slot is taken today
  const isSlotTaken = (medId: string, slotLabel: string) => {
    return logs.some(l => 
      l.medicationId === medId && 
      l.slotLabel === slotLabel && 
      l.status === 'taken' &&
      new Date(l.scheduledTime).toDateString() === new Date().toDateString()
    );
  };

  const handleTakeDose = async (med: Medication, slot: { label: 'Morning' | 'Noon' | 'Evening' | 'Bedtime'; time: string; doseAmount: string }) => {
    setTakingMedId(med.id);
    try {
      // Trigger celebratory confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Voice praise if enabled
      if (voiceEnabled) {
        VoiceAssistant.speak(`Wonderful job, ${profile.preferredName}! You took your ${med.name}.`);
      }

      await api.logDose(profile.id, {
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage + med.unit,
        slotLabel: slot.label,
        status: 'taken',
        loggedByRole: 'senior',
        loggedByName: profile.preferredName,
        moodRating: selectedMood || undefined,
        scheduledTime: new Date().toISOString()
      });

      onRefreshData();
    } catch (err) {
      console.error('Failed to log dose:', err);
    } finally {
      setTakingMedId(null);
    }
  };

  const handleReadSchedule = () => {
    setIsSpeaking(true);
    const morningMeds = activeMeds.filter(m => m.timeSlots.some(t => t.label === 'Morning'));
    const pendingMorning = morningMeds.filter(m => !isSlotTaken(m.id, 'Morning'));

    let speechText = `Hello ${profile.preferredName}! Today is ${todayDateStr}. `;
    if (pendingMorning.length > 0) {
      speechText += `You have ${pendingMorning.length} medications to take this morning: ${pendingMorning.map(m => `${m.name} ${m.dosage}${m.unit}`).join(', and ')}. `;
    } else {
      speechText += `Your morning medications are all completed! You are doing great. `;
    }

    if (upcomingAppointment) {
      speechText += `Reminder: You have an appointment with ${upcomingAppointment.doctorName} coming up. ${upcomingAppointment.driverOrCompanion || ''}.`;
    }

    VoiceAssistant.speak(speechText, () => setIsSpeaking(false));
  };

  const handleVoiceCommand = () => {
    setIsListening(true);
    setVoiceFeedback('Listening... Say: "I took my pills" or "Read schedule"');

    VoiceAssistant.listen(
      (transcript) => {
        setIsListening(false);
        setVoiceFeedback(`You said: "${transcript}"`);
        const lower = transcript.toLowerCase();

        if (lower.includes('took') || lower.includes('taken') || lower.includes('pill')) {
          // Find first untaken medication
          const untaken = activeMeds.find(m => m.timeSlots.some(t => !isSlotTaken(m.id, t.label)));
          if (untaken) {
            const firstSlot = untaken.timeSlots.find(t => !isSlotTaken(untaken.id, t.label)) || untaken.timeSlots[0];
            handleTakeDose(untaken, firstSlot);
          } else {
            VoiceAssistant.speak(`All your scheduled medications are already marked as taken today!`);
          }
        } else if (lower.includes('read') || lower.includes('schedule') || lower.includes('medicine')) {
          handleReadSchedule();
        } else {
          VoiceAssistant.speak(`I heard you say: ${transcript}. To check off medicine, say "I took my pills".`);
        }
      },
      (err) => {
        setIsListening(false);
        setVoiceFeedback('Could not detect speech. Please try tapping the button directly.');
      }
    );
  };

  const handleSaveMood = (mood: 'great' | 'good' | 'okay' | 'unwell' | 'pain') => {
    setSelectedMood(mood);
    setMoodSaved(true);
    if (voiceEnabled) {
      const messages = {
        great: `Glad to hear you are feeling great today, ${profile.preferredName}!`,
        good: `Wonderful! Have a lovely day, ${profile.preferredName}.`,
        okay: `Thank you for sharing. Remember to rest if needed.`,
        unwell: `I will notify your family circle that you are feeling a bit unwell today.`,
        pain: `I have noted that you are experiencing pain. Please rest and consider resting your joints.`
      };
      VoiceAssistant.speak(messages[mood]);
    }
  };

  const hydrationRoutine = routines.find(r => r.type === 'hydration');
  const todayWaterCount = hydrationRoutine
    ? hydrationRoutine.entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length
    : 0;

  const handleAddWater = async () => {
    if (!hydrationRoutine) return;
    try {
      await api.addRoutineEntry(hydrationRoutine.id, 1, 'Glass of fresh water', profile.preferredName);
      if (voiceEnabled) {
        VoiceAssistant.speak(`Great hydration! That is glass number ${todayWaterCount + 1} today.`);
      }
      onRefreshData();
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Friendly Warm Senior Greeting Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 sm:p-10 text-white shadow-xl shadow-amber-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={profile.avatar}
              alt={profile.preferredName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/30 shadow-lg shrink-0"
            />
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-2">
                👵 Senior Mode • Easy Touch
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Good Day, {profile.preferredName}!
              </h1>
              <p className="text-amber-100 font-semibold text-base sm:text-lg mt-1">
                {todayDateStr}
              </p>
            </div>
          </div>

          {/* Senior Voice Audio Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReadSchedule}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm sm:text-base hover:bg-amber-50 transition-all shadow-md active:scale-95"
            >
              <Volume2 className={`w-5 h-5 text-amber-600 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isSpeaking ? 'Reading Out Loud...' : 'Listen to Schedule'}</span>
            </button>

            <button
              onClick={handleVoiceCommand}
              className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-black text-sm sm:text-base transition-all shadow-md active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-amber-900/40 border border-white/30 text-white hover:bg-amber-900/60'
              }`}
            >
              <Mic className="w-5 h-5 text-white" />
              <span>{isListening ? 'Listening...' : 'Voice Check-In'}</span>
            </button>
          </div>
        </div>

        {voiceFeedback && (
          <div className="mt-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold text-white border border-white/20">
            🎙️ {voiceFeedback}
          </div>
        )}
      </div>

      {/* Mood / Daily Well-Being Check-in */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Smile className="w-6 h-6 text-amber-500" />
              How are you feeling right now?
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Tap a smile to let your family and nurse know how your day is going
            </p>
          </div>
          {moodSaved && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Checked in!
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-2">
          {[
            { id: 'great', emoji: '😄', label: 'Great', bg: 'hover:bg-emerald-50 active:bg-emerald-100 border-emerald-200' },
            { id: 'good', emoji: '🙂', label: 'Good', bg: 'hover:bg-sky-50 active:bg-sky-100 border-sky-200' },
            { id: 'okay', emoji: '😐', label: 'Okay', bg: 'hover:bg-amber-50 active:bg-amber-100 border-amber-200' },
            { id: 'unwell', emoji: '🤒', label: 'Unwell', bg: 'hover:bg-orange-50 active:bg-orange-100 border-orange-200' },
            { id: 'pain', emoji: '😣', label: 'In Pain', bg: 'hover:bg-rose-50 active:bg-rose-100 border-rose-200' }
          ].map(m => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSaveMood(m.id as any)}
                className={`flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50 shadow-md scale-105'
                    : `border-slate-200 bg-slate-50/70 ${m.bg}`
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1.5">{m.emoji}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointment Alert if any */}
      {upcomingAppointment && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg shadow-teal-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Upcoming Doctor Visit
              </span>
              <h3 className="text-xl font-bold mt-1">{upcomingAppointment.title}</h3>
              <p className="text-teal-100 text-sm font-semibold">
                {upcomingAppointment.doctorName} • {new Date(upcomingAppointment.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-white/90 mt-1 font-bold">
                🚗 {upcomingAppointment.driverOrCompanion || 'Pending companion ride'}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href={`tel:${upcomingAppointment.phone}`}
              className="px-4 py-2.5 bg-white text-teal-800 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:bg-teal-50"
            >
              <Phone className="w-4 h-4" />
              Call Clinic
            </a>
          </div>
        </div>
      )}

      {/* TODAY'S MEDICATIONS: Time Slot Groups */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Today's Medications
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Tap the big green button after taking each pill
            </p>
          </div>
          <button
            onClick={onRefreshData}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-2xl border border-slate-200 transition-colors"
            title="Refresh schedule"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        {slots.map(slotLabel => {
          // Find medications that have this slot
          const medsInSlot = activeMeds.filter(m => m.timeSlots.some(t => t.label === slotLabel));
          if (medsInSlot.length === 0) return null;

          const slotIcons = {
            Morning: '🌅',
            Noon: '☀️',
            Evening: '🌆',
            Bedtime: '🌙'
          };

          return (
            <div key={slotLabel} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{slotIcons[slotLabel]}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {slotLabel} Medications
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                  {medsInSlot.length} scheduled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medsInSlot.map(med => {
                  const targetSlot = med.timeSlots.find(t => t.label === slotLabel) || med.timeSlots[0];
                  const taken = isSlotTaken(med.id, slotLabel);

                  return (
                    <div
                      key={med.id}
                      className={`relative p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                        taken
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                          : 'bg-white border-slate-200 shadow-sm hover:border-sky-300'
                      }`}
                    >
                      {/* Pill appearance visualizer */}
                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xs text-slate-800 shadow-inner shrink-0 border-2 border-slate-300"
                          style={{ backgroundColor: med.color || '#bae6fd' }}
                          title={`Visual appearance: ${med.shape} in color ${med.color}`}
                        >
                          <span className="text-[10px] font-mono font-black uppercase text-center px-1">
                            {med.imprint || med.shape}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg sm:text-xl font-black text-slate-900 truncate">
                              {med.name}
                            </h4>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                              {targetSlot.time}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-sky-700 mt-0.5">
                            Dose: {med.dosage}{med.unit} ({targetSlot.doseAmount})
                          </p>

                          <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-2">
                            {med.instructions}
                          </p>

                          {med.warnings && med.warnings.length > 0 && (
                            <p className="text-[11px] font-bold text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-2 border border-amber-200">
                              ⚠️ {med.warnings[0]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Big Action Button */}
                      <div className="mt-5">
                        {taken ? (
                          <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center gap-2 shadow-sm">
                            <CheckCircle2 className="w-6 h-6 fill-emerald-800 text-white" />
                            <span>Taken for {slotLabel}!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleTakeDose(med, targetSlot)}
                            disabled={takingMedId === med.id}
                            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-7 h-7" />
                            <span>{takingMedId === med.id ? 'Logging...' : '✓ I Took This Medicine'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Hydration Target Widget */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-500/15">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Hydration Routine
              </span>
              <h3 className="text-2xl font-black mt-1">Water Glasses Today: {todayWaterCount} of 6</h3>
              <p className="text-sky-100 text-sm font-medium">
                Drinking plenty of fresh water helps your medications work and prevents dizziness.
              </p>
            </div>
          </div>

          <button
            onClick={handleAddWater}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-sky-50 active:scale-95 text-sky-900 font-black text-base flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>💧</span>
            <span>+ 1 Glass Drank</span>
          </button>
        </div>

        {/* Visual glass dots */}
        <div className="flex gap-2.5 mt-5 justify-center sm:justify-start">
          {[1, 2, 3, 4, 5, 6].map(glassNum => (
            <div
              key={glassNum}
              className={`w-9 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                glassNum <= todayWaterCount
                  ? 'bg-white border-white text-sky-600 shadow-md scale-105'
                  : 'bg-white/20 border-white/40 text-white/50'
              }`}
            >
              💧
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Help Banner */}
      <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-black text-red-900">Need Immediate Help or Feeling Unwell?</h4>
            <p className="text-xs text-red-700">
              Tap the red SOS button to notify your family caregiver {profile.emergencyContacts[0]?.name} or call 911.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenEmergencyModal}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-base uppercase tracking-wider shadow-md shadow-red-500/25 transition-all shrink-0 cursor-pointer"
        >
          🚨 Open SOS Medical Card
        </button>
      </div>

    </div>
  );
};
