'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SupportedLanguage, useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// Import components
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { cn } from './lib/utils';

// Import icons
import { 
  MessageSquare, 
  Clock, 
  Trash2, 
  Brain, 
  ArrowLeft,
  Menu as MenuIcon,
  MoreVertical,
  PaperclipIcon,
  Mic,
  Smile,
  RefreshCw,
  X,
  Settings,
  LogOut,
  User,
  Globe,
  Shield,
  Send,
  PlusCircle,
} from 'lucide-react';

// Import translations
const translations = {
  en: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Ask a question...',
    askAI: 'Ask AI',
    typeYourAnswer: 'Type your answer...',
    submitAnswer: 'Submit',
    menu: {
      quizMode: 'Quiz Mode',
      cannedQuestions: 'Canned Questions',
      history: 'Conversation History',
    },
    settings: {
      language: 'Language',
      adminView: 'Admin View',
      account: 'Account Settings',
      darkMode: 'Dark Mode',
      logout: 'Logout',
    }
  },
  fr: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Poser une question...',
    askAI: 'Demander à l\'IA',
    typeYourAnswer: 'Répondez à la question...',
    submitAnswer: 'Soumettre',
    menu: {
      quizMode: 'Mode Quiz',
      cannedQuestions: 'Questions prédéfinies',
      history: 'Historique des conversations',
    },
    settings: {
      language: 'Langue',
      adminView: 'Vue admin',
      account: 'Paramètres du compte',
      darkMode: 'Mode sombre',
      logout: 'Déconnexion',
    }
  },
  de: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Eine Frage stellen...',
    askAI: 'KI fragen',
    typeYourAnswer: 'Antworten Sie auf die Frage...',
    submitAnswer: 'Einreichen',
    menu: {
      quizMode: 'Quiz-Modus',
      cannedQuestions: 'Vorgefertigte Fragen',
      history: 'Gesprächsverlauf',
    },
    settings: {
      language: 'Sprache',
      adminView: 'Admin-Ansicht',
      account: 'Kontoeinstellungen',
      darkMode: 'Dunkelmodus',
      logout: 'Abmelden',
    }
  },
  it: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Fai una domanda...',
    askAI: 'Chiedi all\'IA',
    typeYourAnswer: 'Rispondi alla domanda...',
    submitAnswer: 'Invia',
    menu: {
      quizMode: 'Modalità Quiz',
      cannedQuestions: 'Domande predefinite',
      history: 'Cronologia conversazioni',
    },
    settings: {
      language: 'Lingua',
      adminView: 'Vista amministratore',
      account: 'Impostazioni account',
      darkMode: 'Modalità scura',
      logout: 'Esci',
    }
  },
  es: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Hacer una pregunta...',
    askAI: 'Preguntar a la IA',
    typeYourAnswer: 'Responde la pregunta...',
    submitAnswer: 'Enviar',
    menu: {
      quizMode: 'Modo Cuestionario',
      cannedQuestions: 'Preguntas predefinidas',
      history: 'Historial de conversaciones',
    },
    settings: {
      language: 'Idioma',
      adminView: 'Vista de administrador',
      account: 'Configuración de cuenta',
      darkMode: 'Modo oscuro',
      logout: 'Cerrar sesión',
    }
  }
};

