'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Add this helper function before your AdminSettings component
const titleCase = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Add this helper function before or after your existing titleCase function
const formatTabName = (str: string): string => {
  // First, handle camelCase by adding spaces before capital letters
  const spacedString = str.replace(/([A-Z])/g, ' $1').trim();
  
  // Then apply title case to ensure first letters are capitalized
  return titleCase(spacedString);
};

interface AIPrompt {
  id: string;
  name: string;
  description?: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PromptFormData {
  name: string;
  description: string;
  content: string;
  isActive: boolean;
}

const AdminSettings = () => {
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Use useMemo for stable reference to allowed roles
  const allowedRoles = [UserRole.ADMIN];
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);
  
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Prompts state
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptData, setPromptData] = useState<PromptFormData>({
    name: '',
    description: '',
    content: '',
    isActive: false
  });
  const [promptStatus, setPromptStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4 scale
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Password strength checker function
  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    
    return strength;
  };

  // Handle password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'current-password') {
      setCurrentPassword(value);
    } else if (name === 'new-password') {
      setNewPassword(value);
      setPasswordStrength(checkPasswordStrength(value));
    } else if (name === 'confirm-password') {
      setConfirmPassword(value);
    }
    
    // Clear any previous errors/success when user types
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate passwords
    if (!currentPassword) {
      setPasswordError(translate('currentPasswordRequired'));
      return;
    }
    
    if (!newPassword) {
      setPasswordError(translate('newPasswordRequired'));
      return;
    }
    
    if (passwordStrength < 3) {
      setPasswordError(translate('passwordNotStrongEnough'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(translate('passwordsDontMatch'));
      return;
    }
    
    setIsPasswordSubmitting(true);
    
    try {
      // Call your API to update the password
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translate('failedToUpdatePassword'));
      }
      
      // Clear form on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
      setPasswordSuccess(translate('passwordUpdateSuccess'));
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || translate('failedToUpdatePassword'));
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // Handler for language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Force rerender when language changes
  useEffect(() => {
    // This empty dependency array with language will trigger a rerender when language changes
    console.log(`Language changed to: ${language}`);
  }, [language]);

  const handleConfigureApiKey = () => {
    setApiKey('');
    setApiKeyStatus(null);
    setShowApiKeyModal(true);
  };
  
  const closeApiKeyModal = () => {
    setShowApiKeyModal(false);
    // Reset form state
    setApiKey('');
    setApiKeyStatus(null);
    setIsSubmitting(false);
  };
  
  const submitApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setApiKeyStatus({
        message: translate('apiKeyCannotBeEmpty'),
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock API call - replace with actual API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success response
      setApiKeyStatus({
        message: translate('apiKeySetSuccess'),
        type: 'success'
      });
      
      // In a real implementation you would:
      // - Send the apiKey to your backend
      // - Update the API key in your database
      // - Return success/failure
      
      // Don't automatically close the modal on success so user can see confirmation
    } catch (error) {
      console.error('Error setting API key:', error);
      setApiKeyStatus({
        message: translate('failedToSetApiKey'),
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddNewPrompt = () => {
    setPromptData({ name: '', description: '', content: '', isActive: false });
    setPromptStatus(null);
    setShowPromptModal(true);
  };
  
  const closePromptModal = () => {
    setShowPromptModal(false);
    // Reset form state
    setPromptData({ name: '', description: '', content: '', isActive: false });
    setPromptStatus(null);
    setIsSubmitting(false);
  };
  
  const handlePromptFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setPromptData({
        ...promptData,
        // @ts-ignore - we know this is a checkbox input
        [name]: e.target.checked
      });
    } else {
      setPromptData({
        ...promptData,
        [name]: value
      });
    }
  };
  
  const submitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptData.name.trim()) {
      setPromptStatus({
        message: translate('promptNameRequired'),
        type: 'error'
      });
      return;
    }
    
    if (!promptData.content.trim()) {
      setPromptStatus({
        message: translate('promptContentRequired'),
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || translate('failedToCreatePrompt'));
      }
      
      const newPrompt = await response.json();
      
      // Update prompts list
      setPrompts(prev => [...prev, newPrompt]);
      
      setPromptStatus({
        message: translate('promptCreatedSuccess'),
        type: 'success'
      });
      
      // Close the modal after a brief delay to show the success message
      setTimeout(() => {
        closePromptModal();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      setPromptStatus({
        message: error.message || translate('failedToCreatePrompt'),
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/admin/prompts');
      
      if (!response.ok) {
        throw new Error(translate('failedToFetchPrompts'));
      }
      
      const data = await response.json();
      setPrompts(data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      setError(translate('failedToLoadPrompts'));
    }
  };
  
  const deletePrompt = async (id: string) => {
    if (!confirm(translate('confirmDeletePrompt'))) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(translate('failedToDeletePrompt'));
      }
      
      // Remove the deleted prompt from the state
      setPrompts(prev => prev.filter(prompt => prompt.id !== id));
      
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      setError(error.message || translate('failedToDeletePrompt'));
    }
  };
  
  const togglePromptActive = async (id: string, isCurrentlyActive: boolean) => {
    // If it's already active, confirm deactivation
    if (isCurrentlyActive) {
      if (!confirm(translate('confirmDeactivatePrompt'))) {
        return;
      }
    } else {
      // If activating, confirm as it will deactivate others
      if (!confirm(translate('confirmActivatePrompt'))) {
        return;
      }
    }
    
    try {
      const response = await fetch(`/api/admin/prompts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isCurrentlyActive }),
      });
      
      if (!response.ok) {
        throw new Error(translate('failedToUpdatePrompt'));
      }
      
      const updatedPrompt = await response.json();
      
      // Update the prompts state
      setPrompts(prev => prev.map(prompt => {
        // Update the target prompt
        if (prompt.id === id) {
          return updatedPrompt;
        }
        // If activating one prompt, deactivate all others
        if (!isCurrentlyActive && updatedPrompt.isActive && prompt.isActive) {
          return { ...prompt, isActive: false };
        }
        return prompt;
      }));
      
    } catch (error: any) {
      console.error('Error updating prompt:', error);
      setError(error.message || translate('failedToUpdatePrompt'));
    }
  };
  
  // Load prompts on component mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchPrompts();
    }
  }, [isAuthenticated, authLoading]);

  const userDisplayName = user?.name?.[0] || 'A';
  const isStaffUser = user?.role === UserRole.STAFF;

  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false); // Close menu before logout
      await logout();
      // The logout function in AuthContext now handles navigation
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation if needed
      window.location.href = '/login';
    }
  };

  // If still loading or not authenticated, show loading spinner
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user isn't an admin, don't render anything (useAuthProtection will redirect)
  if (user?.role !== UserRole.ADMIN) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}
                  height={120}
                  className="h-12 w-auto"
                  priority
                  quality={100}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </Link>
            </div>

            {/* Center - Title and Admin badge */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-wider font-['Helvetica'] italic">
                  <span className="text-gray-900 dark:text-white tracking-[.10em]">alta</span>
                  <span className="text-[#C72026] tracking-[.10em]">c</span>
                  <span className="text-gray-900 dark:text-white tracking-[.10em]">oach</span>
                </span>
                <span className="ml-2 px-2 py-1 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-sm font-medium rounded">
                  Admin
                </span>
              </div>
            </div>

            {/* Right-side items - dark mode, language, profile */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language selector */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026] rounded-full p-1"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  aria-expanded={isLanguageMenuOpen}
                >
                  <span>{languageLabels[language as SupportedLanguage]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Language menu */}
                {isLanguageMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code as SupportedLanguage);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`${
                          language === code
                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                            : 'text-gray-700 dark:text-gray-200'
                        } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600`}
                        role="menuitem"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                    id="user-menu"
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center text-[#C72026] dark:text-[#C72026] font-semibold">
                      {userDisplayName}
                    </div>
                  </button>
                </div>

                {/* User menu dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    {/* Show email only for non-staff users */}
                    {!isStaffUser && (
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        {user?.email}
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="h-full flex flex-col" key={`admin-sidebar-${language}`}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/admin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('dashboard')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('businesses')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('content')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/admin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('userAccounts')}
                  </Link>
                </li> */}
                <li>
                  <Link href="/admin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('analytics')}
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" 
                    className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                    {translate('settings')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8" key={`admin-settings-${language}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate('settings')}</h1>
              <div className="flex items-center space-x-2">
                {/* <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="ml-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select> */}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translate('settingsDescription')}
            </p>

            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'general'
                      ? 'border-[#C72026] text-[#C72026]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {translate('general')}
                </button>
                {/* <button
                  onClick={() => setActiveTab('prompts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'prompts'
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {translate('aiPrompts')}
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'api'
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {translate('apiKeys')}
                </button> */}
                <button
                  onClick={() => setActiveTab('resetPassword')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'resetPassword'
                      ? 'border-[#C72026] text-[#C72026]'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {formatTabName(translate('resetPassword'))}
                </button>
              </nav>
            </div>
            
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {translate('generalSettings')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {translate('configureGeneralSettings')}
                </p>
                
                {/* Placeholder for general settings - can be expanded later */}
                <div className="border dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                  <p className="text-gray-500 dark:text-gray-300">
                    {translate('generalSettingsFutureUpdate')}
                  </p>
                </div>
              </div>
            )}
            
            {/* AI Prompts Tab */}
            {activeTab === 'prompts' && (
              <div className="mt-6">
                {/* Header with Add button */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{translate('aiPromptsManagement')}</h2>
                  <button
                    onClick={handleAddNewPrompt}
                    className="bg-[#C72026] hover:bg-[#C72026]/90 text-white font-semibold py-2 px-4 rounded flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {translate('addNewPrompt')}
                  </button>
                </div>
                
                {/* Error message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
                    {error}
                  </div>
                )}
                
                {/* Prompts list */}
                {prompts.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {translate('name')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {translate('description')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {translate('status')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {translate('lastUpdated')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {translate('actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {prompts.map((prompt) => (
                          <tr key={prompt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{prompt.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{prompt.description || translate('noDescription')}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                prompt.isActive 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {prompt.isActive ? translate('active') : translate('inactive')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(prompt.updatedAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => togglePromptActive(prompt.id, prompt.isActive)}
                                className={`mr-3 ${
                                  prompt.isActive 
                                    ? 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300' 
                                    : 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300'
                                }`}
                              >
                                {prompt.isActive ? translate('deactivate') : translate('activate')}
                              </button>
                              <button 
                                onClick={() => deletePrompt(prompt.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                {translate('delete')}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !error ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">{translate('noPromptsFound')}</p>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* API Keys Tab */}
            {activeTab === 'api' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{translate('apiIntegration')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {translate('configureApiKeys')}
                </p>
                
                <div className="space-y-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">{translate('openaiApiKey')}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {translate('openaiApiDescription')}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={handleConfigureApiKey}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
                      >
                        {translate('configureApiKey')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Additional API integrations can be added here */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white">{translate('additionalIntegrations')}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {translate('moreIntegrationsFuture')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reset Password Tab */}
            {activeTab === 'resetPassword' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {formatTabName(translate('accountSecurity'))}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {formatTabName(translate('updateYourPasswordRegularly'))}
                </p>
                
                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200">
                    {formatTabName(passwordSuccess)}
                  </div>
                )}
                
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
                    {formatTabName(passwordError)}
                  </div>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6 max-w-2xl mx-auto">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="mb-5">
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {formatTabName(translate('currentPassword'))}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="current-password"
                          name="current-password"
                          value={currentPassword}
                          onChange={handlePasswordChange}
                          className="block w-full px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                          placeholder="••••••••••••"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {formatTabName(translate('newPassword'))}
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          id="new-password"
                          name="new-password"
                          value={newPassword}
                          onChange={handlePasswordChange}
                          className="block w-full px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                          placeholder="••••••••••••"
                        />
                        <div className="mt-2 flex space-x-1">
                          {[1, 2, 3, 4].map((index) => (
                            <span 
                              key={index} 
                              className={`h-1 flex-1 rounded-full ${
                                passwordStrength >= index 
                                  ? 'bg-[#C72026] dark:bg-[#C72026]' 
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            ></span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-[#C72026]/5 dark:bg-[#C72026]/10 rounded-lg border border-[#C72026]/20 dark:border-[#C72026]/30">
                        <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {formatTabName(translate('passwordRequirements'))}:
                        </p>
                        <ul className="space-y-1.5 mb-3">
                          {[
                            "Minimum 8 characters long",
                            "At least one uppercase letter (A-Z)",
                            "At least one number (0-9)",
                            "At least one special character (!@#$%^&*)"
                          ].map((req, i) => (
                            <li key={i} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <svg className="w-3.5 h-3.5 mr-1.5 text-[#C72026] dark:text-[#C72026] flex-shrink-0" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              {req}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t border-[#C72026]/20 dark:border-[#C72026]/30 flex items-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">Example:</span>
                          <code className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded border border-[#C72026]/20 dark:border-[#C72026]/30 text-xs font-mono text-[#C72026] dark:text-[#C72026]">
                            Secure@2025!
                          </code>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {formatTabName(translate('confirmNewPassword'))}
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        name="confirm-password"
                        value={confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full px-4 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isPasswordSubmitting}
                      className="bg-[#C72026] hover:bg-[#C72026]/90 text-white font-medium py-3 px-6 rounded-md transition duration-150 ease-in-out flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPasswordSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {formatTabName(translate('updating'))}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {formatTabName(translate('updatePassword'))}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* API Key Modal */}
            {showApiKeyModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{translate('configureOpenaiApiKey')}</h3>
                  
                  <form onSubmit={submitApiKey}>
                    <div className="mb-4">
                      <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translate('apiKey')}
                      </label>
                      <input
                        type="password"
                        id="api-key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                        placeholder="sk-..."
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {translate('enterApiKeySecure')}
                      </p>
                    </div>
                    
                    {apiKeyStatus && (
                      <div className={`mb-4 p-3 rounded-md ${
                        apiKeyStatus.type === 'success' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {apiKeyStatus.message}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeApiKeyModal}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        disabled={isSubmitting}
                      >
                        {translate('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-[#C72026] hover:bg-[#C72026]/90 text-white px-4 py-2 rounded-md transition flex items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {translate('saving')}
                          </>
                        ) : translate('saveApiKey')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Add Prompt Modal */}
            {showPromptModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{translate('createNewAiPrompt')}</h3>
                  
                  <form onSubmit={submitPrompt}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translate('promptName')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={promptData.name}
                        onChange={handlePromptFormChange}
                        className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                        placeholder={translate('systemInstructions')}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translate('descriptionOptional')}
                      </label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={promptData.description}
                        onChange={handlePromptFormChange}
                        className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                        placeholder={translate('briefDescriptionPrompt')}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {translate('promptContent')}
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={10}
                        value={promptData.content}
                        onChange={handlePromptFormChange}
                        className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                        placeholder={translate('promptPlaceholder')}
                      ></textarea>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {translate('systemPromptGuide')}
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={promptData.isActive}
                          onChange={handlePromptFormChange}
                          className="h-4 w-4 text-[#C72026] focus:ring-[#C72026] border-gray-300 rounded"
                        />
                        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          {translate('setAsActivePrompt')}
                        </label>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {translate('oneActivePromptWarning')}
                      </p>
                    </div>
                    
                    {promptStatus && (
                      <div className={`mb-4 p-3 rounded-md ${
                        promptStatus.type === 'success' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {promptStatus.message}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closePromptModal}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        disabled={isSubmitting}
                      >
                        {translate('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="bg-[#C72026] hover:bg-[#C72026]/90 text-white px-4 py-2 rounded-md transition flex items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-[#C72026]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {translate('creating')}
                          </>
                        ) : translate('createPrompt')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;