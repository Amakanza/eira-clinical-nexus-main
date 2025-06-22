
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SpecialEvent, User } from '@/types/clinical';
import { useAppointments } from '@/hooks/useAppointments';

interface SpecialEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: SpecialEvent;
  onSave?: (event: SpecialEvent) => void;
}

export const SpecialEventForm: React.FC<SpecialEventFormProps> = ({
  isOpen,
  onClose,
  event,
  onSave
}) => {
  const { clinicians, createSpecialEvent, updateSpecialEvent } = useAppointments();
  const [formData, setFormData] = useState({
    title: '',
    startDateTime: '',
    endDateTime: '',
    type: 'other' as 'meeting' | 'leave' | 'training' | 'other',
    description: '',
    clinicianIds: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        startDateTime: event.startDateTime.slice(0, 16), // Format for datetime-local
        endDateTime: event.endDateTime.slice(0, 16),
        type: event.type,
        description: event.description || '',
        clinicianIds: event.clinicianIds
      });
    } else {
      setFormData({
        title: '',
        startDateTime: '',
        endDateTime: '',
        type: 'other',
        description: '',
        clinicianIds: []
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        ...formData,
        startDateTime: formData.startDateTime + ':00.000Z',
        endDateTime: formData.endDateTime + ':00.000Z',
      };

      let savedEvent: SpecialEvent;
      if (event) {
        savedEvent = await updateSpecialEvent(event.id, eventData);
      } else {
        savedEvent = await createSpecialEvent(eventData);
      }

      onSave?.(savedEvent);
      onClose();
    } catch (error) {
      console.error('Error saving special event:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClinician = (clinicianId: string) => {
    setFormData(prev => ({
      ...prev,
      clinicianIds: prev.clinicianIds.includes(clinicianId)
        ? prev.clinicianIds.filter(id => id !== clinicianId)
        : [...prev.clinicianIds, clinicianId]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Special Event' : 'Create Special Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDateTime">Start Date & Time</Label>
            <Input
              id="startDateTime"
              type="datetime-local"
              value={formData.startDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="endDateTime">End Date & Time</Label>
            <Input
              id="endDateTime"
              type="datetime-local"
              value={formData.endDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endDateTime: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Affected Clinicians</Label>
            <div className="space-y-2 mt-2">
              {clinicians.map(clinician => (
                <div key={clinician.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={clinician.id}
                    checked={formData.clinicianIds.includes(clinician.id)}
                    onCheckedChange={() => toggleClinician(clinician.id)}
                  />
                  <Label htmlFor={clinician.id}>
                    {clinician.firstName} {clinician.lastName}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (event ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
