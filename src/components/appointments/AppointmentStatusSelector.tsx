import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/types/clinical';

interface AppointmentStatusSelectorProps {
  currentStatus: Appointment['status'];
  onStatusChange: (status: Appointment['status']) => void;
  disabled?: boolean;
}

const statusOptions: { value: Appointment['status']; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'text-blue-600' },
  { value: 'in-progress', label: 'In Progress', color: 'text-yellow-600' },
  { value: 'completed', label: 'Completed', color: 'text-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600' },
  { value: 'no-show', label: 'No Show', color: 'text-red-600' }
];

export const AppointmentStatusSelector: React.FC<AppointmentStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const currentOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <Select
      value={currentStatus}
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger className={`w-32 ${currentOption?.color}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={option.color}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};