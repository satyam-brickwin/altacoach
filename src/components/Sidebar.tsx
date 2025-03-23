'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-teal-300 text-gray-800 w-64 min-h-screen p-4">
      <nav className="space-y-8">
        <div className={`${isActive('/dashboard') ? 'bg-teal-200' : ''} rounded-lg`}>
          <Link href="/dashboard" className="flex items-center space-x-3 text-gray-800 p-2 rounded-lg hover:bg-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>

        <div className={`${isActive('/documents') ? 'bg-teal-200' : ''} rounded-lg`}>
          <Link href="/documents" className="flex items-center space-x-3 text-gray-800 p-2 rounded-lg hover:bg-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Documents</span>
          </Link>
        </div>

        <div className={`${isActive('/ai-assistant') ? 'bg-teal-200' : ''} rounded-lg`}>
          <Link href="/ai-assistant" className="flex items-center space-x-3 text-gray-800 p-2 rounded-lg hover:bg-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="font-medium">AI Assistant</span>
          </Link>
        </div>

        <div className={`${isActive('/document-chat') ? 'bg-teal-200' : ''} rounded-lg`}>
          <Link href="/document-chat" className="flex items-center space-x-3 text-gray-800 p-2 rounded-lg hover:bg-teal-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="font-medium">Document Chat</span>
          </Link>
        </div>
      </nav>
    </div>
  );
} 