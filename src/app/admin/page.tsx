'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Business {
  id: string;
  name: string;
  userCount: number;
  status: string; // Changed from enum to string for more flexibility
  joinedDate: string;
  endDate?: string; // Added endDate field
  logo?: string; // Added logo field
  startDate?: string; // Added startDate field
  createdBy?: string | { name: string; email?: string; id?: string; }; // Added proper typing for createdBy
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

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  regularUsers: number; // Added for regular (non-admin) users
  businessUsers: number;
}

interface TopQuestion {
  content: string;
  count: number;
  id: string;
  created_at: string;
}

const AdminDashboard = () => {
  // Move all hooks to the top for consistent ordering
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated, logout } = useAuth();
  
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
  const [contentStats, setContentStats] = useState({
    total: 0,
    courses: 0,
    guides: 0,
    exercises: 0,
    faqs: 0
  });
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    regularUsers: 0, // Initialize regular users count
    businessUsers: 0
  });
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);
  
  // Add a refresh trigger state to force data refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Add state for the business detail modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };
  
  // Force refresh function
  const refreshDashboardData = useCallback(() => {
    console.log('Manually refreshing dashboard data...');
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // Define userDisplayName - derive initial from user's name or email
  const userDisplayName = useMemo(() => {
    if (!user) return 'A'; // Default to 'A' for Admin if no user
    if (user.name && user.name.length > 0) return user.name[0].toUpperCase();
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase();
    }
    return 'A'; // Default to 'A' for Admin
  }, [user]);

  // Check if user is staff/admin
  const isStaffUser = useMemo(() => {
    return user?.role === UserRole.ADMIN;
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false); // Close menu before logout
      await logout();
      // The logout function in AuthContext will handle navigation
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login'; // Fallback redirect
    }
  };

  // Function to handle view button click with additional debugging
  const handleViewBusiness = (business: Business) => {
    console.log('Full business object being viewed:', business);
    console.log('EndDate value:', business.endDate);
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

  // Function to close view modal
  const closeViewModal = () => {
    setIsViewModalOpen(false);
  };

  // Function to handle manage button click - redirect to business page
  const handleManageBusiness = (businessId: string) => {
    console.log('Navigating to business management page for ID:', businessId);
    router.push(`/admin/businesses/${businessId}`);
  };
  
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
        
        // Fetch business and user stats
        const dashboardResponse = await fetch(`/api/admin/dashboard-stats?t=${new Date().getTime()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!dashboardResponse.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${dashboardResponse.status}`);
        }
        
        const dashboardData = await dashboardResponse.json();
        
        // Fetch content stats
        const contentResponse = await fetch('/api/admin/content/altamedia');
        
        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content stats: ${contentResponse.status}`);
        }
        
        const contentData = await contentResponse.json();
        
        console.log('Raw content API response:', contentData);
        console.log('Content stats being set:', {
          total: contentData.stats.total || 0,
          courses: contentData.stats.courses || 0,
          guides: contentData.stats.guides || 0,
          exercises: contentData.stats.exercises || 0,
          faqs: contentData.stats.faqs || 0
        });

        console.log('Content stats from API:', contentData.stats);
        
        // Update the content stats using the same structure as in the content page
        setContentStats({
          total: contentData.stats.total || 0,
          courses: contentData.stats.courses || 0,
          guides: contentData.stats.guides || 0,
          exercises: contentData.stats.exercises || 0,
          faqs: contentData.stats.faqs || 0
        });
        
        // Update business and user stats from dashboardData
        if (dashboardData.stats) {
          // Business stats
          if (dashboardData.stats.businesses) {
            setBusinessStats({
              totalBusinesses: dashboardData.stats.businesses.total || 0,
              activeBusinesses: dashboardData.stats.businesses.active || 0,
              pendingBusinesses: dashboardData.stats.businesses.pending || 0,
              suspendedBusinesses: dashboardData.stats.businesses.suspended || 0
            });
          }
          
          // User stats - focus on regular users
          if (dashboardData.stats.users) {
            // Regular users = total - (admins + super admins)
            const admins = dashboardData.stats.users.admins || 0;
            const superAdmins = dashboardData.stats.users.superAdmins || 0;
            const totalUsers = dashboardData.stats.users.total || 0;
            const regularUsers = totalUsers - (admins + superAdmins);
            
            setUserStats({
              totalUsers: totalUsers,
              activeUsers: dashboardData.stats.users.active || 0,
              regularUsers: regularUsers,
              businessUsers: dashboardData.stats.users.business || 0
            });
            
            console.log('User stats processed:', {
              totalUsers,
              activeUsers: dashboardData.stats.users.active || 0,
              regularUsers,
              businessUsers: dashboardData.stats.users.business || 0
            });
          }
        }
        
        // Update recent businesses if available
        if (dashboardData.recentBusinessRegistrations && dashboardData.recentBusinessRegistrations.length > 0) {
          console.log('Setting real business data from API:', dashboardData.recentBusinessRegistrations);
          
          const processedBusinesses = processBusinessData(dashboardData.recentBusinessRegistrations);
          console.log('Processed businesses with fixed end dates:', processedBusinesses);
          
          // Replace mock business data with processed real data from the API
          setRecentBusinesses(processedBusinesses);
          // Also set the business state to ensure consistency
          setBusinesses(processedBusinesses);
        } else {
          console.log('No recent businesses found in API response');
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
          total: 0,
          courses: 0,
          guides: 0,
          exercises: 0,
          faqs: 0
        });

        setUserStats({
          totalUsers: 0,
          activeUsers: 0,
          regularUsers: 0,
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

  // Remove the existing fetchTopQuestions function and the setIsQuestionsLoading function at the bottom
// Add this useEffect inside the component, near your other useEffect hooks:

// Add this useEffect to fetch top questions when the dashboard loads
  useEffect(() => {
    const fetchTopQuestionsData = async () => {
      try {
        setIsQuestionsLoading(true);
        
        // First, get a list of all business IDs
        const businessesResponse = await fetch('/api/admin/businesses');
        const businessesData = await businessesResponse.json();
        
        if (!businessesData.success) {
          throw new Error('Failed to fetch businesses list');
        }
        
        // Extract business IDs from the response
        const businessIds = businessesData.businesses.map((business: any) => business.id);
        
        // Now use those business IDs in the questions request
        const response = await fetch('/api/admin/export-chat-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Include all business IDs instead of an empty array
            selectedBusinesses: businessIds,
            dateRange: null
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch top questions');
        }

        // Process the questions to find the most common ones
        const questionCounts = new Map<string, { content: string, count: number, id: string, created_at: string }>();
        
        // Check if data.data exists and is an array
        if (!Array.isArray(data.data)) {
          console.warn('Expected array of chat data but received:', data.data);
          setTopQuestions([]);
          return;
        }
        
        data.data.forEach((chat: any) => {
          if (chat.chat_history && Array.isArray(chat.chat_history)) {
            chat.chat_history.forEach((msg: any) => {
              if (msg.question) {
                const normalizedQuestion = msg.question.trim().toLowerCase();
                
                if (questionCounts.has(normalizedQuestion)) {
                  const existingQuestion = questionCounts.get(normalizedQuestion)!;
                  questionCounts.set(normalizedQuestion, {
                    ...existingQuestion,
                    count: existingQuestion.count + 1
                  });
                } else {
                  questionCounts.set(normalizedQuestion, {
                    content: msg.question,
                    count: 1,
                    id: msg.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    created_at: msg.created_at || new Date().toISOString()
                  });
                }
              }
            });
          }
        });

        // Convert to array and sort by count (descending)
        const sortedQuestions = Array.from(questionCounts.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 3); // Get top 3

        setTopQuestions(sortedQuestions);
        console.log("Top questions processed successfully:", sortedQuestions);
      } catch (error) {
        console.error('Error fetching top questions:', error);
        // Set an empty array on error to avoid undefined issues
        setTopQuestions([]);
      } finally {
        setIsQuestionsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchTopQuestionsData();
    }
  }, [isAuthenticated, authLoading, refreshTrigger]);

  useEffect(() => {
    console.log('Current contentStats state:', contentStats);
  }, [contentStats]);

  const processBusinessData = (businesses: Business[]): Business[] => {
    return businesses.map(business => {
      console.log(`Business ${business.name} - Original Data:`, business);
      
      // Get all possible field names that might contain end date
      const businessAny = business as any;
      const possibleEndDateFields = ['endDate', 'end_date', 'subscription_end', 'expiry_date', 'expiryDate'];
      
      // Find the first field that exists and has a value
      let endDate = null;
      for (const field of possibleEndDateFields) {
        if (businessAny[field]) {
          endDate = businessAny[field];
          console.log(`Found end date in field "${field}":`, endDate);
          break;
        }
      }
      
      return {
        ...business,
        endDate: endDate
      };
    });
  };

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
                <span className="ml-2 px-2 py-1 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-sm font-medium rounded">
                  {translate('Admin')}
                </span>
              </div>
            </div>
            {/* Right-side items - dark mode, language, profile */}
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
                <button
                  type="button"
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026] rounded-full p-1"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  aria-expanded={isLanguageMenuOpen}
                >
                  <span>{languageLabels[language as SupportedLanguage]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLanguageMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
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
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <button
                  type="button"
                  className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center text-[#C72026] dark:text-[#C72026] font-semibold">
                    {userDisplayName}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    {!isStaffUser && (
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        {user?.email}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
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
      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="h-full flex flex-col" key={`admin-sidebar-${language}`}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/admin" className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
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
                    {translate('altamediacontent')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/admin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('userAccounts')}
                  </Link>
                </li> */}
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
                <li>
                  <Link href="/admin/suggestion" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('suggestion')}
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
                  className="flex items-center px-3 py-2 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] rounded-md hover:bg-[#C72026]/20 dark:hover:bg-[#C72026]/30 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {translate('refresh')}
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translate('adminDashboardDescription')}
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
                    <p className="text-3xl font-bold text-[#C72026] dark:text-[#C72026]">{contentStats.total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Dashboard Sections - Can be kept if needed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card: Business Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('contentManagement')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('courses')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {contentStats.courses}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('guides')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {contentStats.guides}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('exercises')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {contentStats.exercises}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('faqs')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {contentStats.faqs}
                    </span>
                  </div>
                </div>
              </div>
              {/* Card: User Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full p-3 mr-4">
                    <svg className="h-5 w-5 text-[#C72026] dark:text-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  {/* <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('regularUsers')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{userStats.regularUsers}</span>
                  </div> */}
                  {/* <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{translate('businessUsers')}</span>
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">{userStats.businessUsers}</span>
                  </div> */}
                </div>
              </div>
            </div>

            Recent Registrations
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {translate('recentRegistrations')}
                </h2>
                {/* <button className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  {translate('viewAll')}
                </button> */}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {translate('name')}
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
                            <div className="h-10 w-10 flex-shrink-0 bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-[#C72026] dark:text-[#C72026]">
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
                          <button 
                            onClick={() => handleViewBusiness(business)} 
                            className="text-[#C72026] hover:text-[#C72026]/80 mr-3"
                          >
                            {translate('view')}
                          </button>
                          <button 
                            onClick={() => {
                              console.log('Managing business with ID:', business.id);
                              router.push(`/admin/businesses`);
                            }}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                          >
                            {translate('manage')}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {recentBusinesses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <svg className="h-10 w-10 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p>{translate('noBusinessesFound') || 'No businesses found'}</p>
                            <button
                              onClick={refreshDashboardData}
                              className="px-4 py-2 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] rounded-md hover:bg-[#C72026]/20 dark:hover:bg-[#C72026]/30 transition-colors text-sm"
                            >
                              {translate('refresh') || 'Refresh Data'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Questions Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mt-8">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {translate('Top3MostAskedQuestions') || 'Top 3 Most Asked Questions'}
                </h2>
              </div>
              <div className="p-6">
                {isQuestionsLoading ? (
                  <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-4"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                            <div className="mt-2 flex justify-between">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {topQuestions.map((question, index) => (
                      <QuestionCard 
                        key={question.id} 
                        question={question} 
                        rank={index + 1} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {translate('Noquestiondataavailablefortheselectedperiod') || 'No question data available for the selected period'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business View Modal - Updated Design */}
      {isViewModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeViewModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {selectedBusiness.name}
                  </h3>
                  <button
                    type="button"
                    onClick={closeViewModal}
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  {/* Logo */}
                  <div className="flex justify-center">
                    {selectedBusiness.logo ? (
                      <img 
                        src={selectedBusiness.logo} 
                        alt={`${selectedBusiness.name} logo`} 
                        className="h-24 w-24 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div 
                        className="h-24 w-24 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                        style={{ backgroundColor: '#C72026' }}
                      >
                        <span className="text-3xl font-bold text-white">
                          {selectedBusiness.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Business Details */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{translate('Status') || 'Status'}</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBusiness.status === 'active' || selectedBusiness.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                            : selectedBusiness.status === 'pending' || selectedBusiness.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }`}>
                          {translate(selectedBusiness.status.toLowerCase()) || selectedBusiness.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{translate('userCount') || 'User Count'}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedBusiness.userCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{translate('StartDate') || 'Start Date'}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedBusiness.startDate ? new Date(selectedBusiness.startDate).toLocaleDateString() : 
                         selectedBusiness.joinedDate ? selectedBusiness.joinedDate : 'Not set'}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{translate('EndDate') || 'End Date'}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedBusiness.endDate ? (
                          <>
                            <span className="font-semibold">Raw value from DB:</span> {selectedBusiness.endDate}
                            <br />
                            <span className="text-xs text-gray-500">
                              Formatted: {new Date(selectedBusiness.endDate).toLocaleDateString()}
                            </span>
                          </>
                        ) : 'Not set'}
                      </p>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{translate('Color') || 'Color'}</p>
                      <div className="mt-1 flex items-center">
                        <div 
                          className="h-6 w-6 rounded-full mr-2" 
                          style={{ backgroundColor: '#C72026' }}
                        ></div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {'#C72026'}
                        </p>
                      </div>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{translate('createdBy') || 'Created By'}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {typeof selectedBusiness.createdBy === 'string'
                          ? selectedBusiness.createdBy
                          : selectedBusiness.createdBy?.name || 'Admin'}
                      </p>
                    </div> */}
                  </div>
                </div>
                
                <div className="mt-6">
                  {/* <button
                    type="button"
                    onClick={() => {
                      closeViewModal();
                      handleManageBusiness(selectedBusiness.id);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] text-base font-medium text-white hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:text-sm"
                  >
                    {translate('manage') || 'Manage'}
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C72026]"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionCard = ({ question, rank }: { 
  question: TopQuestion, 
  rank: number 
}) => {
  const { translate } = useLanguage(); // Add this to access the translate function
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
          rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
        }`}>
          <span className="text-white font-bold">{rank}</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-900 dark:text-white font-medium line-clamp-3">
            {question.content}
          </p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {translate('Asked') || 'Asked'} {question.count} {translate('times') || 'times'}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {translate('Last') || 'Last'} {new Date(question.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

