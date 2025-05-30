import React from 'react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkAction: (action: string) => void;
  onClearSelection: () => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ 
  selectedCount, 
  onBulkAction, 
  onClearSelection 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-600 text-white p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="font-semibold">{selectedCount} leads selected</span>
        <button
          onClick={() => onBulkAction('status')}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        >
          Change Status
        </button>
        <button
          onClick={() => onBulkAction('assign')}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        >
          Assign
        </button>
        <button
          onClick={() => onBulkAction('export')}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        >
          Export
        </button>
      </div>
      <button
        onClick={onClearSelection}
        className="text-white hover:text-gray-200 transition-colors"
      >
        Clear Selection
      </button>
    </div>
  );
};