import { ElderlyProfile, Medication, MedicationLog, Appointment, RoutineTask, CareMessage, NotificationLog } from '../types.js';

export const initialProfiles: ElderlyProfile[] = [
  {
    id: 'prof-eleanor',
    fullName: 'Eleanor Vance',
    preferredName: 'Grandma Ellie',
    age: 78,
    dateOfBirth: '1948-04-12',
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    address: '42 Maplewood Terrace, Apt 3B, Boston, MA',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Sulfa drugs', 'Shellfish'],
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Hypertension (High BP)', 'Mild Osteoarthritis in knees'],
    primaryPhysician: {
      name: 'Dr. Sarah Bennett, MD',
      specialty: 'Internal Medicine & Geriatrics',
      clinic: 'Beacon Hill Elder Health Center',
      phone: '(617) 555-0142',
      email: 'dr.bennett@beaconhillhealth.org'
    },
    emergencyContacts: [
      {
        id: 'ec-1',
        name: 'David Vance',
        relation: 'Son (Primary Caregiver)',
        phone: '(617) 555-0899',
        email: 'david.vance@silvercare-demo.com',
        isPrimary: true,
        canReceiveAlerts: true
      },
      {
        id: 'ec-2',
        name: 'Clara Miller, RN',
        relation: 'Visiting Home Nurse',
        phone: '(617) 555-0321',
        email: 'nurse.clara@eldercarevisiting.com',
        isPrimary: false,
        canReceiveAlerts: true
      },
      {
        id: 'ec-3',
        name: 'Emily Vance',
        relation: 'Granddaughter',
        phone: '(617) 555-0711',
        email: 'emily.vance@silvercare-demo.com',
        isPrimary: false,
        canReceiveAlerts: true
      }
    ],
    medicalNotes: 'DNR on file with Beacon Hill Health. Eleanor uses walking cane outdoors. Prefers medications with warm water or light applesauce.',
    passcodes: {
      seniorPin: '1234',
      caretakerPasscode: 'CARE789',
      familyPasscode: 'FAM456'
    },
    preferredLanguage: 'English',
    fontSizePreference: 'large',
    highContrast: false,
    voiceAssistEnabled: true,
    activeStatus: 'active'
  },
  {
    id: 'prof-arthur',
    fullName: 'Arthur Pendelton',
    preferredName: 'Arthur',
    age: 83,
    dateOfBirth: '1943-09-28',
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    address: '15 Oak Ridge Blvd, Brookline, MA',
    bloodType: 'O+',
    allergies: ['Aspirin (triggers GI bleed)', 'Codeine'],
    chronicConditions: ['Atrial Fibrillation (AFib)', 'Post-Ischemic Stroke (Mild right hand weakness)', 'Hyperlipidemia'],
    primaryPhysician: {
      name: 'Dr. Marcus Vance, MD',
      specialty: 'Cardiology',
      clinic: 'New England Heart Institute',
      phone: '(617) 555-0988',
      email: 'dr.m.vance@neheart.org'
    },
    emergencyContacts: [
      {
        id: 'ec-4',
        name: 'Rachel Pendelton-Lee',
        relation: 'Daughter',
        phone: '(617) 555-8832',
        email: 'rachel.pendelton@silvercare-demo.com',
        isPrimary: true,
        canReceiveAlerts: true
      },
      {
        id: 'ec-5',
        name: 'Thomas Lee',
        relation: 'Son-in-law',
        phone: '(617) 555-9921',
        email: 'thomas.lee@silvercare-demo.com',
        isPrimary: false,
        canReceiveAlerts: true
      }
    ],
    medicalNotes: 'Arthur is on blood thinners. Fall risk protocol active. Non-slip socks and bathroom grab bars installed.',
    passcodes: {
      seniorPin: '5678',
      caretakerPasscode: 'NURSE321',
      familyPasscode: 'LOVE123'
    },
    preferredLanguage: 'English',
    fontSizePreference: 'extra-large',
    highContrast: true,
    voiceAssistEnabled: true,
    activeStatus: 'active'
  }
];

