'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import UploadContentForm from '@/components/admin/UploadContentForm';

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
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading, isAuthenticated, user } = useAuthProtection([UserRole.ADMIN]);
  
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

  // Fetch content function
  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/content');
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
      const response = await fetch(`/api/admin/content/${id}`, {
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
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated or not an admin, the useAuthProtection hook will redirect to login
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

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
        <div className="bg-white dark:bg-gray-800 shadow-md w-full md:w-64 md:min-h-screen">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Empty div - language selector removed */}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/admin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('businesses')}
                </Link>
              </li>
              <li>
                <Link href="/admin/content" className="block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium">
                  {t('content')}
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('userAccounts')}
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('settings')}
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
                {t('content')}
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
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
                            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
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
                              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
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
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                : item.type === 'guide' 
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                  : item.type === 'exercise'
                                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                    : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
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
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mr-3"
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