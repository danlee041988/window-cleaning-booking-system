import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'New Lead', onClick: () => navigate('/leads?action=new'), color: 'blue' },
    { label: 'Follow-ups', onClick: () => navigate('/follow-ups'), color: 'yellow' },
    { label: 'Export Data', onClick: () => navigate('/leads?action=export'), color: 'green' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`w-full py-2 px-4 rounded-lg bg-${action.color}-600 hover:bg-${action.color}-700 text-white transition-colors`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};