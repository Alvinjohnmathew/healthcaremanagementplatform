import React, { useRef } from 'react';
import { Printer, Download, X, Heart, Shield, Calendar, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { ElderlyProfile, Medication, Appointment, RoutineTask, DrugInteraction } from '../types';

interface DoctorSummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ElderlyProfile;
  medications: Medication[];
  appointments: Appointment[];
  routines: RoutineTask[];
  interactions: DrugInteraction[];
  adherenceRate: number;
}

export const DoctorSummaryReportModal: React.FC<DoctorSummaryReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  medications,
  appointments,
  routines,
  interactions,
  adherenceRate
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const activeMeds = medications.filter(m => m.active);
  const nextAppointment = appointments.find(a => a.status === 'upcoming');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-slate-900 p-4 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Physician Consultation & Clinical Summary Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div ref={reportRef} className="flex-1 overflow-y-auto p-8 sm:p-12 text-slate-900 bg-white print:p-0 print:m-0">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">CareBridge 360</span>
                  <span className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-300">
                    Clinical Summary
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="text-right text-xs text-slate-600">
                <p className="font-bold text-slate-900">{profile.primaryPhysician.name}</p>
                <p>{profile.primaryPhysician.clinic}</p>
                <p>{profile.primaryPhysician.phone}</p>
              </div>
            </div>

            {/* Patient Demographic Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <strong className="text-sm text-slate-900">{profile.fullName}</strong>
                <span className="text-slate-500 block">({profile.preferredName})</span>
              </div>
              <div>
                <span className="text-slate-500 block">DOB / Age:</span>
                <strong className="text-slate-900">{profile.dateOfBirth} (Age {profile.age})</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Type:</span>
                <strong className="text-red-700 font-black">{profile.bloodType}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Medication Adherence:</span>
                <strong className="text-emerald-700 font-bold">{adherenceRate}% (Last 30 Days)</strong>
              </div>
            </div>
          </div>

          {/* Allergies & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-800 mb-2">
                ⚠️ Known Drug & Environmental Allergies
              </h4>
              <ul className="text-xs space-y-1 font-semibold text-rose-950">
                {profile.allergies.map(a => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Active Diagnoses & Chronic Conditions
              </h4>
              <ul className="text-xs space-y-1 font-semibold text-slate-800">
                {profile.chronicConditions.map(c => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Active Medications Schedule */}
          <div className="mb-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Current Active Medications & Regimen ({activeMeds.length})
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Medication Name</th>
                    <th className="p-2.5">Dosage</th>
                    <th className="p-2.5">Frequency & Times</th>
                    <th className="p-2.5">Food / Patient Instructions</th>
                    <th className="p-2.5">Rx # / Prescriber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeMeds.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-900">
                        {m.name}
                        <span className="block font-normal text-slate-500 text-[11px]">{m.genericName}</span>
                      </td>
                      <td className="p-2.5 font-semibold">{m.dosage}{m.unit}</td>
                      <td className="p-2.5">
                        <span className="font-semibold">{m.frequency.replace('_', ' ')}</span>
                        <div className="text-[11px] text-slate-500">
                          {m.timeSlots.map(t => `${t.label} (${t.time})`).join(', ')}
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{m.instructions}</td>
                      <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                        {m.rxNumber}<br />{m.prescribingDoctor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Interactions Radar */}
          {interactions.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Active Clinical Safety Alerts & Drug Interactions
              </h4>
              <div className="space-y-2">
                {interactions.map(it => (
                  <div key={it.id} className="text-xs bg-white p-2.5 rounded-lg border border-amber-200">
                    <strong className="text-amber-900">{it.title}</strong>
                    <p className="text-slate-700 mt-0.5">{it.description}</p>
                    <p className="text-amber-800 font-semibold mt-0.5">Clinical Note: {it.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Vitals */}
          <div className="mb-6">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-3">
              Recent Patient Vitals Log
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {routines.map(r => (
                <div key={r.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="flex justify-between text-xs mb-1">
                    <strong className="text-slate-900">{r.title}</strong>
                    <span className="text-slate-500">Target: {r.targetValue} {r.unit}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {r.entries.slice(0, 3).map(e => (
                      <div key={e.id} className="flex justify-between py-0.5 border-b border-slate-200/60 text-slate-700">
                        <span>{new Date(e.timestamp).toLocaleDateString()}</span>
                        <strong className="text-slate-900">{e.value} {r.unit}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prepared Questions for the Doctor */}
          {nextAppointment && nextAppointment.questionsForDoctor && nextAppointment.questionsForDoctor.length > 0 && (
            <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-sky-900 mb-2">
                Questions Prepared by Patient & Family for this Visit:
              </h4>
              <ul className="text-xs space-y-1 text-sky-950 font-medium">
                {nextAppointment.questionsForDoctor.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-sky-700">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Doctor Signature & Follow-up notes */}
          <div className="mt-8 pt-6 border-t-2 border-slate-300">
            <div className="grid grid-cols-2 gap-8 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-700 mb-6">Physician Follow-up Notes & Adjustments:</p>
                <div className="h-16 border-b border-dashed border-slate-400" />
              </div>
              <div className="flex flex-col justify-end">
                <div className="border-b border-slate-400 pb-1" />
                <p className="mt-1 font-semibold text-slate-700">Physician Signature & Date</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
