import React, { useState, useEffect } from 'react';
import Modal from '../componentsuper/Modal';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate?: string;
  lastActive?: string;
}

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
  translate: (key: string) => string;
  onSuccess: () => void;
}

export default function EditAdminModal({ isOpen, onClose, admin, translate, onSuccess }: EditAdminModalProps) {
  const [formData, setFormData] = useState<Partial<Admin>>({
    name: '',
    email: '',
    role: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      // Convert role to a consistent format for the form
      let displayRole = admin.role;
      
      // Convert uppercase roles like 'SUPER_ADMIN' to the expected 'super_admin' format
      if (admin.role) {
        displayRole = admin.role.toLowerCase();
      }
      
      setFormData({
        name: admin.name,
        email: admin.email,
        role: displayRole,
        status: admin.status,
      });
    }
  }, [admin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;

    setIsLoading(true);
    setError(null);

    try {
      // Make sure we have a default role value to avoid undefined
      let normalizedRole: string = formData.role || 'admin';
      
      // If role comes from the UI dropdown selection as 'super_admin' or 'admin', use it directly
      // If it comes as 'Super Admin' or 'Admin', convert it to the correct format
      if (formData.role === 'Super Admin') {
        normalizedRole = 'super_admin';
      } else if (formData.role === 'Admin') {
        normalizedRole = 'admin';
      }
      
      // Always ensure role is lowercase for consistency with your backend
      normalizedRole = normalizedRole.toLowerCase();

      // Create the update data object with only the fields that can be updated
      const updateData = {
        name: formData.name || '',
        email: formData.email || '',
        role: normalizedRole, // Use the normalized role value
        status: formData.status || 'active'
      };

      console.log('Updating user with data:', updateData); // Debug log

      const response = await fetch(`/apisuper/superadmin/user/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update admin');
      }

      const data = await response.json();
      if (data.success) {
        onSuccess(); // Refresh the admin list
        onClose(); // Close the modal
      } else {
        throw new Error(data.message || 'Failed to update admin');
      }
    } catch (err) {
      console.error('Error updating admin:', err);
      setError(typeof err === 'string' ? err : (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {translate('Edit Admin')}
            </h3>
            <div className="mt-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('role')}
                  </label>
                  <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white text-sm"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('status')}
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white text-sm"
                    required
                  >
                    <option value="active">{translate('active')}</option>
                    <option value="suspended">{translate('suspended')}</option>
                    <option value="pending">{translate('pending')}</option>
                  </select>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:text-sm"
                  >
                    {translate('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] text-base font-medium text-white hover:bg-[#A61B20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:text-sm"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {translate('save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}