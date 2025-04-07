'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole, useAuth } from '@/contexts/AuthContext';
import UploadContentForm from '@/components/adminsuper/UploadContentForm';

// Define interface for Content type
interface Content {
  id: string;
  title: string;
  description?: string;
  type: string;
  filePath: string;
  language: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  business?: {
    id: string;
    name: string;
  };
}

// Define content stats interface
interface ContentStats {
  total: number;
  courses: number;
  guides: number;
  exercises: number;
  faqs: number;
}

// Define translations for the admin dashboard
const adminTranslations = {
  en: {
    adminDashboard: 'Admin Dashboard',
    dashboard: 'Dashboard',
    businesses: 'Businesses',
    content: 'Content',
    userAccounts: 'User Accounts',
    settings: 'Settings',
    analytics: 'Analytics',
    prompts: 'Prompts',
    notifications: 'Notifications',
    businessOverview: 'Business Overview',
    activeBusinesses: 'Active Businesses',
    pendingBusinesses: 'Pending Businesses',
    suspendedBusinesses: 'Suspended Businesses',
    contentManagement: 'Content Management',
    contentItems: 'Content Items',
    exercises: 'Exercises',
    faqs: 'FAQs',
    viewAll: 'View All',
    manage: 'Manage',
    approve: 'Approve',
    suspend: 'Suspend',
    delete: 'Delete',
    userStatistics: 'User Statistics',
    totalBusinesses: 'Total Businesses',
    totalContent: 'Total Content',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    adminUsers: 'Admin Users',
    courses: 'Courses',
    guides: 'Guides',
    recentRegistrations: 'Recent Registrations',
    selectLanguage: 'Select Language',
    name: 'Name',
    plan: 'Plan',
    userCount: 'Users',
    status: 'Status',
    joined: 'Joined',
    actions: 'Actions',
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
    view: 'View',
    edit: 'Edit',
    download: 'Download',
    title: 'Title',
    type: 'Type',
    language: 'Language',
    lastUpdated: 'Last Updated',
    contentManagementDesc: 'Manage and organize all content for businesses',
    addNewContent: 'Add New Content',
    filterByType: 'Filter by Type:',
    allContent: 'All Content',
    course: 'Course',
    guide: 'Guide',
    exercise: 'Exercise',
    faq: 'FAQ',
    search: 'Search',
    searchContent: 'Search content...'
  },
  fr: {
    adminDashboard: 'Tableau de Bord Admin',
    dashboard: 'Tableau de Bord',
    businesses: 'Entreprises',
    content: 'Contenu',
    userAccounts: 'Comptes Utilisateurs',
    settings: 'Paramètres',
    analytics: 'Analyses',
    prompts: 'Invites',
    notifications: 'Notifiche',
    businessOverview: 'Aperçu des Entreprises',
    activeBusinesses: 'Entreprises Actives',
    pendingBusinesses: 'Entreprises en Attente',
    suspendedBusinesses: 'Entreprises Suspendues',
    contentManagement: 'Gestion de Contenu',
    contentItems: 'Éléments de Contenu',
    exercises: 'Exercices',
    faqs: 'FAQs',
    viewAll: 'Voir Tout',
    manage: 'Gérer',
    approve: 'Approuver',
    suspend: 'Suspendre',
    delete: 'Supprimer',
    userStatistics: 'Statistiques Utilisateurs',
    totalBusinesses: 'Total Entreprises',
    totalContent: 'Total Contenu',
    totalUsers: 'Total Utilisateurs',
    activeUsers: 'Utilisateurs Actifs',
    adminUsers: 'Utilisateurs Admin',
    courses: 'Cours',
    guides: 'Guides',
    recentRegistrations: 'Inscriptions Récentes',
    selectLanguage: 'Sélectionner la Langue',
    name: 'Nom',
    plan: 'Plan',
    userCount: 'Utilisateurs',
    status: 'Statut',
    joined: 'Inscrit',
    actions: 'Actions',
    active: 'Actif',
    pending: 'En Attente',
    suspended: 'Suspendu',
    view: 'Voir',
    edit: 'Modifier',
    download: 'Télécharger',
    title: 'Titre',
    type: 'Type',
    language: 'Langue',
    lastUpdated: 'Dernière Mise à Jour',
    contentManagementDesc: 'Gérer et organiser tout le contenu pour les entreprises',
    addNewContent: 'Ajouter Nouveau Contenu',
    filterByType: 'Filtrer par Type:',
    allContent: 'Tout le Contenu',
    course: 'Cours',
    guide: 'Guide',
    exercise: 'Exercice',
    faq: 'FAQ',
    search: 'Rechercher',
    searchContent: 'Rechercher du contenu...'
  },
  // Add other languages as needed
};