export default function StaffDashboard() {
  // Core hooks and auth logic
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout } = useAuth();
  const allowedRoles = useMemo(() => [UserRole.STAFF], []);
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);
  
  // State
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // View state
  const [activeView, setActiveView] = useState<'chat' | 'history' | 'cannedQuestions' | 'quizMode'>('chat');
  
  // Quiz mode state
  const [quizMode, setQuizMode] = useState(false);
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'es', name: 'Español' }
  ];
  
  // Example questions for staff to choose from
  const [exampleQuestions] = useState([
    "What are the main features of this AI assistant?",
    "How can I learn more about machine learning?",
    "Can you explain how large language models work?",
    "What are some good resources for learning Python?",
    "How do I integrate this AI with my existing tools?",
    "What's the difference between AI and machine learning?"
  ]);

  // Quiz subjects data
  const [quizSubjects] = useState([
    {
      title: "General Knowledge",
      description: "Explore a wide range of topics from science to history."
    },
    {
      title: "Technology",
      description: "Test your knowledge about AI, programming, and tech trends."
    },
    {
      title: "Business Strategy",
      description: "Test your understanding of business strategies, marketing, and management."
    },
    {
      title: "Customer Service",
      description: "Quiz on customer support best practices and customer experience."
    }
  ]);

  // Chat history data
  const [chatHistory] = useState([
    {
      id: '1',
      title: 'Machine Learning Basics',
      snippet: 'We discussed neural networks and supervised learning...',
      date: 'Today, 2:30 PM'
    },
    {
      id: '2',
      title: 'Project Planning',
      snippet: 'We outlined the steps for implementing a recommendation system...',
      date: 'Yesterday, 10:15 AM'
    },
    {
      id: '3',
      title: 'Python Code Review',
      snippet: 'I helped debug a function that was causing performance issues...',
      date: 'Mar 15, 2023'
    }
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close menus when clicking outside
      if (menuOpen || settingsOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('.menu-dropdown') && !target.closest('.menu-trigger') && 
            !target.closest('.settings-dropdown') && !target.closest('.settings-trigger')) {
          setMenuOpen(false);
          setSettingsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, settingsOpen]);

  // Early return for loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user isn't a staff member, don't render anything (useAuthProtection will redirect)
  if (!user || user.role !== UserRole.STAFF) {
    return null;
  }

  // Quiz helper functions
  const evaluateQuizAnswer = (answer: string) => {
    const feedbacks = [
      "That's correct! Well done. Let me ask you another question.",
      "Good answer! You clearly understand this topic. Let's continue.",
      "Almost there! That's partially correct. The complete answer would include more details about the process.",
      "That's a good point, but not quite right. Remember that the key concept is about optimizing for customer experience.",
      "Not quite. Remember that this topic focuses on strategies for long-term growth rather than short-term gains."
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };
  
  const generateQuizQuestion = () => {
    const questions = [
      "What are the three key components of an effective marketing strategy?",
      "How does customer segmentation benefit a business?",
      "What factors should be considered when pricing a new product?",
      "Explain the difference between inbound and outbound marketing.",
      "What metrics are most important for measuring the success of a social media campaign?",
      "How can a company effectively differentiate itself from competitors?",
      "What are the advantages of using a CRM system for managing customer relationships?",
      "Describe the customer journey and why it's important to understand it."
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Handle view switching
  const handleViewChange = (view: 'chat' | 'history' | 'cannedQuestions' | 'quizMode') => {
    setActiveView(view);
    setMenuOpen(false);
  };
  
  // Function to handle quiz subject selection
  const handleStartQuiz = (subject: string) => {
    // Clear existing messages
    setMessages([]);
    setActiveView('chat');
    setQuizMode(true);
    
    // Add a welcome message for the quiz
    setTimeout(() => {
      const welcomeMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: `Welcome to the ${subject} quiz! I'll ask you a series of questions to test your knowledge. Let's begin with the first question:\n\n${generateQuizQuestion()}`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
    }, 100);
  };

  // Handle AI Assistant chat submission - modified to work with the new UI
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a user message
    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      text: content,
      timestamp: new Date().toISOString(),
    };
    
    // Add the user message to the chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // If in quiz mode, handle the submission as an answer to a quiz question
      if (quizMode && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
        // In quiz mode, just simulate the AI evaluation - in a real app you'd evaluate the answer
        setTimeout(() => {
          const evaluationMessage = {
            id: uuidv4(),
            role: 'assistant' as const,
            text: evaluateQuizAnswer(content),
            timestamp: new Date().toISOString(),
          };
          
          setMessages(prevMessages => [...prevMessages, evaluationMessage]);
          
          // After evaluation, ask another question
          setTimeout(() => {
            const nextQuestionMessage = {
              id: uuidv4(),
              role: 'assistant' as const,
              text: generateQuizQuestion(),
              timestamp: new Date().toISOString(),
            };
            
            setMessages(prevMessages => [...prevMessages, nextQuestionMessage]);
            setIsLoading(false);
          }, 1000);
        }, 1500);
        
        return;
      }
      
      // Regular chat mode processing
      // Try the simple chat endpoint first as it's more reliable
      console.log('Calling simple chat API with message:', content);
      const simpleResponse = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
      });
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        console.log('Simple API response data:', simpleData);
        
        // Add AI response from simple endpoint
        const aiMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          text: simpleData.message,
          timestamp: new Date().toISOString(),
        };
  
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return; // Exit early since we already have a response
      }
      
      // If simple endpoint failed, try the main chat API
      console.log('Simple API failed, trying main chat API...');
      console.log('Calling chat API with message:', content);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      console.log('API response status:', response.status);
      
      const data = await response.json();
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(`Failed to get response: ${data.error || response.statusText}`);
      }

      // Add AI response
      const aiMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: data.message || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat submission:', error);
      
      // Add error message
      const errorMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: `Sorry, I encountered an error. Please try again. (Error: ${error instanceof Error ? error.message : String(error)})`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle regenerate response
  const handleRegenerateResponse = () => {
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex !== -1) {
      const actualIndex = messages.length - 1 - lastUserMessageIndex;
      const userMessage = messages[actualIndex];
      // Keep messages up to and including the user message, but remove any after it
      setMessages(prev => prev.filter((_, i) => i <= actualIndex));
      // Resubmit the query
      handleSendMessage(userMessage.text);
    }
  };
  
  // Handle stop generating
  const handleStopGenerating = () => {
    setIsLoading(false);
  };
  
  // Handle delete message
  const handleDeleteMessage = (id: string) => {
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      setMessages(messages.slice(0, index));
    }
  };
  
  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // Function to clear all chat history
  const handleClearHistory = () => {
    alert('This would clear all chat history in a real app.');
  };

  // Function to load a historical chat
  const handleLoadChat = (id: string) => {
    alert(`Loading chat ${id} in a real application`);
    setActiveView('chat');
  };

  // Handle file upload
  const handleFileUpload = () => {
    alert('File upload functionality would be integrated here');
  };

  // Handle voice input
  const handleVoiceInput = () => {
    alert('Voice input functionality would be integrated here');
  };

  // Handle emoji picker
  const handleEmojiPicker = () => {
    alert('Emoji picker would be integrated here');
  };
  
  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as SupportedLanguage);
    setSettingsOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Enhanced custom input component
  const EnhancedInput = () => {
    const [inputValue, setInputValue] = useState('');
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      
      // Auto resize the textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
      }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };
    
    const handleSubmit = () => {
      if (inputValue.trim() && !isLoading) {
        handleSendMessage(inputValue);
        setInputValue('');
        
        // Reset height
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
        }
      }
    };
    
    return (
      <div className="p-2 sm:p-3 border dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg w-full">
        <div className="flex items-end gap-1 sm:gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={quizMode 
                ? translations[language]?.typeYourAnswer || 'Type your answer...' 
                : translations[language]?.askQuestion || 'Ask a question...'}
              disabled={isLoading}
              className="enhanced-input w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base resize-none overflow-y-auto max-h-[80px] sm:max-h-[100px] rounded-xl border-0 focus:outline-none focus:ring-0 bg-transparent text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              rows={1}
            />
          </div>
          
          {/* Send button - smaller on mobile */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading}
            className={`p-1.5 sm:p-2 rounded-full transition-colors ${
              !inputValue.trim() || isLoading
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`}
          >
            <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>
    );
  };

  // New UI layout with top navbar and enhanced UI
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-[260px] z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-lg ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={() => {
              setMessages([]);
              setActiveView('chat');
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <PlusCircle size={16} />
            <span>New chat</span>
          </button>
        </div>

        {/* Navigation Buttons - Moved from bottom to top */}
        <div className="p-2 space-y-1">
          <button
            onClick={() => handleViewChange('quizMode')}
            className="flex items-center w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group text-gray-700 dark:text-gray-300"
          >
            <Brain size={16} className="mr-3" />
            <span>Quiz Mode</span>
          </button>

          <button
            onClick={() => handleViewChange('cannedQuestions')}
            className="flex items-center w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
          >
            <MessageSquare size={16} className="mr-3" />
            <span>Canned Questions</span>
          </button>

          <button
            onClick={() => handleViewChange('history')}
            className="flex items-center w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
          >
            <Clock size={16} className="mr-3" />
            <span>History</span>
          </button>
        </div>

        {/* Spacer to push any future bottom content down */}
        <div className="flex-1"></div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${menuOpen ? "lg:ml-[260px]" : "ml-0"} transition-all duration-300`}>
        {/* Header - Fixed height */}
        <header className="h-14 flex items-center justify-between px-4 backdrop-blur-md bg-white/0 dark:bg-gray-900/0">
          {/* Left: Menu Button */}
          <div className="flex items-center">
            <button 
              className="p-2 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-md"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MenuIcon size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Center: AltaCoach Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold text-gray-700 dark:text-gray-300">
              AltaCoach
            </h1>
          </div>

          {/* Right: Settings */}
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-md"
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <MoreVertical size={20} className="text-gray-700 dark:text-white" />
            </button>
            
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border dark:border-gray-700 z-50">
                <button
                  onClick={() => handleLanguageChange('en')}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Globe size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">Language</span>
                </button>
                <button
                  onClick={() => alert('Admin functionality would be integrated here')}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Shield size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">Admin</span>
                </button>
                <button
                  onClick={() => alert('Account settings would be integrated here')}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">Account</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Chat Container - Remaining height */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-3xl mx-auto px-4">
            {activeView === 'history' ? (
              // Chat History View
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Chat History</h2>
                {chatHistory.map((chat) => (
                  <div 
                    key={chat.id}
                    className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                    onClick={() => handleLoadChat(chat.id)}
                  >
                    <h3 className="font-medium truncate text-gray-800 dark:text-gray-200">{chat.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{chat.snippet}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">{chat.date}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Delete chat ${chat.id} in a real application`);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                      >
                        <Trash2 size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeView === 'cannedQuestions' ? (
              // Canned Questions View
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quick Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {exampleQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      className="p-3 text-left border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      onClick={() => {
                        handleSuggestedQuestion(question);
                        setActiveView('chat');
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeView === 'quizMode' ? (
              // Quiz Mode View
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Quiz Mode</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Select a subject to test your knowledge with interactive questions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizSubjects.map((subject, idx) => (
                    <button
                      key={idx}
                      className="p-4 border dark:border-gray-700 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 flex flex-col"
                      onClick={() => handleStartQuiz(subject.title)}
                    >
                      <span className="font-medium text-lg">{subject.title}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {subject.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4 pb-24"> {/* Added pb-24 for bottom padding */}
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    isLast={index === messages.length - 1}
                    onDeleteMessage={handleDeleteMessage}
                  />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} /> {/* Reference element for auto-scrolling */}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Chat Input - Only show in chat view */}
        {activeView === 'chat' && (
          <div className="fixed bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-white dark:from-gray-900 pt-6 pb-4">
            <div className="max-w-3xl mx-auto px-4">
              <EnhancedInput />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}