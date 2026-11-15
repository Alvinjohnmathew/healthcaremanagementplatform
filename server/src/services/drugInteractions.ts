import { DrugInteraction } from '../types.js';

interface KnownInteractionRule {
  drugKeywordsA: string[];
  drugKeywordsB: string[];
  severity: 'high' | 'moderate' | 'caution';
  title: string;
  description: string;
  recommendation: string;
  foodWarnings?: string[];
}

const interactionRules: KnownInteractionRule[] = [
  {
    drugKeywordsA: ['eliquis', 'apixaban', 'warfarin', 'coumadin', 'xarelto', 'rivaroxaban', 'pradaxa', 'dabigatran'],
    drugKeywordsB: ['aspirin', 'ibuprofen', 'advil', 'motrin', 'naproxen', 'aleve', 'nsaid', 'celebrex'],
    severity: 'high',
    title: 'Severe Bleeding Hazard: Anticoagulant + NSAID / Aspirin',
    description: 'Combining blood thinners (like Eliquis/Warfarin) with NSAIDs or Aspirin dramatically increases gastrointestinal bleeding and hemorrhagic stroke risk.',
    recommendation: 'Avoid over-the-counter NSAIDs. Use acetaminophen (Tylenol) for mild pain unless explicitly directed otherwise by your cardiologist.',
    foodWarnings: ['Avoid high doses of vitamin E, ginkgo biloba, garlic supplements, or ginger supplements as they amplify bleeding risk.']
  },
  {
    drugKeywordsA: ['atorvastatin', 'simvastatin', 'lovastatin', 'lipitor', 'zocor'],
    drugKeywordsB: ['grapefruit', 'clarithromycin', 'erythromycin', 'diltiazem'],
    severity: 'high',
    title: 'Statin Toxicity Alert: CYP3A4 Enzyme Inhibition',
    description: 'Grapefruit and certain antibiotics block the liver enzyme (CYP3A4) that breaks down Atorvastatin, causing medication levels in the bloodstream to surge dangerously.',
    recommendation: 'Strictly avoid Grapefruit and grapefruit juice. Can cause acute muscle breakdown (rhabdomyolysis) and kidney injury.',
    foodWarnings: ['Do NOT drink grapefruit juice or eat fresh grapefruit while on Atorvastatin or Simvastatin.']
  },
  {
    drugKeywordsA: ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan'],
    drugKeywordsB: ['spironolactone', 'potassium', 'k-dur', 'salt substitute'],
    severity: 'moderate',
    title: 'Hyperkalemia Risk: ACE Inhibitor / ARB + Potassium Accumulation',
    description: 'Lisinopril reduces aldosterone secretion, leading to potassium retention. Combining with potassium supplements or potassium-based salt substitutes can cause dangerously elevated serum potassium.',
    recommendation: 'Avoid "NoSalt" or salt substitutes containing potassium chloride. Periodic basic metabolic panel (BMP) blood work recommended.',
    foodWarnings: ['Do not consume salt-substitute shakers labeled "Potassium Chloride" without doctor approval.']
  },
  {
    drugKeywordsA: ['glipizide', 'glimepiride', 'glyburide', 'insulin'],
    drugKeywordsB: ['metoprolol', 'atenolol', 'propranolol', 'carvedilol', 'beta blocker'],
    severity: 'moderate',
    title: 'Hypoglycemia Symptom Masking: Sulfonylurea / Insulin + Beta Blocker',
    description: 'Beta-blockers can disguise vital warning signs of low blood sugar, particularly heart palpitations, shaking, and tremor (though diaphoresis/sweating remains).',
    recommendation: 'Elderly individuals should test blood sugar if feeling dizzy, fatigued, confused, or diaphoretic (sweaty), even without racing heartbeats.',
    foodWarnings: ['Keep fast-acting glucose tablets or fruit juice readily accessible.']
  },
  {
    drugKeywordsA: ['metformin', 'glucophage'],
    drugKeywordsB: ['alcohol', 'contrast dye', 'iodine'],
    severity: 'high',
    title: 'Lactic Acidosis Warning: Metformin + Excessive Alcohol or Contrast Dye',
    description: 'Excessive alcohol consumption while on Metformin impairs lactate clearance by the liver, escalating risk of rare but life-threatening lactic acidosis.',
    recommendation: 'Limit alcohol strictly. If scheduled for a CT scan with intravenous iodinated contrast, withhold Metformin 48 hours prior and post procedure as instructed.',
    foodWarnings: ['Avoid binge drinking or heavy alcohol intake. Always take Metformin with food to protect gastric lining.']
  },
  {
    drugKeywordsA: ['calcium', 'caltrate', 'tums'],
    drugKeywordsB: ['levothyroxine', 'synthroid', 'iron', 'ferrous sulfate', 'ciprofloxacin'],
    severity: 'moderate',
    title: 'Absorption Chelation: Calcium Blocks Vital Medication Uptake',
    description: 'Calcium binds with thyroid hormone (Levothyroxine) and iron supplements in the gut, rendering them inert and unabsorbed.',
    recommendation: 'Space calcium supplements and dairy intake at least 4 hours apart from thyroid medications or iron tablets.',
    foodWarnings: ['Take thyroid pills on an empty stomach with plain water at least 4 hours before taking Calcium.']
  }
];

