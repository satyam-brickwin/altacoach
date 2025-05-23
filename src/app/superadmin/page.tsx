'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
}

interface Content {
  id: string;
  title: string;
  type: 'course' | 'guide' | 'exercise' | 'faq';
  language: string;
  lastUpdated: string;
}

// Add interfaces for stats objects
interface BusinessStats {
  totalBusinesses: number;
  activeBusinesses: number;
  pendingBusinesses: number;
  suspendedBusinesses: number;
}

interface ContentStats {
  totalContent: number;
  courses: number;
  guides: number;
  exercises: number;
  faqs: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  businessUsers: number;
}

// Add a new interface for admin users
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const SuperAdminDashboard = () => {
  const router = useRouter();
  const { logout } = useAuth();

  // Move all hooks to the top for consistent ordering
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  
  // Use useMemo for stable reference to allowed roles
  const allowedRoles = useMemo(() => [UserRole.SUPER_ADMIN], []);
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [businessStats, setBusinessStats] = useState<BusinessStats>({
    totalBusinesses: 0,
    activeBusinesses: 0,
    pendingBusinesses: 0,
    suspendedBusinesses: 0
  });
  const [contentStats, setContentStats] = useState<ContentStats>({
    totalContent: 0,
    courses: 0,
    guides: 0,
    exercises: 0,
    faqs: 0
  });
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    businessUsers: 0
  });
  
  // Add a refresh trigger state to force data refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Add a new state for admin users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Clear any local storage items
      localStorage.removeItem('mockUser');
      localStorage.removeItem('token');
      // Close the profile dropdown
      setIsProfileOpen(false);
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally show an error message to the user
      alert('Failed to logout. Please try again.');
    }
  };
  
  // Force refresh function
  const refreshDashboardData = useCallback(() => {
    console.log('Manually refreshing dashboard data...');
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // Force rerender when language changes
  useEffect(() => {
    // This empty dependency array with language will trigger a rerender when language changes
    console.log(`Language changed to: ${language}`);
  }, [language]);
  
  // Fetch stats from the database
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch admin users data from the correct endpoint
        const adminResponse = await fetch('/api/admin/users');
        if (!adminResponse.ok) throw new Error('Failed to fetch admin users');
        const adminData = await adminResponse.json();
        
        // Set the admin users data from the API response
        setAdminUsers(adminData.users.map((user: { id: any; name: any; email: any; role: any; status: string; lastLogin: string | number | Date; }) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
        })));
        
        // Other dashboard data fetching...
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch stats when user is authenticated
    if (isAuthenticated && !authLoading) {
      console.log('User authenticated, fetching stats and admin users...');
      fetchDashboardData();
    } else {
      console.log('User not yet authenticated, skipping stats fetch');
    }
  }, [isAuthenticated, authLoading, refreshTrigger]);
  
  // Load mock data only for businesses and content list (not for stats)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const businessesData = [
        {
          id: '1',
          name: 'Acme Corporation',
          plan: 'Enterprise',
          userCount: 85,
          status: 'active' as const,
          joinedDate: '2023-04-12'
        },
        {
          id: '2',
          name: 'Globex Industries',
          plan: 'Professional',
          userCount: 42,
          status: 'active' as const,
          joinedDate: '2023-05-25'
        },
        {
          id: '3',
          name: 'Stark Enterprises',
          plan: 'Enterprise',
          userCount: 127,
          status: 'active' as const,
          joinedDate: '2023-03-18'
        },
        {
          id: '4',
          name: 'Wayne Industries',
          plan: 'Professional',
          userCount: 36,
          status: 'pending' as const,
          joinedDate: '2023-07-02'
        },
        {
          id: '5',
          name: 'Umbrella Corporation',
          plan: 'Basic',
          userCount: 12,
          status: 'suspended' as const,
          joinedDate: '2023-01-30'
        }
      ];
      
      setBusinesses(businessesData);
      // Set recent businesses to the same data for demonstration
      setRecentBusinesses(businessesData);

      setContent([
        {
          id: '1',
          title: 'Introduction to Sales',
          type: 'course',
          language: 'English',
          lastUpdated: '2023-06-10'
        },
        {
          id: '2',
          title: 'Handling Objections',
          type: 'guide',
          language: 'French',
          lastUpdated: '2023-05-15'
        },
        {
          id: '3',
          title: 'Customer Service Scenarios',
          type: 'exercise',
          language: 'German',
          lastUpdated: '2023-07-20'
        }
      ]);

      // We no longer set mock data for stats since that comes from the API now
      setIsLoading(false);
    }, 1000);
  }, []);

  // Optional: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileOpen && !target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);
  
  // If still loading or not authenticated, show loading spinner
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-[#C72026] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user isn't an admin, don't render anything (useAuthProtection will redirect)
  if (user?.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  // Main render
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
          <div className="flex items-center h-16">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}  // Increased from 80
                  height={120} // Increased from 80
                  className="h-10 w-auto" // Increased from h-10
                  priority
                  quality={100}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </Link>
            </div>

            {/* Center - Title and Admin badge */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-wider font-['Helvetica'] italic">
                  <span className="text-gray-900 dark:text-white tracking-[.10em]">alta</span>
                  <span className="text-[#C72026] tracking-[.10em]">c</span>
                  <span className="text-gray-900 dark:text-white tracking-[.10em]">oach</span>
                </span>
                <span className="ml-2 px-2 py-1 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-xs font-medium rounded">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
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
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-50 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {translate('signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="h-full flex flex-col" key={`superadmin-sidebar-${language}`}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/superadmin" className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                    {translate('dashboard')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/superadmin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('businesses')}
                  </Link>
                </li> */}
                {/* <li>
                  <Link href="/superadmin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('altamedia Content')}
                  </Link>
                </li> */}
                <li>
                  <Link href="/superadmin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('Admin Accounts')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/superadmin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('analytics')}
                  </Link>
                </li> */}
                {/* <li>
                  <Link href="/superadmin/chat-analysis" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('chatAnalysis') || 'Chat Analysis'}
                  </Link>
                </li> */}
                <li>
                  <Link href="/superadmin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('settings')}
                  </Link>
                </li>
                <li>
                  <Link href="/superadmin/permissions" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('Permissions')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8" key={`superadmin-dashboard-${language}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate('Super Admin Dashboard')}</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshDashboardData}
                  className="flex items-center px-3 py-2 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] rounded-md hover:bg-[#C72026]/20 dark:hover:bg-[#C72026]/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {translate('refresh')}
                </button>
                {/* <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="ml-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select> */}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translate('Super Admin Dashboard Description')}
            </p>
            
            {/* Dashboard Overview Cards - Simplified to match the image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card: Businesses */}
              <div className="bg-[#C72026]/5 dark:bg-[#C72026]/10 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{translate('businesses')}</h2>
                    <p className="text-3xl font-bold text-[#C72026] dark:text-[#C72026]">{businessStats.totalBusinesses}</p>
                  </div>
                </div>
              </div>

              {/* Card: Total Users */}
              <div className="bg-[#C72026]/5 dark:bg-[#C72026]/10 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{translate('totalUsers')}</h2>
                    <p className="text-3xl font-bold text-[#C72026] dark:text-[#C72026]">{userStats.totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Card: Content Items */}
              <div className="bg-[#C72026]/5 dark:bg-[#C72026]/10 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{translate('contentItems')}</h2>
                    <p className="text-3xl font-bold text-[#C72026] dark:text-[#C72026]">{contentStats.totalContent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Dashboard Sections - Can be kept if needed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card: Business Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-[0_2px_4px_rgba(199,32,38,0.1)] p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('businessOverview')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('activeBusinesses')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{businessStats.activeBusinesses}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('pendingBusinesses')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{businessStats.pendingBusinesses}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('suspendedBusinesses')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{businessStats.suspendedBusinesses}</span>
                  </div>
                </div>
              </div>

              {/* Card: Content Management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-[0_2px_4px_rgba(199,32,38,0.1)] p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('contentManagement')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('courses')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{contentStats.courses}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('guides')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{contentStats.guides}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('exercises')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{contentStats.exercises}</span>
                  </div>
                </div>
              </div>

              {/* Card: User Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-[0_2px_4px_rgba(199,32,38,0.1)] p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('userStatistics')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('activeUsers')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{userStats.activeUsers}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('adminUsers')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{userStats.adminUsers}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('businessUsers')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{userStats.businessUsers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin & Super Admin Details in Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Super Admin Users Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-[0_2px_4px_rgba(199,32,38,0.1)] p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('Super Admin Users')}</h3>
                </div>
                
                <div className="space-y-3">
                  {adminUsers
                    .filter(admin => admin.role.toLowerCase() === 'super_admin' || admin.role.toLowerCase() === 'super admin' || admin.role.toLowerCase() === 'superadmin')
                    .map(admin => (
                      <div key={admin.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                                {admin.name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{admin.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {admin.status}
                          </span>
                        </div>
                        {/* <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {translate('Last Login')}: {admin.lastLogin}
                        </div> */}
                      </div>
                    ))}
                  
                  {/* Show current user if no super admin data available */}
                  {adminUsers.filter(admin => admin.role.toLowerCase() === 'super_admin' || admin.role.toLowerCase() === 'super admin' || admin.role.toLowerCase() === 'superadmin').length === 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                              {user?.name?.[0]?.toUpperCase() || 'S'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name || 'Super Admin'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@altacoach.com'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Active
                        </span>
                      </div>
                      {/* <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {translate('Last Login')}: {new Date().toLocaleDateString()}
                      </div> */}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Users Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-[0_2px_4px_rgba(199,32,38,0.1)] p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('Admin Users')}</h3>
                </div>
                
                <div className="space-y-3">
                  {adminUsers
                    .filter(admin => 
                      admin.role.toLowerCase().includes('admin') && 
                      !admin.role.toLowerCase().includes('super')
                    )
                    .map(admin => (
                      <div key={admin.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {admin.name?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{admin.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{admin.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.status === 'Active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {admin.status}
                          </span>
                        </div>
                        {/* <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {translate('Last Login')}: {admin.lastLogin}
                        </div> */}
                      </div>
                    ))}
                  
                  {/* Show sample admin if no admin data available */}
                  {adminUsers.filter(admin => 
                    admin.role.toLowerCase().includes('admin') && 
                    !admin.role.toLowerCase().includes('super')
                  ).length === 0 ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="text-center py-3 text-gray-500 dark:text-gray-400">
                        <p>No regular admin users found</p>
                        <Link href="/superadmin/users" className="text-[#C72026] hover:underline mt-2 inline-block">
                          Add a new admin
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link href="/superadmin/users" className="text-sm font-medium text-[#C72026] hover:text-[#A51B1F] flex items-center">
                    {translate('Manage admin users')}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 shadow-[0_4px_6px_rgba(199,32,38,0.1)]">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#C72026] border-t-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;