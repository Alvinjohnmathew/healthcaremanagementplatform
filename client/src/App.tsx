import React, { useState, useEffect, useCallback } from 'react';
import {
  ElderlyProfile,
  Medication,
  MedicationLog,
  Appointment,
  RoutineTask,
  CareMessage,
  NotificationLog,
  DrugInteraction,
  Role
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { SeniorView } from './components/SeniorView';
import { CaretakerView } from './components/CaretakerView';
import { FamilyView } from './components/FamilyView';
import { PasscodeModal } from './components/PasscodeModal';
import { EmergencyModal } from './components/EmergencyModal';
import { EmailNotificationCenter } from './components/EmailNotificationCenter';
import { DoctorSummaryReportModal } from './components/DoctorSummaryReportModal';

export const App: React.FC = () => {
  const [profiles, setProfiles] = useState<ElderlyProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<ElderlyProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('senior');
  
  // Data for current profile
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [routines, setRoutines] = useState<RoutineTask[]>([]);
  const [messages, setMessages] = useState<CareMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [adherenceRate, setAdherenceRate] = useState<number>(100);

  // Modals state
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [targetRoleForPasscode, setTargetRoleForPasscode] = useState<Role>('caretaker');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isEmailCenterOpen, setIsEmailCenterOpen] = useState(false);
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState(false);

  // Accessibility state
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Load profiles on mount
  const loadProfiles = useCallback(async () => {
    try {
      const res = await api.getProfiles();
      if (res.success && res.profiles.length > 0) {
        setProfiles(res.profiles);
        if (!currentProfile) {
          // Fetch full profile for first one
          const fullProf = await api.getProfile(res.profiles[0].id);
          if (fullProf.success) {
            setCurrentProfile(fullProf.profile);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProfile]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Load data for active profile
  const loadProfileData = useCallback(async () => {
    if (!currentProfile) return;
    const profId = currentProfile.id;

    try {
      const [medsRes, logsRes, aptsRes, routRes, msgsRes, notifsRes, intsRes, statsRes] = await Promise.all([
        api.getMedications(profId),
        api.getLogs(profId),
        api.getAppointments(profId),
        api.getRoutines(profId),
        api.getMessages(profId),
        api.getNotifications(profId),
        api.getInteractions(profId),
        api.getAdherenceStats(profId)
      ]);

      if (medsRes.success) setMedications(medsRes.medications);
      if (logsRes.success) setLogs(logsRes.logs);
      if (aptsRes.success) setAppointments(aptsRes.appointments);
      if (routRes.success) setRoutines(routRes.routines);
      if (msgsRes.success) setMessages(msgsRes.messages);
      if (notifsRes.success) setNotifications(notifsRes.notifications);
      if (intsRes.success) setInteractions(intsRes.interactions);
      if (statsRes.success) setAdherenceRate(statsRes.stats.adherenceRate);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    }
  }, [currentProfile]);

  useEffect(() => {
    loadProfileData();
    // Auto refresh every 10 seconds to keep live notifications updated
    const interval = setInterval(loadProfileData, 10000);
    return () => clearInterval(interval);
  }, [loadProfileData]);

  // Profile switch
  const handleSelectProfile = async (profile: ElderlyProfile) => {
    setIsLoading(true);
    try {
      const res = await api.getProfile(profile.id);
      if (res.success) {
        setCurrentProfile(res.profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Role switch with passcode check
  const handleOpenPasscodeModal = (targetRole: Role) => {
    if (targetRole === currentRole) return;
    setTargetRoleForPasscode(targetRole);
    setIsPasscodeModalOpen(true);
  };

  const handlePasscodeSuccess = (unlockedRole: Role) => {
    setCurrentRole(unlockedRole);
  };

  const handleResetData = async () => {
    if (confirm('Reset entire healthcare management database to original seed state?')) {
      await api.resetData();
      await loadProfiles();
      await loadProfileData();
    }
  };

  if (isLoading || !currentProfile) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold">Connecting to CareBridge Healthcare Hub...</h2>
        <p className="text-sm text-slate-400 mt-1">Synchronizing medications, vitals, and schedules</p>
      </div>
    );
  }

  // Dynamic root classes for accessibility
  const fontSizeClass = fontSize === 'large' ? 'font-size-large' : fontSize === 'extra-large' ? 'font-size-extra-large' : 'font-size-normal';
  const contrastClass = highContrast ? 'high-contrast' : '';

  return (
    <div className={`min-h-screen bg-slate-50/80 text-slate-900 ${fontSizeClass} ${contrastClass}`}>
      
      {/* Top Navigation */}
      <Navbar
        currentProfile={currentProfile}
        allProfiles={profiles}
        onSelectProfile={handleSelectProfile}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        onOpenPasscodeModal={handleOpenPasscodeModal}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenEmailCenter={() => setIsEmailCenterOpen(true)}
        onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
        onResetData={handleResetData}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        notifications={notifications}
      />

      {/* Main Role Content View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Passcode Security Banner */}
        <div className="mb-6 p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Authorized Access: <strong className="uppercase text-slate-900">{currentRole} Mode</strong> for <strong>{currentProfile.fullName}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Passcode: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
              {currentRole === 'senior' ? currentProfile.passcodes.seniorPin : currentRole === 'caretaker' ? currentProfile.passcodes.caretakerPasscode : currentProfile.passcodes.familyPasscode}
            </code></span>
            <button
              onClick={() => setIsPasscodeModalOpen(true)}
              className="font-bold text-sky-600 hover:text-sky-800 underline"
            >
              Switch Role / Re-authenticate
            </button>
          </div>
        </div>

        {/* View Selection */}
        {currentRole === 'senior' && (
          <SeniorView
            profile={currentProfile}
            medications={medications}
            logs={logs}
            appointments={appointments}
            routines={routines}
            onRefreshData={loadProfileData}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            voiceEnabled={voiceEnabled}
          />
        )}

        {currentRole === 'caretaker' && (
          <CaretakerView
            profile={currentProfile}
            medications={medications}
            logs={logs}
            appointments={appointments}
            routines={routines}
            interactions={interactions}
            onRefreshData={loadProfileData}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          />
        )}

        {currentRole === 'family' && (
          <FamilyView
            profile={currentProfile}
            medications={medications}
            logs={logs}
            appointments={appointments}
            routines={routines}
            messages={messages}
            onRefreshData={loadProfileData}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white/60 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CareBridge 360 Healthcare Management Ecosystem. Empowering Seniors & Connected Families.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEmailCenterOpen(true)}
              className="text-sky-600 hover:text-sky-800 font-bold"
            >
              Email Notification Log
            </button>
            <span>•</span>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ICE Medical ID Card
            </button>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              Reset Seed Data
            </button>
          </div>
        </div>
      </footer>

      {/* Passcode Unlock Modal */}
      <PasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        targetRole={targetRoleForPasscode}
        profile={currentProfile}
        onSuccess={handlePasscodeSuccess}
      />

      {/* Emergency SOS & ICE Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        profile={currentProfile}
        onSOSBroadcasted={loadProfileData}
      />

      {/* Proactive Email Notification Center Drawer */}
      <EmailNotificationCenter
        isOpen={isEmailCenterOpen}
        onClose={() => setIsEmailCenterOpen(false)}
        profile={currentProfile}
        notifications={notifications}
        medications={medications}
        appointments={appointments}
        onRefreshNotifications={loadProfileData}
      />

      {/* Printable Clinical Doctor Consultation Summary Modal */}
      <DoctorSummaryReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        profile={currentProfile}
        medications={medications}
        appointments={appointments}
        routines={routines}
        interactions={interactions}
        adherenceRate={adherenceRate}
      />

    </div>
  );
};
