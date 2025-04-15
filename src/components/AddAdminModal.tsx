import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../contexts/AuthContext';

interface BusinessCredentials {
  businessId: string;
  email: string;
  password: string;
  role: string; // Changed to string to allow custom format
}

interface NewAdmin {
  name: string;
  email: string;
  role: UserRole;
  status: string;
  password: string;
}

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (admin: NewAdmin) => void;
  translate: (key: string) => string;
}

// Helper function to convert UserRole enum to database format
const roleToDbFormat = (role: UserRole): string => {
  if (role === UserRole.SUPER_ADMIN) {
    return 'super_admin';
  }
  // For other roles, you can add more conversions as needed
  return role.toString().toLowerCase();
};

const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onSuccess, translate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<NewAdmin>({
    name: '',
    email: '',
    role: UserRole.ADMIN, // Default to ADMIN
    status: 'active',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add this function to check if current user is super admin
  const isSuperAdmin = () => {
    return user?.role === UserRole.SUPER_ADMIN;
  };

  // Update handleChange to handle both input and select elements
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveNewAdmin = async (adminData: NewAdmin) => {
    try {
      const credentials = localStorage.getItem('mockBusinessCredentials');
      const existingCredentials: BusinessCredentials[] = credentials ? JSON.parse(credentials) : [];
      
      const newCredential: BusinessCredentials = {
        businessId: '',
        email: adminData.email,
        password: adminData.password,
        role: roleToDbFormat(adminData.role) // Convert to db format here
      };
      
      localStorage.setItem('mockBusinessCredentials', 
        JSON.stringify([...existingCredentials, newCredential])
      );

      console.log('New admin credentials saved:', newCredential);
      return true;
    } catch (error) {
      console.error('Error saving admin:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Add validation for super admin creation
    if (formData.role === UserRole.SUPER_ADMIN && !isSuperAdmin()) {
      setError('Only super admins can create other super admin accounts');
      setIsLoading(false);
      return;
    }

    const processedData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: roleToDbFormat(formData.role), // Convert to db format for API
      // Set password to empty string to trigger the reset token generation on the server
      password: '',
      // Add a flag to indicate we want to generate a reset token
      generateResetToken: true
    };

    try {
      console.log('Submitting admin data:', processedData);
      
      const response = await fetch('/apisuper/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      const saveSuccess = await saveNewAdmin(formData);
      if (!saveSuccess) {
        throw new Error('Failed to save admin locally');
      }

      onSuccess(formData);
      setFormData({
        name: '',
        email: '',
        role: UserRole.ADMIN,
        status: 'active',
        password: ''
      });
      onClose();
    } catch (err) {
      console.error('Error in form submission:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {translate('Add New Admin')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              placeholder="Admin Name"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              placeholder="admin@example.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('role')} *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
            >
              <option value={UserRole.ADMIN}>{translate('Admin')}</option>
              {isSuperAdmin() && (
                <option value={UserRole.SUPER_ADMIN}>{translate('superAdmin')}</option>
              )}
            </select>
          </div>

          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {translate('An invitation email will be sent to the provided email address.')}
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C72026] border border-transparent rounded-md shadow-sm hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;