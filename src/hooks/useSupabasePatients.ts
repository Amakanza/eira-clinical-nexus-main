import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SupabasePatient {
  id: string;
  patient_name: string;
  case_number?: string;
  occupation?: string;
  date_of_birth?: string;
  referring_dr?: string;
  date_of_initial_ax?: string;
  case_manager?: string;
  facility?: string;
  physiotherapist?: string;
  diagnosis?: string;
  medical_aid?: string;
  medical_aid_number?: string;
  home_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientFormData {
  patient_name: string;
  case_number?: string;
  occupation?: string;
  date_of_birth?: string;
  referring_dr?: string;
  date_of_initial_ax?: string;
  case_manager?: string;
  facility?: string;
  physiotherapist?: string;
  diagnosis?: string;
  medical_aid?: string;
  medical_aid_number?: string;
  home_address?: string;
}

export const useSupabasePatients = () => {
  const queryClient = useQueryClient();

  // Fetch all patients
  const patientsQuery = useQuery({
    queryKey: ["supabase-patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupabasePatient[];
    },
  });

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: PatientFormData) => {
      const { data, error } = await supabase
        .from("patients")
        .insert([patientData])
        .select()
        .single();

      if (error) throw error;
      return data as SupabasePatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-patients"] });
      toast.success("Patient created successfully!");
    },
    onError: (error: Error) => {
      console.error("Error creating patient:", error);
      toast.error(error.message || "Failed to create patient");
    },
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, ...patientData }: { id: string } & Partial<PatientFormData>) => {
      const { data, error } = await supabase
        .from("patients")
        .update(patientData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SupabasePatient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-patients"] });
      toast.success("Patient updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Error updating patient:", error);
      toast.error(error.message || "Failed to update patient");
    },
  });

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("patients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-patients"] });
      toast.success("Patient deleted successfully!");
    },
    onError: (error: Error) => {
      console.error("Error deleting patient:", error);
      toast.error(error.message || "Failed to delete patient");
    },
  });

  return {
    patients: patientsQuery.data || [],
    isLoading: patientsQuery.isLoading,
    error: patientsQuery.error,
    createPatient: createPatientMutation.mutateAsync,
    updatePatient: updatePatientMutation.mutateAsync,
    deletePatient: deletePatientMutation.mutateAsync,
    isCreating: createPatientMutation.isPending,
    isUpdating: updatePatientMutation.isPending,
    isDeleting: deletePatientMutation.isPending,
  };
};