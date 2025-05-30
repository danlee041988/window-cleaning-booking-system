import React from 'react';

interface TransferPreviewProps {
  selectedLeads: any[];
}

export const TransferPreview: React.FC<TransferPreviewProps> = ({ selectedLeads }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">Transfer Preview</h3>
      <p className="text-gray-300">
        {selectedLeads.length} leads selected for transfer to Squeegee
      </p>
      {selectedLeads.length > 0 && (
        <div className="mt-3 space-y-1">
          {selectedLeads.slice(0, 3).map((lead: any) => (
            <div key={lead.id} className="text-sm text-gray-400">
              {lead.customerName} - {lead.postcode}
            </div>
          ))}
          {selectedLeads.length > 3 && (
            <div className="text-sm text-gray-500">
              +{selectedLeads.length - 3} more leads...
            </div>
          )}
        </div>
      )}
    </div>
  );
};