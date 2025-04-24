'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { SupportedLanguage, useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import Link from 'next/link';

// Import components
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { cn } from './lib/utils';
import { SuggestionModal } from '@/components/SuggestionModal';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';

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
    aiAssistant: 'altacoach',
    askQuestion: 'Ask a question...',
    askAI: 'Ask AI',
    typeYourAnswer: 'Type your answer...',
    submitAnswer: 'Submit',
    newChat: 'New chat',
    menu: {
      quizMode: 'Quiz Mode',
      cannedQuestions: 'Canned Questions',
      history: 'History',
      suggestions: 'Suggestions',
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
    footerDisclaimer: 'altacoach is an AI and may make mistakes. Please verify any important information.',
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
      suggestions: 'Suggestions',
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
    footerDisclaimer: 'altacoach est une IA et peut faire des erreurs. Veuillez vérifier toute information importante.',
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
      suggestions: 'Vorschläge',
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
    footerDisclaimer: 'altacoach ist eine KI und kann Fehler machen. Bitte überprüfen Sie alle wichtigen Informationen.',
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
      suggestions: 'Suggerimenti',
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
    footerDisclaimer: 'altacoach è un\'IA e può commettere errori. Verifica qualsiasi informazione importante.',
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
      suggestions: 'Sugerencias',
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
    footerDisclaimer: 'altacoach è un\'IA e può commettere errori. Verifica qualsiasi informazione importante.',
  }
};

// Add this constant at the top of the file with other constants
const DEFAULT_RESPONSE = "Sorry, Altacoach is designed to coach you about client experience. For any other topic, please contact your manager or send a suggestion to the team.";

