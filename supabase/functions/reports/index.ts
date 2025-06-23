import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PatientData {
  id: string;
  patient_name: string;
  case_number: string;
  occupation: string;
  date_of_birth: string;
  referring_dr: string;
  date_of_initial_ax: string;
  case_manager: string;
  facility: string;
  physiotherapist: string;
  diagnosis: string;
  medical_aid: string;
  medical_aid_number: string;
  home_address: string;
}

interface ClinicalNote {
  note_type: string;
  content: string;
  note_date: string;
}

interface JointMeasurement {
  joint: string;
  initial_rom: string;
  current_rom: string;
  comment: string;
}

interface MuscleStrength {
  muscle_group: string;
  initial_strength: string;
  current_strength: string;
  comment: string;
}

interface ActivityDailyLiving {
  activity: string;
  initial_level: string;
  current_level: string;
  comment: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    
    // Expected path: /reports/{type}/{id}
    if (pathParts.length < 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid path. Expected /reports/{type}/{id}' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const reportType = pathParts[2] // 'general' or 'mva'
    const identifier = pathParts[3] // patientId or caseNumber

    if (reportType !== 'general' && reportType !== 'mva') {
      return new Response(
        JSON.stringify({ error: 'Report type must be "general" or "mva"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch patient data
    let patientQuery = supabase.from('patients').select('*')
    
    // Check if identifier is UUID (patient ID) or case number
    if (identifier.includes('-')) {
      patientQuery = patientQuery.eq('id', identifier)
    } else {
      patientQuery = patientQuery.eq('case_number', identifier)
    }

    const { data: patientData, error: patientError } = await patientQuery.single()

    if (patientError || !patientData) {
      return new Response(
        JSON.stringify({ error: 'Patient not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch clinical notes
    const { data: clinicalNotes } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('patient_id', patientData.id)
      .order('note_date', { ascending: true })

    // Fetch joint measurements
    const { data: jointMeasurements } = await supabase
      .from('joint_measurements')
      .select('*')
      .eq('patient_id', patientData.id)

    // Fetch muscle strength data
    const { data: muscleStrength } = await supabase
      .from('muscle_strength')
      .select('*')
      .eq('patient_id', patientData.id)

    // Fetch activities of daily living
    const { data: activities } = await supabase
      .from('activities_daily_living')
      .select('*')
      .eq('patient_id', patientData.id)

    // Generate narrative text based on type
    let narrativeText: string

    if (reportType === 'general') {
      narrativeText = generateGeneralReportNarrative(patientData, clinicalNotes || [])
    } else {
      narrativeText = generateMVAReportNarrative(patientData, clinicalNotes || [], jointMeasurements || [], muscleStrength || [], activities || [])
    }

    // Apply LanguageTool grammar checking
    const correctedText = await checkGrammarWithLanguageTool(narrativeText)

    // Return the corrected narrative text
    const reportData = {
      narrativeText: correctedText,
      originalData: reportType === 'general' 
        ? generateGeneralReportData(patientData, clinicalNotes || [])
        : generateMVAReportData(patientData, clinicalNotes || [], jointMeasurements || [], muscleStrength || [], activities || [])
    }

    return new Response(
      JSON.stringify(reportData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateGeneralReportNarrative(patient: PatientData, notes: ClinicalNote[]): string {
  const assessmentNotes = notes.filter(n => n.note_type === 'assessment').map(n => n.content).join(' ')
  const treatmentNotes = notes.filter(n => n.note_type === 'treatment_plan').map(n => n.content).join(' ')
  const reassessmentNotes = notes.filter(n => n.note_type === 'reassessment').map(n => n.content).join(' ')
  const recommendationNotes = notes.filter(n => n.note_type === 'recommendations').map(n => n.content).join(' ')

  return `
PHYSIOTHERAPY REPORT

Patient: ${patient.patient_name || 'Not specified'}
Date of Birth: ${patient.date_of_birth || 'Not specified'}
Medical Aid: ${patient.medical_aid || 'Not specified'} (${patient.medical_aid_number || 'Not specified'})
Occupation: ${patient.occupation || 'Not specified'}
Physiotherapist: ${patient.physiotherapist || 'Not specified'}
Referral Diagnosis: ${patient.diagnosis || 'Not specified'}
Report Date: ${new Date().toLocaleDateString()}

ASSESSMENT:
${assessmentNotes || 'No assessment notes available.'}

TREATMENT PLAN:
${treatmentNotes || 'No treatment plan notes available.'}

REASSESSMENT:
${reassessmentNotes || 'No reassessment notes available.'}

RECOMMENDATIONS:
${recommendationNotes || 'No recommendations available.'}

Kind regards,

${patient.physiotherapist || 'Physiotherapist'}
BSc Physiotherapy
  `.trim()
}

function generateMVAReportNarrative(
  patient: PatientData, 
  notes: ClinicalNote[], 
  joints: JointMeasurement[], 
  muscles: MuscleStrength[], 
  activities: ActivityDailyLiving[]
): string {
  const historyNotes = notes.filter(n => n.note_type === 'history').map(n => n.content).join(' ')
  const findingsNotes = notes.filter(n => n.note_type === 'findings').map(n => n.content).join(' ')
  const assessmentNotes = notes.filter(n => n.note_type === 'assessment').map(n => n.content).join(' ')
  const recommendationNotes = notes.filter(n => n.note_type === 'recommendations').map(n => n.content).join(' ')

  let jointText = ''
  if (joints.length > 0) {
    jointText = 'Joint Range of Motion findings include: ' + joints.map(j => 
      `${j.joint} with initial ROM of ${j.initial_rom || 'not recorded'}${j.comment ? ` (${j.comment})` : ''}`
    ).join(', ') + '.'
  }

  let muscleText = ''
  if (muscles.length > 0) {
    muscleText = 'Muscle strength assessment shows: ' + muscles.map(m => 
      `${m.muscle_group} with initial strength of ${m.initial_strength || 'not recorded'}${m.comment ? ` (${m.comment})` : ''}`
    ).join(', ') + '.'
  }

  let activitiesText = ''
  if (activities.length > 0) {
    activitiesText = 'Activities of Daily Living assessment reveals: ' + activities.map(a => 
      `${a.activity} with initial level of ${a.initial_level || 'not recorded'}${a.comment ? ` (${a.comment})` : ''}`
    ).join(', ') + '.'
  }

  return `
MVA INITIAL PHYSIOTHERAPY REPORT

Patient Name: ${patient.patient_name || 'Not specified'}
Case Number: ${patient.case_number || 'Not specified'}
Occupation: ${patient.occupation || 'Not specified'}
Date of Birth: ${patient.date_of_birth || 'Not specified'}
Referring Doctor: ${patient.referring_dr || 'Not specified'}
Date of Initial Assessment: ${patient.date_of_initial_ax || 'Not specified'}
Case Manager: ${patient.case_manager || 'Not specified'}
Report Date: ${new Date().toLocaleDateString()}
Facility: ${patient.facility || 'Not specified'}
Physiotherapist: ${patient.physiotherapist || 'Not specified'}
Diagnosis: ${patient.diagnosis || 'Not specified'}

HISTORY:
${historyNotes || assessmentNotes || 'No history notes available.'}

HOME ADDRESS:
${patient.home_address || 'Not specified'}

INVESTIGATIONS AND SPECIAL TESTS:
${findingsNotes || 'No special tests or investigations documented.'}

PHYSICAL ASSESSMENT:
${jointText}

${muscleText}

${activitiesText}

OTHER FINDINGS:
${findingsNotes || 'No additional findings documented.'}

PHYSIOTHERAPY KEY GOALS:
Improve functional mobility and reduce pain associated with motor vehicle accident injuries.

RECOMMENDATIONS:
${recommendationNotes || 'Continue physiotherapy treatment as clinically indicated.'}

${patient.physiotherapist || 'Physiotherapist'}
BSc Physiotherapy
  `.trim()
}

function generateGeneralReportData(patient: PatientData, notes: ClinicalNote[]) {
  const assessmentNotes = notes.filter(n => n.note_type === 'assessment').map(n => n.content).join(' ')
  const treatmentNotes = notes.filter(n => n.note_type === 'treatment_plan').map(n => n.content).join(' ')
  const reassessmentNotes = notes.filter(n => n.note_type === 'reassessment').map(n => n.content).join(' ')
  const recommendationNotes = notes.filter(n => n.note_type === 'recommendations').map(n => n.content).join(' ')

  return {
    patient_info: {
      patient_name: patient.patient_name || '',
      date_of_birth: patient.date_of_birth || '',
      medical_aid: patient.medical_aid || '',
      medical_aid_number: patient.medical_aid_number || '',
      occupation: patient.occupation || '',
      physiotherapist: patient.physiotherapist || '',
      referral_diagnosis: patient.diagnosis || '',
      report_date: new Date().toISOString().split('T')[0]
    },
    assessment: assessmentNotes || '',
    treatment_plan: treatmentNotes || '',
    reassessment: reassessmentNotes || '',
    recommendations: recommendationNotes || '',
    sign_off: {
      salutation: 'Kind regards',
      therapist_name: patient.physiotherapist || '',
      therapist_credentials: 'BSc Physiotherapy'
    }
  }
}

function generateMVAReportData(
  patient: PatientData, 
  notes: ClinicalNote[], 
  joints: JointMeasurement[], 
  muscles: MuscleStrength[], 
  activities: ActivityDailyLiving[]
) {
  const historyNotes = notes.filter(n => n.note_type === 'history').map(n => n.content).join(' ')
  const findingsNotes = notes.filter(n => n.note_type === 'findings').map(n => n.content).join(' ')
  const assessmentNotes = notes.filter(n => n.note_type === 'assessment').map(n => n.content).join(' ')
  const recommendationNotes = notes.filter(n => n.note_type === 'recommendations').map(n => n.content).join(' ')

  return {
    report_header: {
      patient_name: patient.patient_name || '',
      case_number: patient.case_number || '',
      occupation: patient.occupation || '',
      date_of_birth: patient.date_of_birth || '',
      referring_dr: patient.referring_dr || '',
      date_of_initial_ax: patient.date_of_initial_ax || '',
      case_manager: patient.case_manager || '',
      date_of_report: new Date().toISOString().split('T')[0],
      facility: patient.facility || '',
      physiotherapist: patient.physiotherapist || '',
      diagnosis: patient.diagnosis || ''
    },
    history: historyNotes || assessmentNotes || '',
    home_address: patient.home_address || '',
    investigations_and_special_tests: findingsNotes || '',
    joint_range_of_motion: joints.map(j => ({
      joint: j.joint,
      initial_rom: j.initial_rom || '',
      comment: j.comment || ''
    })),
    muscle_strength: muscles.map(m => ({
      key_group_or_muscle: m.muscle_group,
      initial_strength: m.initial_strength || '',
      comment: m.comment || ''
    })),
    activities_of_daily_living: activities.map(a => ({
      activity: a.activity,
      level_of_independence: a.initial_level || ''
    })),
    activities_of_daily_living_cont: activities.map(a => ({
      activity: a.activity,
      level_of_independence: a.current_level || '',
      comment: a.comment || ''
    })),
    any_other_findings: findingsNotes || '',
    physiotherapy_key_goals: 'Improve functional mobility and reduce pain',
    recommendations: recommendationNotes || ''
  }
}

async function checkGrammarWithLanguageTool(text: string): Promise<string> {
  try {
    // LanguageTool API integration
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'text': text,
        'language': 'en-US',
        'enabledOnly': 'false'
      }),
    });

    if (!response.ok) {
      console.error('LanguageTool API error:', response.status);
      return text; // Return original text if API fails
    }

    const result = await response.json();
    let correctedText = text;

    // Apply corrections in reverse order to maintain string positions
    if (result.matches && result.matches.length > 0) {
      const matches = result.matches.sort((a: any, b: any) => b.offset - a.offset);
      
      for (const match of matches) {
        if (match.replacements && match.replacements.length > 0) {
          const replacement = match.replacements[0].value;
          const start = match.offset;
          const end = start + match.length;
          correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
        }
      }
    }

    console.log('Grammar check completed. Found', result.matches?.length || 0, 'suggestions');
    return correctedText;
  } catch (error) {
    console.error('Error checking grammar with LanguageTool:', error);
    return text; // Return original text if grammar check fails
  }
}
