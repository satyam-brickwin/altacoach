'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setIsLanguageOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Helper function to check if we're on a dashboard page
  const isDashboardPage = () => {
    if (!pathname) return false;
    
    // More explicit and strict checking for dashboard paths
    const dashboardPaths = ['/dashboard', '/admin', '/business', '/staff'];
    const result = dashboardPaths.some(path => pathname.startsWith(path));
    
    console.log('Current path:', pathname);
    console.log('Is dashboard page:', result);
    
    return result;
  };

  // Check if current path matches a specific route
  const isActivePath = (path: string) => {
    if (!pathname) return false;
    return pathname === path;
  };

  // Don't show navbar on auth pages or dashboard pages
  if (isActivePath('/login') || isActivePath('/register') || isActivePath('/forgot-password') ||
      pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin') || 
      pathname?.startsWith('/business') || pathname?.startsWith('/staff')) {
    return null;
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-teal-600 dark:text-teal-400">Alta</span><span className="text-blue-600 dark:text-blue-400">Coach</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  pathname === '/'
                    ? 'border-purple-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {translate('home')}
              </Link>
              <Link
                href="/about"
                className={`${
                  pathname === '/about'
                    ? 'border-purple-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {translate('about')}
              </Link>
              <Link
                href="/features"
                className={`${
                  pathname === '/features'
                    ? 'border-purple-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {translate('features')}
              </Link>
              <Link
                href="/pricing"
                className={`${
                  pathname === '/pricing'
                    ? 'border-purple-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {translate('pricing')}
              </Link>
              {isAuthenticated && (
                <>
                  {/* Only show Chat and Document Chat links when pathname doesn't start with dashboard paths */}
                  {!pathname?.startsWith('/dashboard') && 
                   !pathname?.startsWith('/admin') && 
                   !pathname?.startsWith('/business') && 
                   !pathname?.startsWith('/staff') && (
                    <>
                      <Link
                        href="/chat"
                        className={`${
                          pathname === '/chat'
                            ? 'border-purple-500 text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        {translate('chat')}
                      </Link>
                      <Link
                        href="/document-chat"
                        className={`${
                          pathname === '/document-chat'
                            ? 'border-purple-500 text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                        } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                      >
                        {translate('documentChat')}
                      </Link>
                    </>
                  )}
                  <Link
                    href="/dashboard"
                    className={`${
                      pathname === '/dashboard' || 
                      pathname?.startsWith('/admin') || 
                      pathname?.startsWith('/business') || 
                      pathname?.startsWith('/staff')
                        ? 'border-purple-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {translate('dashboard')}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
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
            
            {/* Language selector */}
            <div className="relative">
              <button
                type="button"
                className="bg-white dark:bg-gray-800 rounded-md flex text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                id="language-menu"
                aria-expanded="false"
                aria-haspopup="true"
                onClick={toggleLanguage}
              >
                <span className="sr-only">{translate('preferredLanguage')}</span>
                <span className="flex items-center space-x-1">
                  <span>{languageLabels[language as SupportedLanguage]}</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
              {isLanguageOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="language-menu"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <button
                      key={code}
                      className={`w-full text-left block px-4 py-2 text-sm ${
                        language === code 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      role="menuitem"
                      onClick={() => handleLanguageChange(code as SupportedLanguage)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={toggleProfile}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                {isProfileOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-gray-500 dark:text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <button
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {translate('login')}
                </Link>
                <Link
                  href="/register"
                  className="bg-purple-600 text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {translate('signUp')}
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`${
              pathname === '/'
                ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            {translate('home')}
          </Link>
          <Link
            href="/about"
            className={`${
              pathname === '/about'
                ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            {translate('about')}
          </Link>
          <Link
            href="/features"
            className={`${
              pathname === '/features'
                ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            {translate('features')}
          </Link>
          <Link
            href="/pricing"
            className={`${
              pathname === '/pricing'
                ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMenuOpen(false)}
          >
            {translate('pricing')}
          </Link>
          {isAuthenticated && !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/admin') && !pathname?.startsWith('/business') && !pathname?.startsWith('/staff') && (
            <Link
              href="/chat"
              className={`${
                pathname === '/chat'
                  ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              {translate('chat')}
            </Link>
          )}
          {isAuthenticated && !pathname?.startsWith('/dashboard') && !pathname?.startsWith('/admin') && !pathname?.startsWith('/business') && !pathname?.startsWith('/staff') && (
            <Link
              href="/document-chat"
              className={`${
                pathname === '/document-chat'
                  ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              {translate('documentChat')}
            </Link>
          )}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`${
                pathname === '/dashboard' || 
                pathname?.startsWith('/admin') || 
                pathname?.startsWith('/business') || 
                pathname?.startsWith('/staff')
                  ? 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-800 dark:text-purple-300'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:border-gray-600'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              {translate('dashboard')}
            </Link>
          )}
        </div>
        {isAuthenticated ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <button
                className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <Link
                href="/login"
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('login')}
              </Link>
              <Link
                href="/register"
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                {translate('signUp')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 