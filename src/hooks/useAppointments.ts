
import { useSupabaseAppointments } from './useSupabaseAppointments';
import { useSpecialEventOperations } from './useSpecialEventOperations';

// This hook now acts as a wrapper around the Supabase implementation
// to maintain backward compatibility with existing components
export const useAppointments = () => {
  const supabaseHook = useSupabaseAppointments();
  
  const specialEventOperations = useSpecialEventOperations(
    supabaseHook.specialEvents,
    () => supabaseHook.refreshData()
  );

  return {
    ...supabaseHook,
    ...specialEventOperations
  };
};
