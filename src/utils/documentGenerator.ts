
// Document generation utilities
// In production, this would use libraries like docxtemplater or @nativedocx/docx

export interface DocumentTemplate {
  type: 'general' | 'mva';
  placeholders: string[];
}

export const DOCUMENT_TEMPLATES: Record<string, DocumentTemplate> = {
  general: {
    type: 'general',
    placeholders: [
      'patient_name',
      'date_of_birth',
      'medical_aid',
      'medical_aid_number',
      'occupation',
      'physiotherapist',
      'referral_diagnosis',
      'report_date',
      'assessment',
      'treatment_plan',
      'reassessment',
      'recommendations',
      'salutation',
      'therapist_name',
      'therapist_credentials'
    ]
  },
  mva: {
    type: 'mva',
    placeholders: [
      'patient_name',
      'case_number',
      'occupation',
      'date_of_birth',
      'referring_dr',
      'date_of_initial_ax',
      'case_manager',
      'date_of_report',
      'facility',
      'physiotherapist',
      'diagnosis',
      'history',
      'home_address',
      'investigations_and_special_tests',
      'any_other_findings',
      'physiotherapy_key_goals',
      'recommendations'
    ]
  }
};

export const generateWordDocument = async (
  reportData: any,
  templateType: 'general' | 'mva'
): Promise<Blob> => {
  // Placeholder implementation
  // In production, you would:
  // 1. Load the appropriate .docx template file
  // 2. Use docxtemplater to replace placeholders
  // 3. Apply LanguageTool grammar corrections
  // 4. Return the generated document as a Blob

  console.log('Generating Word document for template:', templateType);
  console.log('Report data:', reportData);

  // For now, return a simple text file
  const content = JSON.stringify(reportData, null, 2);
  return new Blob([content], { type: 'application/json' });
};

export const validateReportData = (
  reportData: any,
  templateType: 'general' | 'mva'
): { isValid: boolean; missingFields: string[] } => {
  const template = DOCUMENT_TEMPLATES[templateType];
  const missingFields: string[] = [];

  // Check for missing required fields
  template.placeholders.forEach(placeholder => {
    if (!getNestedValue(reportData, placeholder)) {
      missingFields.push(placeholder);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Grammar checking utility (placeholder for LanguageTool integration)
export const checkGrammar = async (text: string): Promise<string> => {
  // In production, integrate with LanguageTool API
  console.log('Checking grammar for text length:', text.length);
  
  // Placeholder: just return the original text
  return text;
};
