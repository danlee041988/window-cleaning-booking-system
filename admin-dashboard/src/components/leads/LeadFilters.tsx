import React from 'react';

interface LeadFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
  statuses?: any[];
  users?: any[];
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ filters, onChange, statuses, users }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Status
        </label>
        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
        >
          <option value="">All Statuses</option>
          {statuses && statuses.length > 0 ? (
            statuses.map((status: any) => (
              <option key={status.id} value={status.name}>
                {status.displayName}
              </option>
            ))
          ) : (
            <>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
            </>
          )}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Priority
        </label>
        <select
          value={filters.priority || ''}
          onChange={(e) => onChange({ ...filters, priority: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search
        </label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search leads..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
        />
      </div>
      
      <button
        onClick={() => onChange({})}
        className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
};