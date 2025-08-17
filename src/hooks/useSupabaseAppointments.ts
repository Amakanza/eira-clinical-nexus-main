import { useState, useEffect } from 'react';
import { Appointment, TimeSlot, Room, User, SpecialEvent } from '@/types/clinical';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateAppointment } from '@/utils/appointmentValidation';
import { useAppointmentQueries } from './useAppointmentQueries';

export const useSupabaseAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clinicians, setClinicians] = useState<User[]>([]);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Add real-time subscription for appointments
  useEffect(() => {
    let appointmentsSubscription: any = null;
    
    const setupSubscription = async () => {
      try {
        appointmentsSubscription = supabase
          .channel(`appointments-changes-${Date.now()}`) // Use unique channel name
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'appointments'
            },
            (payload) => {
              console.log('Real-time appointment change:', payload);
              // Refresh appointments when any change occurs
              fetchAppointments();
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Error setting up subscription:', error);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (appointmentsSubscription) {
        appointmentsSubscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to run only once

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAppointments(),
        fetchTimeSlots(),
        fetchRooms(),
        fetchClinicians(),
        fetchSpecialEvents()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        time_slots:time_slot_id(*),
        rooms:room_id(*),
        users:clinician_id(*)
      `);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    const formattedAppointments: Appointment[] = data?.map(apt => ({
      id: apt.id,
      patientId: apt.patient_id || '',
      patientName: apt.patient_name,
      clinicianId: apt.clinician_id || '',
      clinicianName: apt.clinician_name || '',
      date: apt.appointment_date,
      timeSlot: apt.time_slots ? {
        id: apt.time_slots.id,
        startTime: apt.time_slots.start_time,
        endTime: apt.time_slots.end_time,
        isEarlyMorning: apt.time_slots.is_early_morning || false
      } : undefined,
      customStartTime: apt.custom_start_time || undefined,
      customEndTime: apt.custom_end_time || undefined,
      duration: apt.duration,
      type: apt.appointment_type as Appointment['type'],
      status: apt.status as Appointment['status'],
      roomId: apt.room_id || '',
      roomName: apt.room_name || '',
      notes: apt.notes || undefined,
      additionalInfo: apt.additional_info || undefined,
      createdBy: apt.created_by || '',
      updatedBy: apt.updated_by || '',
      createdAt: apt.created_at || '',
      updatedAt: apt.updated_at || ''
    })) || [];

    setAppointments(formattedAppointments);
  };

  const fetchTimeSlots = async () => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('start_time');

    if (error) {
      console.error('Error fetching time slots:', error);
      throw error;
    }

    const formattedTimeSlots: TimeSlot[] = data?.map(slot => ({
      id: slot.id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      isEarlyMorning: slot.is_early_morning || false
    })) || [];

    setTimeSlots(formattedTimeSlots);
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }

    const formattedRooms: Room[] = data?.map(room => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      isGym: room.is_gym || false
    })) || [];

    setRooms(formattedRooms);
  };

  const fetchClinicians = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['clinician', 'supervisor'])
      .eq('is_active', true)
      .order('first_name');

    if (error) {
      console.error('Error fetching clinicians:', error);
      throw error;
    }

    const formattedClinicians: User[] = data?.map(user => ({
      id: user.id,
      username: user.username || undefined,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role as User['role'],
      department: user.department || undefined,
      license: user.license || undefined,
      signature: user.signature || undefined,
      initials: user.initials || undefined,
      clinicianColor: user.clinician_color || undefined,
      isActive: user.is_active || true,
      lastLogin: user.last_login || undefined,
      createdAt: user.created_at || ''
    })) || [];

    setClinicians(formattedClinicians);
  };

  const fetchSpecialEvents = async () => {
    const { data, error } = await supabase
      .from('special_events')
      .select('*')
      .order('start_date_time');

    if (error) {
      console.error('Error fetching special events:', error);
      throw error;
    }

    const formattedEvents: SpecialEvent[] = data?.map(event => ({
      id: event.id,
      title: event.title,
      startDateTime: event.start_date_time,
      endDateTime: event.end_date_time,
      clinicianIds: event.clinician_ids || [],
      type: event.event_type as SpecialEvent['type'],
      description: event.description || undefined
    })) || [];

    setSpecialEvents(formattedEvents);
  };

  // Add UUID validation helper function
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };
  
  const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      const validation = validateAppointment(appointmentData, appointments, specialEvents, rooms);
      if (!validation.isValid) {
        console.error('Validation failed:', validation.error);
        throw new Error(validation.error);
      }
      
      console.log('Validation passed');
  
      // Check if patient exists in database by name
      let patientId = null;
      if (appointmentData.patientName) {
        const { data: existingPatients } = await supabase
          .from('patients')
          .select('id')
          .ilike('name', appointmentData.patientName)
          .limit(1);
        
        if (existingPatients && existingPatients.length > 0) {
          patientId = existingPatients[0].id;
        }
      }
  
      // Validate UUIDs before insertion
      const clinicianId = appointmentData.clinicianId && isValidUUID(appointmentData.clinicianId) 
        ? appointmentData.clinicianId 
        : null;
      
      const roomId = appointmentData.roomId && isValidUUID(appointmentData.roomId) 
        ? appointmentData.roomId 
        : null;
      
      const timeSlotId = appointmentData.timeSlot?.id && isValidUUID(appointmentData.timeSlot.id) 
        ? appointmentData.timeSlot.id 
        : null;
      
      const createdBy = currentUser?.id && isValidUUID(currentUser.id) 
        ? currentUser.id 
        : null;
  
      const insertData: any = {
        patient_id: patientId, // Will be null if patient doesn't exist
        patient_name: appointmentData.patientName || '',
        clinician_id: clinicianId,
        clinician_name: appointmentData.clinicianName || null,
        appointment_date: appointmentData.date || '',
        time_slot_id: timeSlotId,
        custom_start_time: appointmentData.customStartTime || null,
        custom_end_time: appointmentData.customEndTime || null,
        duration: appointmentData.duration || 40,
        appointment_type: appointmentData.type || 'consultation',
        status: appointmentData.status || 'scheduled',
        room_id: roomId,
        room_name: appointmentData.roomName || null,
        notes: appointmentData.notes || null,
        additional_info: appointmentData.additionalInfo || null,
        created_by: createdBy,
        updated_by: createdBy
      };
  
      console.log('Inserting appointment data:', insertData);
      console.log('UUID validation results:', {
        clinicianId: { original: appointmentData.clinicianId, valid: clinicianId },
        roomId: { original: appointmentData.roomId, valid: roomId },
        timeSlotId: { original: appointmentData.timeSlot?.id, valid: timeSlotId },
        createdBy: { original: currentUser?.id, valid: createdBy }
      });
  
      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select()
        .single();
  
      console.log('Supabase response:', { data, error });
  
      if (error) {
        throw error;
      }
  
      // Refresh appointments
      await fetchAppointments();
      
      const newAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id || '',
        patientName: data.patient_name,
        clinicianId: data.clinician_id || '',
        clinicianName: data.clinician_name || '',
        date: data.appointment_date,
        timeSlot: appointmentData.timeSlot,
        customStartTime: data.custom_start_time || undefined,
        customEndTime: data.custom_end_time || undefined,
        duration: data.duration,
        type: data.appointment_type as Appointment['type'],
        status: data.status as Appointment['status'],
        roomId: data.room_id || '',
        roomName: data.room_name || '',
        notes: data.notes || undefined,
        additionalInfo: data.additional_info || undefined,
        createdBy: data.created_by || '',
        updatedBy: data.updated_by || '',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || ''
      };
  
      // Add the new appointment to the local state immediately
      setAppointments(prev => [newAppointment, ...prev]);
      setLoading(false);
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment> => {
    setLoading(true);
    setError(null);
    
    try {
      const validation = validateAppointment(updates, appointments, specialEvents, rooms, id);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const { data, error } = await supabase
        .from('appointments')
        .update({
          patient_id: updates.patientId,
          patient_name: updates.patientName,
          clinician_id: updates.clinicianId,
          clinician_name: updates.clinicianName,
          appointment_date: updates.date,
          time_slot_id: updates.timeSlot?.id,
          custom_start_time: updates.customStartTime,
          custom_end_time: updates.customEndTime,
          duration: updates.duration,
          appointment_type: updates.type,
          status: updates.status,
          room_id: updates.roomId,
          room_name: updates.roomName,
          notes: updates.notes,
          additional_info: updates.additionalInfo,
          updated_by: currentUser?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh appointments
      await fetchAppointments();
      
      const updatedAppointment: Appointment = {
        id: data.id,
        patientId: data.patient_id || '',
        patientName: data.patient_name,
        clinicianId: data.clinician_id || '',
        clinicianName: data.clinician_name || '',
        date: data.appointment_date,
        timeSlot: updates.timeSlot,
        customStartTime: data.custom_start_time || undefined,
        customEndTime: data.custom_end_time || undefined,
        duration: data.duration,
        type: data.appointment_type as Appointment['type'],
        status: data.status as Appointment['status'],
        roomId: data.room_id || '',
        roomName: data.room_name || '',
        notes: data.notes || undefined,
        additionalInfo: data.additional_info || undefined,
        createdBy: data.created_by || '',
        updatedBy: data.updated_by || '',
        createdAt: data.created_at || '',
        updatedAt: data.updated_at || ''
      };

      setLoading(false);
      return updatedAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const generateInvoiceForAppointment = async (appointmentId: string): Promise<void> => {
    try {
      // Get appointment details
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) throw appointmentError;

      // Calculate fees based on appointment type and duration
      let amount = 0;
      if (appointment.appointment_type === 'consultation') {
        amount = appointment.duration * 2.5; // $2.5 per minute
      } else if (appointment.appointment_type === 'treatment') {
        amount = appointment.duration * 3.0; // $3.0 per minute
      }

      // Generate payment token (simple hash for demo)
      const paymentToken = `inv_${appointmentId}_${Date.now()}`;

      // Create invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          appointment_id: appointmentId,
          amount,
          payment_token: paymentToken,
          status: 'issued',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
        });

      if (invoiceError) throw invoiceError;
    } catch (err) {
      console.error('Error generating invoice:', err);
      throw err;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_by: currentUser?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
  
      if (error) {
        throw error;
      }
  
      // If status changed to 'completed', generate invoice
      if (status === 'completed') {
        await generateInvoiceForAppointment(id);
      }
  
      // Refresh appointments
      await fetchAppointments();
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment status';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Refresh appointments
      await fetchAppointments();
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const appointmentQueries = useAppointmentQueries(appointments);

  return {
    appointments,
    timeSlots,
    rooms,
    clinicians,
    specialEvents,
    loading,
    error,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    refreshData: fetchAllData,
    ...appointmentQueries
  };
};
// Remove these lines that are causing the error:
// console.log('Current user:', currentUser);
// console.log('Current user ID type:', typeof currentUser?.id);
// console.log('Current user ID value:', currentUser?.id);
