import React from 'react';
import Modal from './Modal';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive?: string;
  status: string;
  joinDate?: string;
  createdAt?: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive?: string;
  status: string;
  joinDate?: string;
  createdAt?: Date;
}

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  translate: (key: string) => string;
}

export default function ViewUserModal({ isOpen, onClose, user, translate: t }: ViewUserModalProps) {
  if (!user) return null;

  const getRoleName = (role: string): string => {
    if (role === 'ADMIN') return 'System Admin';
    if (role === 'BUSINESS') return 'Business Admin';
    return 'User';
  };

  const getStatusBadgeClass = (status: string): string => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    if (status === 'pending') return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('User Details')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 flex items-center">
          <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <span className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">{t('role')}</h4>
            <p className="text-gray-900 dark:text-white">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                user.role === 'ADMIN' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                  : user.role === 'BUSINESS'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {getRoleName(user.role)}
              </span>
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">{t('status')}</h4>
            <p className="text-gray-900 dark:text-white">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadgeClass(user.status)}`}>
                {t(user.status)}
              </span>
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">{t('joinDate')}</h4>
            <p className="text-gray-900 dark:text-white">{user.joinDate || 'Unknown'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">{t('lastActive')}</h4>
            <p className="text-gray-900 dark:text-white">{user.lastActive || 'Never'}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}