export const initialMedications: Medication[] = [
  // Eleanor's medications
  {
    id: 'med-1',
    profileId: 'prof-eleanor',
    name: 'Metformin HCl',
    genericName: 'Metformin Extended Release',
    dosage: '500',
    unit: 'mg',
    shape: 'oval',
    color: '#ffffff', // White
    imprint: 'M 500',
    instructions: 'Take with food to avoid stomach upset. Swallow whole, do not crush.',
    frequency: 'twice_daily',
    timeSlots: [
      { id: 'ts-1', time: '08:30', label: 'Morning', doseAmount: '1 tablet (500mg)' },
      { id: 'ts-2', time: '18:30', label: 'Evening', doseAmount: '1 tablet (500mg)' }
    ],
    inventoryCount: 14,
    refillThreshold: 10,
    lastRefillDate: '2026-10-28',
    prescribingDoctor: 'Dr. Sarah Bennett',
    rxNumber: 'RX-982144-A',
    pharmacyInfo: {
      name: 'CVS Beacon Street',
      phone: '(617) 555-7811'
    },
    active: true,
    foodInstructions: 'with_food',
    warnings: ['Take with meals', 'Avoid excessive alcohol consumption']
  },
  {
    id: 'med-2',
    profileId: 'prof-eleanor',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    dosage: '10',
    unit: 'mg',
    shape: 'round',
    color: '#fef08a', // Light yellow
    imprint: 'L 10',
    instructions: 'Take once every morning. Helps control blood pressure and protects kidneys.',
    frequency: 'daily',
    timeSlots: [
      { id: 'ts-3', time: '08:30', label: 'Morning', doseAmount: '1 tablet (10mg)' }
    ],
    inventoryCount: 22,
    refillThreshold: 7,
    lastRefillDate: '2026-11-01',
    prescribingDoctor: 'Dr. Sarah Bennett',
    rxNumber: 'RX-773120-B',
    pharmacyInfo: {
      name: 'CVS Beacon Street',
      phone: '(617) 555-7811'
    },
    active: true,
    foodInstructions: 'anytime',
    warnings: ['May cause slight dizziness upon standing', 'Avoid potassium salt substitutes']
  },
  {
    id: 'med-3',
    profileId: 'prof-eleanor',
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium (Lipitor)',
    dosage: '20',
    unit: 'mg',
    shape: 'oval',
    color: '#bae6fd', // Light blue
    imprint: 'AT 20',
    instructions: 'Take before going to bed. Controls cholesterol.',
    frequency: 'daily',
    timeSlots: [
      { id: 'ts-4', time: '21:00', label: 'Bedtime', doseAmount: '1 tablet (20mg)' }
    ],
    inventoryCount: 19,
    refillThreshold: 7,
    lastRefillDate: '2026-10-25',
    prescribingDoctor: 'Dr. Sarah Bennett',
    rxNumber: 'RX-649012-C',
    pharmacyInfo: {
      name: 'CVS Beacon Street',
      phone: '(617) 555-7811'
    },
    active: true,
    foodInstructions: 'anytime',
    warnings: ['Do NOT consume Grapefruit or grapefruit juice while taking this medication!']
  },
  {
    id: 'med-4',
    profileId: 'prof-eleanor',
    name: 'Glipizide',
    genericName: 'Glipizide XL',
    dosage: '5',
    unit: 'mg',
    shape: 'round',
    color: '#fed7aa', // Light orange
    imprint: 'G 5',
    instructions: 'Take 30 minutes before morning breakfast.',
    frequency: 'daily',
    timeSlots: [
      { id: 'ts-5', time: '08:00', label: 'Morning', doseAmount: '1 tablet (5mg)' }
    ],
    inventoryCount: 8, // Low stock alert!
    refillThreshold: 10,
    lastRefillDate: '2026-10-14',
    prescribingDoctor: 'Dr. Alan Cooper',
    rxNumber: 'RX-312988-G',
    pharmacyInfo: {
      name: 'CVS Beacon Street',
      phone: '(617) 555-7811'
    },
    active: true,
    foodInstructions: 'before_food',
    warnings: ['Low stock! Only 8 pills remaining', 'Have glucose tabs or snack ready if shaky']
  },
  {
    id: 'med-5',
    profileId: 'prof-eleanor',
    name: 'Calcium Citrate + Vitamin D3',
    genericName: 'Calcium Citrate 600mg + D3 400IU',
    dosage: '600',
    unit: 'mg',
    shape: 'capsule',
    color: '#dcfce7', // Light green
    imprint: 'CAL-D',
    instructions: 'Take with lunchtime meal for bone density support.',
    frequency: 'daily',
    timeSlots: [
      { id: 'ts-6', time: '12:30', label: 'Noon', doseAmount: '1 softgel' }
    ],
    inventoryCount: 45,
    refillThreshold: 14,
    lastRefillDate: '2026-10-10',
    prescribingDoctor: 'Dr. Sarah Bennett',
    rxNumber: 'OTC-9901',
    pharmacyInfo: {
      name: 'CVS Beacon Street',
      phone: '(617) 555-7811'
    },
    active: true,
    foodInstructions: 'with_food',
    warnings: ['Do not take at the exact same moment as iron supplements']
  },

  // Arthur's medications
  {
    id: 'med-6',
    profileId: 'prof-arthur',
    name: 'Eliquis',
    genericName: 'Apixaban Blood Thinner',
    dosage: '5',
    unit: 'mg',
    shape: 'oval',
    color: '#fbcfe8', // Pink
    imprint: '894 5',
    instructions: 'CRITICAL ANTICOAGULANT. Take exactly 12 hours apart. Do not skip.',
    frequency: 'twice_daily',
    timeSlots: [
      { id: 'ts-7', time: '09:00', label: 'Morning', doseAmount: '1 tablet (5mg)' },
      { id: 'ts-8', time: '21:00', label: 'Bedtime', doseAmount: '1 tablet (5mg)' }
    ],
    inventoryCount: 28,
    refillThreshold: 14,
    lastRefillDate: '2026-11-04',
    prescribingDoctor: 'Dr. Marcus Vance',
    rxNumber: 'RX-ELI-8812',
    pharmacyInfo: {
      name: 'Walgreens Brookline',
      phone: '(617) 555-4300'
    },
    active: true,
    foodInstructions: 'anytime',
    warnings: ['CRITICAL: Do NOT take Aspirin, Ibuprofen, or NSAIDs', 'Report any unusual bruising or bleeding immediately']
  },
  {
    id: 'med-7',
    profileId: 'prof-arthur',
    name: 'Metoprolol Succinate',
    genericName: 'Metoprolol Extended Release',
    dosage: '25',
    unit: 'mg',
    shape: 'round',
    color: '#ffffff',
    imprint: 'M 25',
    instructions: 'Take every morning with breakfast. Controls heart rate rhythm.',
    frequency: 'daily',
    timeSlots: [
      { id: 'ts-9', time: '09:00', label: 'Morning', doseAmount: '1 tablet (25mg)' }
    ],
    inventoryCount: 30,
    refillThreshold: 10,
    lastRefillDate: '2026-11-05',
    prescribingDoctor: 'Dr. Marcus Vance',
    rxNumber: 'RX-MET-4419',
    pharmacyInfo: {
      name: 'Walgreens Brookline',
      phone: '(617) 555-4300'
    },
    active: true,
    foodInstructions: 'with_food',
    warnings: ['Do not stop taking abruptly']
  }
];

