import React from 'react';
import {
  Heart,
  Shield,
  User,
  Users,
  Stethoscope,
  Bell,
  Volume2,
  VolumeX,
  Printer,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Role, ElderlyProfile, NotificationLog } from '../types';

interface NavbarProps {
  currentProfile: ElderlyProfile;
  allProfiles: ElderlyProfile[];
  onSelectProfile: (profile: ElderlyProfile) => void;
  currentRole: Role;
  onChangeRole: (newRole: Role) => void;
  onOpenPasscodeModal: (targetRole: Role) => void;
  onOpenEmergencyModal: () => void;
  onOpenEmailCenter: () => void;
  onOpenDoctorReport: () => void;
  onResetData: () => void;
  fontSize: 'normal' | 'large' | 'extra-large';
  onChangeFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  notifications: NotificationLog[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProfile,
  allProfiles,
  onSelectProfile,
  currentRole,
  onOpenPasscodeModal,
  onOpenEmergencyModal,
  onOpenEmailCenter,
  onOpenDoctorReport,
  onResetData,
  fontSize,
  onChangeFontSize,
  highContrast,
  onToggleHighContrast,
  voiceEnabled,
  onToggleVoice,
  notifications
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Heart className="w-7 h-7 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Care<span className="text-sky-600">Bridge</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  360
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Interconnected Elderly Care & Medication Ecosystem
              </p>
            </div>
          </div>

          {/* Center: Profile Switcher */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {allProfiles.map(p => {
              const isSelected = p.id === currentProfile.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProfile(p)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.preferredName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <div className="text-left hidden md:block">
                    <p className="leading-tight text-xs font-bold">{p.preferredName}</p>
                    <p className="leading-tight text-[11px] text-slate-500">Age {p.age}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Role Switcher Pill with Passcode Security */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => onOpenPasscodeModal('senior')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentRole === 'senior'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
                title="Switch to Senior Mode (Large fonts, 1-touch dose log, voice assistant)"
              >
                <span>👵</span>
                <span className="hidden sm:inline">Senior</span>
                {currentRole !== 'senior' && <Lock className="w-3 h-3 opacity-60" />}
              </button>

              <button
                onClick={() => onOpenPasscodeModal('caretaker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentRole === 'caretaker'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-teal-700'
                }`}
                title="Switch to Caretaker Mode (Medication schedules, clinical drug interactions, vitals)"
              >
                <span>👩‍⚕️</span>
                <span className="hidden sm:inline">Caretaker</span>
                {currentRole !== 'caretaker' && <Lock className="w-3 h-3 opacity-60" />}
              </button>

              <button
                onClick={() => onOpenPasscodeModal('family')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentRole === 'family'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
                title="Switch to Family Mode (Peace-of-mind activity feed, missed alerts, companion rides)"
              >
                <span>👨‍👩‍👧</span>
                <span className="hidden sm:inline">Family</span>
                {currentRole !== 'family' && <Lock className="w-3 h-3 opacity-60" />}
              </button>
            </div>

            {/* Accessibility Controls: Font Size & Audio */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onChangeFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'extra-large' : 'normal')}
                className="px-2 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-white"
                title="Change font size (Elderly Accessibility)"
              >
                Aa {fontSize === 'normal' ? '1x' : fontSize === 'large' ? '1.2x' : '1.5x'}
              </button>

              <button
                onClick={onToggleVoice}
                className={`p-1.5 rounded-lg text-xs font-semibold ${
                  voiceEnabled ? 'text-teal-700 bg-white' : 'text-slate-400 hover:text-slate-700'
                }`}
                title={voiceEnabled ? 'Voice Companion Enabled' : 'Voice Companion Muted'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onToggleHighContrast}
                className={`px-2 py-1 text-xs font-bold rounded-lg ${
                  highContrast ? 'bg-black text-white' : 'text-slate-600 hover:bg-white'
                }`}
                title="Toggle High Contrast for Visual Impairment"
              >
                Contrast
              </button>
            </div>

            {/* Doctor Visit Report Button */}
            <button
              onClick={onOpenDoctorReport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              title="Printable Clinical Summary for Doctor Consultations"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Doctor Report</span>
            </button>

            {/* Live Email Notification Center */}
            <button
              onClick={onOpenEmailCenter}
              className="relative p-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
              title="Open Proactive Email & Notification Center"
            >
              <Bell className="w-5 h-5 text-sky-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* 1-Click Emergency SOS Button */}
            <button
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-md shadow-red-500/25 transition-all hover:scale-105 active:scale-95"
              title="Open Emergency SOS Medical ID Card & Broadcast"
            >
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>SOS / ICE</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
