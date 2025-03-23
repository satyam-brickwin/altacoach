'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();
  
  return (
    <div key={`dashboard-layout-${language}`} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
} 