// Today's sample logs for Eleanor
const todayStr = new Date().toISOString().split('T')[0];
export const initialMedicationLogs: MedicationLog[] = [
  {
    id: 'log-1',
    profileId: 'prof-eleanor',
    medicationId: 'med-4',
    medicationName: 'Glipizide 5mg',
    dosage: '5mg',
    scheduledTime: `${todayStr}T08:00:00.000Z`,
    slotLabel: 'Morning',
    status: 'taken',
    loggedAt: `${todayStr}T08:05:00.000Z`,
    loggedByRole: 'senior',
    loggedByName: 'Eleanor Vance',
    notes: 'Took with warm water before tea',
    moodRating: 'good'
  },
  {
    id: 'log-2',
    profileId: 'prof-eleanor',
    medicationId: 'med-1',
    medicationName: 'Metformin HCl 500mg',
    dosage: '500mg',
    scheduledTime: `${todayStr}T08:30:00.000Z`,
    slotLabel: 'Morning',
    status: 'taken',
    loggedAt: `${todayStr}T08:35:00.000Z`,
    loggedByRole: 'senior',
    loggedByName: 'Eleanor Vance',
    notes: 'Had oatmeal breakfast first',
    moodRating: 'great'
  },
  {
    id: 'log-3',
    profileId: 'prof-eleanor',
    medicationId: 'med-2',
    medicationName: 'Lisinopril 10mg',
    dosage: '10mg',
    scheduledTime: `${todayStr}T08:30:00.000Z`,
    slotLabel: 'Morning',
    status: 'taken',
    loggedAt: `${todayStr}T08:36:00.000Z`,
    loggedByRole: 'senior',
    loggedByName: 'Eleanor Vance',
    notes: 'Taken together with Metformin',
    moodRating: 'great'
  },
  {
    id: 'log-4',
    profileId: 'prof-eleanor',
    medicationId: 'med-5',
    medicationName: 'Calcium Citrate + Vitamin D3',
    dosage: '600mg',
    scheduledTime: `${todayStr}T12:30:00.000Z`,
    slotLabel: 'Noon',
    status: 'taken',
    loggedAt: `${todayStr}T12:45:00.000Z`,
    loggedByRole: 'caretaker',
    loggedByName: 'Clara Miller, RN',
    notes: 'Administered with lunch vegetable soup',
    moodRating: 'good'
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    profileId: 'prof-eleanor',
    title: 'Cardiology 6-Month Review & ECG',
    doctorName: 'Dr. Sarah Bennett, MD',
    specialty: 'Cardiology & Geriatric Medicine',
    clinicName: 'Beacon Hill Heart & Vascular Pavilion',
    address: '120 Tremont St, Suite 400, Boston, MA',
    phone: '(617) 555-0142',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 2 days from now
    status: 'upcoming',
    transportationStatus: 'arranged',
    driverOrCompanion: 'Son David Vance (Driving)',
    preparationChecklist: [
      { id: 'pc-1', task: 'Fasting from 8:00 AM (water permitted)', completed: false },
      { id: 'pc-2', task: 'Bring updated printed medication list from CareBridge', completed: true },
      { id: 'pc-3', task: 'Wear loose-fitting two-piece outfit for ECG chest electrodes', completed: false },
      { id: 'pc-4', task: 'Bring Medicare and supplemental insurance cards', completed: true }
    ],
    questionsForDoctor: [
      'Can we adjust the evening Metformin timing if mild indigestion recurs?',
      'Is the knee arthritis responding adequately, or should we schedule a physical therapy review?',
      'Check if blood pressure readings averaging 124/78 are within the ideal target window.'
    ],
    reminderSent24h: false,
    reminderSent2h: false
  },
  {
    id: 'apt-2',
    profileId: 'prof-eleanor',
    title: 'Diabetic Retinal Eye Exam',
    doctorName: 'Dr. Harold Chen, OD',
    specialty: 'Optometry & Ophthalmology',
    clinicName: 'New England Eye Center',
    address: '750 Washington St, Boston, MA',
    phone: '(617) 555-3390',
    dateTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
    status: 'upcoming',
    transportationStatus: 'needed',
    driverOrCompanion: 'Need family volunteer (eyes will be dilated for 3-4 hours)',
    preparationChecklist: [
      { id: 'pc-5', task: 'Bring dark UV sunglasses for post-dilation ride home', completed: false },
      { id: 'pc-6', task: 'Do not drive after appointment', completed: false }
    ],
    questionsForDoctor: [
      'Check for any signs of diabetic microvascular changes in the macula.'
    ]
  },
  {
    id: 'apt-3',
    profileId: 'prof-arthur',
    title: 'Post-Stroke Neurological & Mobility Assessment',
    doctorName: 'Dr. Aris Thorne, MD',
    specialty: 'Neurology & Stroke Recovery',
    clinicName: 'Mass General Brigham Neuro Rehabilitation',
    address: '55 Fruit St, Boston, MA',
    phone: '(617) 555-6677',
    dateTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    transportationStatus: 'arranged',
    driverOrCompanion: 'Daughter Rachel Pendelton',
    preparationChecklist: [
      { id: 'pc-7', task: 'Bring walking quad-cane and wrist brace', completed: true },
      { id: 'pc-8', task: 'Bring PT exercise adherence log', completed: true }
    ],
    questionsForDoctor: [
      'Can Arthur increase grip strengthening therapy duration?',
      'Assess AFib stability with Eliquis dosage.'
    ]
  }
];

