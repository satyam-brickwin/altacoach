'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="flex">
      <Sidebar />
      <div className={`flex-1 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {children}
      </div>
    </div>
  );
} 