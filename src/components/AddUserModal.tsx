import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Update the User interface to remove role
interface User {
  id?: string;          
  name: string;
  email: string;
  password: string;
  status: string;       
  language: string;     
  businessId?: string;  // Business ID for association
  lastActive?: string;
  joinDate?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  translate: (key: string) => string;
  businessId?: string; // Business ID is now optional but important
}

export default function AddUserModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  translate,
  businessId 
}: AddUserModalProps) {
  const { user } = useAuth();
  
  // Initialize with a default but immediately check localStorage in useEffect
  const [formData, setFormData] = useState<User>({
    name: '',
    email: '',
    password: '',
    status: 'ACTIVE',
    language: 'English', // Default to full language name
    businessId: businessId
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This effect ensures the language selection persists by retrieving from localStorage
  useEffect(() => {
    // Try to get previously selected language from localStorage
    const savedLanguage = localStorage.getItem('preferredUserLanguage');
    if (savedLanguage) {
      console.log('Retrieved saved language from localStorage:', savedLanguage);
      setFormData(prev => ({ ...prev, language: savedLanguage }));
    }
  }, [isOpen]); // Run when modal opens, not just on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for language to save to localStorage
    if (name === 'language') {
      localStorage.setItem('preferredUserLanguage', value);
      console.log('Language selected and saved to localStorage:', value);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email) {
        throw new Error('Name and email are required');
      }

      // Email validation remains the same
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Save current language selection for reuse
      const currentLanguage = formData.language;
      
      // Include the businessId in the userData
      const userData = {
        ...formData,
        status: formData.status.toUpperCase(), // Ensure status is uppercase
        businessId: businessId,
        password: '', // Empty password to trigger reset token generation
        role: 'USER', // Explicitly set role to USER
        generateResetToken: true, // Flag to indicate we want to generate a reset token
        passwordPending: true // New flag to indicate password should be set after verification
      };

      console.log('Submitting new user with data:', userData);

      // Make API call to create user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Format the user data to match what the UI expects
      const newUserForUI = {
        id: data.user?.id || Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: 'USER',
        status: formData.status,
        language: formData.language,
        businessId: businessId,
        isVerified: false,
        lastActive: new Date().toISOString(),
        joinDate: new Date().toISOString()
      };

      // Call the parent's onSuccess handler with properly formatted user
      onSuccess(newUserForUI);

      // Reset form on success but maintain the language preference
      setFormData({
        name: '',
        email: '',
        password: '',
        status: 'ACTIVE',
        language: currentLanguage, // Keep the selected language
        businessId: businessId
      });

      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {translate('Add New User')}
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
              {translate('Name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              placeholder="John Smith"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('Email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              placeholder="user@example.com"
            />
          </div>

          {/* Password field removed as we'll use email invitation now */}

          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('Status')}
            </label>
            <div className="relative">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white appearance-none bg-none"
              >
                <option value="ACTIVE">{translate('active')}</option>
                <option value="PENDING">{translate('pending')}</option>
                <option value="SUSPENDED">{translate('suspended')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('Language')}
            </label>
            <div className="relative">
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white appearance-none bg-none"
              >
                <option value="English">English</option>
                <option value="Español">Español</option>
                <option value="Français">Français</option>
                <option value="Deutsch">Deutsch</option>
                <option value="Português">Português</option>
                <option value="Italiano">Italiano</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Hidden business ID field to ensure it's included in form submission */}
          {businessId && (
            <input 
              type="hidden" 
              name="businessId" 
              value={businessId} 
            />
          )}
          
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
              {translate('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#C72026] border border-transparent rounded-md shadow-sm hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? translate('creating') : translate('Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}