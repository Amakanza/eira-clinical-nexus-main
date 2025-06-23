
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Patient {
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

export interface ReportData {
  patient_info?: any;
  report_header?: any;
  assessment?: string;
  treatment_plan?: string;
  reassessment?: string;
  recommendations?: string;
  sign_off?: any;
  [key: string]: any;
}

export const usePatients = () => {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: 'general' | 'mva'; id: string }) => {
      console.log(`Generating ${type} report for ${id}`);
      
      const response = await fetch(`https://anmxvcoleucxybtowpnm.supabase.co/functions/v1/reports/${type}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubXh2Y29sZXVjeHlidG93cG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTA3NzIsImV4cCI6MjA2NjI4Njc3Mn0.82tFr2l-RrpADwaYRhDLKEWxDNhkaBGZD4d_Hq5QA4M`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      return await response.json() as ReportData;
    },
    onSuccess: () => {
      toast.success("Report generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: Error) => {
      console.error("Error generating report:", error);
      toast.error(error.message || "Failed to generate report");
    },
  });
};

export const useDownloadReport = () => {
  return useMutation({
    mutationFn: async ({ 
      reportData, 
      type, 
      patientName 
    }: { 
      reportData: ReportData; 
      type: 'general' | 'mva'; 
      patientName: string 
    }) => {
      // Create a downloadable JSON file for now
      // In production, this would generate a Word document
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_report_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Report downloaded successfully!");
    },
    onError: (error: Error) => {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    },
  });
};
