import React from 'react';

interface PerformanceMetricsProps {
  data?: any;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-green-400">25%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Avg Response Time</p>
          <p className="text-2xl font-bold text-yellow-400">2.5h</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Lead Quality Score</p>
          <p className="text-2xl font-bold text-blue-400">8.5</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Customer Satisfaction</p>
          <p className="text-2xl font-bold text-purple-400">92%</p>
        </div>
      </div>
    </div>
  );
};