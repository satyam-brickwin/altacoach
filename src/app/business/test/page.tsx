'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, UserRole, sampleBusinesses, initMockDatabase } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function BusinessTestPage() {
  const { user, isAuthenticated } = useAuth();
  const { translate } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  
  useEffect(() => {
    // Get user data from localStorage to see what's actually stored
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, []);
  
  // Get business info
  const businessId = user?.businessId;
  const business = businessId ? sampleBusinesses.find(b => b.id === businessId) : null;
  
  const resetAndLogout = () => {
    // Remove all storage
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockDatabaseInitialized');
    localStorage.removeItem('mockBusinessCredentials');
    
    // Re-initialize the database
    initMockDatabase();
    
    // Redirect to login page
    window.location.href = '/login';
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Business Authentication Test Page</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Auth Context State:</h2>
            <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <p><span className="font-medium">Is Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">User ID:</span> {user?.id || 'None'}</p>
              <p><span className="font-medium">User Email:</span> {user?.email || 'None'}</p>
              <p><span className="font-medium">User Role:</span> {user?.role || 'None'}</p>
              <p><span className="font-medium">Business ID:</span> {user?.businessId || 'None'}</p>
              <p><span className="font-medium">Business Name:</span> {business?.name || 'None'}</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">LocalStorage Data:</h2>
            <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
              <pre className="whitespace-pre-wrap">{userData ? JSON.stringify(userData, null, 2) : 'No data'}</pre>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/business" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Business Dashboard
            </Link>
            
            <button
              onClick={() => {
                localStorage.removeItem('mockDatabaseInitialized');
                window.location.reload();
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset Mock Database
            </button>
            
            <button
              onClick={resetAndLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Reset & Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 