import React from 'react';

interface ConversionFunnelProps {
  data?: any;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">New Leads</span>
          <span className="text-white font-semibold">100%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Contacted</span>
          <span className="text-white font-semibold">75%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Qualified</span>
          <span className="text-white font-semibold">50%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Converted</span>
          <span className="text-white font-semibold">25%</span>
        </div>
      </div>
    </div>
  );
};