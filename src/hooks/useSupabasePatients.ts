// src/hooks/useSupabasePatients.ts - Simple direct approach
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface DatabasePatient {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  id_number: string;
  phone?: string;
  cell_number?: string;
  email?: string;
  occupation?: string;
  dependent_code?: string;
  medical_aid_name?: string;
  medical_aid_number?: string;
  medical_aid_id?: string;
  main_member_id_number?: string;
  bank?: string;
  bank_account_number?: string;
  main_member_occupation?: string;
  employer_name?: string;
  referring_doctor?: string;
  family_doctor?: string;
  street?: string;
  city?: string;
  allergies?: string;
  medications?: string;
  medical_history?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientFormData {
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  phone?: string;
  cellNumber?: string;
  email?: string;
  occupation?: string;
  dependentCode?: string;
  medicalAidName?: string;
  medicalAidNumber?: string;
  medicalAidId?: string;
  mainMemberIdNumber?: string;
  bank?: string;
  bankAccountNumber?: string;
  mainMemberOccupation?: string;
  employerName?: string;
  referringDoctor?: string;
  familyDoctor?: string;
  street?: string;
  city?: string;
  allergies?: string;
  medications?: string;
  medicalHistory?: string;
}

export const useSupabasePatients = () => {
  const [patients, setPatients] = useState<DatabasePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patients
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      setPatients(data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add patient
  const addPatient = async (patientData: PatientFormData): Promise<DatabasePatient> => {
    try {
      setError(null);

      // Map form data to database format
      const dbPatient = {
        mrn: patientData.mrn,
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        id_number: patientData.idNumber,
        phone: patientData.phone || null,
        cell_number: patientData.cellNumber || null,
        email: patientData.email || null,
        occupation: patientData.occupation || null,
        dependent_code: patientData.dependentCode || null,
        medical_aid_name: patientData.medicalAidName || null,
        medical_aid_number: patientData.medicalAidNumber || null,
        medical_aid_id: patientData.medicalAidId || null,
        main_member_id_number: patientData.mainMemberIdNumber || null,
        bank: patientData.bank || null,
        bank_account_number: patientData.bankAccountNumber || null,
        main_member_occupation: patientData.mainMemberOccupation || null,
        employer_name: patientData.employerName || null,
        referring_doctor: patientData.referringDoctor || null,
        family_doctor: patientData.familyDoctor || null,
        street: patientData.street || null,
        city: patientData.city || null,
        allergies: patientData.allergies || null,
        medications: patientData.medications || null,
        medical_history: patientData.medicalHistory || null,
        status: 'active'
      };

      console.log('Inserting patient data:', dbPatient);

      const { data, error: supabaseError } = await supabase
        .from('patients')
        .insert([dbPatient])
        .select()
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      console.log('Patient created successfully:', data);

      // Update local state
      setPatients(prev => [data, ...prev]);

      toast({
        title: 'Success',
        description: `Patient ${patientData.firstName} ${patientData.lastName} added successfully`,
      });

      return data;
    } catch (err) {
      console.error('Error adding patient:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add patient';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update patient
  const updatePatient = async (patientId: string, patientData: Partial<PatientFormData>): Promise<DatabasePatient> => {
    try {
      setError(null);

      // Map form data to database format (only include fields that are provided)
      const dbUpdates: Partial<DatabasePatient> = {};
      
      if (patientData.mrn) dbUpdates.mrn = patientData.mrn;
      if (patientData.firstName) dbUpdates.first_name = patientData.firstName;
      if (patientData.lastName) dbUpdates.last_name = patientData.lastName;
      if (patientData.dateOfBirth) dbUpdates.date_of_birth = patientData.dateOfBirth;
      if (patientData.gender) dbUpdates.gender = patientData.gender;
      if (patientData.idNumber) dbUpdates.id_number = patientData.idNumber;
      if (patientData.phone !== undefined) dbUpdates.phone = patientData.phone || null;
      if (patientData.cellNumber !== undefined) dbUpdates.cell_number = patientData.cellNumber || null;
      if (patientData.email !== undefined) dbUpdates.email = patientData.email || null;
      if (patientData.occupation !== undefined) dbUpdates.occupation = patientData.occupation || null;
      if (patientData.dependentCode !== undefined) dbUpdates.dependent_code = patientData.dependentCode || null;
      if (patientData.medicalAidName !== undefined) dbUpdates.medical_aid_name = patientData.medicalAidName || null;
      if (patientData.medicalAidNumber !== undefined) dbUpdates.medical_aid_number = patientData.medicalAidNumber || null;
      if (patientData.medicalAidId !== undefined) dbUpdates.medical_aid_id = patientData.medicalAidId || null;
      if (patientData.mainMemberIdNumber !== undefined) dbUpdates.main_member_id_number = patientData.mainMemberIdNumber || null;
      if (patientData.bank !== undefined) dbUpdates.bank = patientData.bank || null;
      if (patientData.bankAccountNumber !== undefined) dbUpdates.bank_account_number = patientData.bankAccountNumber || null;
      if (patientData.mainMemberOccupation !== undefined) dbUpdates.main_member_occupation = patientData.mainMemberOccupation || null;
      if (patientData.employerName !== undefined) dbUpdates.employer_name = patientData.employerName || null;
      if (patientData.referringDoctor !== undefined) dbUpdates.referring_doctor = patientData.referringDoctor || null;
      if (patientData.familyDoctor !== undefined) dbUpdates.family_doctor = patientData.familyDoctor || null;
      if (patientData.street !== undefined) dbUpdates.street = patientData.street || null;
      if (patientData.city !== undefined) dbUpdates.city = patientData.city || null;
      if (patientData.allergies !== undefined) dbUpdates.allergies = patientData.allergies || null;
      if (patientData.medications !== undefined) dbUpdates.medications = patientData.medications || null;
      if (patientData.medicalHistory !== undefined) dbUpdates.medical_history = patientData.medicalHistory || null;

      const { data, error: supabaseError } = await supabase
        .from('patients')
        .update(dbUpdates)
        .eq('id', patientId)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      // Update local state
      setPatients(prev => prev.map(p => p.id === patientId ? data : p));

      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });

      return data;
    } catch (err) {
      console.error('Error updating patient:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Archive patient
  const archivePatient = async (patientId: string): Promise<void> => {
    try {
      setError(null);

      const { error: supabaseError } = await supabase
        .from('patients')
        .update({ status: 'inactive' })
        .eq('id', patientId);

      if (supabaseError) {
        throw supabaseError;
      }

      // Update local state
      setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, status: 'inactive' } : p
      ));

      toast({
        title: 'Success',
        description: 'Patient archived successfully',
      });
    } catch (err) {
      console.error('Error archiving patient:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive patient';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    archivePatient,
    refreshPatients: loadPatients,
  };
};
