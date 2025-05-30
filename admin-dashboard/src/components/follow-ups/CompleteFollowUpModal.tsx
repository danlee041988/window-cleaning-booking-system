import React from 'react';

interface CompleteFollowUpModalProps {
  activity: any;
  onComplete: (outcome: string, notes: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

export const CompleteFollowUpModal: React.FC<CompleteFollowUpModalProps> = ({ 
  activity, 
  onClose, 
  onComplete,
  isLoading 
}) => {
  const [outcome, setOutcome] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(outcome, notes);
    setOutcome('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-white mb-4">Complete Follow-up</h3>
        <p className="text-gray-300 mb-4">Customer: {activity?.lead?.customerName}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Select outcome</option>
              <option value="completed">Completed</option>
              <option value="no_answer">No Answer</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};