export function checkMedicationInteractions(medicationNames: string[]): DrugInteraction[] {
  const detectedInteractions: DrugInteraction[] = [];
  const normalizedMeds = medicationNames.map(m => m.toLowerCase());

  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const medA = normalizedMeds[i];
      const medB = normalizedMeds[j];

      for (const rule of interactionRules) {
        const matchesAtoA = rule.drugKeywordsA.some(k => medA.includes(k));
        const matchesBtoB = rule.drugKeywordsB.some(k => medB.includes(k));
        const matchesAtoB = rule.drugKeywordsA.some(k => medB.includes(k));
        const matchesBtoA = rule.drugKeywordsB.some(k => medA.includes(k));

        if ((matchesAtoA && matchesBtoB) || (matchesAtoB && matchesBtoA)) {
          detectedInteractions.push({
            id: `int-${i}-${j}-${rule.severity}`,
            drugA: medicationNames[i],
            drugB: medicationNames[j],
            severity: rule.severity,
            title: rule.title,
            description: rule.description,
            recommendation: rule.recommendation,
            foodWarnings: rule.foodWarnings
          });
        }
      }
    }
  }

  // Also check individual medications for single-drug food/lifestyle warnings
  for (let i = 0; i < normalizedMeds.length; i++) {
    const med = normalizedMeds[i];
    if (med.includes('atorvastatin') || med.includes('simvastatin') || med.includes('lipitor')) {
      if (!detectedInteractions.some(di => di.title.includes('Statin Toxicity Alert'))) {
        detectedInteractions.push({
          id: `food-statin-${i}`,
          drugA: medicationNames[i],
          drugB: 'Grapefruit & Citrus Pomelo',
          severity: 'high',
          title: 'Dietary Warning: Statin + Grapefruit Incompatibility',
          description: 'Grapefruit compounds inhibit intestinal CYP3A4 enzymes, raising Atorvastatin concentrations to dangerous toxicity levels.',
          recommendation: 'Do not eat grapefruit or drink grapefruit juice while on this medication.',
          foodWarnings: ['Avoid grapefruit, Seville oranges, and pomelos.']
        });
      }
    }

    if (med.includes('metformin')) {
      if (!detectedInteractions.some(di => di.title.includes('Lactic Acidosis'))) {
        detectedInteractions.push({
          id: `food-metformin-${i}`,
          drugA: medicationNames[i],
          drugB: 'Alcohol & Fasting',
          severity: 'moderate',
          title: 'Metformin Diet & Hydration Safety',
          description: 'Metformin must be taken with wholesome meals to avoid GI distress and never combined with heavy alcohol.',
          recommendation: 'Take with mid-meal or post-meal food. Maintain steady daily hydration.',
          foodWarnings: ['Always take with meals. Avoid heavy alcohol.']
        });
      }
    }
  }

  return detectedInteractions;
}
