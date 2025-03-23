'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

// Wrapper component to force re-render when language changes
export default function HomePage() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  // Initialize once on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show loading state until client-side rendering is complete
  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Use language as a key to force complete component remount when language changes
  return <HomePageContent key={`home-${language}`} />;
}

// Main content component that will be re-mounted whenever language changes
function HomePageContent() {
  const { translate, language } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Debug the current language
  useEffect(() => {
    console.log('HomePageContent rendering with language:', language);
  }, [language]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Dark mode toggle button */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 z-50"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-50 to-white dark:from-teal-950 dark:to-gray-900 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                {translate('trainingDoesntEnd')}
              </h1>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                {translate('aiPoweredAssistant')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">
                  {translate('tryAltaCoach')}
                </Link>
                <Link href="/pricing" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {translate('viewPricing')}
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="w-full h-auto rounded-lg shadow-xl bg-teal-50 dark:bg-teal-900 p-8 flex flex-col items-center justify-center">
                <div className="w-64 h-96 bg-gray-800 rounded-3xl shadow-lg relative overflow-hidden border-4 border-gray-700">
                  {/* Phone Screen */}
                  <div className="absolute inset-0 bg-gradient-to-b from-teal-500 to-blue-600 p-4 flex flex-col items-center">
                    {/* App Logo */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">ALTACOACH</h3>
                    <p className="text-teal-100 text-sm text-center mb-6">Continual Learning Beyond the Classroom</p>
                    
                    {/* App Interface */}
                    <div className="w-full bg-white rounded-lg p-3 mb-4">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="w-full bg-white rounded-lg p-3 mb-4">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="w-full bg-teal-600 rounded-lg p-3 text-center text-white font-medium">
                      Start Learning
                    </div>
                  </div>
                </div>
                
                {/* Feature Icons */}
                <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">{translate('realTimeCoaching')}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mb-2">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">{translate('knowledgeRetention')}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center mb-2">
                      <svg className="h-6 w-6 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="text-xs text-center text-gray-700 dark:text-gray-300">{translate('postTrainingSupport')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {translate('howReinforces')}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              {translate('aiPoweredPlatform')}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{translate('aiPoweredQA')}</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    {translate('employeesCanAsk')}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{translate('contentIntegration')}</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    {translate('seamlesslyIntegrates')}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{translate('analyticsInsights')}</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    {translate('trackEngagement')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="bg-teal-100 dark:bg-teal-900 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-teal-600 dark:text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('improvedRetention')}</h3>
                  <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">85%</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {translate('increaseKnowledge')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('timeSaved')}</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">68%</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {translate('reductionSearching')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-3 mr-4">
                  <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('userSatisfaction')}</h3>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">92%</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {translate('positiveFeedback')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-teal-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            {translate('readyTransform')}
          </h2>
          <p className="mt-4 text-xl text-teal-100 max-w-2xl mx-auto">
            {translate('joinOrganizations')}
          </p>
          <div className="mt-8">
            <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-teal-600 bg-white hover:bg-teal-50">
              {translate('getStarted')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">AltaCoach</h3>
              <p className="text-gray-400">
                {translate('aiPoweredAssistant')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{translate('content')}</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white">{translate('features')}</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white">{translate('pricing')}</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">{translate('about')}</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">{translate('contact')}</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} AltaCoach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 