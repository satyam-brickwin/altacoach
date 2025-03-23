'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

const FeaturesPage = () => {
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

        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">{translate('features')}</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400">{translate('aiPoweredConversations')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {translate('engageInNatural')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400">{translate('documentBasedLearning')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {translate('uploadTrainingMaterials')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400">{translate('continuousReinforcement')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {translate('receiveRegularPrompts')}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-teal-600 dark:text-teal-400">{translate('progressTracking')}</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {translate('monitorYourLearning')}
            </p>
          </div>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">{translate('howAltaCoachWorks')}</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{translate('uploadYourMaterials')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{translate('addYourTrainingDocuments')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{translate('engageWithYourCoach')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{translate('askQuestions')}</p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">{translate('reinforceAndImprove')}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{translate('receivePersonalizedChallenges')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">{translate('enterpriseFeatures')}</h2>
          
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">{translate('teamManagement')}:</span> {translate('createAndManageLearningGroups')}</span>
            </li>
            
            <li className="flex items-start">
              <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">{translate('customIntegration')}:</span> {translate('connectAltaCoach')}</span>
            </li>
            
            <li className="flex items-start">
              <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">{translate('advancedAnalytics')}:</span> {translate('gainInsights')}</span>
            </li>
            
            <li className="flex items-start">
              <svg className="h-6 w-6 text-teal-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300"><span className="font-medium">{translate('customizedLearningPaths')}:</span> {translate('designTailoredLearning')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FeaturesPage; 