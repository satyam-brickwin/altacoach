'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
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

const AdminDashboard = () => {
  // Move all hooks to the top for consistent ordering
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  
  // Use useMemo for stable reference to allowed roles
  const allowedRoles = useMemo(() => [UserRole.ADMIN], []);
  
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
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
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
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching dashboard stats...');
        // Fetch real statistics from the API with timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/admin/dashboard-stats?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dashboard stats data:', data);
        
        if (!data.success) {
          throw new Error('API returned unsuccessful response');
        }
        
        // Debug logging to show received values for statistics
        console.log('Business stats from API:', data.stats.businesses);
        console.log('User stats from API:', data.stats.users);
        console.log('Content stats from API:', data.stats.content);
        
        // Update with real data from database
        if (data.stats) {
          // Business stats
          if (data.stats.businesses) {
            setBusinessStats({
              totalBusinesses: data.stats.businesses.total || 0,
              activeBusinesses: data.stats.businesses.active || 0,
              pendingBusinesses: data.stats.businesses.pending || 0,
              suspendedBusinesses: data.stats.businesses.suspended || 0
            });
          }
          
          // Content stats
          if (data.stats.content) {
            setContentStats({
              totalContent: data.stats.content.total || 0,
              courses: data.stats.content.courses || 0,
              guides: data.stats.content.guides || 0,
              exercises: data.stats.content.exercises || 0,
              faqs: data.stats.content.faqs || 0
            });
          }
          
          // User stats
          if (data.stats.users) {
            setUserStats({
              totalUsers: data.stats.users.total || 0,
              activeUsers: data.stats.users.active || 0,
              adminUsers: data.stats.users.admins || 0,
              businessUsers: data.stats.users.business || 0
            });
          }
        }
        
        // Update recent businesses if available
        if (data.recentBusinessRegistrations) {
          setRecentBusinesses(data.recentBusinessRegistrations);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Show error in console with full stack trace to help debug
        console.trace('Dashboard stats fetch error stack:');
        
        // No fallback to mock data - if the API fails, show zeros
        setBusinessStats({
          totalBusinesses: 0,
          activeBusinesses: 0,
          pendingBusinesses: 0,
          suspendedBusinesses: 0
        });

        setContentStats({
          totalContent: 0,
          courses: 0,
          guides: 0,
          exercises: 0,
          faqs: 0
        });

        setUserStats({
          totalUsers: 0,
          activeUsers: 0,
          adminUsers: 0,
          businessUsers: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch stats when user is authenticated
    if (isAuthenticated && !authLoading) {
      console.log('User authenticated, fetching stats...');
      fetchStats();
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
  
  // If still loading or not authenticated, show loading spinner
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user isn't an admin, don't render anything (useAuthProtection will redirect)
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  // Main render
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">altacoach</span>
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded">
                Admin
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="h-full flex flex-col" key={`admin-sidebar-${language}`}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/admin" className="block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium">
                    {translate('dashboard')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('businesses')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('content')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('userAccounts')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('analytics')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/admin/chat-analysis" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('chatAnalysis') || 'Chat Analysis'}
                  </Link>
                </li> */}
                <li>
                  <Link href="/admin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('settings')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8" key={`admin-dashboard-${language}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate('adminDashboard')}</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshDashboardData}
                  className="flex items-center px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {translate('refresh')}
                </button>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="ml-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translate('adminDashboardDescription')}
            </p>
            
            {/* Dashboard Overview Cards - Simplified to match the image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card: Businesses */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{translate('businesses')}</h2>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{businessStats.totalBusinesses}</p>
                  </div>
                </div>
              </div>

              {/* Card: Total Users */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{translate('totalUsers')}</h2>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{userStats.totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Card: Content Items */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-800 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{translate('contentItems')}</h2>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{contentStats.totalContent}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Dashboard Sections - Can be kept if needed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card: Business Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{businessStats.activeBusinesses}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('pendingBusinesses')}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{businessStats.pendingBusinesses}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('suspendedBusinesses')}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{businessStats.suspendedBusinesses}</span>
                  </div>
                </div>
              </div>

              {/* Card: Content Management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{contentStats.courses}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('guides')}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{contentStats.guides}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('exercises')}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{contentStats.exercises}</span>
                  </div>
                </div>
              </div>

              {/* Card: User Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{userStats.activeUsers}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('adminUsers')}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{userStats.adminUsers}</span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('businessUsers')}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{userStats.businessUsers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {translate('recentRegistrations')}
                </h2>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  {translate('viewAll')}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('name')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('plan')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('userCount')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('status')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('joined')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {recentBusinesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                                {business.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {business.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {business.plan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {business.userCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            business.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                              : business.status === 'pending' 
                                ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' 
                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}>
                            {business.status === 'active' 
                              ? translate('active') 
                              : business.status === 'pending' 
                                ? translate('pending') 
                                : translate('suspended')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {business.joinedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mr-3">
                            {translate('view')}
                          </button>
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                            {translate('manage')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 