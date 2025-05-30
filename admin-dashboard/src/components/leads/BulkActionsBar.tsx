import React from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
  canWrite: boolean;
  canDelete: boolean;
  canTransfer: boolean;
  statuses?: any[];
  users?: any[];
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ 
  selectedCount, 
  onAction, 
  canWrite,
  canDelete,
  canTransfer,
  statuses,
  users
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="font-semibold">{selectedCount} leads selected</span>
        {canWrite && (
          <button
            onClick={() => onAction('status')}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
          >
            Change Status
          </button>
        )}
        {canWrite && (
          <button
            onClick={() => onAction('assign')}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
          >
            Assign
          </button>
        )}
        <button
          onClick={() => onAction('export')}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        >
          Export
        </button>
        {canDelete && (
          <button
            onClick={() => onAction('delete')}
            className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      <button
        onClick={() => onAction('clear')}
        className="text-white hover:text-gray-200 transition-colors"
      >
        Clear Selection
      </button>
    </div>
  );
};