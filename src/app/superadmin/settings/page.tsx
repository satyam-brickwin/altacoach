'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AIPrompt {
  id: string;
  language_code: string;
  system_prompt: string;
  created_at: string;
  updated_at: string;
}

interface PromptFormData {
  language_code: string;
  system_prompt: string;
}


const SuperAdminSettings = () => {
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState('mistral');
  const [initialModel, setInitialModel] = useState('mistral');
  const [showSaveModel, setShowSaveModel] = useState(false);

  // Fetch model on mount
  useEffect(() => {
    const fetchModel = async () => {
      const res = await fetch('/api/admin/model');
      const data = await res.json();
      const uiValue = data.model === 'mixtral' ? 'mistral' : 'deepseek';
      setSelectedModel(uiValue);
      setInitialModel(uiValue);
    };
    fetchModel();
  }, []);




  // Update the handleLogout function
  const handleLogout = async () => {
    try {
      setIsProfileOpen(false); // Close the dropdown immediately

      // Step 1: Disable any auto-redirect in your app by setting a flag in session storage
      sessionStorage.setItem('manual_logout', 'true');

      // Step 2: First clear client-side storage immediately
      localStorage.clear();
      sessionStorage.clear();

      // Step 3: Clear all cookies 
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Step 4: Use both endpoints simultaneously to ensure logout happens
      // try {
      //   // Try the super admin logout
      //   await fetch('/apisuper/auth/logout', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     credentials: 'include',
      //   });
      // } catch (e) {
      //   console.warn("Super admin logout failed, continuing...");
      // }

      try {
        // Also try the regular logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      } catch (e) {
        console.warn("Regular logout failed, continuing...");
      }

      // Step 5: Force redirect with a random parameter to prevent caching
      const timestamp = new Date().getTime();
      window.location.replace(`/login?t=${timestamp}`);
    } catch (error) {
      console.error('Error during logout:', error);
      // If all else fails, force hard redirect to login
      window.location.replace('/login');
    }
  };

  // Use useMemo for stable reference to allowed roles
  const allowedRoles = [UserRole.SUPER_ADMIN];

  // Protect this page - only allow admin users
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);

  const [activeTab, setActiveTab] = useState('general');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prompts state
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptData, setPromptData] = useState<PromptFormData>({
    language_code: 'en',
    system_prompt: ''
  });
  const [promptStatus, setPromptStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4 scale
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);

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


  const handleEditPrompt = (prompt: AIPrompt) => {
    setPromptData({
      language_code: prompt.language_code,
      system_prompt: prompt.system_prompt,
    });
    setEditingPrompt(prompt); // add this new state below
    setPromptStatus(null);
    setShowPromptModal(true);
  };

  const closePromptModal = () => {
    setShowPromptModal(false);
    setPromptData({ language_code: 'en', system_prompt: '' });
    setPromptStatus(null);
    setIsSubmitting(false);
    setEditingPrompt(null);
  };
  ;

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

    if (!editingPrompt) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/apisuper/superadmin/prompts/${editingPrompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: promptData.system_prompt, language_code: promptData.language_code }),
      });

      if (!res.ok) throw new Error('Failed to update prompt.');
      const updatedPrompt = await res.json();

      // Map the updated prompt to match the frontend structure
      const mappedUpdatedPrompt = {
        id: updatedPrompt.id,
        language_code: updatedPrompt.languageCode, // Map `languageCode` to `language_code`
        system_prompt: updatedPrompt.systemPrompt, // Map `systemPrompt` to `system_prompt`
        created_at: updatedPrompt.createdAt, // Map `createdAt` to `created_at`
        updated_at: updatedPrompt.updatedAt, // Map `updatedAt` to `updated_at`
      };

      // Update the prompt in the table
      setPrompts(prev => prev.map(p => (p.id === mappedUpdatedPrompt.id ? mappedUpdatedPrompt : p)));
      setPromptStatus({ message: 'Prompt updated successfully!', type: 'success' });

      setTimeout(() => {
        closePromptModal();
      }, 1000);
    } catch (err: any) {
      setPromptStatus({ message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/apisuper/superadmin/prompts', {
        method: 'GET',
        credentials: 'include', // 🔥 IMPORTANT
      });

      if (!response.ok) throw new Error('Failed to fetch prompts');

      const data = await response.json();

      // Map the API response to match the UI structure
      const mappedPrompts = data.map((prompt: any) => ({
        id: prompt.id,
        language_code: prompt.languageCode, // Map `languageCode` to `language_code`
        system_prompt: prompt.systemPrompt, // Map `systemPrompt` to `system_prompt`
        created_at: prompt.createdAt, // Map `createdAt` to `created_at`
        updated_at: prompt.updatedAt, // Map `updatedAt` to `updated_at`
      }));

      setPrompts(mappedPrompts); // Set the transformed data in state
      setError(null);
    } catch (err: any) {
      console.error('Error fetching prompts:', err);
      setError('Failed to load prompts');
    }
  };




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

    // Ensure we have a user ID
    if (!user?.id) {
      setPasswordError(translate('notAuthenticated'));
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      console.log("Attempting password reset for user:", user?.id);

      // Call your API to update the password
      const response = await fetch('/apisuper/superadmin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        cache: 'no-store', // Prevent caching of this request
        body: JSON.stringify({
          currentPassword,
          newPassword,
          userId: user?.id // Make sure to include user ID
        }),
      });

      // Log the full response for debugging
      console.log("Password reset response status:", response.status);

      // First get the response as text
      const responseText = await response.text();
      console.log("Response text:", responseText);

      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
      }

      if (!response.ok) {
        throw new Error(data?.message || `Error: ${response.status} - ${response.statusText}`);
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

  // Load prompts on component mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchPrompts();
    }
  }, [isAuthenticated, authLoading]);

  const titleCase = (str: string): string => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTabName = (str: string): string => {
    // First, handle camelCase by adding spaces before capital letters
    const spacedString = str.replace(/([A-Z])/g, ' $1').trim();

    // Then apply title case to ensure first letters are capitalized
    return titleCase(spacedString);
  };

  // If still loading or not authenticated, show loading spinner
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-[#C72026] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user isn't an admin, don't render anything (useAuthProtection will redirect)
  if (user?.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}
                  height={120}
                  className="h-10 w-auto"
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
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold tracking-wider font-['Helvetica'] italic">
                  <span className="text-gray-900 dark:text-white tracking-[.15em]">alta</span>
                  <span className="text-[#C72026] tracking-[.15em]">c</span>
                  <span className="text-gray-900 dark:text-white tracking-[.15em]">oach</span>
                </span>
                <span className="px-3 py-1.5 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-sm font-medium rounded-md">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-6">
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
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-50 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {translate('signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block min-h-[calc(100vh-5rem)]">
          <div className="h-full flex flex-col" key={`admin_super-sidebar-${language}`}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/superadmin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('dashboard')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/superadmin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('businesses')}
                  </Link>
                </li>
                <li>
                  <Link href="/superadmin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('altamedia Content')}
                  </Link>
                </li> */}
                <li>
                  <Link href="/superadmin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('Admin Accounts')}
                  </Link>
                </li>
                {/* <li>
                  <Link href="/superadmin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('analytics')}
                  </Link>
                </li> */}
                <li>
                  <Link href="/superadmin/settings" className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                    {translate('settings')}
                  </Link>
                </li>
                <li>
                  <Link href="/superadmin/permissions" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                    {translate('Permissions')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8" key={`superadmin-settings-${language}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{translate('settings')}</h1>
              {/* <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="ml-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translate('settingsDescription')}
            </p>

            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'general'
                    ? 'border-[#C72026] text-[#C72026] dark:text-[#C72026]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  {translate('general')}
                </button>
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prompts'
                    ? 'border-[#C72026] text-[#C72026] dark:text-[#C72026]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  {translate('aiPrompts')}
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'api'
                    ? 'border-[#C72026] text-[#C72026] dark:text-[#C72026]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  {translate('apiKeys')}
                </button>
                <button
                  onClick={() => setActiveTab('resetPassword')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'resetPassword'
                    ? 'border-[#C72026] text-[#C72026] dark:text-[#C72026]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  {formatTabName(translate('resetPassword'))}
                </button>
                <button
                  onClick={() => setActiveTab('model')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'model'
                    ? 'border-[#C72026] text-[#C72026] dark:text-[#C72026]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  {translate('model')}
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
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prompts.map((prompt) => (
                          <tr key={prompt.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {prompt.language_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                              {prompt.system_prompt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {new Date(prompt.updated_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleEditPrompt(prompt)} // Pass the prompt to the handler
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Edit
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
                      <div className={`mb-4 p-3 rounded-md ${apiKeyStatus.type === 'success'
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
                        className="bg-[#C72026] text-white px-4 py-2 rounded-md hover:bg-[#C72026]/90 transition flex items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Prompt</h3>
                  <form onSubmit={submitPrompt}>

                    <div className="mb-4">
                      <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Prompt</label>
                      <textarea
                        id="system_prompt"
                        name="system_prompt"
                        rows={8}
                        value={promptData.system_prompt} // Bind to state
                        onChange={handlePromptFormChange} // Update state on change
                        className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm sm:text-sm"
                        placeholder="e.g. You are a helpful assistant that..."
                      />
                    </div>

                    {promptStatus && (
                      <div className={`mb-4 p-3 rounded-md ${promptStatus.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        }`}>
                        {promptStatus.message}
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button type="button" onClick={closePromptModal} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Cancel
                      </button>
                      <button type="submit" className="bg-[#C72026] text-white px-4 py-2 rounded-md hover:bg-[#C72026]/90 transition">
                        {isSubmitting ? 'Saving...' : 'Save Prompt'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'model' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {translate('modelSettings')}
                </h2>

                <div className="border dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                  <label htmlFor="model-select" className="block mb-2 text-gray-700 dark:text-gray-300">
                    {translate('selectModel')}
                  </label>
                  <select
                    id="model-select"
                    className="w-full p-2 rounded-md bg-white dark:bg-gray-800 border dark:border-gray-600 text-gray-800 dark:text-white"
                    value={selectedModel}
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setShowSaveModel(e.target.value !== initialModel);
                    }}
                  >
                    <option value="mistral">Mistral</option>
                    <option value="deepseek">Deepseek</option>
                  </select>

                  {showSaveModel && (
                    <button
                      onClick={async () => {
                        await fetch('/api/admin/model', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            model_name: selectedModel === 'mistral' ? 'mixtral' : 'reasoning'
                          })
                        });

                        setInitialModel(selectedModel);
                        setShowSaveModel(false);
                      }}
                      className="mt-4 px-4 py-2 bg-[#C72026] text-white rounded hover:bg-[#a51a1f]"
                    >
                      {translate('SaveModel')}
                    </button>

                  )}
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
                              className={`h-1 flex-1 rounded-full ${passwordStrength >= index
                                ? 'bg-[#C72026]'
                                : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            ></span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-[#C72026]/5 dark:bg-[#C72026]/10 rounded-lg border border-[#C72026]/20">
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
                              <svg className="w-3.5 h-3.5 mr-1.5 text-[#C72026] dark:text-[#C72026] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              {req}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t border-[#C72026]/20 flex items-center">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2">Example:</span>
                          <code className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded border border-[#C72026]/20 text-xs font-mono text-[#C72026] dark:text-[#C72026]">Secure@2025!</code>
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
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;