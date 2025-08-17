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
}

export interface ReportPayload {
  patient_id: string;
  report_type: "initial" | "progress" | "discharge" | "mva_initial" | "mva_progress" | "mva_discharge" | "motivational_letter";
}

export interface GeneratedReport {
  id: string;
  file_path: string;
}

export const usePatients = () => {
  return useQuery<{ data: Patient[] | null }>(
    {
      queryKey: ["patients"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("patients")
          .select(
            `id, patient_name:firstName, case_number:mrn, occupation, date_of_birth:dateOfBirth, referring_dr:referringDoctor, date_of_initial_ax:dateOfInitialAx, case_manager:mainMemberOccupation, facility:employerName, physiotherapist` // Map to expected fields
          );

        if (error) throw error;
        return { data };
      },
    }
  );
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation<GeneratedReport, Error, ReportPayload>({
    mutationFn: async (payload) => {
      console.log("Generating report with payload:", payload);

const { data, error } = await supabase.functions.invoke("reports", {
  body: payload,
});

      if (error) {
        console.error("Error generating report:", error);
        toast.error("Failed to generate report");
        throw error;
      }

      if (!data || !data.file_path) {
        console.error("Invalid response from report generation:", data);
        toast.error("Invalid response from report generation");
        throw new Error("Invalid response from report generation");
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Report generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      console.error("Error in useGenerateReport:", error);
    },
  });
};

export const useDownloadReport = () => {
  return useMutation<{ success: boolean }, Error, { filePath: string }>(
    {
      mutationFn: async ({ filePath }) => {
        console.log("Downloading report from:", filePath);

        const { data, error } = await supabase.storage
          .from("reports")
          .download(filePath.replace("public/", "")); // Ensure correct path for download

        if (error) {
          console.error("Download error:", error);
          toast.error("Failed to download report");
          throw error;
        }

        // Create a blob URL and trigger the download
        const url = URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = filePath.split("/").pop() || "report.pdf"; // Use default filename if none found
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
    }
  );
};
