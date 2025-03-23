'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

const PricingPage = () => {
  const { language, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-end mb-4">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 z-50"
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
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">{translate('pricing')}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          {translate('choosePerfectPlan')}
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{translate('basic')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{translate('forIndividuals')}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">CHF 29</span>
                <span className="text-gray-600 dark:text-gray-400">/{translate('month')}</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('unlimitedAiConversations')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('uploadUpTo10Documents')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('basicProgressTracking')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('emailSupport')}</span>
                </li>
              </ul>
              <Link href="/register" className="block text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md mt-6 transition duration-300">
                {translate('getStarted')}
              </Link>
            </div>
          </div>
          
          {/* Professional Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border-2 border-teal-500 transform scale-105">
            <div className="bg-teal-500 text-white text-center py-1 text-sm font-medium">
              {translate('mostPopular')}
            </div>
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{translate('professional')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{translate('forGrowingProfessionals')}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">CHF 59</span>
                <span className="text-gray-600 dark:text-gray-400">/{translate('month')}</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('everythingInBasic')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('uploadUpTo50Documents')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('advancedAnalytics')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('prioritySupport')}</span>
                </li>
              </ul>
              <Link href="/register" className="block text-center bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md mt-6 transition duration-300">
                {translate('getStarted')}
              </Link>
            </div>
          </div>
          
          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{translate('enterprise')}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{translate('forLargeOrganizations')}</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{translate('custom')}</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('everythingInProfessional')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('unlimitedDocuments')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('dedicatedSupport')}</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-teal-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">{translate('customizableFeatures')}</span>
                </li>
              </ul>
              <Link href="/contact" className="block text-center bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md mt-6 transition duration-300">
                {translate('contactUs')}
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-teal-50 dark:bg-teal-900 rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">{translate('frequentlyAskedQuestions')}</h2>
          
          <div className="space-y-6 mt-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translate('canICancel')}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{translate('yesYouCan')}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translate('howManyUsers')}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{translate('basicAndProfessionalPlans')}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translate('whatTypesOfDocuments')}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{translate('altaCoachSupports')}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translate('isMyDataSecure')}</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{translate('absolutelyWeTake')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage; 