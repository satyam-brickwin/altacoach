'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, SupportedLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Document {
  id: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: string;
  created_at: string;
  language?: string;
}

export default function DocumentChat() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, setLanguage, translate } = useLanguage();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: `Welcome to Document Chat! Upload documents and ask questions about them. Current language: ${language}.` }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check authentication and redirect if not a staff user
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user && (user.isAdmin || user.isBusiness)) {
        // Redirect non-staff users to dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  // If still loading or not authenticated, show loading state
  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-3 text-gray-700">Loading...</p>
      </div>
    );
  }

  // If user is not staff, they should be redirected, but we'll show this just in case
  if (user && (user.isAdmin || user.isBusiness)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-700">Access restricted. Document Chat is only available for staff users.</p>
      </div>
    );
  }

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear notifications after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Update welcome message when language changes
  useEffect(() => {
    // Only update if there's only the welcome message or if the first message is a system message
    if (messages.length === 1 && messages[0].role === 'system') {
      setMessages([
        { role: 'system', content: `Welcome to Document Chat! Upload documents and ask questions about them. Current language: ${language}.` }
      ]);
    } else if (messages.length > 1) {
      // Add a new system message about language change
      setMessages(prev => [
        ...prev,
        { role: 'system', content: `Language changed to ${language}.` }
      ]);
    }
  }, [language]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Error fetching documents');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Use filename as default title
        setTitle(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('No file selected');
      return;
    }

    if (!title) {
      setError('Please provide a title');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('language', language);
      formData.append('uploadedById', 'anonymous'); // In a real app, use actual user ID

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Document uploaded successfully');

        // Process the document to extract text and create embeddings
        await fetch('/api/documents/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId: result.document.id }),
        });

        // Reset form
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Refresh document list
        fetchDocuments();

        // Add system message
        setMessages(prev => [
          ...prev, 
          { 
            role: 'system', 
            content: `Document "${result.document.title}" uploaded and is being processed. You can ask questions about it once processing is complete.` 
          }
        ]);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Document deleted');
        fetchDocuments();
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/document-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: 'anonymous', // In a real app, use actual user ID
          language: language, // Send the selected language to the API
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage = { role: 'assistant' as const, content: data.message };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to get response');
      
      // Add fallback response
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I'm having trouble processing your request. This might be because there are no relevant documents uploaded yet, or because of a connection issue. Please try uploading some documents first or try a different question." 
        }
      ]);
    } finally {
      setIsLoading(false);
      // Focus on input after sending
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-blue-600">Document</span> Chat
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`px-3 py-1 rounded-md transition-colors duration-200 ${darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Notifications */}
        {error && (
          <div className={`${darkMode ? 'bg-red-900 border-red-800' : 'bg-red-100 border-red-400'} border text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center`}>
            <span className={darkMode ? 'text-red-200' : 'text-red-700'}>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className={`${darkMode ? 'bg-green-900 border-green-800' : 'bg-green-100 border-green-400'} border text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center`}>
            <span className={darkMode ? 'text-green-200' : 'text-green-700'}>{success}</span>
            <button 
              onClick={() => setSuccess(null)}
              className="text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Document Upload and List */}
          <div className="w-full lg:w-1/3">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow rounded-lg p-6 mb-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Title</label>
                  <input 
                    type="text"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Document title"
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Description (optional)</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Brief description of the document"
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>File</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className={`w-full ${darkMode ? 'text-gray-300' : 'text-gray-700'} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 ${
                      darkMode 
                        ? 'file:bg-gray-700 file:text-gray-300' 
                        : 'file:bg-blue-50 file:text-blue-700'
                    }`}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Supported formats: PDF, DOC, DOCX, TXT
                  </p>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
                    isUploading || !selectedFile
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                      : darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </div>
                  ) : 'Upload Document'}
                </button>
              </div>
            </div>
            
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow rounded-lg p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">Your Documents</h2>
              {documents.length === 0 ? (
                <p className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No documents uploaded yet
                </p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li key={doc.id} className={`p-3 border rounded-md ${
                      darkMode 
                        ? 'border-gray-700 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } transition-colors duration-150`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {doc.file_name} ({formatFileSize(doc.file_size)})
                          </p>
                          <div className="mt-1 flex items-center">
                            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                              doc.status === 'PROCESSED' 
                                ? 'bg-green-500' 
                                : doc.status === 'PROCESSING' 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}></span>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {doc.status === 'PROCESSED' 
                                ? 'Ready' 
                                : doc.status === 'PROCESSING' 
                                  ? 'Processing' 
                                  : 'Error'}
                            </span>
                            {doc.language && (
                              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                darkMode 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {doc.language}
                              </span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className={`text-sm px-2 py-1 rounded ${
                            darkMode 
                              ? 'text-red-400 hover:bg-red-900 hover:text-red-300' 
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right side - Chat Interface */}
          <div className="w-full lg:w-2/3">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow rounded-lg p-6 h-full flex flex-col border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">Chat with Your Documents</h2>
              
              {/* Messages Area */}
              <div 
                className={`flex-1 overflow-y-auto mb-4 p-4 border rounded-md min-h-[400px] max-h-[500px] ${
                  darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
                }`}
              >
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg mb-3 ${
                      msg.role === 'user' 
                        ? darkMode 
                          ? 'bg-blue-900 ml-auto max-w-[80%]' 
                          : 'bg-blue-100 ml-auto max-w-[80%]' 
                        : msg.role === 'system' 
                          ? darkMode 
                            ? 'bg-gray-700 max-w-[90%] mx-auto text-center' 
                            : 'bg-gray-200 max-w-[90%] mx-auto text-center' 
                          : darkMode 
                            ? 'bg-gray-800 max-w-[80%]' 
                            : 'bg-white border border-gray-200 max-w-[80%]'
                    }`}
                  >
                    <p className={`text-sm font-bold mb-1 ${
                      msg.role === 'user' 
                        ? darkMode ? 'text-blue-300' : 'text-blue-700' 
                        : msg.role === 'system' 
                          ? darkMode ? 'text-gray-300' : 'text-gray-600' 
                          : darkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      {msg.role === 'user' ? 'You' : 
                       msg.role === 'system' ? 'System' : 'AI Assistant'}
                    </p>
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.content}</p>
                  </div>
                ))}
                {isLoading && (
                  <div className={`p-4 rounded-lg mb-3 max-w-[80%] ${
                    darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'
                  }`}>
                    <p className={`text-sm font-bold mb-1 ${
                      darkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      AI Assistant
                    </p>
                    <div className="flex space-x-2 items-center h-6">
                      <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`}></div>
                      <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce delay-150`}></div>
                      <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce delay-300`}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="mt-auto">
                <div className={`flex items-end border rounded-lg overflow-hidden ${
                  darkMode ? 'border-gray-700' : 'border-gray-300'
                }`}>
                  <textarea
                    ref={messageInputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your documents..."
                    rows={2}
                    className={`flex-1 p-3 resize-none focus:outline-none ${
                      darkMode 
                        ? 'bg-gray-700 text-white placeholder-gray-400' 
                        : 'bg-white text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className={`px-4 py-3 h-full ${
                      isLoading || !inputMessage.trim()
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 