export const initialRoutines: RoutineTask[] = [
  {
    id: 'rt-1',
    profileId: 'prof-eleanor',
    title: 'Daily Hydration Target',
    type: 'hydration',
    targetValue: 6,
    unit: 'glasses',
    frequency: 'Daily (Aim for 6 glasses)',
    iconName: 'Droplets',
    description: 'Vital for kidney health, preventing dizziness, and optimal medication metabolism.',
    entries: [
      { id: 're-1', timestamp: `${todayStr}T09:00:00.000Z`, value: 1, notes: 'Glass of lemon water', loggedBy: 'Eleanor' },
      { id: 're-2', timestamp: `${todayStr}T11:30:00.000Z`, value: 1, notes: 'Chamomile tea', loggedBy: 'Eleanor' },
      { id: 're-3', timestamp: `${todayStr}T13:00:00.000Z`, value: 1, notes: 'Water with lunch', loggedBy: 'Clara (Nurse)' },
      { id: 're-4', timestamp: `${todayStr}T15:30:00.000Z`, value: 1, notes: 'Afternoon refreshment', loggedBy: 'Eleanor' }
    ]
  },
  {
    id: 'rt-2',
    profileId: 'prof-eleanor',
    title: 'Morning Blood Pressure Check',
    type: 'blood_pressure',
    targetValue: '< 130/80',
    unit: 'mmHg',
    frequency: 'Every Morning after resting 5 mins',
    iconName: 'Activity',
    description: 'Monitor with Omron arm cuff before morning caffeine or medication.',
    entries: [
      { id: 're-5', timestamp: `${todayStr}T08:15:00.000Z`, value: '124/78', notes: 'Pulse 71 bpm. Eleanor was calm and rested.', loggedBy: 'Eleanor' },
      { id: 're-6', timestamp: '2026-11-14T08:20:00.000Z', value: '126/80', notes: 'Pulse 74 bpm.', loggedBy: 'Eleanor' },
      { id: 're-7', timestamp: '2026-11-13T08:10:00.000Z', value: '122/76', notes: 'Pulse 69 bpm.', loggedBy: 'David Vance' }
    ]
  },
  {
    id: 'rt-3',
    profileId: 'prof-eleanor',
    title: 'Fasting Blood Glucose',
    type: 'blood_glucose',
    targetValue: '90 - 120',
    unit: 'mg/dL',
    frequency: 'Daily upon waking',
    iconName: 'HeartPulse',
    description: 'Finger-prick glucometer test to monitor diabetes control.',
    entries: [
      { id: 're-8', timestamp: `${todayStr}T07:45:00.000Z`, value: '108', notes: 'Great reading! Fasted for 9 hours.', loggedBy: 'Eleanor' },
      { id: 're-9', timestamp: '2026-11-14T07:50:00.000Z', value: '114', notes: 'Normal fasting reading.', loggedBy: 'Eleanor' },
      { id: 're-10', timestamp: '2026-11-13T07:40:00.000Z', value: '110', notes: 'Target range met.', loggedBy: 'Eleanor' }
    ]
  },
  {
    id: 'rt-4',
    profileId: 'prof-eleanor',
    title: 'Gentle Garden Mobility Walk',
    type: 'mobility',
    targetValue: 20,
    unit: 'minutes',
    frequency: 'Daily in sunny courtyard',
    iconName: 'Footprints',
    description: 'Helps joint mobility and cardiovascular endurance. Uses single-point cane.',
    entries: [
      { id: 're-11', timestamp: `${todayStr}T10:15:00.000Z`, value: 20, notes: 'Walked courtyard with Emily. Enjoyed the autumn sun!', loggedBy: 'Emily Vance' },
      { id: 're-12', timestamp: '2026-11-14T10:30:00.000Z', value: 15, notes: 'Felt slight knee stiffness, rested after 15 mins.', loggedBy: 'Clara (Nurse)' }
    ]
  }
];

