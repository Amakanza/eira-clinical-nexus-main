
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

    // Generate report based on type
    let reportData: any

    if (reportType === 'general') {
      reportData = generateGeneralReport(patientData, clinicalNotes || [])
    } else {
      reportData = generateMVAReport(patientData, clinicalNotes || [], jointMeasurements || [], muscleStrength || [], activities || [])
    }

    // Apply grammar checking (simplified - in production you'd integrate with LanguageTool)
    const correctedReport = await applyGrammarCorrections(reportData)

    return new Response(
      JSON.stringify(correctedReport),
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

function generateGeneralReport(patient: PatientData, notes: ClinicalNote[]) {
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

function generateMVAReport(
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

async function applyGrammarCorrections(reportData: any): Promise<any> {
  // Simplified grammar correction - in production, integrate with LanguageTool API
  // For now, just return the data as-is
  console.log('Applying grammar corrections...')
  
  // You would implement LanguageTool integration here:
  // const correctedText = await checkGrammar(JSON.stringify(reportData))
  
  return reportData
}
