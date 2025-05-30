import React from 'react';

interface TransferPreviewProps {
  leads: any[];
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export const TransferPreview: React.FC<TransferPreviewProps> = ({
  leads,
  onConfirm,
  onClose,
  isLoading
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-4">
          Transfer Preview - {leads.length} leads
        </h2>
        
        <div className="space-y-2 mb-6">
          {leads.map((lead, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-white">{lead.customerName}</span>
              <span className="text-green-400">£{lead.estimatedMonthlyValue}/month</span>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Transferring...' : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};