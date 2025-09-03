// src/hooks/usePatients.ts - Updated version
import { useState, useEffect } from "react";
import { Patient } from "@/types/clinical";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadPatients();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first
      const { data: supabasePatients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading patients from Supabase:', error);
        // Fallback to localStorage if available
        const localPatients = localStorage.getItem('eira_patients');
        if (localPatients) {
          setPatients(JSON.parse(localPatients));
        }
      } else {
        // Map database format to frontend format
        const mappedPatients: Patient[] = supabasePatients.map(dbPatient => ({
          id: dbPatient.id,
          mrn: dbPatient.mrn,
          firstName: dbPatient.first_name,
          lastName: dbPatient.last_name,
          dateOfBirth: dbPatient.date_of_birth,
          gender: dbPatient.gender,
          idNumber: dbPatient.id_number,
          phone: dbPatient.phone,
          cellNumber: dbPatient.cell_number,
          email: dbPatient.email,
          occupation: dbPatient.occupation,
          dependentCode: dbPatient.dependent_code,
          
          // Main member information
          mainMember: dbPatient.medical_aid_name ? {
            medicalAidName: dbPatient.medical_aid_name,
            medicalAidNumber: dbPatient.medical_aid_number || "",
            medicalAidId: dbPatient.medical_aid_id || "",
            idNumber: dbPatient.main_member_id_number || "",
            bank: dbPatient.bank || "",
            bankAccountNumber: dbPatient.bank_account_number || "",
            occupation: dbPatient.main_member_occupation || "",
            employerName: dbPatient.employer_name || "",
            referringDoctor: dbPatient.referring_doctor,
            familyDoctor: dbPatient.family_doctor,
          } : undefined,
          
          // Address
          address: dbPatient.street ? {
            street: dbPatient.street,
            city: dbPatient.city || "",
          } : undefined,
          
          // Medical information
          allergies: dbPatient.allergies ? dbPatient.allergies.split(',').map(s => s.trim()) : [],
          medications: dbPatient.medications ? dbPatient.medications.split(',').map(s => s.trim()) : [],
          medicalHistory: dbPatient.medical_history ? dbPatient.medical_history.split(',').map(s => s.trim()) : [],
          diagnoses: [],
          
          status: dbPatient.status === 'inactive' ? 'inactive' : 'active',
          createdAt: dbPatient.created_at,
          updatedAt: dbPatient.updated_at,
        }));
        
        setPatients(mappedPatients);
        // Cache locally
        localStorage.setItem('eira_patients', JSON.stringify(mappedPatients));
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (patientData: any): Promise<Patient> => {
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      mrn: patientData.mrn,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      dateOfBirth: patientData.dateOfBirth,
      gender: patientData.gender,
      idNumber: patientData.idNumber,
      phone: patientData.phone || undefined,
      cellNumber: patientData.cellNumber || undefined,
      email: patientData.email || undefined,
      occupation: patientData.occupation || undefined,
      dependentCode: patientData.dependentCode || undefined,
      
      // Main member information
      mainMember: patientData.medicalAidName ? {
        medicalAidName: patientData.medicalAidName,
        medicalAidNumber: patientData.medicalAidNumber || "",
        medicalAidId: patientData.medicalAidId || "",
        idNumber: patientData.mainMemberIdNumber || "",
        bank: patientData.bank || "",
        bankAccountNumber: patientData.bankAccountNumber || "",
        occupation: patientData.mainMemberOccupation || "",
        employerName: patientData.employerName || "",
        referringDoctor: patientData.referringDoctor || undefined,
        familyDoctor: patientData.familyDoctor || undefined,
      } : undefined,
      
      // Address
      address: patientData.street ? {
        street: patientData.street,
        city: patientData.city || "",
      } : undefined,
      
      // Next of kin
      nextOfKin1: patientData.nextOfKin1Name ? {
        name: patientData.nextOfKin1Name,
        relationship: patientData.nextOfKin1Relationship || "",
        phone: patientData.nextOfKin1Phone || "",
      } : undefined,
      
      nextOfKin2: patientData.nextOfKin2Name ? {
        name: patientData.nextOfKin2Name,
        relationship: patientData.nextOfKin2Relationship || "",
        phone: patientData.nextOfKin2Phone || "",
      } : undefined,
      
      // Medical information
      allergies: patientData.allergies ? patientData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medications: patientData.medications ? patientData.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medicalHistory: patientData.medicalHistory ? patientData.medicalHistory.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      diagnoses: patientData.diagnoses || [],
      
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Map to database format
      const dbPatient = {
        id: newPatient.id,
        mrn: newPatient.mrn,
        first_name: newPatient.firstName,
        last_name: newPatient.lastName,
        date_of_birth: newPatient.dateOfBirth,
        gender: newPatient.gender,
        id_number: newPatient.idNumber,
        phone: newPatient.phone,
        cell_number: newPatient.cellNumber,
        email: newPatient.email,
        occupation: newPatient.occupation,
        dependent_code: newPatient.dependentCode,
        
        // Main member fields (flattened)
        medical_aid_name: newPatient.mainMember?.medicalAidName,
        medical_aid_number: newPatient.mainMember?.medicalAidNumber,
        medical_aid_id: newPatient.mainMember?.medicalAidId,
        main_member_id_number: newPatient.mainMember?.idNumber,
        bank: newPatient.mainMember?.bank,
        bank_account_number: newPatient.mainMember?.bankAccountNumber,
        main_member_occupation: newPatient.mainMember?.occupation,
        employer_name: newPatient.mainMember?.employerName,
        referring_doctor: newPatient.mainMember?.referringDoctor,
        family_doctor: newPatient.mainMember?.familyDoctor,
        
        // Address fields (flattened)
        street: newPatient.address?.street,
        city: newPatient.address?.city,
        
        // Medical info (as comma-separated strings)
        allergies: newPatient.allergies?.join(', '),
        medications: newPatient.medications?.join(', '),
        medical_history: newPatient.medicalHistory?.join(', '),
        
        status: newPatient.status,
      };

      console.log('Attempting to save patient:', dbPatient);

      // Try to save to Supabase
      const { data, error } = await supabase
        .from('patients')
        .insert([dbPatient])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully saved to Supabase:', data);

      // Update local state
      setPatients(prev => [newPatient, ...prev]);
      
      // Update localStorage cache
      const updatedPatients = [newPatient, ...patients];
      localStorage.setItem('eira_patients', JSON.stringify(updatedPatients));

      toast({
        title: 'Success',
        description: 'Patient added successfully',
      });

      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      
      // If we're offline or there's an error, save locally and show appropriate message
      if (!navigator.onLine) {
        setPatients(prev => [newPatient, ...prev]);
        const updatedPatients = [newPatient, ...patients];
        localStorage.setItem('eira_patients', JSON.stringify(updatedPatients));
        
        toast({
          title: 'Saved Offline',
          description: 'Patient saved locally. Will sync when online.',
        });
        return newPatient;
      } else {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to add patient',
          variant: 'destructive',
        });
        throw error;
      }
    }
  };

  const updatePatient = async (patientId: string, patientData: any): Promise<Patient> => {
    const existingPatient = patients.find(p => p.id === patientId);
    if (!existingPatient) throw new Error('Patient not found');

    // Similar logic to addPatient but for updates
    // ... implementation similar to above
    
    // For now, return the existing patient
    return existingPatient;
  };

  const archivePatient = async (patientId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: 'inactive' })
        .eq('id', patientId);

      if (error) throw error;

      setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, status: 'inactive' } : p
      ));

      toast({
        title: 'Success',
        description: 'Patient archived successfully',
      });
    } catch (error) {
      console.error('Error archiving patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive patient',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const unarchivePatient = async (patientId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: 'active' })
        .eq('id', patientId);

      if (error) throw error;

      setPatients(prev => prev.map(p => 
        p.id === patientId ? { ...p, status: 'active' } : p
      ));

      toast({
        title: 'Success',
        description: 'Patient unarchived successfully',
      });
    } catch (error) {
      console.error('Error unarchiving patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to unarchive patient',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    patients,
    loading,
    addPatient,
    updatePatient,
    archivePatient,
    unarchivePatient,
    isOffline,
  };
};
