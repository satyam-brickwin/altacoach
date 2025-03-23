'use client';

import React from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Assistant Card */}
        <Link href="/ai-assistant" className={`block rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors duration-200`}>
          <div className="flex items-start">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-teal-900' : 'bg-teal-100'} mr-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Assistant</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ask questions and get instant answers from our AI assistant.
              </p>
            </div>
          </div>
        </Link>
        
        {/* Document Chat Card */}
        <Link href="/document-chat" className={`block rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors duration-200`}>
          <div className="flex items-start">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} mr-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Document Chat</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload documents and chat with AI about their contents.
              </p>
            </div>
          </div>
        </Link>
        
        {/* Documents Card */}
        <Link href="/documents" className={`block rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-colors duration-200`}>
          <div className="flex items-start">
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} mr-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Documents</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Manage your documents and files.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 