import React from 'react';

interface TransferHistoryProps {
  history: any[];
}

export const TransferHistory: React.FC<TransferHistoryProps> = ({ history }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">Transfer History</h3>
      {history.length === 0 ? (
        <p className="text-gray-400">No transfers yet</p>
      ) : (
        <div className="space-y-2">
          {history.map((transfer: any, index: number) => (
            <div key={index} className="border-b border-gray-700 pb-2">
              <div className="text-sm text-white">
                {transfer.date} - {transfer.count} leads transferred
              </div>
              <div className="text-xs text-gray-400">
                Status: {transfer.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};