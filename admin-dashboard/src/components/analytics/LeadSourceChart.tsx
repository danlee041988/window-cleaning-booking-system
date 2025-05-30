import React from 'react';

interface LeadSourceChartProps {
  data?: any;
}

export const LeadSourceChart: React.FC<LeadSourceChartProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Lead Sources</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Website</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <span className="text-white">70%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Phone</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
            <span className="text-white">20%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Referral</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
            <span className="text-white">10%</span>
          </div>
        </div>
      </div>
    </div>
  );
};