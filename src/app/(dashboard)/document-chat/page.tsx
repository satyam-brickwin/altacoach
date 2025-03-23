'use client';

import React from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function DocumentChatPage() {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className={`rounded-lg shadow-md p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Document Chat</h1>
        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Upload a document and chat with AI about its contents.
        </p>
        
        {/* Document upload section */}
        <div className={`border rounded-lg p-6 mb-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Document</h2>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Drag and drop your file here, or click to select
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Supported formats: PDF, DOCX, TXT (Max 10MB)
            </p>
            <button className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors duration-200">
              Select File
            </button>
          </div>
        </div>
        
        {/* Chat section (empty state) */}
        <div>
          <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Chat with your document</h2>
          <div className={`border rounded-lg p-6 text-center ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Upload a document to start chatting about its contents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 