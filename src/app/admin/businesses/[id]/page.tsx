'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import AddUserModal from '@/components/AddUserModal';
import ViewUserModal from '@/components/ViewUserModal';
import EditUserModal from '@/components/EditUserModal';

// Keep only necessary interfaces
type SupportedLanguage = 'en' | 'es' | 'fr';

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created: string;
  source: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive?: string;
  status: string;
  joinDate?: string;
}

interface Business {
  id: string;
  name: string;
  status: string;
  plan: string;
  userCount: number;
  joinedDate: string;
  colorTheme: string;
  isActive: boolean;
  createdBy: string;
  documents?: Document[];
  users?: User[];
}

interface DummyBusinessesType {
  [key: string]: {
    name: string;
    plan: string;
    userCount: number;
    status: string;
    joinedDate: string;
    colorTheme: string;
    isActive: boolean;
    createdBy: string;
  };
}

export default function BusinessDetails() {
  const params = useParams();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [viewUserModal, setViewUserModal] = useState<User | null>(null);
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const languageLabels = {
    en: 'English',
    es: 'Español',
    fr: 'Français'
  };

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const dummyBusinesses: DummyBusinessesType = {
          '1': {
            name: 'Acme Corporation',
            plan: 'Enterprise',
            userCount: 85,
            status: 'active',
            joinedDate: '2023-04-12',
            colorTheme: '#4F46E5',
            isActive: true,
            createdBy: 'John Smith'
          },
          '2': {
            name: 'Globex Industries',
            plan: 'Professional',
            userCount: 42,
            status: 'active',
            joinedDate: '2023-05-25',
            colorTheme: '#10B981',
            isActive: true,
            createdBy: 'Sarah Johnson'
          },
          '3': {
            name: 'Stark Enterprises',
            plan: 'Enterprise',
            userCount: 127,
            status: 'active',
            joinedDate: '2023-03-18',
            colorTheme: '#F59E0B',
            isActive: true,
            createdBy: 'Tony Stark'
          },
          '4': {
            name: 'Wayne Industries',
            plan: 'Professional',
            userCount: 36,
            status: 'pending',
            joinedDate: '2023-07-02',
            colorTheme: '#3B82F6',
            isActive: false,
            createdBy: 'Bruce Wayne'
          },
          '5': {
            name: 'Umbrella Corporation',
            plan: 'Basic',
            userCount: 12,
            status: 'suspended',
            joinedDate: '2023-01-30',
            colorTheme: '#EF4444',
            isActive: false,
            createdBy: 'Albert Wesker'
          }
        };

        const businessId = params.id as string;
        const businessData = dummyBusinesses[businessId];

        if (!businessData) {
          throw new Error('Business not found');
        }

        const dummyBusiness = {
          id: businessId,
          name: businessData.name,
          status: businessData.status,
          plan: businessData.plan,
          userCount: businessData.userCount,
          joinedDate: businessData.joinedDate,
          colorTheme: businessData.colorTheme,
          isActive: businessData.isActive,
          createdBy: businessData.createdBy,
          documents: [
            {
              id: '1',
              title: 'Sales Training Manual',
              description: 'Comprehensive guide for sales team training',
              type: 'Business',
              status: 'processed',
              created: '2023-06-15',
              source: 'Admin'
            },
            {
              id: '2',
              title: 'Customer Service Guide',
              description: 'Best practices for customer interactions',
              type: 'Business',
              status: 'processed',
              created: '2023-07-10',
              source: 'Business'
            }
          ],
          users: [
            {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'user',
              status: 'active',
              lastActive: '2024-04-01',
              joinDate: '2024-01-15'
            },
            {
              id: '2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              role: 'user',
              status: 'active',
              lastActive: '2024-03-30',
              joinDate: '2024-02-01'
            }
          ]
        };

        setTimeout(() => {
          setBusiness(dummyBusiness);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching business details:', error);
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [params.id]);

  const filteredDocuments = business?.documents?.filter(doc => {
    const matchesFilter = activeFilter === 'all' || doc.source.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = activeFilter !== 'all' || 
      doc.title.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(documentSearchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewUser = (user: User) => {
    setViewUserModal(user);
    setIsViewUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditUserModal(user);
    setIsEditUserModalOpen(true);
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      // Call API to update user status
      // await fetch(`/api/users/${user.id}/status`, {
      //   method: 'PUT',
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Update local state
      const updatedUsers = business?.users?.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ) || [];
      setBusiness(prev => prev ? { ...prev, users: updatedUsers } : null);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleUserAdded = () => {
    // Refresh user list or update state as needed
  };

  const handleLogout = () => {
    // Implement logout functionality
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center text-red-600">Business not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Keep only this header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/businesses" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </Link>
              <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">
                {business.name}
              </h1>
            </div>

            {/* Right-side items */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language selector */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  aria-expanded={isLanguageMenuOpen}
                >
                  <span>{languageLabels[language as SupportedLanguage]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLanguageMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code as SupportedLanguage);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`${
                          language === code
                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200'
                        } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600`}
                        role="menuitem"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="user-menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                    {user?.name?.[0] || 'U'}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    {user?.email && (
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        {user.email}
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Document and User Filtering Tabs */}
        <div className="px-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['all', 'business'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`${
                  activeFilter === filter
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {filter === 'all' ? 'All Documents' : `${filter} Documents`}
              </button>
            ))}
            <button
              onClick={() => setActiveFilter('admin')}
              className={`${
                activeFilter === 'admin'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Admin Documents
            </button>
            <button
              onClick={() => setActiveFilter('users')}
              className={`${
                activeFilter === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Accounts
            </button>
          </nav>
        </div>

        {/* Conditional Content Based on Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeFilter === 'users' ? 'User Accounts' : 
                activeFilter === 'all' ? 'All Documents' : 
                `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Documents`}
            </h2>
            {activeFilter === 'users' ? (
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg 
                  className="-ml-1 mr-2 h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
                Add New User
              </button>
            ) : (
              (activeFilter === 'admin' || activeFilter === 'business') && (
                <button
                  type="button"
                  onClick={() => {/* Add upload handler */}}
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Document
                </button>
              )
            )}
          </div>
          <div className="overflow-x-auto">
            {activeFilter === 'users' ? (
              <>
                {/* User Search */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Users Table */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {business.users?.filter(user => 
                      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
                    ).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Joined: {user.joinDate}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewUser(user)}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleToggleUserStatus(user)}
                              className={`${
                                user.status === 'active' 
                                  ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                                  : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
                              }`}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <>
                {activeFilter === 'all' && (
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search documents..."
                        value={documentSearchTerm}
                        onChange={(e) => setDocumentSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredDocuments?.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{doc.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'processed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doc.created}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{doc.source}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              View
                            </button>
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              Chat
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </main>

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => setIsViewUserModalOpen(false)}
        user={viewUserModal}
        translate={(key: string) => key} // Add proper translation function
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        user={editUserModal}
        onSuccess={() => {
          setIsEditUserModalOpen(false);
          // Refresh user list or update state as needed
        }}
        translate={(key: string) => key} // Add proper translation function
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleUserAdded}
        translate={(key: string) => key} // Add proper translation function
      />
    </div>
  );
}