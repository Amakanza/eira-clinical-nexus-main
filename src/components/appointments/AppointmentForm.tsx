
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Appointment, TimeSlot } from '@/types/clinical';
import { useAppointments } from '@/hooks/useAppointments';
import { isEarlyMorningTime } from '@/utils/timeSlotUtils';
import { toast } from '@/hooks/use-toast';

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment;
  onSave: (appointment: Appointment) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  isOpen,
  onClose,
  appointment,
  onSave
}) => {
  const { timeSlots, rooms, clinicians, createAppointment, updateAppointment } = useAppointments();
  
  const [formData, setFormData] = useState({
    patientName: '',
    clinicianId: '',
    date: new Date(),
    timeSlotId: '',
    customStartTime: '',
    customEndTime: '',
    type: 'consultation' as Appointment['type'],
    roomId: '',
    notes: '',
    additionalInfo: ''
  });

  const [isEarlyMorning, setIsEarlyMorning] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName,
        clinicianId: appointment.clinicianId,
        date: new Date(appointment.date),
        timeSlotId: appointment.timeSlot?.id || '',
        customStartTime: appointment.customStartTime || '',
        customEndTime: appointment.customEndTime || '',
        type: appointment.type,
        roomId: appointment.roomId,
        notes: appointment.notes || '',
        additionalInfo: appointment.additionalInfo || ''
      });
      setIsEarlyMorning(appointment.type === 'early-morning');
    } else {
      // Reset form for new appointment
      setFormData({
        patientName: '',
        clinicianId: '',
        date: new Date(),
        timeSlotId: '',
        customStartTime: '',
        customEndTime: '',
        type: 'consultation',
        roomId: '',
        notes: '',
        additionalInfo: ''
      });
      setIsEarlyMorning(false);
    }
  }, [appointment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedTimeSlot = timeSlots.find(slot => slot.id === formData.timeSlotId);
      const selectedRoom = rooms.find(room => room.id === formData.roomId);
      const selectedClinician = clinicians.find(c => c.id === formData.clinicianId);
      
      const appointmentData: Partial<Appointment> = {
        patientName: formData.patientName,
        clinicianId: formData.clinicianId,
        clinicianName: selectedClinician ? `${selectedClinician.firstName} ${selectedClinician.lastName}` : '',
        date: format(formData.date, 'yyyy-MM-dd'),
        type: isEarlyMorning ? 'early-morning' : formData.type,
        roomId: formData.roomId,
        roomName: selectedRoom?.name || '',
        notes: formData.notes,
        additionalInfo: formData.additionalInfo
      };

      if (isEarlyMorning) {
        appointmentData.customStartTime = formData.customStartTime;
        appointmentData.customEndTime = formData.customEndTime;
        appointmentData.duration = calculateDuration(formData.customStartTime, formData.customEndTime);
      } else {
        appointmentData.timeSlot = selectedTimeSlot;
        appointmentData.duration = 40;
      }

      let savedAppointment: Appointment;
      if (appointment) {
        savedAppointment = await updateAppointment(appointment.id, appointmentData);
      } else {
        savedAppointment = await createAppointment(appointmentData);
      }

      onSave(savedAppointment);
      onClose();
      
      toast({
        title: 'Success',
        description: `Appointment ${appointment ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save appointment',
        variant: 'destructive',
      });
    }
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  };

  const handleTimeTypeChange = (value: string) => {
    const isEarly = value === 'early-morning';
    setIsEarlyMorning(isEarly);
    setFormData(prev => ({ 
      ...prev, 
      type: isEarly ? 'early-morning' : 'consultation',
      timeSlotId: isEarly ? '' : prev.timeSlotId,
      customStartTime: isEarly ? '07:30' : '',
      customEndTime: isEarly ? '08:30' : ''
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="clinician">Clinician *</Label>
              <Select value={formData.clinicianId} onValueChange={(value) => setFormData(prev => ({ ...prev, clinicianId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((clinician) => (
                    <SelectItem key={clinician.id} value={clinician.id}>
                      {clinician.firstName} {clinician.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Time Type</Label>
              <Select value={isEarlyMorning ? 'early-morning' : 'regular'} onValueChange={handleTimeTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Slot (09:20-16:00)</SelectItem>
                  <SelectItem value="early-morning">Early Morning (07:30-09:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEarlyMorning ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  min="07:30"
                  max="09:00"
                  value={formData.customStartTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, customStartTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  min="07:30"
                  max="09:00"
                  value={formData.customEndTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, customEndTime: e.target.value }))}
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <Label>Time Slot *</Label>
              <Select value={formData.timeSlotId} onValueChange={(value) => setFormData(prev => ({ ...prev, timeSlotId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.startTime} - {slot.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Appointment Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Room *</Label>
              <Select value={formData.roomId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.isGym ? 'Gym' : `Cap: ${room.capacity}`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Appointment notes..."
            />
          </div>

          <div>
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {appointment ? 'Update' : 'Create'} Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
