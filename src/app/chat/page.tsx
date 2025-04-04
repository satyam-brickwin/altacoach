'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Focus input field when component mounts
    inputRef.current?.focus();
  }, [messages]);

  // Add welcome message when chat loads
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "👋 Hello! I'm your altacoach assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Clear any previous errors
    setError(null);

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Save conversation ID for context
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.message || "I'm having trouble connecting to my knowledge base. Please try again or ask a different question.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Set error state
      setError(error instanceof Error ? error.message : 'An error occurred');
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I'm having trouble processing your request right now. Let me try a simpler response instead.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Add fallback response after a short delay
      setTimeout(() => {
        const fallbackMessage: Message = {
          id: Date.now().toString(),
          text: "I understand you're looking for assistance. While I'm having trouble with my advanced features, I can still help with basic questions. Could you try rephrasing your question?",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallbackMessage]);
        setLoading(false);
      }, 1000);
      return;
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm sticky top-0 z-10`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="text-blue-600">Alta</span>Coach Chat
          </h1>
          <div className="flex items-center space-x-4">
            {error && (
              <div className="hidden md:block text-sm text-red-500">
                Connection issue. Using fallback mode.
              </div>
            )}
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

      {/* Chat Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Messages */}
          <div 
            className={`h-[65vh] overflow-y-auto p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} space-y-6`}
          >
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-2">
                    A
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    message.sender === 'user' 
                      ? darkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      : darkMode 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.text}</p>
                  <p 
                    className={`text-xs mt-2 ${
                      message.sender === 'user' 
                        ? 'text-blue-200' 
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold ml-2">
                    U
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-2">
                  A
                </div>
                <div className={`rounded-2xl px-5 py-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="flex space-x-2 items-center h-5">
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`}></div>
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce delay-150`}></div>
                    <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce delay-300`}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit} 
            className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                  darkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-blue-500' 
                    : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-300 focus:ring-blue-400'
                } border`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`px-6 py-3 rounded-r-lg font-medium transition-colors duration-200 ${
                  loading || !input.trim()
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send'}
              </button>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-500 text-center md:hidden">
                Connection issue. Using fallback mode.
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
} 