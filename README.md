# CareBridge 360 - Smart, Interconnected Elderly Healthcare & Medication Management Ecosystem

> **CareBridge 360** is an intelligent, interconnected healthcare platform designed to place elderly individuals at the center of their own healthcare decisions while keeping caretakers, visiting nurses, and family members continuously informed, coordinated, and reassured.

---

## 🌟 The Innovation & Core Vision

Managing multi-drug regimens, chronic conditions, and frequent doctor appointments can be intimidating for elderly individuals and stressful for family members living apart. Most reminder applications fail seniors because they are designed as rigid alarm clocks that treat elderly users as passive recipients rather than autonomous individuals.

**CareBridge 360** bridges this gap by providing a collaborative **Shared Ecosystem** that balances **elderly empowerment**, **clinical diligence**, and **family peace of mind**.

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

## 🔒 Secure Passcode-Based Access Control

Each elderly profile has distinct, role-based access credentials:
* **Senior 4-Digit PIN**: Easy numeric keypad designed for seniors (e.g. `1234` for Eleanor Vance, `5678` for Arthur Pendelton).
* **Caretaker Passcode**: Secure administrative code (e.g. `CARE789` / `NURSE321`).
* **Family Passcode**: Collaborative family circle code (e.g. `FAM456` / `LOVE123`).
* *Quick-Unlock helper buttons are provided in the UI for effortless demonstration and testing!*

---

## 📬 Proactive Email Reminders & Alert Engine

CareBridge 360 features a proactive background scheduler and email dispatch engine:
1. **Upcoming Dose Reminders**: Dispatched 15 minutes before scheduled times with pill visuals and meal instructions.
2. **Missed Medication Escalation Alerts**: Automatically escalated to family members and caregivers if a dose is not confirmed within 30 minutes.
3. **Doctor Appointment Reminders**: Dispatched 24 hours and 2 hours prior to scheduled clinic visits with prep checklists and transportation status.
4. **Weekly Family Health Digest**: Automated summary email sent to family circles every Sunday with adherence trends and vital averages.
5. **Urgent Emergency SOS Broadcast**: Immediate email blast with patient GPS address, allergies, blood type, and emergency contacts.
6. **In-App Live Notification Center & Email Previewer**:
   * Inspect the exact responsive HTML email templates sent by the system.
   * Interactive simulator buttons to trigger upcoming doses, missed alerts, and appointment notices on demand.
   * Direct test email dispatcher allowing reviewers to send test emails to their own real inbox.

---

## 📄 Doctor Consultation Summary Report

With 1 click, users can generate a printable, clinical-grade medical report containing:
* Patient demographics, DOB, blood type, and known drug allergies.
* Complete active prescription schedule (Drug, generic name, dose, frequency, Rx #, prescriber).
* 30-Day Medication adherence rate.
* Recent vitals history (Blood pressure, glucose readings).
* Active drug interaction warnings.
* Questions prepared by patient and family for the physician.
* Dedicated physician signature and clinical follow-up section.

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v18+ (Node v24 recommended)
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
   Navigate to `http://localhost:5000`

### Running Integration Tests
```bash
npm test
```

---

## 🧪 Demo Credentials

| Profile | Role | Passcode | Description |
| :--- | :--- | :--- | :--- |
| **Eleanor Vance** (Age 78) | **Senior** | `1234` | Large buttons, 1-tap dose logging, voice assistance |
| Eleanor Vance | **Caretaker** | `CARE789` | Full medication editing, interaction radar, vitals |
| Eleanor Vance | **Family** | `FAM456` | Live activity timeline, appointment rides, love notes |
| **Arthur Pendelton** (Age 83) | **Senior** | `5678` | AFib & post-stroke recovery profile |
| Arthur Pendelton | **Caretaker** | `NURSE321` | Anticoagulant safety monitoring |
| Arthur Pendelton | **Family** | `LOVE123` | Family circle dashboard |
