import React from 'react';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (suggestion: string) => void;
  suggestionInput: string;
  setSuggestionInput: (value: string) => void;
  language?: string;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suggestionInput,
  setSuggestionInput,
  language = 'en'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity" 
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        {/* Modal Content */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Submit a Suggestion
                </h3>
                <div className="mt-2">
                  <textarea
                    value={suggestionInput}
                    onChange={(e) => setSuggestionInput(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-gray-700 dark:text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Your suggestion..."
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                onSubmit(suggestionInput);
                onClose();
              }}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] text-base font-medium text-white hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!suggestionInput.trim()}
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};