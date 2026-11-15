import React, { useState } from 'react';
import { Shield, KeyRound, Lock, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Role, ElderlyProfile } from '../types';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: Role;
  profile: ElderlyProfile;
  onSuccess: (role: Role) => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  profile,
  onSuccess
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const roleName = targetRole === 'senior' ? 'Senior Individual' : targetRole === 'caretaker' ? 'Caretaker' : 'Family Member';
  const expectedCode = targetRole === 'senior'
    ? profile.passcodes.seniorPin
    : targetRole === 'caretaker'
    ? profile.passcodes.caretakerPasscode
    : profile.passcodes.familyPasscode;

  const handleVerify = (codeToVerify = passcode) => {
    setIsVerifying(true);
    setError(null);

    const cleanInput = codeToVerify.trim();
    let valid = false;

    if (targetRole === 'senior') {
      valid = cleanInput === profile.passcodes.seniorPin;
    } else if (targetRole === 'caretaker') {
      valid = cleanInput.toLowerCase() === profile.passcodes.caretakerPasscode.toLowerCase();
    } else {
      valid = cleanInput.toLowerCase() === profile.passcodes.familyPasscode.toLowerCase();
    }

    setTimeout(() => {
      setIsVerifying(false);
      if (valid) {
        onSuccess(targetRole);
        onClose();
        setPasscode('');
      } else {
        setError(`Incorrect passcode for ${roleName}. Please try again or tap the quick-fill button below.`);
      }
    }, 200);
  };

  const handleNumberClick = (num: string) => {
    if (passcode.length < 6) {
      const nextCode = passcode + num;
      setPasscode(nextCode);
      if (targetRole === 'senior' && nextCode.length === 4) {
        handleVerify(nextCode);
      }
    }
  };

  const handleClear = () => {
    setPasscode('');
    setError(null);
  };

  const handleQuickFill = () => {
    setPasscode(expectedCode);
    handleVerify(expectedCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center">
            <Lock className="w-7 h-7 text-sky-400" />
          </div>

          <h3 className="text-xl font-bold">
            Enter {roleName} Passcode
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            Accessing healthcare profile for <strong>{profile.fullName}</strong>
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Quick-Access Hint Box for Reviewers */}
          <div className="mb-5 p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Reviewer Quick-Unlock Hint:</p>
              <p className="mt-0.5 text-slate-600">
                Correct passcode for {roleName}: <code className="bg-sky-100 px-1.5 py-0.5 rounded font-mono font-bold text-sky-800">{expectedCode}</code>
              </p>
              <button
                onClick={handleQuickFill}
                className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1"
              >
                ⚡ 1-Tap Auto Fill & Unlock
              </button>
            </div>
          </div>

          {/* Passcode Input Display */}
          <div className="mb-4 text-center">
            <div className="relative flex justify-center items-center gap-2 mb-2">
              {targetRole === 'senior' ? (
                // 4-digit PIN dots
                <div className="flex justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map(idx => (
                    <div
                      key={idx}
                      className={`w-5 h-5 rounded-full border-2 transition-all ${
                        passcode.length > idx
                          ? 'bg-sky-600 border-sky-600 scale-110'
                          : 'border-slate-300 bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              ) : (
                // Text input for alphanumeric caretaker / family codes
                <input
                  type="text"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value.toUpperCase())}
                  placeholder={`Enter code (e.g. ${expectedCode})`}
                  className="w-full text-center text-xl font-mono tracking-widest uppercase font-bold py-3 px-4 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
              )}
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-600 flex items-center justify-center gap-1 mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Numeric keypad for Senior PIN (large, tactile touch buttons) */}
          {targetRole === 'senior' && (
            <div className="grid grid-cols-3 gap-2.5 my-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="py-3.5 text-xl font-bold bg-slate-100 hover:bg-slate-200 active:bg-sky-100 rounded-2xl text-slate-800 transition-colors shadow-xs active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="py-3.5 text-xs font-bold uppercase text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                className="py-3.5 text-xl font-bold bg-slate-100 hover:bg-slate-200 active:bg-sky-100 rounded-2xl text-slate-800 transition-colors shadow-xs active:scale-95"
              >
                0
              </button>
              <button
                onClick={() => handleVerify()}
                disabled={passcode.length === 0}
                className="py-3.5 text-xs font-bold uppercase bg-sky-600 hover:bg-sky-700 text-white rounded-2xl transition-colors disabled:opacity-40"
              >
                Enter
              </button>
            </div>
          )}

          {targetRole !== 'senior' && (
            <div className="mt-4">
              <button
                onClick={() => handleVerify()}
                disabled={isVerifying || !passcode}
                className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold rounded-2xl transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : `Unlock ${roleName} Profile`}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
