import React, { useState } from 'react';
import { AlertTriangle, Phone, ShieldAlert, Heart, X, CheckCircle2, User, Activity, MapPin } from 'lucide-react';
import { ElderlyProfile } from '../types';
import { api } from '../services/api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ElderlyProfile;
  onSOSBroadcasted?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSOSBroadcasted
}) => {
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleTriggerSOS = async () => {
    setSosSending(true);
    try {
      await api.triggerSOS(profile.id, customEmail || undefined);
      setSosSent(true);
      if (onSOSBroadcasted) onSOSBroadcasted();
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    } finally {
      setSosSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex p-3 rounded-2xl bg-white/20 backdrop-blur-sm mb-2">
            <AlertTriangle className="w-8 h-8 fill-white text-red-600" />
          </div>

          <h2 className="text-2xl font-black tracking-tight uppercase">
            Emergency Medical Card (ICE)
          </h2>
          <p className="text-sm text-red-100 font-medium">
            In Case of Emergency • Patient Identification & Rapid Response
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          
          {/* Patient Overview */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <img
              src={profile.avatar}
              alt={profile.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-sm"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">{profile.fullName}</h3>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {profile.address}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-200">
                  Blood: {profile.bloodType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  Age: {profile.age} (DOB: {profile.dateOfBirth})
                </span>
              </div>
            </div>
          </div>

          {/* Critical Warnings: Allergies & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
              <p className="text-xs font-black uppercase text-rose-800 tracking-wider">
                ⚠️ Known Drug Allergies
              </p>
              <ul className="mt-1.5 space-y-1 text-sm font-semibold text-rose-950">
                {profile.allergies.map(a => (
                  <li key={a} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-xs font-black uppercase text-amber-800 tracking-wider">
                🩺 Chronic Health Conditions
              </p>
              <ul className="mt-1.5 space-y-1 text-xs font-semibold text-amber-950">
                {profile.chronicConditions.map(c => (
                  <li key={c} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Primary Doctor & Caretaker Contacts */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Primary Physician</p>
                <p className="text-sm font-bold text-slate-900">{profile.primaryPhysician.name}</p>
                <p className="text-xs text-slate-600">{profile.primaryPhysician.clinic} • {profile.primaryPhysician.phone}</p>
              </div>
              <a
                href={`tel:${profile.primaryPhysician.phone}`}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Doctor
              </a>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Emergency Contacts</p>
              <div className="space-y-2">
                {profile.emergencyContacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <span className="text-slate-500 ml-1.5">({c.relation})</span>
                      <p className="text-slate-500">{c.phone}</p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      Call
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SOS Broadcast Section */}
          <div className="p-5 bg-red-50 border-2 border-red-300 rounded-2xl">
            {sosSent ? (
              <div className="text-center py-3">
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black text-red-900">EMERGENCY SOS BROADCAST ACTIVE!</h4>
                <p className="text-xs text-red-800 mt-1 max-w-sm mx-auto">
                  Emergency notifications and emails have been dispatched to all family members and caregivers. First responders have been notified.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-black uppercase text-red-900 tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  Broadcast Instant Emergency SOS
                </h4>
                <p className="text-xs text-red-700 mb-3">
                  This sends an urgent priority email with GPS address, medical history, and contact details to all emergency family members.
                </p>

                <div className="mb-3">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Send test alert to your email address (Optional):
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    placeholder="Enter email to receive real SOS alert"
                    className="w-full text-xs py-2 px-3 rounded-xl border border-red-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <a
                    href="tel:911"
                    className="flex-1 py-3 text-center bg-slate-900 hover:bg-black text-white font-black text-sm uppercase rounded-xl shadow-md"
                  >
                    📞 Call 911 Direct
                  </a>
                  <button
                    onClick={handleTriggerSOS}
                    disabled={sosSending}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm uppercase rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {sosSending ? 'Broadcasting...' : '🚨 Broadcast SOS'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
