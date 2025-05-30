import React from 'react';

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface ConversionFunnelProps {
  data?: FunnelStage[];
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
        <p className="text-gray-400">No funnel data available</p>
      </div>
    );
  }

  // Calculate the width of each stage based on percentage
  const getBarWidth = (percentage: number) => {
    return `${Math.max(percentage, 5)}%`; // Minimum 5% width for visibility
  };

  // Get color based on stage
  const getBarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-green-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h3>
      <div className="space-y-4">
        {data.map((stage, index) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">{stage.stage}</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{stage.percentage.toFixed(1)}%</span>
                <span className="text-gray-400">({stage.count})</span>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(index)}`}
                style={{ width: getBarWidth(stage.percentage) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};