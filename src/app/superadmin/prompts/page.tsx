'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';

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

const PromptsPage = () => {
  const [error, setError] = useState<string | null>('Failed to fetch prompts');
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add New Prompt state
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptData, setPromptData] = useState<PromptFormData>({
    name: '',
    description: '',
    content: '',
    isActive: false
  });
  const [promptStatus, setPromptStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const { language, translate } = useLanguage();
  const { isDarkMode } = useDarkMode();
  
  // Auth protection hook
  const { isLoading: authLoading, isAuthenticated, user } = useAuthProtection(['super_admin' as UserRole]);
  
  // Handle configure API key
  const handleConfigureApiKey = () => {
    setShowApiKeyModal(true);
  };
  
  // Close API key modal
  const closeApiKeyModal = () => {
    setShowApiKeyModal(false);
    setApiKey('');
    // Don't clear status message immediately so user can see it
  };
  
  // Handle API key submission
  const submitApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim().startsWith('sk-')) {
      setApiKeyStatus({
        message: 'Invalid API key format. OpenAI keys should start with "sk-"',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setApiKeyStatus(null);
    
    try {
      const response = await fetch('/apisuper/superadmin/settings/openai-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update API key');
      }
      
      setApiKeyStatus({
        message: 'API key updated successfully',
        type: 'success'
      });
      
      // Close the modal after a short delay
      setTimeout(() => {
        closeApiKeyModal();
      }, 2000);
      
    } catch (err) {
      setApiKeyStatus({
        message: err instanceof Error ? err.message : 'Failed to update API key',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle add new prompt button click
  const handleAddNewPrompt = () => {
    setShowPromptModal(true);
  };
  
  // Close prompt modal
  const closePromptModal = () => {
    setShowPromptModal(false);
    setPromptData({
      name: '',
      description: '',
      content: '',
      isActive: false
    });
    setPromptStatus(null);
  };
  
  // Handle prompt form change
  const handlePromptFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setPromptData({
        ...promptData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setPromptData({
        ...promptData,
        [name]: value
      });
    }
  };
  
  // Handle prompt submission
  const submitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promptData.name.trim() || !promptData.content.trim()) {
      setPromptStatus({
        message: 'Name and content are required',
        type: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    setPromptStatus(null);
    
    try {
      const response = await fetch('/apisuper/superadmin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create prompt');
      }
      
      setPromptStatus({
        message: 'Prompt created successfully',
        type: 'success'
      });
      
      // Close the modal after a short delay
      setTimeout(() => {
        closePromptModal();
        // Refresh prompts list
        fetchPrompts();
      }, 2000);
      
    } catch (err) {
      setPromptStatus({
        message: err instanceof Error ? err.message : 'Failed to create prompt',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fetch prompts
  const fetchPrompts = async () => {
    try {
      const response = await fetch('/apisuper/superadmin/prompts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }
      
      const data = await response.json();
      setPrompts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch prompts');
      console.error(err);
    }
  };
  
  // If still loading authentication, show spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated or not an admin, useAuthProtection will redirect
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          AI Prompts Management
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleConfigureApiKey}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Configure API Key
          </button>
          <button
            onClick={handleAddNewPrompt}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Add New Prompt
          </button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Main content - No prompts found message */}
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">
          No prompts found. Create your first prompt to get started.
        </p>
      </div>
      
      {/* API Key Configuration Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure OpenAI API Key</h2>
              <button 
                onClick={closeApiKeyModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={submitApiKey}>
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Your API key will be stored securely in the .env file. This key is used for OpenAI API calls to generate AI responses.
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add New Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Prompt</h2>
              <button 
                onClick={closePromptModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={submitPrompt}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={promptData.name}
                  onChange={handlePromptFormChange}
                  placeholder="E.g., Customer Support Assistant"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={promptData.description}
                  onChange={handlePromptFormChange}
                  placeholder="Brief description of what this prompt does"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prompt Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={promptData.content}
                  onChange={handlePromptFormChange}
                  placeholder="Enter the prompt text that will be sent to the AI model..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-40"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  You can use variables like {'{user_question}'} which will be replaced with actual values at runtime.
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as active prompt
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Only one prompt can be active at a time. Setting this as active will deactivate other prompts.
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : 'Create Prompt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptsPage; 