export default function StaffDashboard() {
  // Core hooks and auth logic
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, logout, isAuthenticated } = useAuth();
  const allowedRoles = useMemo(() => [UserRole.STAFF, UserRole.USER], []);
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [chatId, setChatId] = useState<string | null>(null);

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
  const heightRef = useRef<string>(''); // Define heightRef to track textarea height

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

  // Add state for suggestion modal
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [suggestionInput, setSuggestionInput] = useState('');

  // Add state for password reset modal
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  // Toggle dropdown section function - MODIFIED HERE
  const toggleSection = (section: string) => {
    // Clear messages and reset UI when switching sections
    if (expandedSection !== section) {
      // Reset all states
      setMessages([]); // Clear chat messages
      setIsLoading(false); // Reset loading state
      setQuizMode(false); // Reset quiz mode
      setInputValue(''); // Clear input field

      // Set active view to chat for proper UI update
      setActiveView('chat');

      // Set the new expanded section
      setExpandedSection(section);

      // If on mobile, close the menu
      if (window.innerWidth < 1024) {
        setMenuOpen(true);
      }
    } else {
      // Toggle off current section
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

  useEffect(() => {
    if (user?.language) {
      // Map the user's language to the corresponding SupportedLanguage code
      const mappedLanguage = languages.find(lang => lang.name === user.language)?.code || 'en'; // Default to 'en' if not found
      setLanguage(mappedLanguage as SupportedLanguage);
    }
  }, [user, setLanguage]);

  useEffect(() => {
    console.log('[DEBUG] user:', user); // Is user defined?
    if (user) {
      fetch(`/api/chat-documents?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          console.log('📄 Documents for current user:', data);
          setAvailableDocuments(data);
        })
        .catch(err => console.error('Failed to fetch user documents', err));
    }
  }, [user]);

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

  // Cleanup effect
  useEffect(() => {
    // Cleanup function
    return () => {
      setMessages([]);
      setIsLoading(false);
      setQuizMode(false);
      setInputValue('');
    };
  }, []);

  // Update useEffect for navigation after authentication
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.role === UserRole.SUPER_ADMIN) {
        router.push('/superadmin');
      } else if (user?.role === UserRole.ADMIN) {
        router.push('/admin');
      } else if (user?.role === UserRole.STAFF || user?.role === UserRole.USER) {
        // Both Staff and User roles should stay on this page
        return;
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Add this useEffect to focus the input field on initial page load
  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current && activeView === 'chat') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Small delay to ensure the component is fully rendered
    }
  }, [activeView]);

  // Early return for loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C72026]"></div>
      </div>
    );
  }

  // If user isn't a staff member, don't render anything (useAuthProtection will redirect)
  if (!user || ![UserRole.STAFF, UserRole.USER].includes(user.role)) {
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
    // Reset states
    setMessages([]);
    setIsLoading(false);
    setQuizMode(false);
    setInputValue('');

    // Update view
    setActiveView(view);
    toggleSection(view);
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

    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      text: content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if it's a canned question
      const isCannedQuestion = [
        "What are effective strategies for small business growth?",
        "How can I create a competitive analysis for my industry?",
        "What metrics should I track for my business performance?",
        "How can I improve my social media marketing?",
        "What are the latest digital marketing trends?",
        "How to create an effective email marketing campaign?",
        "What content marketing strategies work best for B2B companies?",
        "How to improve customer satisfaction scores?",
        "What are best practices for handling customer complaints?",
        "How can AI enhance our customer service operations?",
        "Can you summarize this document for me?",
        "What are the key points in this document?",
        "How does this document compare to industry standards?"
      ].includes(content);

      if (isCannedQuestion) {
        const restrictedMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          text: DEFAULT_RESPONSE,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, restrictedMessage]);
        setIsLoading(false);
        return;
      }

      if (!quizMode) {
        const fileIds = availableDocuments.map((doc: any) => doc.id);

        const endpoint = chatId
          ? `/api/chat/${chatId}/ask`
          : `/api/chat/create`;

        const mappedLanguageCode = languages.find(lang => lang.code === language)?.code || 'en'; // Default to 'en' if not found

        const payload = chatId
          ? { question: content, file_ids: fileIds, language_code: mappedLanguageCode }
          : { name: 'New Chat', user_id: user.id, question: content, file_ids: fileIds, language_code: mappedLanguageCode };
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!chatId && data.chat_id) {
          setChatId(data.chat_id); // 💾 save new chat ID
        }

        const aiMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          text: data?.answer ?? DEFAULT_RESPONSE,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }


      // Rest of the existing code for handling regular messages
      if (quizMode && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
        const feedback = evaluateQuizAnswer(content);
        const feedbackMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          text: feedback,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, feedbackMessage]);

        setTimeout(() => {
          const newQuestion = generateQuizQuestion();
          const questionMessage = {
            id: uuidv4(),
            role: 'assistant' as const,
            text: newQuestion,
            timestamp: new Date().toISOString(),
          };

          setMessages(prev => [...prev, questionMessage]);
        }, 1500);

        setIsLoading(false);
        return;
      }

      const aiMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: DEFAULT_RESPONSE,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat submission:', error);

      const errorMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        text: DEFAULT_RESPONSE,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle regenerate response
  const handleRegenerateResponse = () => {
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex !== -1) {
      const actualIndex = messages.length - 1 - lastUserMessageIndex;
      const userMessage = messages[actualIndex];
      setMessages(prev => prev.filter((_, i) => i <= actualIndex));
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
    setMessages([]);
    setTimeout(() => {
      const userMessage = {
        id: uuidv4(),
        role: 'user' as const,
        text: question,
        timestamp: new Date().toISOString(),
      };

      setMessages([userMessage]);
      setActiveView('chat');
      setQuizMode(false);
      setIsLoading(true);

      const estimatedLength = question.length * 5;
      const typingDelay = Math.min(
        Math.max(1000, estimatedLength / 20),
        5000
      );

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
            const aiMessage = {
              id: uuidv4(),
              role: 'assistant' as const,
              text: data.message || "I'm sorry, I couldn't generate a response.",
              timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
          })
          .catch(error => {
            console.error("Error fetching canned question response:", error);

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
      }, typingDelay);
    }, 50);

    if (window.innerWidth < 1024) {
      setMenuOpen(false);
    }
  };

  // Handle question click with single vs double click detection
  const handleQuestionClick = (question: string, questionId: string) => {
    const now = Date.now();
    const lastClick = lastClickTime[questionId] || 0;
    const isDoubleClick = now - lastClick < 300;

    setLastClickTime(prev => ({
      ...prev,
      [questionId]: now
    }));

    if (isDoubleClick) {
      handleSendMessage(question);
      if (window.innerWidth < 1024) {
        setMenuOpen(false);
      }
    } else {
      setInputValue(question);
      setActiveView('chat');
      if (window.innerWidth < 1024) {
        setMenuOpen(false);
      }
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    console.log('[DEBUG] user:', user); // Is user defined?
    if (user) {
      console.log('[USER OBJECT]', JSON.stringify(user, null, 2)); // Print user object with all values
    }
  }, [user]);

  // Function to clear all chat history
  const handleClearHistory = () => {
    alert('This would clear all chat history in a real app.');
  };

  // Function to load a historical chat
  const handleLoadChat = (id: string) => {
    alert(`Loading chat ${id} in a real application`);
    setActiveView('chat');
    setMenuOpen(false);
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
  const handleLanguageChange = async (langCode: string, langName: string) => {
    try {
      // Update the language in the database for the current user
      const response = await fetch('/api/user/update-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id, // Pass the current user's ID
          language: langName, // Pass the selected language code
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update language in the database');
      }

      // Update the language in the frontend state
      setLanguage(langCode as SupportedLanguage);
      if (user) {
        user.language = langName; // Update the language property of the user object
        console.log('[DEBUG] Updated user object:', user);
      }
      setSettingsOpen(false);
    } catch (error) {
      console.error('Error updating language:', error);
      alert('Failed to update language. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Function to handle password reset
  const handleResetPassword = async (currentPassword: string, newPassword: string) => {
    try {
      // Call the API to verify current password and update with new password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Handle suggestion submission
  const handleSuggestionSubmit = (suggestion: string) => {
    alert('Thank you for your suggestion: ' + suggestion);
    setSuggestionInput('');
    setIsSuggestionModalOpen(false);
  };

  // Enhanced custom input component
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd;

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const clone = document.createElement('textarea');
        const styles = window.getComputedStyle(inputRef.current);

        Array.from(styles).forEach(key => {
          clone.style.setProperty(key, styles.getPropertyValue(key));
        });

        clone.value = e.target.value;
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        clone.style.height = 'auto';
        document.body.appendChild(clone);

        const newHeight = `${Math.min(clone.scrollHeight, 100)}px`;
        document.body.removeChild(clone);

        if (heightRef.current !== newHeight) {
          heightRef.current = newHeight;
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = newHeight;
        }

        // Only restore cursor on desktop devices
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (!isMobile) {
          setTimeout(() => {
            inputRef.current?.setSelectionRange(selectionStart, selectionEnd);
          }, 10);
        }
      }
    });
  };

  return (
    <div className="h-screen flex overflow-scroll">
      <div className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-[260px] z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-lg overflow-y-auto ${menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className="p-2">
          <button
            onClick={() => {
              setMessages([]);
              setActiveView('chat');
              setQuizMode(false);
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <PlusCircle size={16} className="text-[#C72026] dark:text-[#C72026]" />
            <span>{translations[language]?.newChat || 'New chat'}</span>
          </button>
        </div>

        <div className="p-2 space-y-1">
          <div className="border-b dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSection('quizMode');
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
            >
              <div className="flex items-center">
                <Brain size={16} className="mr-3 text-[#C72026] dark:text-[#C72026]" />
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

            {expandedSection === 'quizMode' && (
              <div className="pl-8 pr-3 pb-3 space-y-3 animate-fadeIn">
                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-2">
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

                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-2">
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

                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-2">
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

          <div className="border-b dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSection('cannedQuestions');
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-3 text-[#C72026] dark:text-[#C72026]" />
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

            {expandedSection === 'cannedQuestions' && (
              <div className="pl-8 pr-3 pb-3 space-y-3 animate-fadeIn">
                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-1.5">
                    {translations[language]?.categories.businessStrategy || 'Business Strategy'}
                  </div>
                  {[
                    "What are effective strategies for small business growth?",
                    "How can I create a competitive analysis for my industry?",
                    "What metrics should I track for my business performance?"
                  ].map((question, idx) => (
                    <button
                      key={`strategy-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1 relative group"
                      onClick={() => handleQuestionClick(question, `strategy-${idx}`)}
                      title="Single click to copy, double click to send"
                    >
                      {question}
                      <span className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Click to copy, double click to send
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-1.5">
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
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1 relative group"
                      onClick={() => handleQuestionClick(question, `marketing-${idx}`)}
                      title="Single click to copy, double click to send"
                    >
                      {question}
                      <span className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Click to copy, double click to send
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-1.5">
                    {translations[language]?.categories.customerSupport || 'Customer Support'}
                  </div>
                  {[
                    "How to improve customer satisfaction scores?",
                    "What are best practices for handling customer complaints?",
                    "How can AI enhance our customer service operations?"
                  ].map((question, idx) => (
                    <button
                      key={`support-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1 relative group"
                      onClick={() => handleQuestionClick(question, `support-${idx}`)}
                      title="Single click to copy, double click to send"
                    >
                      {question}
                      <span className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Click to copy, double click to send
                      </span>
                    </button>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-medium text-[#C72026] dark:text-[#C72026] mb-1.5">
                    {translations[language]?.categories.documentAnalysis || 'Document Analysis'}
                  </div>
                  {[
                    "Can you summarize this document for me?",
                    "What are the key points in this document?",
                    "How does this document compare to industry standards?"
                  ].map((question, idx) => (
                    <button
                      key={`document-${idx}`}
                      className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mb-1 relative group"
                      onClick={() => handleQuestionClick(question, `document-${idx}`)}
                      title="Single click to copy, double click to send"
                    >
                      {question}
                      <span className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                        Click to copy, double click to send
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-b dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSection('history');
              }}
              className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
            >
              <div className="flex items-center">
                <Clock size={16} className="mr-3 text-[#C72026] dark:text-[#C72026]" />
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

            {expandedSection === 'history' && (
              <div className="pl-8 pr-3 pb-3 space-y-3 animate-fadeIn">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full p-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="truncate font-medium">{chat.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {chat.date}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-b dark:border-gray-700">
          <button
            onClick={() => setIsSuggestionModalOpen(true)}
            className="flex items-center justify-between w-full px-3 py-3 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 group"
          >
            <div className="flex items-center">
              <PlusCircle size={16} className="mr-3 text-[#C72026] dark:text-[#C72026]" />
              <span>{translations[language]?.menu.suggestions || 'Suggestions'}</span>
            </div>
          </button>
        </div>

        <div className="flex-1"></div>
      </div>

      <div className={`flex-1 flex flex-col ${menuOpen ? "lg:ml-[260px]" : "ml-0"} transition-all duration-300`}>
        <header className="relative z-20 h-14 flex items-center justify-between px-4 backdrop-blur-md bg-white/0 dark:bg-gray-900/0">          {/* Left - Menu Button and Logo */}
          <div className="flex items-center space-x-3">
            <button
              className="p-2 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-md"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MenuIcon size={20} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* Logo moved next to menu button */}
            {/* <div className="flex-shrink-0">
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
            </div> */}
          </div>

          {/* Center - Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg font-bold tracking-wider font-['Helvetica'] italic">
              <span className="text-gray-900 dark:text-white tracking-[.15em]">alta</span>
              <span className="text-[#C72026] tracking-[.15em]">c</span>
              <span className="text-gray-900 dark:text-white tracking-[.15em]">oach</span>
            </h1>
          </div>

          {/* Right - Settings */}
          <div className="relative">
            <button
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md settings-trigger"
              onClick={() => setSettingsOpen(!settingsOpen)}
            >
              <MoreVertical size={20} className="text-gray-700 dark:text-white" />
            </button>

            {settingsOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border dark:border-gray-700 z-[1050] settings-dropdown"
              >
                <button
                  onClick={() => {
                    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Globe size={16} className="mr-2 dark:text-white" />
                  <span className="dark:text-white">{translations[language]?.settings.language || 'Language'}</span>
                  <svg
                    className={`ml-auto h-4 w-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-90' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

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
                              handleLanguageChange(lang.code, lang.name);
                              setIsLanguageDropdownOpen(false);
                              setSettingsOpen(false);
                            }}
                            className={`flex items-center justify-center px-2 py-2 text-sm rounded-md ${language === lang.code
                              ? 'bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026]'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                              }`}
                          >
                            <span>{lang.name}</span>
                            {language === lang.code && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#C72026] dark:text-[#C72026] ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <button
                  onClick={() => setIsResetPasswordModalOpen(true)}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  role="menuitem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Reset Password
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

        <div className="flex-1 overflow-scroll">
          <div className="max-w-3xl mx-auto px-4">
            {activeView === 'history' ? (
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
              <div className="space-y-4 pb-24">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLast={index === messages.length - 1}
                    onDeleteMessage={handleDeleteMessage}
                  />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {activeView === 'chat' && (
          <div className={`fixed bottom-0 z-10 bg-gradient-to-t from-white dark:from-gray-900 pt-6 pb-4 ${menuOpen ? "lg:left-[260px]" : "left-0"
            } right-0 transition-all duration-300`}>
            <div className="max-w-3xl mx-auto px-4">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isLoading && inputValue.trim()) {
                      e.preventDefault(); // Prevent default newline behavior
                      handleSendMessage(inputValue);
                      setInputValue(''); // Clear input after sending
                    }
                  }}
                  placeholder="Ask Question"
                  // Added padding-right to make space for the button
                  className="w-full p-3 pr-12 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#C72026] dark:bg-gray-800 dark:text-white"
                  rows={1}
                  style={{ maxHeight: '100px', overflowY: 'auto' }} // Added maxHeight and overflow
                />
                {/* Send Button - Positioned absolutely inside the relative container */}
                <button
                  onClick={() => {
                    if (!isLoading && inputValue.trim()) {
                      handleSendMessage(inputValue);
                      setInputValue(''); // Clear input after sending
                    }
                  }}
                  disabled={isLoading || !inputValue.trim()}
                  // Positioned absolutely at the bottom right
                  className={`absolute bottom-2 right-2 p-2 rounded-md text-white transition-colors ${isLoading || !inputValue.trim()
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-[#C72026] hover:bg-[#A31A1F]'
                    }`}
                >
                  <Send size={18} /> {/* Slightly smaller icon might fit better */}
                </button>
              </div>
              <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                <p className="italic">
                  {translations[language]?.footerDisclaimer}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        onSubmit={handleResetPassword}
        language={language}
      />

      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => {
          setSuggestionInput('');
          setIsSuggestionModalOpen(false);
        }}
        onSubmit={handleSuggestionSubmit}
        suggestionInput={suggestionInput}
        setSuggestionInput={setSuggestionInput}
        language={language}
      />

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