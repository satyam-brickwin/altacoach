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
    newChat: 'New chat',
    menu: {
      quizMode: 'Quiz Mode',
      cannedQuestions: 'Canned Questions',
      history: 'History',
    },
    quizModeActive: 'Quiz Mode Active',
    categories: {
      business: 'Business',
      businessStrategy: 'Business Strategy',
      marketing: 'Marketing',
      customerSupport: 'Customer Support',
      documentAnalysis: 'Document Analysis',
      productKnowledge: 'Product Knowledge',
      industryKnowledge: 'Industry Knowledge',
    },
    settings: {
      language: 'Language',
      adminView: 'Admin',
      account: 'Account Settings',
      darkMode: 'Dark Mode',
      logout: 'Logout',
    },
    empty: {
      title: 'How can I help you today?',
      description: 'Ask me anything about your business needs, or select a suggestion below.'
    },
    emptyState: {
      title: "Start a conversation",
      description: "Begin by typing a message to start your chat. Ask questions, get assistance, or explore topics together.",
      suggestions: {
        tellMeAbout: {
          title: "Tell me about...",
          description: "Complex topics and explanations"
        },
        helpMeWith: {
          title: "Help me with...",
          description: "Problem solving and creative tasks"
        },
        writeA: {
          title: "Write a...",
          description: "Creative writing and formatting"
        },
        analyzeThis: {
          title: "Analyze this...",
          description: "Data analysis and interpretation"
        }
      }
    },
  },
  fr: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Poser une question...',
    askAI: 'Demander à l\'IA',
    typeYourAnswer: 'Répondez à la question...',
    submitAnswer: 'Soumettre',
    newChat: 'Nouvelle conversation',
    menu: {
      quizMode: 'Mode Quiz',
      cannedQuestions: 'Questions prédéfinies',
      history: 'Historique',
    },
    quizModeActive: 'Mode Quiz Actif',
    categories: {
      business: 'Affaires',
      businessStrategy: 'Stratégie d\'entreprise',
      marketing: 'Marketing',
      customerSupport: 'Service client',
      documentAnalysis: 'Analyse de documents',
      productKnowledge: 'Connaissance du produit',
      industryKnowledge: 'Connaissance de l\'industrie',
    },
    settings: {
      language: 'Langue',
      adminView: 'Admin',
      account: 'Paramètres du compte',
      darkMode: 'Mode sombre',
      logout: 'Déconnexion',
    },
    empty: {
      title: 'Comment puis-je vous aider aujourd\'hui?',
      description: 'Posez-moi n\'importe quelle question concernant vos besoins professionnels, ou sélectionnez une suggestion ci-dessous.'
    },
    emptyState: {
      title: "Commencer une conversation",
      description: "Commencez par taper un message pour démarrer votre conversation. Posez des questions, obtenez de l'aide ou explorez des sujets ensemble.",
      suggestions: {
        tellMeAbout: {
          title: "Parlez-moi de...",
          description: "Sujets complexes et explications"
        },
        helpMeWith: {
          title: "Aidez-moi avec...",
          description: "Résolution de problèmes et tâches créatives"
        },
        writeA: {
          title: "Écrivez un...",
          description: "Rédaction créative et mise en forme"
        },
        analyzeThis: {
          title: "Analysez ceci...",
          description: "Analyse et interprétation des données"
        }
      }
    },
  },
  de: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Eine Frage stellen...',
    askAI: 'KI fragen',
    typeYourAnswer: 'Antworten Sie auf die Frage...',
    submitAnswer: 'Einreichen',
    newChat: 'Neuer Chat',
    menu: {
      quizMode: 'Quiz-Modus',
      cannedQuestions: 'Vorgefertigte Fragen',
      history: 'Verlauf',
    },
    quizModeActive: 'Quiz-Modus Aktiv',
    categories: {
      business: 'Geschäft',
      businessStrategy: 'Geschäftsstrategie',
      marketing: 'Marketing',
      customerSupport: 'Kundendienst',
      documentAnalysis: 'Dokumentenanalyse',
      productKnowledge: 'Produktwissen',
      industryKnowledge: 'Branchenkenntnisse',
    },
    settings: {
      language: 'Sprache',
      adminView: 'Admin',
      account: 'Kontoeinstellungen',
      darkMode: 'Dunkelmodus',
      logout: 'Abmelden',
    },
    empty: {
      title: 'Wie kann ich Ihnen heute helfen?',
      description: 'Stellen Sie mir jede Frage zu Ihren geschäftlichen Bedürfnissen oder wählen Sie unten einen Vorschlag aus.'
    },
    emptyState: {
      title: "Starten Sie ein Gespräch",
      description: "Beginnen Sie mit der Eingabe einer Nachricht, um Ihren Chat zu starten. Stellen Sie Fragen, erhalten Sie Hilfe oder erkunden Sie gemeinsam Themen.",
      suggestions: {
        tellMeAbout: {
          title: "Erzählen Sie mir über...",
          description: "Komplexe Themen und Erklärungen"
        },
        helpMeWith: {
          title: "Helfen Sie mir mit...",
          description: "Problemlösung und kreative Aufgaben"
        },
        writeA: {
          title: "Schreiben Sie...",
          description: "Kreatives Schreiben und Formatierung"
        },
        analyzeThis: {
          title: "Analysieren Sie das...",
          description: "Datenanalyse und Interpretation"
        }
      }
    },
  },
  it: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Fai una domanda...',
    askAI: 'Chiedi all\'IA',
    typeYourAnswer: 'Rispondi alla domanda...',
    submitAnswer: 'Invia',
    newChat: 'Nuova chat',
    menu: {
      quizMode: 'Modalità Quiz',
      cannedQuestions: 'Domande predefinite',
      history: 'Cronologia',
    },
    quizModeActive: 'Modalità Quiz Attiva',
    categories: {
      business: 'Affari',
      businessStrategy: 'Strategia aziendale',
      marketing: 'Marketing',
      customerSupport: 'Assistenza clienti',
      documentAnalysis: 'Analisi documenti',
      productKnowledge: 'Conoscenza del prodotto',
      industryKnowledge: 'Conoscenza del settore',
    },
    settings: {
      language: 'Lingua',
      adminView: 'Admin',
      account: 'Impostazioni account',
      darkMode: 'Modalità scura',
      logout: 'Esci',
    },
    empty: {
      title: 'Come posso aiutarti oggi?',
      description: 'Fammi qualsiasi domanda sulle tue esigenze aziendali o seleziona un suggerimento qui sotto.'
    },
    emptyState: {
      title: "Inizia una conversazione",
      description: "Inizia digitando un messaggio per avviare la tua chat. Fai domande, ottieni assistenza o esplora argomenti insieme.",
      suggestions: {
        tellMeAbout: {
          title: "Parlami di...",
          description: "Argomenti complessi e spiegazioni"
        },
        helpMeWith: {
          title: "Aiutami con...",
          description: "Risoluzione di problemi e compiti creativi"
        },
        writeA: {
          title: "Scrivi un...",
          description: "Scrittura creativa e formattazione"
        },
        analyzeThis: {
          title: "Analizza questo...",
          description: "Analisi e interpretazione dei dati"
        }
      }
    },
  },
  es: {
    aiAssistant: 'AltaCoach',
    askQuestion: 'Hacer una pregunta...',
    askAI: 'Preguntar a la IA',
    typeYourAnswer: 'Responde la pregunta...',
    submitAnswer: 'Enviar',
    newChat: 'Nueva conversación',
    menu: {
      quizMode: 'Modo Cuestionario',
      cannedQuestions: 'Preguntas predefinidas',
      history: 'Historial',
    },
    quizModeActive: 'Modo Cuestionario Activo',
    categories: {
      business: 'Negocios',
      businessStrategy: 'Estrategia de negocio',
      marketing: 'Marketing',
      customerSupport: 'Atención al cliente',
      documentAnalysis: 'Análisis de documentos',
      productKnowledge: 'Conocimiento del producto',
      industryKnowledge: 'Conocimiento de la industria',
    },
    settings: {
      language: 'Idioma',
      adminView: 'Admin',
      account: 'Configuración de cuenta',
      darkMode: 'Modo oscuro',
      logout: 'Cerrar sesión',
    },
    empty: {
      title: '¿Cómo puedo ayudarte hoy?',
      description: 'Hazme cualquier pregunta sobre tus necesidades de negocio, o selecciona una sugerencia abajo.'
    },
    emptyState: {
      title: "Inicia una conversación",
      description: "Comienza escribiendo un mensaje para iniciar tu chat. Haz preguntas, obtén ayuda o explora temas juntos.",
      suggestions: {
        tellMeAbout: {
          title: "Háblame sobre...",
          description: "Temas complejos y explicaciones"
        },
        helpMeWith: {
          title: "Ayúdame con...",
          description: "Resolución de problemas y tareas creativas"
        },
        writeA: {
          title: "Escribe un...",
          description: "Escritura creativa y formato"
        },
        analyzeThis: {
          title: "Analiza esto...",
          description: "Análisis e interpretación de datos"
        }
      }
    },
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
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  
  // View state
  const [activeView, setActiveView] = useState<'chat' | 'history' | 'cannedQuestions' | 'quizMode'>('chat');
  
  // Quiz mode state
  const [quizMode, setQuizMode] = useState(false);
  
  // Add state for tracking which dropdowns are expanded - MOVED HERE
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Add new state variables
  const [lastClickTime, setLastClickTime] = useState<{ [key: string]: number }>({});
  const [inputValue, setInputValue] = useState('');
  
  // Toggle dropdown section function - MODIFIED HERE
  const toggleSection = (section: string) => {
    // If we're opening a new section that's different from the currently open one
    if (expandedSection !== section) {
      // Reset quiz mode when switching away from quizMode
      if (expandedSection === 'quizMode') {
        setQuizMode(false);
      }
      
      // Clear messages when switching between sections (if needed)
      if ((expandedSection === 'quizMode' && section === 'cannedQuestions') || 
          (expandedSection === 'cannedQuestions' && section === 'quizMode')) {
        // Use a timeout to ensure state updates don't interfere with each other
        setTimeout(() => {
          setMessages([]);
        }, 0);
      }
      
      // Set the new expanded section (do this last to avoid UI glitches)
      setExpandedSection(section);
    } else {
      // Toggle off the current section
      setExpandedSection(null);
    }
  };
  
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

  // Quiz-specific questions
  const [quizQuestions] = useState([
    "What are the three key components of effective leadership?",
    "Explain the difference between growth and fixed mindset",
    "How would you handle a difficult customer situation?",
    "What are the most important metrics for measuring team performance?",
    "Describe the steps in an effective problem-solving process",
    "What strategies would you use to improve team collaboration?"
  ]);

  // Quiz subjects data
  const [quizSubjects] = useState([
    {
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
          // setMenuOpen(false);
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
    // ONLY toggle the section, don't change the activeView
    toggleSection(view);
    // Removed the setActiveView call that was happening somewhere else
  };
  
  // Function to handle quiz subject selection
  const handleStartQuiz = (subject: string) => {
    // Clear existing messages and ensure we're not in a previous quiz
    setMessages([]);
    setActiveView('chat');
    
    // Set quiz mode with a slight delay to ensure state is reset properly
    setTimeout(() => {
      setQuizMode(true);
      
      // Add a welcome message for the quiz
      const welcomeMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: `Welcome to the ${subject} quiz! I'll ask you a series of questions to test your knowledge. Let's begin with the first question:\n\n${generateQuizQuestion()}`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
      
      // Close menu on mobile only
      if (window.innerWidth < 1024) {
        setMenuOpen(false);
      }
    }, 50);
  };

  // Handle AI Assistant chat submission - modified to work with the new UI
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Check if input is too short or not business-related
    if (content.length < 2 || !isBusinessRelatedQuery(content)) {
      const restrictedMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: "Sorry, AltaCoach is designed to coach you about client experience. For any other topic, please contact your manager or send a suggestion to the team.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'user' as const,
        text: content,
        timestamp: new Date().toISOString(),
      }, restrictedMessage]);
      return;
    }

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
        // Generate feedback based on the user's answer
        const feedback = evaluateQuizAnswer(content);
        
        // Create a feedback message first
        const feedbackMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          text: feedback,
          timestamp: new Date().toISOString(),
        };
        
        // Add the feedback message to the chat
        setMessages(prev => [...prev, feedbackMessage]);
        
        // Small delay before sending the next question to make it feel more natural
        setTimeout(() => {
          // Create a new question to ask
          const newQuestion = generateQuizQuestion();
          
          // Create the assistant's next question message
          const questionMessage = {
            id: uuidv4(),
            role: 'assistant' as const,
            text: newQuestion,
            timestamp: new Date().toISOString(),
          };
          
          // Add the question message to the chat
          setMessages(prev => [...prev, questionMessage]);
        }, 1500); // 1.5 second delay between feedback and new question
        
        // Set loading to false since we're handling the response ourselves
        setIsLoading(false);
        return;
      }
      
      // Check if the message is a canned question and use a dedicated response
      const isCannedQuestion = [
        ...["What are effective strategies for small business growth?", 
           "How can I create a competitive analysis for my industry?", 
           "What metrics should I track for my business performance?"],
        ...["How can I improve my social media marketing?",
           "What are the latest digital marketing trends?",
           "How to create an effective email marketing campaign?",
           "What content marketing strategies work best for B2B companies?"],
        ...["How to improve customer satisfaction scores?",
           "What are best practices for handling customer complaints?",
           "How can AI enhance our customer service operations?"],
        ...["Can you summarize this document for me?",
           "What are the key points in this document?",
           "How does this document compare to industry standards?"],
        ...exampleQuestions
      ].includes(content);

      if (isCannedQuestion) {
        // For canned questions, we'll provide a thorough response instead of using the default
        let response;
        
        if (content === "What metrics should I track for my business performance?") {
          response = "For business performance, you should track both financial and operational metrics. Key financial metrics include revenue growth, profit margin, cash flow, and customer acquisition cost (CAC). Important operational metrics are customer retention rate, employee productivity, sales conversion rate, and inventory turnover. Also consider customer satisfaction metrics like Net Promoter Score (NPS). The ideal metrics vary by industry and business goals, so focus on those most relevant to your specific objectives.";
        } else {
          // Use the API for other canned questions
          console.log('Calling API for canned question:', content);
          const apiResponse = await fetch('/api/chat-simple', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              isCannedQuestion: true, // Add a flag to indicate this is a canned question
            }),
          });
          
          if (apiResponse.ok) {
            const data = await apiResponse.json();
            response = data.message;
          } else {
            // Fallback response if API fails
            response = "I'd be happy to help with that question. Please note that our system is currently experiencing high demand. Could you please try again in a moment?";
          }
        }

        // Add response as assistant message
        const aiMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          text: response,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }
      
      // Regular chat API logic for non-canned questions
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

  // Add a helper function to check if query is business-related
  const isBusinessRelatedQuery = (query: string): boolean => {
    // List of business-related keywords
    const businessKeywords = [
      'client', 'customer', 'business', 'service', 'product', 
      'sales', 'marketing', 'strategy', 'support', 'experience',
      'market', 'growth', 'revenue', 'satisfaction', 'feedback',
      'complaint', 'improvement', 'quality', 'performance', 'metrics'
    ];

    // Check if query contains any business-related keywords
    const lowercaseQuery = query.toLowerCase();
    return businessKeywords.some(keyword => lowercaseQuery.includes(keyword)) || 
           query.length > 10; // Allow longer queries as they're likely more specific
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
    // Use a callback for state updates to ensure they're applied in the correct order
    setMessages([]); // First clear all messages
    
    // Use setTimeout to ensure the messages state is fully cleared before sending the new message
    setTimeout(() => {
      // Create a user message
      const userMessage = {
        id: uuidv4(),
        role: 'user' as const,
        text: question,
        timestamp: new Date().toISOString(),
      };
      
      // Add the user message
      setMessages([userMessage]);
      setActiveView('chat');
      
      // Set quiz mode off (if it was on)
      setQuizMode(false);
      
      // Show typing indicator
      setIsLoading(true);
      
      // Calculate response time based on length of potential response
      // This simulates a natural typing experience
      // Short responses: 1-2 seconds, Medium: 2-3.5 seconds, Longer: 3.5-5 seconds
      const estimatedLength = question.length * 5; // Rough estimate of response length
      const typingDelay = Math.min(
        Math.max(1000, estimatedLength / 20), // Min 1 second, scales with estimated length
        5000 // Max 5 seconds
      );
      
      // Call API for this canned question after a short delay to show initial typing
      setTimeout(() => {
        fetch('/api/chat-simple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: question,
            isCannedQuestion: true,
          }),
        })
        .then(response => response.json())
        .then(data => {
          // Add AI response
          const aiMessage = {
            id: uuidv4(),
            role: 'assistant' as const,
            text: data.message || "I'm sorry, I couldn't generate a response.",
            timestamp: new Date().toISOString(),
          };
          
          // Update messages to include both user and assistant message
          setMessages(prev => [...prev, aiMessage]);
        })
        .catch(error => {
          console.error("Error fetching canned question response:", error);
          
          // Add error message
          const errorMessage = {
            id: uuidv4(),
            role: 'assistant' as const,
            text: `Sorry, I encountered an error. Please try again.`,
            timestamp: new Date().toISOString(),
          };
          
          setMessages(prev => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsLoading(false);
        });
      }, typingDelay); // Dynamic delay based on expected response length
      
    }, 50);
    
    // Close menu on mobile
    if (window.innerWidth < 1024) {
      setMenuOpen(false);
    }
  };

  // Handle question click with single vs double click detection
  const handleQuestionClick = (question: string, questionId: string) => {
    const now = Date.now();
    const lastClick = lastClickTime[questionId] || 0;
    const isDoubleClick = now - lastClick < 300; // 300ms threshold for double click
    
    // Update the last click time regardless
    setLastClickTime(prev => ({
      ...prev,
      [questionId]: now
    }));
    
    if (isDoubleClick) {
      // Double click - send immediately
      setQuizMode(false); // Explicitly turn off quiz mode
      handleSuggestedQuestion(question);
    } else {
      // Single click - put in input box
      setQuizMode(false); // Explicitly turn off quiz mode
      setInputValue(question); // Set the value
      setActiveView('chat'); // Ensure we're in chat view
      
      // Set focus and position cursor at end in next tick
      setTimeout(() => {
        if (inputRef.current) {
          // Focus the input
          inputRef.current.focus();
          
          // Position cursor at the end
          const length = question.length;
          inputRef.current.setSelectionRange(length, length);
          
          // Manually trigger height adjustment
          const newHeight = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = newHeight;
        }
      }, 50);
      
      // Close menu on mobile if needed
      if (window.innerWidth < 1024) {
        setMenuOpen(false);
      }
    }
  };

  // Function to clear all chat history
  const handleClearHistory = () => {
    alert('This would clear all chat history in a real app.');
  };

  // Function to load a historical chat
  const handleLoadChat = (id: string) => {
    alert(`Loading chat ${id} in a real application`);
    setActiveView('chat'); // This is correct - we want to change the view
    setMenuOpen(false); // Close the sidebar
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
    // Track textarea height separately to avoid re-renders during typing
    const heightRef = useRef('auto');
    
    // Handle input value changes - completely rewritten
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Update the input value in state
      setInputValue(e.target.value);
      
      // Store current cursor position and selection
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      
      // Use setTimeout to ensure DOM updates properly
      setTimeout(() => {
        if (inputRef.current) {
          // Clone the current input element to measure height without affecting the UI
          const clone = document.createElement('textarea');
          const styles = window.getComputedStyle(inputRef.current);
          
          // Copy all relevant styles to ensure accurate height calculation
          Array.from(styles).forEach(key => {
            clone.style.setProperty(key, styles.getPropertyValue(key));
          });
          
          // Set the clone's value to the current text
          clone.value = e.target.value;
          clone.style.position = 'absolute';
          clone.style.visibility = 'hidden';
          clone.style.height = 'auto';
          document.body.appendChild(clone);
          
          // Measure the clone's height
          const newHeight = `${Math.min(clone.scrollHeight, 100)}px`;
          
          // Remove the clone from the DOM
          document.body.removeChild(clone);
          
          // Only update the height if it has changed
          if (heightRef.current !== newHeight) {
            heightRef.current = newHeight;
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = newHeight;
          }
          
          // Restore cursor position after any height changes
          inputRef.current.focus();
          inputRef.current.setSelectionRange(selectionStart, selectionEnd);
        }
      }, 0);
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
        
        // Reset height reference and input height
        heightRef.current = 'auto';
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
                : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30'
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
      <div className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-[260px] z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-lg overflow-y-auto ${
        menuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* New Chat Button */}
        <div className="p-2">
          <button
            onClick={() => {
              setMessages([]);
              setActiveView('chat');
              setQuizMode(false); // Add this to ensure quiz mode is off for new chats
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <PlusCircle size={16} className="text-purple-600 dark:text-purple-400" />
            <span>{translations[language]?.newChat || 'New chat'}</span>
          </button>
        </div>

        {/* Navigation Dropdowns */}
        <div className="p-2 space-y-1">
          {/* Quiz Mode Dropdown (replacing the toggle) */}
          <div className="border-b dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSection('quizMode'); // Toggle the dropdown
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
            >
              <div className="flex items-center">
                <Brain size={16} className="mr-3 text-purple-600 dark:text-purple-400" />
                <span>{translations[language]?.menu.quizMode || 'Quiz Mode'}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSection === 'quizMode' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Quiz Mode Content */}
            {expandedSection === 'quizMode' && (
              <div className="pl-8 pr-3 pb-3 space-y-3 animate-fadeIn">
                {/* Business */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">
                    Business
                  </div>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Marketing Fundamentals");
                    }}
                  >
                    Marketing Fundamentals
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Sales Strategy");
                    }}
                  >
                    Sales Strategy
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Business Development");
                    }}
                  >
                    Business Development
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Customer Relationship Management");
                    }}
                  >
                    Customer Relationship Management
                  </button>
                </div>
                
                {/* Product Knowledge */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">
                    Product Knowledge
                  </div>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Product Features");
                    }}
                  >
                    Product Features
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Services Overview");
                    }}
                  >
                    Services Overview
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Pricing Models");
                    }}
                  >
                    Pricing Models
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Technical Specifications");
                    }}
                  >
                    Technical Specifications
                  </button>
                </div>
                
                {/* Industry Knowledge */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">
                    Industry Knowledge
                  </div>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Market Trends");
                    }}
                  >
                    Market Trends
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Competitor Analysis");
                    }}
                  >
                    Competitor Analysis
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Industry Regulations");
                    }}
                  >
                    Industry Regulations
                  </button>
                  <button
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                    onClick={() => {
                      handleStartQuiz("Best Practices");
                    }}
                  >
                    Best Practices
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Canned Questions Dropdown */}
          <div className="border-b dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent any default behavior
                toggleSection('cannedQuestions'); // Only toggle the dropdown
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-3 text-purple-600 dark:text-purple-400" />
                <span>{translations[language]?.menu.cannedQuestions || 'Canned Questions'}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSection === 'cannedQuestions' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Canned Questions Content */}
            {expandedSection === 'cannedQuestions' && (
              <div className="pl-8 pr-3 pb-3 space-y-3 animate-fadeIn">
                {/* Business Strategy */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                    {translations[language]?.categories.businessStrategy || 'Business Strategy'}
                  </div>
                  {[
                    "What are effective strategies for small business growth?",
                    "How can I create a competitive analysis for my industry?",
                    "What metrics should I track for my business performance?"
                  ].map((question, idx) => (
                    <button
                      key={`strategy-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                      onClick={() => handleQuestionClick(question, `strategy-${idx}`)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                
                {/* Marketing */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                    {translations[language]?.categories.marketing || 'Marketing'}
                  </div>
                  {[
                    "How can I improve my social media marketing?",
                    "What are the latest digital marketing trends?",
                    "How to create an effective email marketing campaign?",
                    "What content marketing strategies work best for B2B companies?"
                  ].map((question, idx) => (
                    <button
                      key={`marketing-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                      onClick={() => handleQuestionClick(question, `marketing-${idx}`)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                
                {/* Customer Support */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                    {translations[language]?.categories.customerSupport || 'Customer Support'}
                  </div>
                  {[
                    "How to improve customer satisfaction scores?",
                    "What are best practices for handling customer complaints?",
                    "How can AI enhance our customer service operations?"
                  ].map((question, idx) => (
                    <button
                      key={`support-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                      onClick={() => handleQuestionClick(question, `support-${idx}`)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                
                {/* Document Analysis */}
                <div>
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                    {translations[language]?.categories.documentAnalysis || 'Document Analysis'}
                  </div>
                  {[
                    "Can you summarize this document for me?",
                    "What are the key points in this document?",
                    "How does this document compare to industry standards?"
                  ].map((question, idx) => (
                    <button
                      key={`document-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1"
                      onClick={() => handleQuestionClick(question, `document-${idx}`)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat History Dropdown */}
          <div className="border-b dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent any default behavior
                toggleSection('history'); // Only toggle the dropdown
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
            >
              <div className="flex items-center">
                <Clock size={16} className="mr-3 text-purple-600 dark:text-purple-400" />
                <span>{translations[language]?.menu.history || 'History'}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSection === 'history' ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* History Content */}
            {expandedSection === 'history' && (
              <div className="pl-8 pr-3 pb-3 space-y-2 animate-fadeIn">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => {
                      handleLoadChat(chat.id);
                      setMenuOpen(true);
                    }}
                  >
                    <div className="font-medium truncate">{chat.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {chat.date}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
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
            <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {translations[language]?.aiAssistant || 'AltaCoach'}
            </h1>
          </div>

          {/* Right: Settings */}
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-md settings-trigger"
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <MoreVertical size={20} className="text-gray-700 dark:text-white" />
            </button>
            
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border dark:border-gray-700 z-50 settings-dropdown">
                <button
                  onClick={() => {
                    // Toggle language dropdown instead of immediately closing settings
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Globe size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">{translations[language]?.settings.language || 'Language'}</span>
                  <svg 
                    className={`ml-auto h-4 w-4 transition-transform ${
                      isLanguageDropdownOpen ? 'rotate-90' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Language dropdown */}
                {isLanguageDropdownOpen && (
                  <div className="border-t dark:border-gray-700">
                    <div className="py-1 px-2">
                      <div className="mb-1 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Select Language
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              handleLanguageChange(lang.code);
                              setIsLanguageDropdownOpen(false);
                              setSettingsOpen(false);
                            }}
                            className={`flex items-center justify-center px-2 py-2 text-sm rounded-md ${
                              language === lang.code 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            <span>{lang.name}</span>
                            {language === lang.code && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                  <span className="dark:text-white">{translations[language]?.settings.darkMode || 'Dark Mode'}</span>
                </button>
                
                <button
                  onClick={() => alert('Admin functionality would be integrated here')}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Shield size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">{translations[language]?.settings.adminView || 'Admin'}</span>
                </button>
                <button
                  onClick={() => alert('Account settings would be integrated here')}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <User size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">{translations[language]?.settings.account || 'Account'}</span>
                </button>
                <div className="border-t dark:border-gray-700 my-1"></div>
                {/* Add forgot password option */}
                <button
                  onClick={() => alert('Password reset functionality would be integrated here')}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  role="menuitem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Forgot Password
                </button>
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
                      onClick={() => handleQuestionClick(question, `example-${idx}`)}
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
                      onClick={() => handleStartQuiz(subject.title ?? 'Unknown Subject')}
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
              <EmptyState 
                title={translations[language]?.emptyState?.title} 
                description={translations[language]?.emptyState?.description}
                suggestions={translations[language]?.emptyState?.suggestions}
              />
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
        <div className={`fixed bottom-0 z-10 bg-gradient-to-t from-white dark:from-gray-900 pt-6 pb-4 ${
          menuOpen ? "lg:left-[260px]" : "left-0"
        } right-0 transition-all duration-300`}>
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
      
      {/* Add the missing animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}