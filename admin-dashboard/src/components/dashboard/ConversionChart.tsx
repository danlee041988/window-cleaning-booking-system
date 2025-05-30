import React from 'react';

interface ConversionChartProps {
  data?: any[];
}

export const ConversionChart: React.FC<ConversionChartProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>Chart visualization will be implemented</p>
      </div>
    </div>
  );
};