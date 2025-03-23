'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import React from 'react';

export default function Navbar() {
  const { user, logout } = useAuth() || {};
  const pathname = usePathname();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Add state to force re-renders when language changes
  const [, setForceUpdate] = React.useState(0);
  
  // Debug current language
  React.useEffect(() => {
    console.log('Current language in Navbar:', language);
    
    // Add listener for language changes
    const handleLanguageChanged = () => {
      console.log('Language change detected in Navbar');
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, [language]);
  
  // Hide navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof logout === 'function') {
      logout();
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as SupportedLanguage;
    console.log('Language changed to:', newLanguage);
    
    // Save the language first
    setLanguage(newLanguage);
    
    // Force a page reload to ensure all components pick up the language change
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 dark:text-white">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              <span className="text-purple-600 dark:text-purple-400">Alta</span><span className="text-blue-600 dark:text-blue-400">Coach</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/features" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              {translate('features')}
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              {translate('pricing')}
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              {translate('contact')}
            </Link>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {/* Language Selector */}
            <div className="relative inline-block">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                {Object.entries(languageLabels).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            {user ? (
              <>
                <Link href={user?.role?.toString().toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard'} className="text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
                  {translate('dashboard')}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                >
                  {translate('signOut')}
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
              >
                {translate('signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 