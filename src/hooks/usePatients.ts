
import { useState, useEffect } from 'react';
import { Patient, Diagnosis } from '@/types/clinical';
import { useOfflineStorage } from './useOfflineStorage';
import { toast } from '@/components/ui/use-toast';

const STORAGE_CONFIG = {
  dbName: 'EiraPatients',
  version: 1,
  stores: [
    {
      name: 'patients',
      keyPath: 'id',
      indexes: [
        { name: 'mrn', keyPath: 'mrn', unique: true },
        { name: 'lastName', keyPath: 'lastName' },
        { name: 'status', keyPath: 'status' },
        { name: 'idNumber', keyPath: 'idNumber' }
      ]
    }
  ]
};

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = useOfflineStorage(STORAGE_CONFIG);

  useEffect(() => {
    loadPatients();
  }, [storage.db]);

  const loadPatients = async () => {
    if (!storage.db) return;
    
    try {
      const allPatients = await storage.getAllFromStore('patients') as Patient[];
      setPatients(allPatients || []);
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
      id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        medicalAidNumber: patientData.medicalAidNumber || '',
        medicalAidId: patientData.medicalAidId || '',
        idNumber: patientData.mainMemberIdNumber || '',
        bank: patientData.bank || '',
        bankAccountNumber: patientData.bankAccountNumber || '',
        occupation: patientData.mainMemberOccupation || '',
        employerName: patientData.employerName || '',
        referringDoctor: patientData.referringDoctor || undefined,
        familyDoctor: patientData.familyDoctor || undefined,
      } : undefined,
      
      // Address (simplified)
      address: patientData.street ? {
        street: patientData.street,
        city: patientData.city || '',
      } : undefined,
      
      // Next of kin contacts
      nextOfKin1: patientData.nextOfKin1Name ? {
        name: patientData.nextOfKin1Name,
        relationship: patientData.nextOfKin1Relationship || '',
        phone: patientData.nextOfKin1Phone || '',
        idNumber: patientData.nextOfKin1IdNumber || undefined,
        email: patientData.nextOfKin1Email || undefined,
      } : undefined,
      
      nextOfKin2: patientData.nextOfKin2Name ? {
        name: patientData.nextOfKin2Name,
        relationship: patientData.nextOfKin2Relationship || '',
        phone: patientData.nextOfKin2Phone || '',
        idNumber: patientData.nextOfKin2IdNumber || undefined,
        email: patientData.nextOfKin2Email || undefined,
      } : undefined,
      
      // Medical information
      allergies: patientData.allergies ? patientData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medications: patientData.medications ? patientData.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medicalHistory: patientData.medicalHistory ? patientData.medicalHistory.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      diagnoses: patientData.diagnoses || [],
      
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.saveToStore('patients', newPatient);
      setPatients(prev => [...prev, newPatient]);
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'CREATE_PATIENT', 
          data: newPatient 
        });
      }

      toast({
        title: 'Success',
        description: 'Patient added successfully',
      });

      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to add patient',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePatient = async (patientId: string, patientData: any): Promise<Patient> => {
    const existingPatient = patients.find(p => p.id === patientId);
    if (!existingPatient) throw new Error('Patient not found');

    const updatedPatient: Patient = {
      ...existingPatient,
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
        medicalAidNumber: patientData.medicalAidNumber || '',
        medicalAidId: patientData.medicalAidId || '',
        idNumber: patientData.mainMemberIdNumber || '',
        bank: patientData.bank || '',
        bankAccountNumber: patientData.bankAccountNumber || '',
        occupation: patientData.mainMemberOccupation || '',
        employerName: patientData.employerName || '',
        referringDoctor: patientData.referringDoctor || undefined,
        familyDoctor: patientData.familyDoctor || undefined,
      } : undefined,
      
      // Address (simplified)
      address: patientData.street ? {
        street: patientData.street,
        city: patientData.city || '',
      } : undefined,
      
      // Next of kin contacts
      nextOfKin1: patientData.nextOfKin1Name ? {
        name: patientData.nextOfKin1Name,
        relationship: patientData.nextOfKin1Relationship || '',
        phone: patientData.nextOfKin1Phone || '',
        idNumber: patientData.nextOfKin1IdNumber || undefined,
        email: patientData.nextOfKin1Email || undefined,
      } : undefined,
      
      nextOfKin2: patientData.nextOfKin2Name ? {
        name: patientData.nextOfKin2Name,
        relationship: patientData.nextOfKin2Relationship || '',
        phone: patientData.nextOfKin2Phone || '',
        idNumber: patientData.nextOfKin2IdNumber || undefined,
        email: patientData.nextOfKin2Email || undefined,
      } : undefined,
      
      // Medical information
      allergies: patientData.allergies ? patientData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medications: patientData.medications ? patientData.medications.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      medicalHistory: patientData.medicalHistory ? patientData.medicalHistory.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      diagnoses: patientData.diagnoses || [],
      
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.saveToStore('patients', updatedPatient);
      setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'UPDATE_PATIENT', 
          data: updatedPatient 
        });
      }

      toast({
        title: 'Success',
        description: 'Patient updated successfully',
      });

      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: 'Error',
        description: 'Failed to update patient',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const archivePatient = async (patientId: string): Promise<void> => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    const archivedPatient = {
      ...patient,
      status: 'inactive' as const,
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.saveToStore('patients', archivedPatient);
      setPatients(prev => prev.map(p => p.id === patientId ? archivedPatient : p));
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'ARCHIVE_PATIENT', 
          data: { id: patientId } 
        });
      }

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
    const patient = patients.find(p => p.id === patientId);
    if (!patient) throw new Error('Patient not found');

    const unarchivedPatient = {
      ...patient,
      status: 'active' as const,
      updatedAt: new Date().toISOString(),
    };

    try {
      await storage.saveToStore('patients', unarchivedPatient);
      setPatients(prev => prev.map(p => p.id === patientId ? unarchivedPatient : p));
      
      if (!storage.isOnline) {
        storage.addToSyncQueue({ 
          type: 'UNARCHIVE_PATIENT', 
          data: { id: patientId } 
        });
      }

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
    isOffline: !storage.isOnline,
  };
};
