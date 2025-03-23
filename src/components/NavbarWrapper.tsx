'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Don't show navbar on admin, dashboard, business, or staff pages
  if (pathname?.startsWith('/admin') || 
      pathname?.startsWith('/dashboard') || 
      pathname?.startsWith('/business') ||
      pathname?.startsWith('/staff')) {
    return null;
  }
  
  // Show navbar on public pages
  return <Navbar />;
} 