export const initialCareMessages: CareMessage[] = [
  {
    id: 'msg-1',
    profileId: 'prof-eleanor',
    senderName: 'David Vance',
    senderRole: 'family',
    text: 'Good morning Mom! Emily and I will be coming over around 5:30 PM with your favorite vegetable minestrone. Remember to drink your afternoon water!',
    timestamp: `${todayStr}T09:15:00.000Z`,
    reactions: { heart: 3, hug: 2 }
  },
  {
    id: 'msg-2',
    profileId: 'prof-eleanor',
    senderName: 'Clara Miller, RN',
    senderRole: 'caretaker',
    text: 'Shift update: Administered noon calcium. Eleanor was in wonderful spirits today and walked 20 mins. Blood pressure was a steady 124/78. Low pill warning noted for Glipizide (8 remaining) - pharmacy reorder queued.',
    timestamp: `${todayStr}T13:30:00.000Z`,
    reactions: { thumbsUp: 2 }
  },
  {
    id: 'msg-3',
    profileId: 'prof-eleanor',
    senderName: 'Emily Vance',
    senderRole: 'family',
    text: 'Loved walking with you this morning Grandma! Your roses are looking so pretty.',
    timestamp: `${todayStr}T14:10:00.000Z`,
    reactions: { heart: 4 }
  }
];

