import React from 'react';

interface ViewModeToggleProps {
  viewMode: 'table' | 'kanban';
  onViewModeChange: (mode: 'table' | 'kanban') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onViewModeChange('table')}
        className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Table
      </button>
      <button
        onClick={() => onViewModeChange('kanban')}
        className={`px-3 py-1 rounded ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
      >
        Kanban
      </button>
    </div>
  );
};