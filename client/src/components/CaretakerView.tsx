import React, { useState } from 'react';
import {
  Stethoscope,
  Pill,
  Plus,
  AlertTriangle,
  Activity,
  HeartPulse,
  Droplets,
  Footprints,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Edit2,
  Trash2,
  Sparkles,
  ClipboardList,
  Save,
  MessageSquare
} from 'lucide-react';
import {
  ElderlyProfile,
  Medication,
  MedicationLog,
  Appointment,
  RoutineTask,
  DrugInteraction,
  PillShape
} from '../types';
import { api } from '../services/api';

interface CaretakerViewProps {
  profile: ElderlyProfile;
  medications: Medication[];
  logs: MedicationLog[];
  appointments: Appointment[];
  routines: RoutineTask[];
  interactions: DrugInteraction[];
  onRefreshData: () => void;
  onOpenDoctorReport: () => void;
}

export const CaretakerView: React.FC<CaretakerViewProps> = ({
  profile,
  medications,
  logs,
  appointments,
  routines,
  interactions,
  onRefreshData,
  onOpenDoctorReport
}) => {
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Vital recording state
  const [vitalType, setVitalType] = useState<'blood_pressure' | 'blood_glucose'>('blood_pressure');
  const [bpSystolic, setBpSystolic] = useState('122');
  const [bpDiastolic, setBpDiastolic] = useState('78');
  const [bpPulse, setBpPulse] = useState('72');
  const [glucoseVal, setGlucoseVal] = useState('105');
  const [vitalNotes, setVitalNotes] = useState('');
  const [vitalSaved, setVitalSaved] = useState(false);

  // Shift note state
  const [shiftNote, setShiftNote] = useState('');
  const [shiftNoteSaved, setShiftNoteSaved] = useState(false);

  // Form for New / Edit Medication
  const [medForm, setMedForm] = useState({
    name: '',
    genericName: '',
    dosage: '10',
    unit: 'mg',
    shape: 'round' as PillShape,
    color: '#38bdf8',
    imprint: '',
    instructions: 'Take with food and full glass of water',
    frequency: 'daily' as 'daily' | 'twice_daily' | 'thrice_daily',
    timeSlotTime: '08:30',
    timeSlotLabel: 'Morning' as 'Morning' | 'Noon' | 'Evening' | 'Bedtime',
    inventoryCount: 30,
    refillThreshold: 10,
    foodInstructions: 'with_food' as 'with_food' | 'before_food' | 'after_food' | 'empty_stomach' | 'anytime',
    prescribingDoctor: profile.primaryPhysician.name,
    rxNumber: `RX-${Math.floor(100000 + Math.random() * 900000)}`
  });

  const handleOpenAdd = () => {
    setEditingMed(null);
    setMedForm({
      name: '',
      genericName: '',
      dosage: '10',
      unit: 'mg',
      shape: 'round',
      color: '#38bdf8',
      imprint: '',
      instructions: 'Take with meals',
      frequency: 'daily',
      timeSlotTime: '08:30',
      timeSlotLabel: 'Morning',
      inventoryCount: 30,
      refillThreshold: 10,
      foodInstructions: 'with_food',
      prescribingDoctor: profile.primaryPhysician.name,
      rxNumber: `RX-${Math.floor(100000 + Math.random() * 900000)}`
    });
    setShowAddMedModal(true);
  };

  const handleOpenEdit = (med: Medication) => {
    setEditingMed(med);
    setMedForm({
      name: med.name,
      genericName: med.genericName,
      dosage: med.dosage,
      unit: med.unit,
      shape: med.shape,
      color: med.color,
      imprint: med.imprint || '',
      instructions: med.instructions,
      frequency: med.frequency as any,
      timeSlotTime: med.timeSlots[0]?.time || '08:30',
      timeSlotLabel: med.timeSlots[0]?.label || 'Morning',
      inventoryCount: med.inventoryCount,
      refillThreshold: med.refillThreshold,
      foodInstructions: med.foodInstructions || 'anytime',
      prescribingDoctor: med.prescribingDoctor,
      rxNumber: med.rxNumber
    });
    setShowAddMedModal(true);
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: medForm.name,
        genericName: medForm.genericName,
        dosage: medForm.dosage,
        unit: medForm.unit,
        shape: medForm.shape,
        color: medForm.color,
        imprint: medForm.imprint,
        instructions: medForm.instructions,
        frequency: medForm.frequency,
        timeSlots: [
          {
            id: `ts-${Date.now()}`,
            time: medForm.timeSlotTime,
            label: medForm.timeSlotLabel,
            doseAmount: `1 ${medForm.shape}`
          }
        ],
        inventoryCount: Number(medForm.inventoryCount),
        refillThreshold: Number(medForm.refillThreshold),
        foodInstructions: medForm.foodInstructions,
        prescribingDoctor: medForm.prescribingDoctor,
        rxNumber: medForm.rxNumber
      };

      if (editingMed) {
        await api.updateMedication(editingMed.id, payload);
      } else {
        await api.addMedication(profile.id, payload);
      }

      setShowAddMedModal(false);
      onRefreshData();
    } catch (err) {
      console.error('Failed to save medication:', err);
    }
  };

  const handleDeleteMed = async (id: string) => {
    if (confirm('Are you sure you want to deactivate and remove this medication?')) {
      await api.deleteMedication(id);
      onRefreshData();
    }
  };

  const handleSaveVital = async () => {
    setVitalSaved(false);
    const routine = routines.find(r => r.type === vitalType);
    if (!routine) return;

    const val = vitalType === 'blood_pressure'
      ? `${bpSystolic}/${bpDiastolic} (HR: ${bpPulse})`
      : `${glucoseVal}`;

    await api.addRoutineEntry(
      routine.id,
      val,
      vitalNotes || undefined,
      'Visiting Nurse (Caretaker)'
    );

    setVitalSaved(true);
    setVitalNotes('');
    setTimeout(() => setVitalSaved(false), 3000);
    onRefreshData();
  };

  const handleSaveShiftNote = async () => {
    if (!shiftNote.trim()) return;
    await api.sendMessage(
      profile.id,
      'Visiting Nurse Clara, RN',
      'caretaker',
      `🩺 Shift Clinical Note: ${shiftNote.trim()}`
    );
    setShiftNote('');
    setShiftNoteSaved(true);
    setTimeout(() => setShiftNoteSaved(false), 3000);
    onRefreshData();
  };

  const bpRoutine = routines.find(r => r.type === 'blood_pressure');
  const glucoseRoutine = routines.find(r => r.type === 'blood_glucose');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm mb-2">
            👩‍⚕️ Clinical & Caretaker Dashboard
          </span>
          <h1 className="text-3xl font-black tracking-tight">
            Managing Healthcare for {profile.fullName}
          </h1>
          <p className="text-teal-100 text-sm mt-1">
            Active Caretaker Passcode: <code className="bg-teal-900/60 px-2 py-0.5 rounded font-mono font-bold">{profile.passcodes.caretakerPasscode}</code> • Clinical protocols active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-3 bg-white text-teal-900 hover:bg-teal-50 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Add Medication</span>
          </button>

          <button
            onClick={onOpenDoctorReport}
            className="px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Doctor Consultation Summary</span>
          </button>
        </div>
      </div>

      {/* CLINICAL SAFETY RADAR: Drug-Drug & Food Interaction Checker */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Clinical Drug & Food Interaction Radar
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Automated clinical pharmacology scanning across all active prescriptions
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            {interactions.length} {interactions.length === 1 ? 'Notice' : 'Notices'} Detected
          </span>
        </div>

        {interactions.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>No severe drug-drug contraindications detected among current prescriptions.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {interactions.map(it => (
              <div
                key={it.id}
                className={`p-4 rounded-2xl border ${
                  it.severity === 'high'
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-amber-50/80 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      it.severity === 'high' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {it.severity} Alert
                    </span>
                    <h4 className="font-bold text-sm sm:text-base">{it.title}</h4>
                  </div>
                  <span className="text-xs font-mono font-semibold opacity-70">
                    {it.drugA} ⟷ {it.drugB}
                  </span>
                </div>

                <p className="text-xs sm:text-sm mt-1 text-slate-700">{it.description}</p>
                
                <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-800">
                  <strong className="text-teal-800">Caretaker Action:</strong> {it.recommendation}
                </div>

                {it.foodWarnings && it.foodWarnings.length > 0 && (
                  <p className="text-[11px] font-bold text-amber-800 mt-1.5">
                    🍊 Dietary Precaution: {it.foodWarnings.join(' • ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MEDICATION SCHEDULE & INVENTORY TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Active Prescriptions & Regimens ({medications.length})
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Manage dosages, administration times, and pharmacy refill thresholds
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rx</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map(med => {
            const isLowStock = med.inventoryCount <= med.refillThreshold;

            return (
              <div
                key={med.id}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  isLowStock ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[10px] text-slate-800 border border-slate-300 shrink-0 shadow-xs"
                        style={{ backgroundColor: med.color || '#e2e8f0' }}
                      >
                        {med.imprint || med.shape}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{med.name}</h4>
                        <p className="text-[11px] text-slate-500">{med.genericName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(med)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-white rounded-lg transition-colors"
                        title="Edit Prescription"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMed(med.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-white rounded-lg transition-colors"
                        title="Deactivate / Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 my-3">
                    <p>
                      <strong>Dosage:</strong> {med.dosage}{med.unit} • <span className="capitalize">{med.frequency.replace('_', ' ')}</span>
                    </p>
                    <p>
                      <strong>Time(s):</strong> {med.timeSlots.map(t => `${t.label} (${t.time})`).join(', ')}
                    </p>
                    <p className="text-[11px] text-slate-500 italic">
                      "{med.instructions}"
                    </p>
                  </div>
                </div>

                {/* Inventory Stock Status */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Inventory: </span>
                    <strong className={isLowStock ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                      {med.inventoryCount} pills
                    </strong>
                    {isLowStock && (
                      <span className="block text-[10px] font-black text-amber-700 uppercase">
                        ⚠️ Low Refill Notice
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {med.rxNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VITALS LOGGING & RECORDING SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Record New Vital */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Record Patient Vital</h3>
              <p className="text-xs text-slate-500">Log clinical reading for care circle review</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setVitalType('blood_pressure')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                vitalType === 'blood_pressure' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setVitalType('blood_glucose')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                vitalType === 'blood_glucose' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Fasting Blood Glucose
            </button>
          </div>

          {vitalType === 'blood_pressure' ? (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Systolic (mmHg)</label>
                <input
                  type="number"
                  value={bpSystolic}
                  onChange={e => setBpSystolic(e.target.value)}
                  className="w-full text-center font-bold text-base py-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Diastolic (mmHg)</label>
                <input
                  type="number"
                  value={bpDiastolic}
                  onChange={e => setBpDiastolic(e.target.value)}
                  className="w-full text-center font-bold text-base py-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={bpPulse}
                  onChange={e => setBpPulse(e.target.value)}
                  className="w-full text-center font-bold text-base py-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Blood Sugar Level (mg/dL)</label>
              <input
                type="number"
                value={glucoseVal}
                onChange={e => setGlucoseVal(e.target.value)}
                className="w-full text-center font-bold text-base py-2.5 border border-slate-300 rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Clinical Observation Notes</label>
            <input
              type="text"
              value={vitalNotes}
              onChange={e => setVitalNotes(e.target.value)}
              placeholder="e.g. Eleanor was calm and rested for 10 minutes prior"
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-xl"
            />
          </div>

          <button
            onClick={handleSaveVital}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            {vitalSaved ? '✓ Vital Logged & Broadcast to Family!' : 'Record Vital Measurement'}
          </button>
        </div>

        {/* Caregiver Shift Clinical Hand-off Notes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Caregiver Shift Log & Handoff</h3>
              <p className="text-xs text-slate-500">Leave notes for family members and incoming staff</p>
            </div>
          </div>

          <textarea
            rows={4}
            value={shiftNote}
            onChange={e => setShiftNote(e.target.value)}
            placeholder="Document Eleanor's afternoon mobility, appetite, pain levels, or medication tolerance..."
            className="w-full text-xs p-3 border border-slate-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleSaveShiftNote}
            disabled={!shiftNote.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-40"
          >
            {shiftNoteSaved ? '✓ Note Posted to Care Circle!' : 'Post Shift Update'}
          </button>

          <p className="text-[11px] text-slate-400">
            Posts to the shared Care Circle where authorized family members can review in real-time.
          </p>
        </div>

      </div>

      {/* MODAL: ADD / EDIT MEDICATION */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-teal-800 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold">
                {editingMed ? 'Edit Medication Regimen' : 'Add New Prescription to Regimen'}
              </h3>
              <button
                onClick={() => setShowAddMedModal(false)}
                className="text-teal-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medication Name *</label>
                  <input
                    type="text"
                    required
                    value={medForm.name}
                    onChange={e => setMedForm({ ...medForm, name: e.target.value })}
                    placeholder="e.g. Metformin HCl"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={medForm.genericName}
                    onChange={e => setMedForm({ ...medForm, genericName: e.target.value })}
                    placeholder="e.g. Metformin ER"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosage Amount</label>
                  <input
                    type="text"
                    required
                    value={medForm.dosage}
                    onChange={e => setMedForm({ ...medForm, dosage: e.target.value })}
                    placeholder="500"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={medForm.unit}
                    onChange={e => setMedForm({ ...medForm, unit: e.target.value })}
                    placeholder="mg"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pill Shape</label>
                  <select
                    value={medForm.shape}
                    onChange={e => setMedForm({ ...medForm, shape: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="round">Round</option>
                    <option value="oval">Oval</option>
                    <option value="capsule">Capsule</option>
                    <option value="square">Square</option>
                    <option value="liquid">Liquid</option>
                    <option value="inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pill Color (Hex or name)</label>
                  <input
                    type="color"
                    value={medForm.color}
                    onChange={e => setMedForm({ ...medForm, color: e.target.value })}
                    className="w-full h-10 p-1 border border-slate-300 rounded-xl cursor-pointer"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Imprint / Markings</label>
                  <input
                    type="text"
                    value={medForm.imprint}
                    onChange={e => setMedForm({ ...medForm, imprint: e.target.value })}
                    placeholder="e.g. M 500"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructions for Senior</label>
                <input
                  type="text"
                  required
                  value={medForm.instructions}
                  onChange={e => setMedForm({ ...medForm, instructions: e.target.value })}
                  placeholder="e.g. Take with breakfast meal. Do not chew."
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Time Slot</label>
                  <select
                    value={medForm.timeSlotLabel}
                    onChange={e => setMedForm({ ...medForm, timeSlotLabel: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Noon">Noon</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time (24h)</label>
                  <input
                    type="time"
                    value={medForm.timeSlotTime}
                    onChange={e => setMedForm({ ...medForm, timeSlotTime: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Pill Stock</label>
                  <input
                    type="number"
                    value={medForm.inventoryCount}
                    onChange={e => setMedForm({ ...medForm, inventoryCount: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Low-Refill Alert Threshold</label>
                  <input
                    type="number"
                    value={medForm.refillThreshold}
                    onChange={e => setMedForm({ ...medForm, refillThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
                >
                  {editingMed ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