export const initialNotifications: NotificationLog[] = [
  {
    id: 'notif-1',
    profileId: 'prof-eleanor',
    type: 'dose_reminder',
    recipientName: 'Eleanor Vance',
    recipientEmail: 'david.vance@silvercare-demo.com',
    recipientRole: 'senior',
    subject: '⏰ Morning Medication Reminder for Eleanor - 8:30 AM',
    htmlBody: `<div style="font-family:sans-serif;padding:20px;border-radius:12px;background:#f0fdf4;border:1px solid #bbf7d0">
      <h2 style="color:#166534;margin-top:0">Good Morning, Eleanor!</h2>
      <p style="font-size:16px;color:#15803d">It is 8:30 AM. Time for your scheduled morning medications:</p>
      <ul>
        <li><strong>Metformin HCl 500mg</strong> (1 tablet with breakfast)</li>
        <li><strong>Lisinopril 10mg</strong> (1 tablet)</li>
      </ul>
      <p style="color:#64748b;font-size:14px">Please remember to have a glass of water and enjoy your breakfast!</p>
    </div>`,
    sentAt: `${todayStr}T08:15:00.000Z`,
    status: 'delivered',
    triggerReason: 'Automated 15-minute advance dose reminder'
  },
  {
    id: 'notif-2',
    profileId: 'prof-eleanor',
    type: 'low_refill',
    recipientName: 'David Vance',
    recipientEmail: 'david.vance@silvercare-demo.com',
    recipientRole: 'family',
    subject: '⚠️ Low Medication Refill Alert: Glipizide (8 tablets left)',
    htmlBody: `<div style="font-family:sans-serif;padding:20px;border-radius:12px;background:#fffbeb;border:1px solid #fde68a">
      <h2 style="color:#b45309;margin-top:0">Prescription Refill Warning</h2>
      <p style="font-size:16px;color:#92400e">Eleanor has only <strong>8 tablets</strong> remaining of <strong>Glipizide 5mg</strong> (Refill threshold: 10).</p>
      <p>Pharmacy: CVS Beacon Street - Phone: (617) 555-7811 - Rx: RX-312988-G</p>
      <p>Please contact the pharmacy or click below to arrange a refill.</p>
    </div>`,
    sentAt: `${todayStr}T09:00:00.000Z`,
    status: 'delivered',
    triggerReason: 'Pill inventory dropped below threshold (8 <= 10)'
  }
];
