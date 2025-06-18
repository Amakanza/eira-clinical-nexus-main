
import { ClinicalTemplate } from '@/types/templates';

export const defaultTemplates: ClinicalTemplate[] = [
  // MSK Initial Evaluation
  {
    id: 'msk-initial',
    name: 'MSK Initial Evaluation',
    type: 'initial-evaluation',
    specialty: 'msk',
    sections: [
      {
        id: 'systems-review',
        title: 'Systems Review',
        fields: [
          {
            id: 'cardiovascular',
            type: 'checkbox',
            label: 'Cardiovascular',
            defaultValue: false
          },
          {
            id: 'integumentary',
            type: 'checkbox',
            label: 'Integumentary',
            defaultValue: false
          },
          {
            id: 'neurological',
            type: 'checkbox',
            label: 'Neurological',
            defaultValue: false
          },
          {
            id: 'musculoskeletal',
            type: 'checkbox',
            label: 'Musculoskeletal',
            defaultValue: true
          }
        ]
      },
      {
        id: 'rom-testing',
        title: 'Range of Motion Testing',
        fields: [
          {
            id: 'flexion',
            type: 'number',
            label: 'Flexion',
            unit: '°',
            min: 0,
            max: 180
          },
          {
            id: 'extension',
            type: 'number',
            label: 'Extension',
            unit: '°',
            min: 0,
            max: 180
          },
          {
            id: 'abduction',
            type: 'number',
            label: 'Abduction',
            unit: '°',
            min: 0,
            max: 180
          },
          {
            id: 'adduction',
            type: 'number',
            label: 'Adduction',
            unit: '°',
            min: 0,
            max: 180
          }
        ]
      },
      {
        id: 'strength-testing',
        title: 'Manual Muscle Testing (MMT)',
        fields: [
          {
            id: 'hip-flexion',
            type: 'select',
            label: 'Hip Flexion',
            options: [
              { value: '0', label: '0/5 - No contraction' },
              { value: '1', label: '1/5 - Trace' },
              { value: '2', label: '2/5 - Poor' },
              { value: '3', label: '3/5 - Fair' },
              { value: '4-', label: '4-/5 - Good minus' },
              { value: '4', label: '4/5 - Good' },
              { value: '4+', label: '4+/5 - Good plus' },
              { value: '5', label: '5/5 - Normal' }
            ]
          },
          {
            id: 'knee-extension',
            type: 'select',
            label: 'Knee Extension',
            options: [
              { value: '0', label: '0/5 - No contraction' },
              { value: '1', label: '1/5 - Trace' },
              { value: '2', label: '2/5 - Poor' },
              { value: '3', label: '3/5 - Fair' },
              { value: '4-', label: '4-/5 - Good minus' },
              { value: '4', label: '4/5 - Good' },
              { value: '4+', label: '4+/5 - Good plus' },
              { value: '5', label: '5/5 - Normal' }
            ]
          }
        ]
      },
      {
        id: 'special-tests',
        title: 'Special Tests',
        fields: [
          {
            id: 'slump-test',
            type: 'select',
            label: 'Slump Test',
            options: [
              { value: 'not-performed', label: 'Not Performed' },
              { value: 'negative', label: 'Negative' },
              { value: 'positive', label: 'Positive' }
            ]
          },
          {
            id: 'straight-leg-raise',
            type: 'select',
            label: 'Straight Leg Raise',
            options: [
              { value: 'not-performed', label: 'Not Performed' },
              { value: 'negative', label: 'Negative' },
              { value: 'positive', label: 'Positive' }
            ]
          }
        ]
      },
      {
        id: 'outcome-measures',
        title: 'Outcome Measures',
        fields: [
          {
            id: 'outcome-measure-type',
            type: 'select',
            label: 'Select Outcome Measure',
            options: [
              { value: 'vas', label: 'Visual Analog Scale (VAS)' },
              { value: 'koos', label: 'Knee Injury and Osteoarthritis Outcome Score (KOOS)' },
              { value: 'tug', label: 'Timed Up and Go (TUG)' },
              { value: 'oswestry', label: 'Oswestry Disability Index' }
            ]
          },
          {
            id: 'outcome-score',
            type: 'number',
            label: 'Score',
            min: 0,
            max: 100
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // Respiratory Initial Evaluation
  {
    id: 'respiratory-initial',
    name: 'Respiratory Initial Evaluation',
    type: 'initial-evaluation',
    specialty: 'respiratory',
    sections: [
      {
        id: 'systems-review',
        title: 'Systems Review',
        fields: [
          {
            id: 'cardiovascular',
            type: 'checkbox',
            label: 'Cardiovascular',
            defaultValue: false
          },
          {
            id: 'neurological',
            type: 'checkbox',
            label: 'Neurological',
            defaultValue: false
          },
          {
            id: 'musculoskeletal',
            type: 'checkbox',
            label: 'Musculoskeletal',
            defaultValue: false
          },
          {
            id: 'respiratory',
            type: 'checkbox',
            label: 'Respiratory',
            defaultValue: true
          }
        ]
      },
      {
        id: 'vital-signs-extended',
        title: 'Respiratory Vital Signs',
        fields: [
          {
            id: 'respiratory-rate',
            type: 'number',
            label: 'Respiratory Rate',
            unit: 'bpm',
            min: 0,
            max: 60
          },
          {
            id: 'oxygen-saturation',
            type: 'number',
            label: 'Oxygen Saturation',
            unit: '%',
            min: 0,
            max: 100
          },
          {
            id: 'peak-flow',
            type: 'number',
            label: 'Peak Expiratory Flow',
            unit: 'L/min'
          }
        ]
      },
      {
        id: 'auscultation',
        title: 'Auscultation & Percussion',
        fields: [
          {
            id: 'rul-sounds',
            type: 'select',
            label: 'Right Upper Lobe',
            options: [
              { value: 'clear', label: 'Clear' },
              { value: 'crackles', label: 'Crackles' },
              { value: 'wheeze', label: 'Wheeze' },
              { value: 'decreased', label: 'Decreased' },
              { value: 'absent', label: 'Absent' }
            ]
          },
          {
            id: 'lul-sounds',
            type: 'select',
            label: 'Left Upper Lobe',
            options: [
              { value: 'clear', label: 'Clear' },
              { value: 'crackles', label: 'Crackles' },
              { value: 'wheeze', label: 'Wheeze' },
              { value: 'decreased', label: 'Decreased' },
              { value: 'absent', label: 'Absent' }
            ]
          },
          {
            id: 'rll-sounds',
            type: 'select',
            label: 'Right Lower Lobe',
            options: [
              { value: 'clear', label: 'Clear' },
              { value: 'crackles', label: 'Crackles' },
              { value: 'wheeze', label: 'Wheeze' },
              { value: 'decreased', label: 'Decreased' },
              { value: 'absent', label: 'Absent' }
            ]
          },
          {
            id: 'lll-sounds',
            type: 'select',
            label: 'Left Lower Lobe',
            options: [
              { value: 'clear', label: 'Clear' },
              { value: 'crackles', label: 'Crackles' },
              { value: 'wheeze', label: 'Wheeze' },
              { value: 'decreased', label: 'Decreased' },
              { value: 'absent', label: 'Absent' }
            ]
          }
        ]
      },
      {
        id: 'secretion-assessment',
        title: 'Secretion & Cough Assessment',
        fields: [
          {
            id: 'cough-strength',
            type: 'select',
            label: 'Cough Strength',
            options: [
              { value: 'weak', label: 'Weak' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'strong', label: 'Strong' }
            ]
          },
          {
            id: 'sputum-volume',
            type: 'select',
            label: 'Sputum Volume',
            options: [
              { value: 'none', label: 'None' },
              { value: 'minimal', label: 'Minimal (<5ml)' },
              { value: 'moderate', label: 'Moderate (5-25ml)' },
              { value: 'copious', label: 'Copious (>25ml)' }
            ]
          },
          {
            id: 'sputum-consistency',
            type: 'select',
            label: 'Sputum Consistency',
            options: [
              { value: 'thin', label: 'Thin/Watery' },
              { value: 'thick', label: 'Thick/Viscous' },
              { value: 'purulent', label: 'Purulent' }
            ]
          }
        ]
      },
      {
        id: 'outcome-measures',
        title: 'Respiratory Outcome Measures',
        fields: [
          {
            id: 'mrc-dyspnea',
            type: 'select',
            label: 'MRC Dyspnea Scale',
            options: [
              { value: '1', label: '1 - Only breathless with strenuous exercise' },
              { value: '2', label: '2 - Short of breath when hurrying' },
              { value: '3', label: '3 - Walks slower due to breathlessness' },
              { value: '4', label: '4 - Stops for breath after 100m' },
              { value: '5', label: '5 - Too breathless to leave house' }
            ]
          },
          {
            id: 'six-minute-walk',
            type: 'number',
            label: '6-Minute Walk Test Distance',
            unit: 'meters'
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Neurological Initial Evaluation
  {
    id: 'neuro-initial',
    name: 'Neurological Initial Evaluation',
    type: 'initial-evaluation',
    specialty: 'neuro',
    sections: [
      {
        id: 'systems-review',
        title: 'Systems Review',
        fields: [
          {
            id: 'cardiovascular',
            type: 'checkbox',
            label: 'Cardiovascular',
            defaultValue: false
          },
          {
            id: 'cognitive-status',
            type: 'checkbox',
            label: 'Cognitive Status',
            defaultValue: true
          },
          {
            id: 'cranial-nerves',
            type: 'checkbox',
            label: 'Cranial Nerves',
            defaultValue: true
          },
          {
            id: 'neurological',
            type: 'checkbox',
            label: 'Neurological',
            defaultValue: true
          }
        ]
      },
      {
        id: 'reflex-testing',
        title: 'Reflex Testing',
        fields: [
          {
            id: 'biceps-reflex',
            type: 'select',
            label: 'Biceps Reflex',
            options: [
              { value: '0', label: '0 - Absent' },
              { value: '1', label: '1+ - Diminished' },
              { value: '2', label: '2+ - Normal' },
              { value: '3', label: '3+ - Increased' },
              { value: '4', label: '4+ - Hyperactive' }
            ]
          },
          {
            id: 'triceps-reflex',
            type: 'select',
            label: 'Triceps Reflex',
            options: [
              { value: '0', label: '0 - Absent' },
              { value: '1', label: '1+ - Diminished' },
              { value: '2', label: '2+ - Normal' },
              { value: '3', label: '3+ - Increased' },
              { value: '4', label: '4+ - Hyperactive' }
            ]
          },
          {
            id: 'patellar-reflex',
            type: 'select',
            label: 'Patellar Reflex',
            options: [
              { value: '0', label: '0 - Absent' },
              { value: '1', label: '1+ - Diminished' },
              { value: '2', label: '2+ - Normal' },
              { value: '3', label: '3+ - Increased' },
              { value: '4', label: '4+ - Hyperactive' }
            ]
          },
          {
            id: 'achilles-reflex',
            type: 'select',
            label: 'Achilles Reflex',
            options: [
              { value: '0', label: '0 - Absent' },
              { value: '1', label: '1+ - Diminished' },
              { value: '2', label: '2+ - Normal' },
              { value: '3', label: '3+ - Increased' },
              { value: '4', label: '4+ - Hyperactive' }
            ]
          }
        ]
      },
      {
        id: 'sensory-testing',
        title: 'Sensory Testing',
        fields: [
          {
            id: 'light-touch',
            type: 'select',
            label: 'Light Touch',
            options: [
              { value: 'intact', label: 'Intact' },
              { value: 'impaired', label: 'Impaired' },
              { value: 'absent', label: 'Absent' }
            ]
          },
          {
            id: 'proprioception',
            type: 'select',
            label: 'Proprioception',
            options: [
              { value: 'intact', label: 'Intact' },
              { value: 'impaired', label: 'Impaired' },
              { value: 'absent', label: 'Absent' }
            ]
          }
        ]
      },
      {
        id: 'coordination-testing',
        title: 'Coordination Testing',
        fields: [
          {
            id: 'finger-nose',
            type: 'select',
            label: 'Finger-to-Nose Test',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'mild-dysmetria', label: 'Mild Dysmetria' },
              { value: 'moderate-dysmetria', label: 'Moderate Dysmetria' },
              { value: 'severe-dysmetria', label: 'Severe Dysmetria' }
            ]
          },
          {
            id: 'heel-toe',
            type: 'select',
            label: 'Heel-to-Toe Walking',
            options: [
              { value: 'normal', label: 'Normal' },
              { value: 'mild-ataxia', label: 'Mild Ataxia' },
              { value: 'moderate-ataxia', label: 'Moderate Ataxia' },
              { value: 'severe-ataxia', label: 'Severe Ataxia' }
            ]
          }
        ]
      },
      {
        id: 'balance-gait',
        title: 'Balance & Gait Assessment',
        fields: [
          {
            id: 'tug-score',
            type: 'number',
            label: 'Timed Up and Go (TUG)',
            unit: 'seconds'
          },
          {
            id: 'berg-balance',
            type: 'number',
            label: 'Berg Balance Scale',
            min: 0,
            max: 56
          }
        ]
      },
      {
        id: 'outcome-measures',
        title: 'Neurological Outcome Measures',
        fields: [
          {
            id: 'modified-rankin',
            type: 'select',
            label: 'Modified Rankin Scale (mRS)',
            options: [
              { value: '0', label: '0 - No symptoms' },
              { value: '1', label: '1 - No significant disability' },
              { value: '2', label: '2 - Slight disability' },
              { value: '3', label: '3 - Moderate disability' },
              { value: '4', label: '4 - Moderately severe disability' },
              { value: '5', label: '5 - Severe disability' },
              { value: '6', label: '6 - Dead' }
            ]
          },
          {
            id: 'fim-score',
            type: 'number',
            label: 'Functional Independence Measure (FIM)',
            min: 18,
            max: 126
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Progress Note Template (General)
  {
    id: 'progress-general',
    name: 'SOAP Progress Note',
    type: 'progress-note',
    specialty: 'general',
    sections: [
      {
        id: 'session-info',
        title: 'Session Information',
        fields: [
          {
            id: 'session-number',
            type: 'number',
            label: 'Session Number',
            min: 1
          },
          {
            id: 'duration',
            type: 'number',
            label: 'Session Duration',
            unit: 'minutes',
            min: 15,
            max: 120
          }
        ]
      },
      {
        id: 'interventions-performed',
        title: 'Interventions Performed',
        fields: [
          {
            id: 'manual-therapy',
            type: 'checkbox',
            label: 'Manual Therapy',
            defaultValue: false
          },
          {
            id: 'therapeutic-exercise',
            type: 'checkbox',
            label: 'Therapeutic Exercise',
            defaultValue: false
          },
          {
            id: 'modalities',
            type: 'checkbox',
            label: 'Modalities',
            defaultValue: false
          },
          {
            id: 'patient-education',
            type: 'checkbox',
            label: 'Patient Education',
            defaultValue: false
          },
          {
            id: 'gait-training',
            type: 'checkbox',
            label: 'Gait Training',
            defaultValue: false
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
