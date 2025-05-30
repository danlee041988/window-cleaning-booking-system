import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  MinusIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

interface PriorityBadgeProps {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  size = 'sm',
  showIcon = true 
}) => {
  const config = {
    low: {
      label: 'Low',
      color: 'text-gray-400',
      bgColor: 'bg-gray-900/50',
      borderColor: 'border-gray-600',
      icon: ChevronDownIcon
    },
    normal: {
      label: 'Normal',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/50',
      borderColor: 'border-blue-600',
      icon: MinusIcon
    },
    high: {
      label: 'High',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/50',
      borderColor: 'border-orange-600',
      icon: ExclamationCircleIcon
    },
    urgent: {
      label: 'Urgent',
      color: 'text-red-400',
      bgColor: 'bg-red-900/50',
      borderColor: 'border-red-600',
      icon: ExclamationTriangleIcon
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Default to 'normal' if priority is not found in config
  const priorityConfig = config[priority] || config.normal;
  const Icon = priorityConfig.icon;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${sizeClasses[size]}
        ${priorityConfig.color}
        ${priorityConfig.bgColor}
        ${priorityConfig.borderColor}
      `}
    >
      {showIcon && (
        <Icon className={`${iconSizes[size]} mr-1`} />
      )}
      {priorityConfig.label}
    </span>
  );
};