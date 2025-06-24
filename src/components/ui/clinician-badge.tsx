
import React from 'react';
import { User } from '@/types/clinical';

interface ClinicianBadgeProps {
  clinician: User | { initials?: string; clinicianColor?: string; firstName?: string; lastName?: string };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const ClinicianBadge: React.FC<ClinicianBadgeProps> = ({
  clinician,
  size = 'md',
  showName = false,
  className = ''
}) => {
  const getInitials = () => {
    if (clinician.initials) return clinician.initials;
    if (clinician.firstName && clinician.lastName) {
      return (clinician.firstName.charAt(0) + clinician.lastName.charAt(0)).toUpperCase();
    }
    return '??';
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const backgroundColor = clinician.clinicianColor || '#6B7280';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shadow-sm`}
        style={{ backgroundColor }}
      >
        {getInitials()}
      </div>
      {showName && clinician.firstName && clinician.lastName && (
        <span className="text-sm font-medium">
          {clinician.firstName} {clinician.lastName}
        </span>
      )}
    </div>
  );
};
