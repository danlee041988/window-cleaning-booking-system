import React from 'react';

interface LeadKanbanProps {
  leads: any[];
  statuses?: any[];
  onLeadUpdate: (leadId: string, updates: any) => void;
  canWrite: boolean;
}

export const LeadKanban: React.FC<LeadKanbanProps> = ({ leads, statuses, onLeadUpdate, canWrite }) => {
  const columns = [
    { id: 'new', title: 'New', color: 'blue' },
    { id: 'contacted', title: 'Contacted', color: 'yellow' },
    { id: 'qualified', title: 'Qualified', color: 'purple' },
    { id: 'converted', title: 'Converted', color: 'green' },
  ];

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map(column => (
        <div key={column.id} className="bg-gray-800 rounded-lg p-4">
          <h3 className={`text-lg font-semibold text-${column.color}-400 mb-4`}>
            {column.title}
            <span className="ml-2 text-gray-400">
              ({getLeadsByStatus(column.id).length})
            </span>
          </h3>
          <div className="space-y-2">
            {getLeadsByStatus(column.id).map(lead => (
              <div
                key={lead.id}
                className="bg-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => onLeadUpdate(lead.id, { viewed: true })}
              >
                <p className="text-white font-medium">{lead.customerName}</p>
                <p className="text-gray-400 text-sm">{lead.postcode}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};