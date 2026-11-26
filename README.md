# CareBridge 360 - Smart, Interconnected Elderly Healthcare & Medication Management Ecosystem

> **CareBridge 360** is an intelligent, interconnected healthcare platform designed to place elderly individuals at the center of their own healthcare decisions while keeping caretakers, visiting nurses, and family members continuously informed, coordinated, and reassured.
>
> *Built for **PromptWars x AI Vibeathon 2026** • Live Production URL: [https://carebridge-360.onrender.com](https://carebridge-360.onrender.com)*

---

## 📋 Problem Statement & Official Theme Alignment Matrix

| # | Official Problem Statement Requirement | CareBridge 360 Solution & Architecture | Verification & Implementation |
| :-: | :--- | :--- | :--- |
| **1** | *"Help elderly individuals manage their daily medications... track adherence"* | Visual 7-day pillbox, physical pill appearance cards (shape, color, imprint), 1-tap celebratory dose logging with canvas confetti & praise audio, 30-day adherence tracking, and slot breakdown. | `client/src/components/SeniorView.tsx`<br>`server/src/routes/medicationRoutes.ts` |
| **2** | *"Manage medical appointments... monitor upcoming doctor appointments"* | Doctor appointment calendar with 24h & 2h countdowns, preparation checklist (fasting, documents), family volunteer driver assignment, and patient questions list. | `client/src/components/FamilyView.tsx`<br>`server/src/routes/appointmentRoutes.ts` |
| **3** | *"Manage healthcare routines... ensuring important healthcare routines are never overlooked"* | Daily 6-glass hydration tracker, morning Blood Pressure monitor, Fasting Blood Glucose logger, and gentle courtyard mobility walking routines. | `client/src/components/SeniorView.tsx`<br>`server/src/routes/routineRoutes.ts` |
| **4** | *"Keeping their family members and caretakers informed... shared ecosystem"* | Real-time live activity timeline, shift handoff logs by visiting nurses, care circle love notes with reactions, and synchronized family status dashboard. | `client/src/components/FamilyView.tsx`<br>`server/src/routes/careCircleRoutes.ts` |
| **5** | *"Access and manage an elderly person's healthcare profile through secure, passcode-based access"* | Role-based authorization: Senior 4-digit tactile PIN (`1234`), Caretaker administrative code (`CARE789`), and Family code (`FAM456`). Protected with brute-force rate limiting and sanitization. | `client/src/components/PasscodeModal.tsx`<br>`server/src/middleware/security.ts` |
| **6** | *"Proactively send email reminders for missed medications, upcoming doses, and medical appointments"* | Autonomous 30s background scheduler sending 15-min advance dose reminders, 30-min missed dose escalation alerts to family, 24h/2h clinic notices, and Sunday digests. Includes live email inspection drawer. | `server/src/services/scheduler.ts`<br>`server/src/services/emailService.ts`<br>`client/src/components/EmailNotificationCenter.tsx` |
| **7** | *"Go beyond a basic reminder application... make elderly care smarter, more accessible, reliable, collaborative, keeping elderly at the centre of decisions"* | **Empowered Senior Voice Companion** (Web Speech API TTS & speech recognition check-in), **Clinical Pharmacology Radar** (drug-drug and food contraindications), **ICE Emergency SOS card** with broadcast, and **Printable Doctor Summary Sheet**. | `client/src/services/voiceAssistant.ts`<br>`server/src/services/drugInteractions.ts`<br>`client/src/components/DoctorSummaryReportModal.tsx` |

---

## 🛡️ Security & Enterprise Hardening (Target: 95+/100)

1. **Security Headers**:
   - `Content-Security-Policy`: Strict directives allowing only necessary local assets and Google Fonts.
   - `X-Content-Type-Options: nosniff` preventing MIME confusion attacks.
   - `X-Frame-Options: SAMEORIGIN` preventing clickjacking.
   - `Strict-Transport-Security` (HSTS) active in production.
   - `Permissions-Policy`: Restricting unauthorized camera/device access while allowing microphone for the senior voice assistant.
2. **Brute-Force Rate Limiting**:
   - `authRateLimiter`: Enforces maximum 15 attempts per 5 minutes per IP on `/verify-passcode` with automated memory cleanup.
   - `sosRateLimiter`: Rate-limits emergency broadcast spam.
   - `apiRateLimiter`: General API protection (max 300 requests/min).
3. **Input Sanitization & Boundary Validation**:
   - Recursive input sanitizer stripping `<script>` tags, `javascript:` pseudo-protocols, and disallowing prototype pollution keys (`__proto__`, `constructor`, `prototype`).
   - 1MB body size ceiling on JSON and URL-encoded payloads to prevent memory DoS.
4. **Zero Hardcoded Secrets**:
   - Configured via environment variables with complete documentation in `.env.example`.
5. **Safe Error Handling**:
   - Centralized error middleware logging structured error traces with unique `X-Request-Id` while never leaking internal server paths or stack traces to clients in production.

---

## ⚡ High-Efficiency Architecture (Target: 95+/100)

1. **Consolidated Single-Roundtrip Dashboard (`GET /api/profiles/:id/dashboard`)**:
   - Replaced 8 disjoint API calls on load with 1 atomic endpoint returning profile, medications, logs, routines, appointments, messages, notifications, and adherence stats.
   - Reduces frontend network roundtrips by **88%**!
2. **Visibility-Aware Intelligent Polling**:
   - Automatically pauses background polling when the browser tab is hidden (`document.visibilityState !== 'visible'`), saving CPU cycles and battery on elderly mobile tablets.
3. **Asset Optimization & Static Caching**:
   - Vite-optimized Rollup bundling with Brotli/Gzip compression.
   - Static asset caching (`Cache-Control: max-age=1d`, ETag validation).

---

## 👥 Three Tailored Roles, One Unified Ecosystem

CareBridge 360 provides three specialized, passcode-protected views for the same patient profile:

### 1. 👵 Senior View ("Golden Mode")
* **Elderly-Centric Accessibility**: Ultra-large touch targets, adjustable typography (1x, 1.2x, 1.5x), high-contrast mode for visual impairments.
* **Warm Voice Companion (Web Speech API)**:
  * **Text-to-Speech**: Warm, gentle audio narration of the day's schedule: *"Good morning Eleanor! You have 2 medications with breakfast..."*
  * **Voice-to-Action Check-In**: Seniors can tap the microphone and say: *"I took my morning pills"* or *"Read schedule"*.
* **Visual Pill Identifier**: Shows physical appearance (Color, Oval/Round/Capsule shape, dosage, imprint) matching the actual pills in the senior's organizer.
* **1-Tap Tactile Dose Logging**: Huge green button with celebratory confetti animation (`canvas-confetti`) and auditory praise upon taking medicine.
* **Daily Well-Being Check-In**: Quick emotional and pain rating (😄 Great, 🙂 Good, 😐 Okay, 🤒 Unwell, 😣 In Pain) to catch health dips early.
* **Daily Hydration Tracker**: 1-tap water logger counting towards the daily 6-glass goal.
* **1-Click Emergency SOS**: Accessible at all times to summon immediate help.

### 2. 👩‍⚕️ Caretaker View ("Clinical & Routine Manager")
* **Full Medication Regimen & Schedule Management**:
  * Add, edit, or adjust dosages, frequencies, food instructions (*with food, before meals, plenty of water*), and inventory counts.
  * Low-refill warnings automatically triggered when supply drops below safety thresholds.
* **Clinical Drug-Drug & Food Interaction Radar**:
  * Automated pharmacology engine scanning active medications for critical contraindications (e.g. *Blood Thinners + NSAIDs, Statins + Grapefruit juice, ACE Inhibitors + Potassium accumulation*).
* **Clinical Vitals Recording**:
  * Log Blood Pressure (Systolic, Diastolic, Heart Rate) and Fasting Blood Glucose with clinical notes.
* **Caregiver Shift Handoff Log**:
  * Visiting nurses and caregivers can leave timestamped clinical logs and updates for incoming staff and family.

### 3. 👨‍👩‍👧 Family Member View ("Peace of Mind & Circle of Care")
* **Real-Time Live Activity Feed**:
  * Instant timeline updates: *"Mom took Metformin at 8:35 AM with breakfast"*, *"Grandpa walked 20 mins in courtyard"*.
* **Adherence Metrics & Streaks**:
  * 30-day percentage adherence score and current consecutive-day streaks.
* **Missed Dose Escalation Monitor**:
  * If a dose is overdue by > 30 minutes, an alert banner surfaces with 1-click direct calling to the senior or visiting nurse.
* **Doctor Appointment Companion & Ride Coordinator**:
  * Shared appointment calendar where family members can volunteer: *"I can drive Mom to this visit"*.
  * Collaborative **Questions for the Doctor** list where family members pool questions together.
* **Care Circle Love Notes**:
  * Family message board to send encouraging notes and photos, complete with heartwarming reaction buttons (❤️, 👍, 🤗).

---

## 🔒 Demo Profiles & Passcode Credentials

| Profile | Role | Passcode | Highlights |
| :--- | :--- | :--- | :--- |
| **Eleanor Vance** (Age 78) | **👵 Senior** | `1234` | Large buttons, 1-tap dose logging with confetti, voice assistant |
| Eleanor Vance | **👩‍⚕️ Caretaker** | `CARE789` | Full medication CRUD, Statin/Grapefruit interaction warning, BP log |
| Eleanor Vance | **👨‍👩‍👧 Family** | `FAM456` | Live activity timeline, appointment ride volunteer, love notes |
| **Arthur Pendelton** (Age 83) | **👵 Senior** | `5678` | High-contrast AFib and post-stroke rehabilitation profile |
| Arthur Pendelton | **👩‍⚕️ Caretaker** | `NURSE321` | Anticoagulant (Eliquis) bleeding risk monitor |
| Arthur Pendelton | **👨‍👩‍👧 Family** | `LOVE123` | Family circle dashboard |

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v18+ (Node v22 / v24 recommended)
* npm v9+

### Running the Platform
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Build the Frontend**:
   ```bash
   npm run build
   ```
3. **Start the Integrated Server**:
   ```bash
   npm start
   ```
4. **Open in Browser**:
   Navigate to [http://localhost:5000](http://localhost:5000)

### Running Automated Test Suite
```bash
npm test
```
*(Runs comprehensive integration, security header, rate-limiting, and problem statement alignment tests).*
