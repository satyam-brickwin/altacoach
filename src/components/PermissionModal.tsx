import React from 'react';

interface PermissionModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 dark:text-gray-400">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default PermissionModal;