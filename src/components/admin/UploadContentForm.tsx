'use client';

import React, { useState, useRef } from 'react';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';

// Add color constants at the top of the file
const colors = {
  primary: {
    bg: 'bg-[#C72026]',
    hoverBg: 'hover:bg-[#A91B20]',
    text: 'text-[#C72026]',
    focus: 'focus:ring-[#C72026]',
    border: 'border-[#C72026]'
  }
};

interface UploadContentFormProps {
  onUploadSuccess?: () => void;
  onCancel?: () => void;
}

export default function UploadContentForm({ onUploadSuccess, onCancel }: UploadContentFormProps) {
  const { language, translate } = useLanguage();
  
  // Protect component - only for admin users
  const { user } = useAuthProtection(['admin' as UserRole]);
  
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('course');
  // Add a helper function to convert language code to full name
  const getFullLanguageName = (code: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'fr': 'Français',
      'de': 'Deutsch',
      'es': 'Español',
      'it': 'Italiano'
    };
    return languageMap[code] || code;
  };
  // Initialize with full language name instead of code
  const [contentLanguage, setContentLanguage] = useState(getFullLanguageName(language));
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    // Clear any previous file errors
    if (selectedFile) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!file) {
      errors.file = 'Please select a file to upload';
    }
    
    // Check file size (max 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      errors.file = 'File size must be less than 10MB';
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv', // .csv
      'text/plain', // .txt
      'text/markdown',
      'application/json',
      'application/zip',
      'image/jpeg',
      'image/png'
    ];
    
    if (file && !allowedTypes.includes(file.type)) {
      errors.file = 'File type not supported. Supported: PDF, Word, Excel, PowerPoint, CSV, text, image, zip';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    // Clear errors
    setFieldErrors({});
    setError(null);
    setUploading(true);
    
    try {
      // Create form data
      const fileExtension = file ? file.name.split('.').pop()?.toLowerCase() || 'unknown' : 'unknown';
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', fileExtension);
      formData.append('language', contentLanguage);
      formData.append('source', 'admin');
      formData.append('file', file as File);
      formData.append('doctype', type);
      
      // Add user info if available
      if (user) {
        formData.append('userId', user.id);
      }
      
      // API call to upload content
      const response = await fetch('/api/admin/content/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to upload content');
      }
      
      // Reset form on success
      setTitle('');
      setDescription('');
      setType('course');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  };
  
  // Add this helper function before the formTranslations object
  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Update the formTranslations object
  const formTranslations = {
    title: capitalizeWords(translate('title') || 'Title'),
    description: capitalizeWords(translate('description') || 'Description'),
    type: capitalizeWords(translate('type') || 'Type'),
    language: capitalizeWords(translate('language') || 'Language'),
    file: capitalizeWords(translate('file') || 'File'),
    upload: capitalizeWords(translate('upload') || 'Upload'),
    cancel: capitalizeWords(translate('cancel') || 'Cancel'),
    uploadContent: capitalizeWords(translate('uploadContent') || 'Upload Content'),
    course: capitalizeWords(translate('course') || 'Course'),
    guide: capitalizeWords(translate('guide') || 'Guide'),
    exercise: capitalizeWords(translate('exercise') || 'Exercise'),
    faq: translate('faq') || 'FAQ',
    uploading: capitalizeWords(translate('uploading') || 'Uploading...'),
    selectFile: capitalizeWords(translate('selectFile') || 'Select File'),
    dragAndDrop: capitalizeWords(translate('dragAndDrop') || 'Or Drag and Drop'),
    fileSizeLimit: capitalizeWords(translate('fileSizeLimit') || 'File Size Limit: 10MB'),
    requiredField: capitalizeWords(translate('requiredField') || 'This Field is Required'),
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {formTranslations.uploadContent}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Title Field */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1"
            >
              {formTranslations.title} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                fieldErrors.title 
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500' 
                  : `border-gray-300 dark:border-gray-600 dark:bg-gray-700 ${colors.primary.focus} focus:border-[#C72026]`
              } transition-colors duration-200`}
              disabled={uploading}
              required
            />
            {fieldErrors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.title}</p>
            )}
          </div>
          
          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTranslations.description}
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              disabled={uploading}
            />
          </div>
          
          {/* Type Field */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTranslations.type} <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm ${colors.primary.focus} focus:border-[#C72026]`}
              disabled={uploading}
              required
            >
              <option value="course">{formTranslations.course}</option>
              <option value="guide">{formTranslations.guide}</option>
              <option value="exercise">{formTranslations.exercise}</option>
              <option value="faq">{formTranslations.faq}</option>
            </select>
          </div>
          
          {/* Language Field */}
          <div>
            <label htmlFor="content-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTranslations.language} <span className="text-red-500">*</span>
            </label>
            <select
              id="content-language"
              name="language"
              value={contentLanguage}
              onChange={(e) => setContentLanguage(e.target.value as SupportedLanguage)}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm ${colors.primary.focus} focus:border-[#C72026]`}
              disabled={uploading}
              required
            >
              <option value="English">English</option>
              <option value="Français">Français</option>
              <option value="Deutsch">Deutsch</option>
              <option value="Español">Español</option>
              <option value="Italiano">Italiano</option>
            </select>
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {formTranslations.file} <span className="text-red-500">*</span>
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              fieldErrors.file 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="file-upload"
                    className={`relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium ${colors.primary.text} hover:text-[#A91B20] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${colors.primary.focus}`}
                  >
                    <span>{formTranslations.selectFile}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={uploading}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">{formTranslations.dragAndDrop}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formTranslations.fileSizeLimit}
                </p>
                {file && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {file.name}
                  </p>
                )}
              </div>
            </div>
            {fieldErrors.file && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.file}</p>
            )}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.primary.focus}`}
              disabled={uploading}
            >
              {formTranslations.cancel}
            </button>
          )}
          <button
            type="submit"
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${colors.primary.bg} ${colors.primary.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.primary.focus} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {formTranslations.uploading}
              </>
            ) : (
              formTranslations.upload
            )}
          </button>
        </div>
      </form>
    </div>
  );
}