export default function AdminContent() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading, isAuthenticated, user } = useAuthProtection([UserRole.SUPER_ADMIN]);
  const { signOut } = useAuth();
  
  // State for content data
  const [content, setContent] = useState<Content[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats>({
    total: 0,
    courses: 0,
    guides: 0,
    exercises: 0,
    faqs: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Memoized value for userDisplayName
  const userDisplayName = useMemo(() => {
    if (!user) return 'U';
    if (user?.name) return user.name[0].toUpperCase();
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase();
    }
    return 'U';
  }, [user]);

  // Logout handler
  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  // Fetch content function
  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/apisuper/superadmin/content');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      
      // Transform the data to match our Content interface
      const formattedContent = data.content ? data.content.map((item: any) => ({
        ...item,
        // Format dates to match the expected format
        lastUpdated: new Date(item.lastUpdated).toISOString().split('T')[0],
        createdAt: new Date(item.createdAt).toISOString(),
        updatedAt: new Date(item.updatedAt).toISOString(),
        // Ensure type is lowercase for filtering
        type: item.type.toLowerCase()
      })) : [];
      
      setContent(formattedContent);
      setContentStats(data.stats || {
        total: 0,
        courses: 0,
        guides: 0,
        exercises: 0,
        faqs: 0
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load content data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch content data from the API
  useEffect(() => {
    fetchContent();
  }, []);

  // Handle delete content
  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/apisuper/superadmin/content/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
      
      // Remove the deleted content from the state
      setContent(content.filter(item => item.id !== id));
      
      // Update stats
      setContentStats({
        ...contentStats,
        total: contentStats.total - 1,
        courses: content.find(item => item.id === id)?.type === 'course' ? contentStats.courses - 1 : contentStats.courses,
        guides: content.find(item => item.id === id)?.type === 'guide' ? contentStats.guides - 1 : contentStats.guides,
        exercises: content.find(item => item.id === id)?.type === 'exercise' ? contentStats.exercises - 1 : contentStats.exercises,
        faqs: content.find(item => item.id === id)?.type === 'faq' ? contentStats.faqs - 1 : contentStats.faqs
      });
      
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle upload success
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchContent();
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Custom translate function that provides a fallback
  const t = (key: string) => {
    // First check admin translations
    let translation = adminTranslations[language as keyof typeof adminTranslations] ? 
      (adminTranslations[language as keyof typeof adminTranslations] as Record<string, string>)[key] : undefined;
    
    // If not found in admin translations, try global translations
    if (!translation) {
      translation = translate(key);
    }
    
    // If still not found, return the key itself with a console warning
    if (!translation || translation === key) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    return translation;
  };

  // Filter content based on type and search term
  const filteredContent = content.filter(item => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // If still loading authentication, show loading spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-[#C72026] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated or not an admin, the useAuthProtection hook will redirect to login
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}
                  height={120}
                  className="h-10 w-auto"
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
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold tracking-wider font-['Helvetica'] italic">
                  <span className="text-gray-900 dark:text-white tracking-[.15em]">alta</span>
                  <span className="text-[#C72026] tracking-[.15em]">c</span>
                  <span className="text-gray-900 dark:text-white tracking-[.15em]">oach</span>
                </span>
                <span className="px-3 py-1.5 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-sm font-medium rounded-md">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-6">
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
        <div className="bg-white dark:bg-gray-800 shadow-md w-full md:w-64 md:min-h-screen">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Empty div - language selector removed */}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/superadmin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('businesses')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/content" className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                  {t('altamedia Content')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {'Admin Accounts'}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('settings')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/permissions" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('Permissions')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('altamedia Content')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('contentManagementDesc')}
              </p>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('filterByType')}
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] rounded-md"
                >
                  <option value="all">{t('allContent')}</option>
                  <option value="course">{t('course')}</option>
                  <option value="guide">{t('guide')}</option>
                  <option value="exercise">{t('exercise')}</option>
                  <option value="faq">{t('faq')}</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchContent')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Upload Form Modal */}
            {showUploadForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                  <UploadContentForm 
                    onUploadSuccess={handleUploadSuccess}
                    onCancel={() => setShowUploadForm(false)}
                  />
                </div>
              </div>
            )}

            {/* Content Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('contentItems')}
                </h2>
                <button 
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('addNewContent')}
                </button>
              </div>
              
              {/* Content Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('title')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('type')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('language')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('lastUpdated')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-[#C72026] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Loading content...
                          </p>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <p className="mt-2 text-sm text-red-500">
                            {error}
                          </p>
                          <button 
                            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90 rounded-md"
                            onClick={() => fetchContent()}
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : filteredContent.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center">
                          <div className="flex justify-center">
                            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm ? 'No content matching your search' : 'No content available'}
                          </p>
                          {(searchTerm || typeFilter !== 'all') && (
                            <button 
                              className="mt-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                              onClick={() => {
                                setSearchTerm('');
                                setTypeFilter('all');
                              }}
                            >
                              Clear Filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredContent.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center">
                                <span className="text-lg font-semibold text-[#C72026] dark:text-[#C72026]">
                                  {item.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.title}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.type === 'course' 
                                ? 'bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026]' 
                                : item.type === 'guide' 
                                  ? 'bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026]' 
                                  : item.type === 'exercise'
                                    ? 'bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026]'
                                    : 'bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026]'
                            }`}>
                              {t(item.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.language}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {item.lastUpdated}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a 
                              href={item.filePath} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#C72026] dark:text-[#C72026] hover:text-[#C72026]/80 dark:hover:text-[#C72026]/80 mr-3"
                            >
                              {t('view')}
                            </a>
                            <button 
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 mr-3"
                              onClick={() => {
                                // Create a link element and trigger download
                                const link = document.createElement('a');
                                link.href = item.filePath;
                                link.download = item.title;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              {t('download')}
                            </button>
                            <button 
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              {t('delete')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}