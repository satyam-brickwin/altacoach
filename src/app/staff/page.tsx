'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, useAuth, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Define translations for the staff dashboard
const translations = {
  en: {
    staffDashboard: 'Staff Dashboard',
    dashboard: 'Dashboard',
    documents: 'Documents',
    trainings: 'Trainings',
    analytics: 'Analytics',
    settings: 'Settings',
    selectLanguage: 'Select Language',
    notifications: 'Notifications',
    search: 'Search',
    searchPlaceholder: 'Search...',
    recentDocuments: 'Recent Documents',
    assignedTrainings: 'Assigned Trainings',
    personalStats: 'Personal Statistics',
    allDocuments: 'All Documents',
    businessDocuments: 'Business Documents',
    adminDocuments: 'Admin Documents',
    myDocuments: 'My Documents',
    title: 'Title',
    description: 'Description',
    type: 'Type',
    status: 'Status',
    created: 'Created',
    source: 'Source',
    actions: 'Actions',
    processed: 'Processed',
    processing: 'Processing',
    view: 'View',
    chat: 'Chat',
    allTrainings: 'All Trainings',
    completedTrainings: 'Completed Trainings',
    inProgressTrainings: 'In Progress',
    notStartedTrainings: 'Not Started',
    progress: 'Progress',
    dueDate: 'Due Date',
    completed: 'Completed',
    inProgress: 'In Progress',
    notStarted: 'Not Started',
    start: 'Start',
    continue: 'Continue',
    review: 'Review',
    aiInteractions: 'AI Interactions',
    upcomingDeadlines: 'Upcoming Deadlines',
    trainingDueDates: 'Training Due Dates',
    noUpcomingDeadlines: 'No upcoming deadlines. Great job!',
    due: 'Due',
    recentlyAddedDocuments: 'Recently Added Documents',
    added: 'Added',
    myLearning: 'My Learning',
    overallProgress: 'Overall Progress',
    completedOn: 'Completed on',
    knowledgeBase: 'Knowledge Base',
    searchDocuments: 'Search documents...',
    noDocumentsFound: 'No documents found',
    tryAdjustingSearch: 'Try adjusting your search terms.',
    admin: 'Admin',
    business: 'Business',
    accessTrainingMaterials: 'Access your training materials, track your progress, and get assistance',
    aiAssistant: 'AI Assistant',
    chatWithDocument: 'Chat with Document',
    askQuestion: 'Ask a question...',
    askAI: 'Ask AI',
    recentQuestions: 'Recent Questions',
    viewAllChats: 'View All Chats',
    noQuestionsYet: 'No questions yet. Ask something to get started.',
    suggestedQuestions: 'Suggested Questions',
    helpMeUnderstand: 'Help me understand this document',
    summarizeDocument: 'Summarize this document',
    findRelatedTraining: 'Find related training',
    documentChat: 'Document Chat',
    documentChatDescription: 'Ask questions about your documents and get instant answers',
    chooseDocument: 'Choose a document to chat with',
    startChat: 'Start Chat',
    marketingStrategy: 'What are the latest marketing strategies for small businesses?',
    socialMediaTips: 'Give me tips for effective social media marketing',
    customerEngagement: 'How can I improve customer engagement?',
    uploadWork: 'Upload Your Work',
    uploadWorkDescription: 'Get feedback on your work based on training materials',
    dragDropFiles: 'Drag and drop files here, or click to select files',
    supportedFileTypes: 'Supports PDF, DOCX, TXT up to 10MB',
    uploadFileButton: 'Upload File',
    getFeedback: 'Get Feedback',
    chatWithDocuments: 'Chat with Documents',
    myWork: 'My Work',
    improvement: 'Improvement Suggestions',
    basedOnKnowledge: 'Based on our knowledge base',
    documentType: 'Document Type',
    selectDocumentType: 'Select document type',
    salesProposal: 'Sales Proposal',
    marketingPlan: 'Marketing Plan',
    customerServiceScript: 'Customer Service Script',
    productDescription: 'Product Description',
    businessReport: 'Business Report',
    trainingMaterial: 'Training Material',
    other: 'Other',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    feedback: 'Feedback',
    selectDocument: 'Select Document',
    dragAndDrop: 'Drag and drop your file here, or click to select',
    supportedFormats: 'Supported formats: PDF, DOCX, TXT (Max 10MB)',
    typeYourQuestion: 'Type your question...',
    typeYourAnswer: 'Type your answer...',
    submitAnswer: 'Submit'
  },
  fr: {
    staffDashboard: 'Tableau de Bord du Personnel',
    dashboard: 'Tableau de Bord',
    documents: 'Documents',
    trainings: 'Formations',
    analytics: 'Analytique',
    settings: 'Paramètres',
    selectLanguage: 'Choisir la Langue',
    notifications: 'Notifications',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher...',
    recentDocuments: 'Documents Récents',
    assignedTrainings: 'Formations Assignées',
    personalStats: 'Statistiques Personnelles',
    allDocuments: 'Tous les Documents',
    businessDocuments: 'Documents d\'Entreprise',
    adminDocuments: 'Documents d\'Administration',
    myDocuments: 'Mes Documents',
    title: 'Titre',
    description: 'Description',
    type: 'Type',
    status: 'Statut',
    created: 'Créé le',
    source: 'Source',
    actions: 'Actions',
    processed: 'Traité',
    processing: 'En cours de traitement',
    view: 'Voir',
    chat: 'Discuter',
    allTrainings: 'Toutes les Formations',
    completedTrainings: 'Formations Terminées',
    inProgressTrainings: 'En Cours',
    notStartedTrainings: 'Non Commencées',
    progress: 'Progrès',
    dueDate: 'Date d\'Échéance',
    completed: 'Terminé',
    inProgress: 'En Cours',
    notStarted: 'Non Commencé',
    start: 'Commencer',
    continue: 'Continuer',
    review: 'Revoir',
    aiInteractions: 'Interactions IA',
    upcomingDeadlines: 'Échéances à venir',
    trainingDueDates: 'Échéances des formations',
    noUpcomingDeadlines: 'Pas d\'échéances à venir. Bravo !',
    due: 'Échéance',
    recentlyAddedDocuments: 'Documents Récemment Ajoutés',
    added: 'Ajouté',
    myLearning: 'Ma Formation',
    overallProgress: 'Progrès Global',
    completedOn: 'Terminé le',
    knowledgeBase: 'Base de Connaissances',
    searchDocuments: 'Rechercher des documents...',
    noDocumentsFound: 'Aucun document trouvé',
    tryAdjustingSearch: 'Essayez d\'ajuster vos termes de recherche.',
    admin: 'Admin',
    business: 'Entreprise',
    accessTrainingMaterials: 'Accédez à vos matériaux d\'apprentissage, suivez votre progression et obtenez de l\'aide',
    aiAssistant: 'Assistant IA',
    chatWithDocument: 'Discuter avec Document',
    askQuestion: 'Poser une question...',
    askAI: 'Demander à l\'IA',
    recentQuestions: 'Questions Récentes',
    viewAllChats: 'Voir Toutes les Discussions',
    noQuestionsYet: 'Pas encore de questions. Posez quelque chose pour commencer.',
    suggestedQuestions: 'Questions Suggérées',
    helpMeUnderstand: 'Aidez-moi à comprendre ce document',
    summarizeDocument: 'Résumer ce document',
    findRelatedTraining: 'Trouver une formation associée',
    documentChat: 'Discussion de Document',
    documentChatDescription: 'Posez des questions sur vos documents et obtenez des réponses instantanées',
    chooseDocument: 'Choisissez un document pour discuter',
    startChat: 'Commencer la Discussion',
    marketingStrategy: 'Quelles sont les dernières stratégies marketing pour les petites entreprises?',
    socialMediaTips: 'Donnez-moi des conseils pour un marketing efficace sur les réseaux sociaux',
    customerEngagement: 'Comment puis-je améliorer l\'engagement client?',
    uploadWork: 'Télécharger Votre Travail',
    uploadWorkDescription: 'Obtenez des commentaires sur votre travail basés sur le matériel de formation',
    dragDropFiles: 'Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers',
    supportedFileTypes: 'Supporte PDF, DOCX, TXT jusqu\'à 10MB',
    uploadFileButton: 'Télécharger Fichier',
    getFeedback: 'Obtenir des Commentaires',
    chatWithDocuments: 'Discuter avec Documents',
    myWork: 'Mon Travail',
    improvement: 'Suggestions d\'Amélioration',
    basedOnKnowledge: 'Basé sur notre base de connaissances',
    documentType: 'Type de Document',
    selectDocumentType: 'Sélectionnez le type de document',
    salesProposal: 'Proposition de Vente',
    marketingPlan: 'Plan Marketing',
    customerServiceScript: 'Script de Service Client',
    productDescription: 'Description de Produit',
    businessReport: 'Rapport d\'Entreprise',
    trainingMaterial: 'Matériel de Formation',
    other: 'Autre',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    feedback: 'Retour',
    selectDocument: 'Sélectionner un Document',
    dragAndDrop: 'Glissez et déposez votre fichier ici, ou cliquez pour sélectionner',
    supportedFormats: 'Formats pris en charge: PDF, DOCX, TXT (Max 10MB)',
    typeYourQuestion: 'Tapez votre question...',
    typeYourAnswer: 'Répondez à la question...',
    submitAnswer: 'Soumettre'
  },
  de: {
    staffDashboard: 'Mitarbeiter-Dashboard',
    dashboard: 'Dashboard',
    documents: 'Dokumente',
    trainings: 'Schulungen',
    analytics: 'Analytik',
    settings: 'Einstellungen',
    selectLanguage: 'Sprache auswählen',
    notifications: 'Benachrichtigungen',
    search: 'Suche',
    searchPlaceholder: 'Suchen...',
    recentDocuments: 'Neueste Dokumente',
    assignedTrainings: 'Zugewiesene Schulungen',
    personalStats: 'Persönliche Statistiken',
    allDocuments: 'Alle Dokumente',
    businessDocuments: 'Unternehmensdokumente',
    adminDocuments: 'Admin-Dokumente',
    myDocuments: 'Meine Dokumente',
    title: 'Titel',
    description: 'Beschreibung',
    type: 'Typ',
    status: 'Status',
    created: 'Erstellt',
    source: 'Quelle',
    actions: 'Aktionen',
    processed: 'Verarbeitet',
    processing: 'In Bearbeitung',
    view: 'Ansehen',
    chat: 'Chat',
    allTrainings: 'Alle Schulungen',
    completedTrainings: 'Abgeschlossene Schulungen',
    inProgressTrainings: 'In Bearbeitung',
    notStartedTrainings: 'Nicht Begonnen',
    progress: 'Fortschritt',
    dueDate: 'Fälligkeitsdatum',
    completed: 'Abgeschlossen',
    inProgress: 'In Bearbeitung',
    notStarted: 'Nicht Begonnen',
    start: 'Starten',
    continue: 'Fortsetzen',
    review: 'Überprüfen',
    aiInteractions: 'KI-Interaktionen',
    upcomingDeadlines: 'Fällige Termine',
    trainingDueDates: 'Fällige Schulungsdaten',
    noUpcomingDeadlines: 'Keine fälligen Termine. Gute Arbeit!',
    due: 'Fällig am',
    recentlyAddedDocuments: 'Kürzlich Hinzugefügte Dokumente',
    added: 'Hinzugefügt',
    myLearning: 'Meine Lernfortschritte',
    overallProgress: 'Gesamtfortschritt',
    completedOn: 'Abgeschlossen am',
    knowledgeBase: 'Wissensbasis',
    searchDocuments: 'Dokumente suchen...',
    noDocumentsFound: 'Keine Dokumente gefunden',
    tryAdjustingSearch: 'Versuchen Sie, Ihre Suchbegriffe zu ändern.',
    admin: 'Admin',
    business: 'Unternehmen',
    accessTrainingMaterials: 'Greifen Sie auf Ihre Lernmaterialien zu, verfolgen Sie Ihren Fortschritt und erhalten Sie Hilfe',
    aiAssistant: 'KI-Assistent',
    chatWithDocument: 'Mit Dokument chatten',
    askQuestion: 'Eine Frage stellen...',
    askAI: 'KI fragen',
    recentQuestions: 'Kürzliche Fragen',
    viewAllChats: 'Alle Chats anzeigen',
    noQuestionsYet: 'Noch keine Fragen. Stellen Sie eine Frage, um zu beginnen.',
    suggestedQuestions: 'Vorgeschlagene Fragen',
    helpMeUnderstand: 'Hilf mir, dieses Dokument zu verstehen',
    summarizeDocument: 'Dieses Dokument zusammenfassen',
    findRelatedTraining: 'Verwandte Schulung finden',
    documentChat: 'Dokument-Chat',
    documentChatDescription: 'Stellen Sie Fragen zu Ihren Dokumenten und erhalten Sie sofortige Antworten',
    chooseDocument: 'Wählen Sie ein Dokument zum Chatten',
    startChat: 'Chat starten',
    marketingStrategy: 'Was sind die neuesten Marketingstrategien für kleine Unternehmen?',
    socialMediaTips: 'Geben Sie mir Tipps für effektives Social-Media-Marketing',
    customerEngagement: 'Wie kann ich das Kundenengagement verbessern?',
    uploadWork: 'Laden Sie Ihre Arbeit hoch',
    uploadWorkDescription: 'Erhalten Sie Feedback zu Ihrer Arbeit basierend auf Schulungsmaterialien',
    dragDropFiles: 'Ziehen Sie Dateien hierher oder klicken Sie, um Dateien auszuwählen',
    supportedFileTypes: 'Unterstützt PDF, DOCX, TXT bis zu 10MB',
    uploadFileButton: 'Datei hochladen',
    getFeedback: 'Feedback erhalten',
    chatWithDocuments: 'Mit Dokumenten chatten',
    myWork: 'Meine Arbeit',
    improvement: 'Verbesserungsvorschläge',
    basedOnKnowledge: 'Basierend auf unserer Wissensdatenbank',
    documentType: 'Dokumenttyp',
    selectDocumentType: 'Dokumenttyp auswählen',
    salesProposal: 'Verkaufsangebot',
    marketingPlan: 'Marketingplan',
    customerServiceScript: 'Kundendienstskript',
    productDescription: 'Produktbeschreibung',
    businessReport: 'Geschäftsbericht',
    trainingMaterial: 'Schulungsmaterial',
    other: 'Andere',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    feedback: 'Feedback',
    selectDocument: 'Dokument auswählen',
    dragAndDrop: 'Ziehen Sie Ihre Datei hierher oder klicken Sie zum Auswählen',
    supportedFormats: 'Unterstützte Formate: PDF, DOCX, TXT (Max 10MB)',
    typeYourQuestion: 'Geben Sie Ihre Frage ein...',
    typeYourAnswer: 'Antworten Sie auf die Frage...',
    submitAnswer: 'Einreichen'
  },
  it: {
    staffDashboard: 'Dashboard del Personale',
    dashboard: 'Dashboard',
    documents: 'Documenti',
    trainings: 'Formazione',
    analytics: 'Analisi',
    settings: 'Impostazioni',
    selectLanguage: 'Seleziona Lingua',
    notifications: 'Notifiche',
    search: 'Cerca',
    searchPlaceholder: 'Cerca...',
    recentDocuments: 'Documenti Recenti',
    assignedTrainings: 'Formazione Assegnata',
    personalStats: 'Statistiche Personali',
    allDocuments: 'Tutti i Documenti',
    businessDocuments: 'Documenti Aziendali',
    adminDocuments: 'Documenti Admin',
    myDocuments: 'I Miei Documenti',
    title: 'Titolo',
    description: 'Descrizione',
    type: 'Tipo',
    status: 'Stato',
    created: 'Creato',
    source: 'Fonte',
    actions: 'Azioni',
    processed: 'Elaborato',
    processing: 'In elaborazione',
    view: 'Visualizza',
    chat: 'Chat',
    allTrainings: 'Tutta la Formazione',
    completedTrainings: 'Formazione Completata',
    inProgressTrainings: 'In Corso',
    notStartedTrainings: 'Non Iniziato',
    progress: 'Progresso',
    dueDate: 'Scadenza',
    completed: 'Completato',
    inProgress: 'In Corso',
    notStarted: 'Non Iniziato',
    start: 'Inizia',
    continue: 'Continua',
    review: 'Rivedi',
    aiInteractions: 'Interazioni IA',
    upcomingDeadlines: 'Scadenze im corso',
    trainingDueDates: 'Scadenze delle formazioni',
    noUpcomingDeadlines: 'Nessuna scadenza imminente. Ottimo lavoro!',
    due: 'Scadenza',
    recentlyAddedDocuments: 'Documenti Recenti',
    added: 'Aggiunto',
    myLearning: 'La Mia Formazione',
    overallProgress: 'Progresso Globale',
    completedOn: 'Completato il',
    knowledgeBase: 'Base di Conoscenza',
    searchDocuments: 'Cerca documenti...',
    noDocumentsFound: 'Nessun documento trovato',
    tryAdjustingSearch: 'Prova a modificare i termini di ricerca.',
    admin: 'Admin',
    business: 'Azienda',
    accessTrainingMaterials: 'Accedi ai tuoi materiali di apprendimento, segui il tuo progresso e ottieni aiuto',
    aiAssistant: 'Assistente IA',
    chatWithDocument: 'Chatta con Documento',
    askQuestion: 'Fai una domanda...',
    askAI: 'Chiedi all\'IA',
    recentQuestions: 'Domande Recenti',
    viewAllChats: 'Visualizza Tutte le Chat',
    noQuestionsYet: 'Ancora nessuna domanda. Chiedi qualcosa per iniziare.',
    suggestedQuestions: 'Domande Suggerite',
    helpMeUnderstand: 'Aiutami a capire questo documento',
    summarizeDocument: 'Riassumi questo documento',
    findRelatedTraining: 'Trova formazione correlata',
    documentChat: 'Chat sul Documento',
    documentChatDescription: 'Fai domande sui tuoi documenti e ottieni risposte istantanee',
    chooseDocument: 'Scegli un documento con cui chattare',
    startChat: 'Inizia Chat',
    marketingStrategy: 'Quali sono le ultime strategie di marketing per le piccole imprese?',
    socialMediaTips: 'Dammi consigli per un marketing efficace sui social media',
    customerEngagement: 'Come posso migliorare la participación del cliente?',
    uploadWork: 'Carica il Tuo Lavoro',
    uploadWorkDescription: 'Ricevi feedback sul tuo lavoro basato sui materiali di formazione',
    dragDropFiles: 'Trascina e rilascia i file qui, o clicca per selezionare i file',
    supportedFileTypes: 'Supporta PDF, DOCX, TXT fino a 10MB',
    uploadFileButton: 'Carica File',
    getFeedback: 'Ottieni Feedback',
    chatWithDocuments: 'Chatta con Documenti',
    myWork: 'Il Mio Lavoro',
    improvement: 'Suggerimenti di Miglioramento',
    basedOnKnowledge: 'Basato sulla nostra base di conoscenza',
    documentType: 'Tipo di Documento',
    selectDocumentType: 'Seleziona tipo di documento',
    salesProposal: 'Proposta di Vendita',
    marketingPlan: 'Piano di Marketing',
    customerServiceScript: 'Guión de Servizio al Cliente',
    productDescription: 'Descrizione del Prodotto',
    businessReport: 'Rapporto Aziendale',
    trainingMaterial: 'Materiale di Formazione',
    other: 'Altro',
    darkMode: 'Modalità Scura',
    lightMode: 'Modalità Chiara',
    feedback: 'Feedback',
    selectDocument: 'Seleziona Documento',
    dragAndDrop: 'Trascina e rilascia il tuo file qui, o clicca per selezionare',
    supportedFormats: 'Formati supportati: PDF, DOCX, TXT (Máx 10MB)',
    typeYourQuestion: 'Digita la tua domanda...',
    typeYourAnswer: 'Rispondi alla domanda...',
    submitAnswer: 'Invia'
  },
  es: {
    staffDashboard: 'Panel de Control del Personal',
    dashboard: 'Panel de Control',
    documents: 'Documentos',
    trainings: 'Capacitaciones',
    analytics: 'Analítica',
    settings: 'Configuración',
    selectLanguage: 'Seleccionar Idioma',
    notifications: 'Notificaciones',
    search: 'Buscar',
    searchPlaceholder: 'Buscar...',
    recentDocuments: 'Documentos Recientes',
    assignedTrainings: 'Capacitaciones Asignadas',
    personalStats: 'Estadísticas Personales',
    allDocuments: 'Todos los Documentos',
    businessDocuments: 'Documentos de Empresa',
    adminDocuments: 'Documentos de Admin',
    myDocuments: 'Mis Documentos',
    title: 'Título',
    description: 'Descripción',
    type: 'Tipo',
    status: 'Estado',
    created: 'Creado',
    source: 'Fuente',
    actions: 'Acciones',
    processed: 'Procesado',
    processing: 'Procesando',
    view: 'Ver',
    chat: 'Chat',
    allTrainings: 'Todas las Capacitaciones',
    completedTrainings: 'Capacitaciones Completadas',
    inProgressTrainings: 'En Progreso',
    notStartedTrainings: 'No Iniciadas',
    progress: 'Progreso',
    dueDate: 'Fecha Límite',
    completed: 'Completado',
    inProgress: 'En Progreso',
    notStarted: 'No Iniciado',
    start: 'Comenzar',
    continue: 'Continuar',
    review: 'Revisar',
    aiInteractions: 'Interacciones IA',
    upcomingDeadlines: 'Fechas de vencimiento',
    trainingDueDates: 'Fechas de vencimiento de formación',
    noUpcomingDeadlines: 'No hay fechas de vencimiento próximas. ¡Buen trabajo!',
    due: 'Vence',
    recentlyAddedDocuments: 'Documentos Recientes',
    added: 'Añadido',
    myLearning: 'Mi Formación',
    overallProgress: 'Progreso Global',
    completedOn: 'Completado el',
    knowledgeBase: 'Base de Conocimientos',
    searchDocuments: 'Buscar documentos...',
    noDocumentsFound: 'No se encontraron documentos',
    tryAdjustingSearch: 'Intente ajustar los términos de búsqueda.',
    admin: 'Admin',
    business: 'Empresa',
    accessTrainingMaterials: 'Acceda a sus materiales de aprendizaje, siga su progreso y obtenga ayuda',
    aiAssistant: 'Asistente IA',
    chatWithDocument: 'Chatear con Documento',
    askQuestion: 'Hacer una pregunta...',
    askAI: 'Preguntar a la IA',
    recentQuestions: 'Preguntas Recientes',
    viewAllChats: 'Ver Todos los Chats',
    noQuestionsYet: 'Aún no hay preguntas. Pregunte algo para comenzar.',
    suggestedQuestions: 'Preguntas Sugeridas',
    helpMeUnderstand: 'Ayúdame a entender este documento',
    summarizeDocument: 'Resumir este documento',
    findRelatedTraining: 'Encontrar capacitación relacionada',
    documentChat: 'Chat de Documento',
    documentChatDescription: 'Haga preguntas sobre sus documentos y obtenga respuestas instantáneas',
    chooseDocument: 'Elija un documento para chatear',
    startChat: 'Iniciar Chat',
    marketingStrategy: '¿Cuáles son las últimas estrategias de marketing para pequeñas empresas?',
    socialMediaTips: 'Dame consejos para un marketing efectivo en redes sociales',
    customerEngagement: '¿Cómo puedo mejorar la participación del cliente?',
    uploadWork: 'Subir Su Trabajo',
    uploadWorkDescription: 'Obtenga comentarios sobre su trabajo basados en materiales de capacitación',
    dragDropFiles: 'Arrastre y suelte archivos aquí, o haga clic para seleccionar archivos',
    supportedFileTypes: 'Soporta PDF, DOCX, TXT hasta 10MB',
    uploadFileButton: 'Subir Archivo',
    getFeedback: 'Obtener Comentarios',
    chatWithDocuments: 'Chatear con Documentos',
    myWork: 'Mi Trabajo',
    improvement: 'Sugerencias de Mejora',
    basedOnKnowledge: 'Basado en nuestra base de conocimientos',
    documentType: 'Tipo de Documento',
    selectDocumentType: 'Seleccione tipo de documento',
    salesProposal: 'Propuesta de Ventas',
    marketingPlan: 'Plan de Marketing',
    customerServiceScript: 'Guión de Servicio al Cliente',
    productDescription: 'Descripción de Producto',
    businessReport: 'Informe de Negocio',
    trainingMaterial: 'Material de Capacitación',
    other: 'Otro',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    feedback: 'Comentarios',
    selectDocument: 'Seleccionar Documento',
    dragAndDrop: 'Arrastra y suelta tu archivo aquí, o haz clic para seleccionar',
    supportedFormats: 'Formatos compatibles: PDF, DOCX, TXT (Máx 10MB)',
    typeYourQuestion: 'Escribe tu pregunta...',
    typeYourAnswer: 'Responde la pregunta...',
    submitAnswer: 'Enviar'
  }
};

// Interfaces for data types
interface Document {
  id: string;
  title: string;
  description: string;
  fileType: string;
  status: string;
  createdAt: string;
  source: string;
}

interface Training {
  id: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export default function StaffDashboard() {
  // Move all hooks to the top for consistent ordering
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  
  // Use useMemo for stable reference to allowed roles
  const allowedRoles = useMemo(() => [UserRole.STAFF], []);
  
  // Protect this page - only allow staff users
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);
  
  // Initialize component state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents' | 'ai-assistant' | 'document-chat'>('ai-assistant');
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [recentAiQuestions, setRecentAiQuestions] = useState<string[]>([]);
  const [selectedDocumentForChat, setSelectedDocumentForChat] = useState<Document | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentChatMode, setDocumentChatMode] = useState<'chat' | 'feedback'>('chat');
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [documentType, setDocumentType] = useState<'' | 'salesProposal' | 'marketingPlan' | 'customerServiceScript' | 'productDescription' | 'businessReport' | 'trainingMaterial' | 'other'>('');
  const [darkMode, setDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // AI Assistant states
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Quiz mode state
  const [quizMode, setQuizMode] = useState(false);
  
  // Example questions for staff to choose from
  const [exampleQuestions] = useState([
    {
      category: 'Business Strategy',
      questions: [
        'What are effective strategies for small business growth?',
        'How can I create a competitive analysis for my industry?',
        'What metrics should I track for my business performance?'
      ]
    },
    {
      category: 'Marketing',
      questions: [
        'How can I improve my social media marketing?',
        'What are the latest digital marketing trends?',
        'How to create an effective email marketing campaign?',
        'What content marketing strategies work best for B2B companies?'
      ]
    },
    {
      category: 'Customer Support',
      questions: [
        'How to improve customer satisfaction scores?',
        'What are best practices for handling customer complaints?',
        'How can AI enhance our customer service operations?'
      ]
    },
    {
      category: 'Document Analysis',
      questions: [
        'Can you summarize this document for me?',
        'What are the key points in this document?',
        'How does this document compare to industry standards?'
      ]
    }
  ]);

  // Quiz subjects data
  const [quizSubjects] = useState([
    {
      category: 'Business',
      subjects: [
        'Marketing Fundamentals',
        'Sales Strategy',
        'Business Development',
        'Customer Relationship Management'
      ]
    },
    {
      category: 'Product Knowledge',
      subjects: [
        'Product Features',
        'Services Overview',
        'Pricing Models',
        'Technical Specifications'
      ]
    },
    {
      category: 'Industry Knowledge',
      subjects: [
        'Market Trends',
        'Competitor Analysis',
        'Industry Regulations',
        'Best Practices'
      ]
    }
  ]);

  // Quiz helper functions
  const evaluateQuizAnswer = (answer: string) => {
    // In a real app, this would evaluate the answer against expected responses
    // For this demo, we'll provide simulated feedback
    const feedbacks = [
      "That's correct! Well done. Let me ask you another question.",
      "Good answer! You clearly understand this topic. Let's continue.",
      "Almost there! That's partially correct. The complete answer would include more details about the process.",
      "That's a good point, but not quite right. Remember that the key concept is about optimizing for customer experience.",
      "Not quite. Remember that this topic focuses on strategies for long-term growth rather than short-term gains."
    ];
    
    // For demo purposes, randomly select feedback
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };
  
  const generateQuizQuestion = () => {
    // In a real app, this would generate questions based on the selected subject
    // For this demo, we'll provide simulated questions
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
    
    // For demo purposes, randomly select a question
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Function to handle quiz subject selection
  const handleStartQuiz = (subject: string) => {
    // Clear existing messages
    setMessages([]);
    
    // Add a welcome message for the quiz
    setTimeout(() => {
      const welcomeMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        text: `Welcome to the ${subject} quiz! I'll ask you a series of questions to test your knowledge. Let's begin with the first question:\n\n${generateQuizQuestion()}`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages([welcomeMessage]);
    }, 100);
  };

  // Get business name based on businessId with safe access
  const businessName = useMemo(() => {
    if (!user || !user?.businessId) return 'No Business';
    
    // Here you would normally fetch the business name from a real API
    // For this demo, we'll hardcode some sample businesses
    const sampleBusinesses = [
      { id: '1', name: 'Acme Corporation' },
      { id: '2', name: 'TechStart Inc.' },
      { id: '3', name: 'Global Services Ltd.' },
    ];
    const business = sampleBusinesses.find(b => b.id === user.businessId);
    return business?.name || 'Unknown Business';
  }, [user]);

  // Load mock data once on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDocuments([
        {
          id: '1',
          title: 'Sales Training Manual',
          description: 'Comprehensive guide for sales representatives',
          fileType: 'PDF',
          status: 'PROCESSED',
          createdAt: '2025-02-15', // About 2 weeks before March 3rd, 2025
          source: 'business'
        },
        {
          id: '2',
          title: 'Customer Service Best Practices',
          description: 'Guidelines for handling customer inquiries',
          fileType: 'DOCX',
          status: 'PROCESSED',
          createdAt: '2025-02-25', // About 1 week before March 3rd, 2025
          source: 'admin'
        },
        {
          id: '3',
          title: 'Product Knowledge Base',
          description: 'Detailed information about our product lineup',
          fileType: 'PDF',
          status: 'PROCESSED',
          createdAt: '2025-03-01', // 2 days before March 3rd, 2025
          source: 'business'
        }
      ]);

      setTrainings([
        {
          id: '1',
          title: 'New Product Introduction',
          description: 'Learn about our latest product offerings',
          progress: 75,
          dueDate: '2025-03-15', // About 2 weeks after March 3rd, 2025
          status: 'in_progress'
        },
        {
          id: '2',
          title: 'Customer Communication Skills',
          description: 'Enhance your communication with customers',
          progress: 100,
          dueDate: '2025-02-20', // Completed training from about 2 weeks before
          status: 'completed'
        },
        {
          id: '3',
          title: 'Sales Techniques Advanced',
          description: 'Master advanced sales techniques and strategies',
          progress: 0,
          dueDate: '2025-03-30', // About 4 weeks after March 3rd, 2025
          status: 'not_started'
        }
      ]);

      setDocumentsLoading(false);
    }, 1000);
  }, []);

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => 
    documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [documents, searchQuery]
  );

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Early return for loading or logout in progress - MOVE THIS UP before any conditional hooks
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

  // Add a function to format dates in a more user-friendly way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (activeTab === 'ai-assistant') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);
  
  // Handle AI Assistant chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Clear the input
    const currentInput = inputValue;
    setInputValue('');
    
    // Create a user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: currentInput,
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
            id: Date.now().toString(),
            role: 'assistant' as const,
            text: evaluateQuizAnswer(currentInput),
            timestamp: new Date().toISOString(),
          };
          
          setMessages(prevMessages => [...prevMessages, evaluationMessage]);
          
          // After evaluation, ask another question
          setTimeout(() => {
            const nextQuestionMessage = {
              id: (Date.now() + 1).toString(),
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
      // Now try the simple chat endpoint first as it's more reliable
      console.log('Calling simple chat API with message:', currentInput);
      const simpleResponse = await fetch('/api/chat-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
        }),
      });
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        console.log('Simple API response data:', simpleData);
        
        // Add AI response from simple endpoint
        const aiMessage = {
          id: Date.now().toString(),
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
      console.log('Calling chat API with message:', currentInput);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
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
        id: Date.now().toString(),
        role: 'assistant' as const,
        text: data.message || "I'm sorry, I couldn't generate a response.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat submission:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        text: `Sorry, I encountered an error. Please try again. (Error: ${error instanceof Error ? error.message : String(error)})`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle suggested question click
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    
    // For backwards compatibility
    setAiQuestion(question);
    
    // Immediately submit the question
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    setTimeout(() => {
      handleSubmit(fakeEvent);
    }, 100);
  };

  // Document chat functionality
  const handleDocumentChat = (document: Document) => {
    setSelectedDocumentForChat(document);
    setActiveTab('document-chat');
    setDocumentChatMode('chat');
  };

  // Document view functionality
  const handleViewDocument = (document: Document) => {
    // Simulate viewing a document - in a real app this might open a PDF viewer or navigate to a document detail page
    console.log(`Viewing document: ${document.title}`);
    // In a real application, you might add code here to:
    // - Open a modal with the document content
    // - Navigate to a document detail page
    // - Download the document
    // For now, we'll just log it
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-teal-500 dark:text-teal-400">AltaCoach</span>
            <span className="ml-2 text-sm bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-200 px-2 py-1 rounded-full">Staff</span>
          </Link>
          {/* All header elements (search, dark mode toggle, language selector, notifications, user avatar) removed */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 mb-8 lg:mb-0 lg:mr-8">
            <div className="w-64 bg-teal-300 dark:bg-teal-600 p-6 rounded-l-lg shadow-md transition-colors duration-200">
              <div className="space-y-6">
                {/* <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-white/25 shadow-lg transform scale-105 text-gray-800 dark:text-white font-medium'
                      : 'hover:bg-white/15 text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>{translations[language]?.dashboard || 'Dashboard'}</span>
                </button> */}

                {/* <button
                  onClick={() => setActiveTab('documents')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === 'documents'
                      ? 'bg-white/25 shadow-lg transform scale-105 text-gray-800 dark:text-white font-medium'
                      : 'hover:bg-white/15 text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{translations[language]?.documents || 'Documents'}</span>
                </button> */}

                <button
                  onClick={() => setActiveTab('ai-assistant')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === 'ai-assistant'
                      ? 'bg-white/25 shadow-lg transform scale-105 text-gray-800 dark:text-white font-medium'
                      : 'hover:bg-white/15 text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{translations[language]?.aiAssistant || 'AI Assistant'}</span>
                </button>

                {/* <button
                  onClick={() => setActiveTab('document-chat')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                    activeTab === 'document-chat'
                      ? 'bg-white/25 shadow-lg transform scale-105 text-gray-800 dark:text-white font-medium'
                      : 'hover:bg-white/15 text-gray-800 dark:text-white hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>{translations[language]?.documentChat || 'Document Chat'}</span>
                </button> */}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{translations[language]?.staffDashboard || translations.en.staffDashboard}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {translations[language]?.accessTrainingMaterials || translations.en.accessTrainingMaterials}
                </p>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-100 dark:bg-green-800/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="bg-green-500 dark:bg-green-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translations[language]?.completed || translations.en.completed}</h3>
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">3</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-100 dark:bg-amber-800/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="bg-amber-500 dark:bg-amber-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translations[language]?.inProgress || translations.en.inProgress}</h3>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">2</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-100 dark:bg-blue-800/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{translations[language]?.aiInteractions || translations.en.aiInteractions}</h3>
                        <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">28</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recent Documents */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{translations[language]?.recentlyAddedDocuments || 'Recently Added Documents'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.slice(0, 4).map(doc => (
                      <div key={doc.id} className="border rounded-xl p-5 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{doc.description}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {translations[language]?.added || 'Added'}: {formatDate(doc.createdAt)}
                          </span>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleDocumentChat(doc)}
                              className="text-sm font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                            >
                              {translations[language]?.chat || 'Chat'}
                            </button>
                            <button 
                              onClick={() => handleViewDocument(doc)}
                              className="text-sm font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                            >
                              {translations[language]?.view || 'View'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{translations[language]?.documents || 'Documents'}</h2>
                
                {/* Document list would go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map(doc => (
                    <div key={doc.id} className="border rounded-xl p-5 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{doc.description}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {translations[language]?.added || 'Added'}: {formatDate(doc.createdAt)}
                        </span>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleDocumentChat(doc)}
                            className="text-sm font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                          >
                            {translations[language]?.chat || 'Chat'}
                          </button>
                          <button 
                            onClick={() => handleViewDocument(doc)}
                            className="text-sm font-medium text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
                          >
                            {translations[language]?.view || 'View'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai-assistant' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translations[language]?.aiAssistant || 'AI Assistant'}</h2>
                  
                  {/* Quiz Mode Toggle */}
                  <div className="flex items-center">
                    <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {!quizMode ? 'Quiz Mode' : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={quizMode}
                        onChange={() => setQuizMode(!quizMode)}
                        className="sr-only peer" 
                      />
                      <div className={`w-11 h-6 bg-gray-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-500`}></div>
                    </label>
                  </div>
                </div>
                
                {/* Quiz Mode Explanation Message */}
                {quizMode && (
                  <div className="mb-6 p-4 border border-teal-200 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800 rounded-lg text-sm">
                    <div className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>Exam Mode Active:</strong> In Quiz Mode, the AI will only ask you questions to test your knowledge. 
                        The AI will not answer any questions you ask, as you are in an assessment environment. 
                        Select a subject from the right panel to begin a quiz.
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left column - Chatbot (70% width on large screens) */}
                  <div className="w-full lg:w-[70%]">
                    {/* Chat messages */}
                    <div className={`flex-grow overflow-y-auto mb-6 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    } p-4 shadow-inner`} style={{ minHeight: '400px', maxHeight: '500px' }}>
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                              isDarkMode ? 'bg-teal-600' : 'bg-teal-100'
                            }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isDarkMode ? 'text-teal-200' : 'text-teal-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            </div>
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              How can I help you today?
                            </h3>
                            <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                              Ask me anything or try one of the suggested questions below.
                            </p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div 
                              key={message.id} 
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                  message.role === 'user' 
                                    ? isDarkMode 
                                      ? 'bg-teal-600 text-white' 
                                      : 'bg-teal-500 text-white'
                                    : isDarkMode 
                                      ? 'bg-gray-600 text-white' 
                                      : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                              isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800 border border-gray-200'
                            }`}>
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    {/* Question input */}
                    <form onSubmit={handleSubmit} className="mb-6">
                      <div className="relative">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={quizMode 
                            ? translations[language]?.typeYourAnswer || 'Type your answer...' 
                            : translations[language]?.askQuestion || 'Ask a question...'}
                          className={`w-full px-4 py-3 pr-24 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim() || isLoading}
                          className={`absolute right-2 top-2 px-4 py-1 bg-teal-500 text-white rounded-lg transition-colors duration-200 ${
                            !inputValue.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600'
                          }`}
                        >
                          {quizMode 
                            ? translations[language]?.submitAnswer || 'Submit' 
                            : translations[language]?.askAI || 'Ask AI'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right column - Example Questions or Quiz Subjects (30% width on large screens) */}
                  <div className="w-full lg:w-[30%]">
                    <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} h-full`}>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {quizMode ? 'Select Quiz Subject' : 'Example Questions'}
                      </h3>
                      <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '520px' }}>
                        {quizMode ? (
                          // Quiz Subjects
                          quizSubjects.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="mb-4">
                              <h4 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                {category.category}
                              </h4>
                              <div className="space-y-2">
                                {category.subjects.map((subject, subjectIndex) => (
                                  <button
                                    key={subjectIndex}
                                    onClick={() => handleStartQuiz(subject)}
                                    className={`text-left w-full border rounded-lg p-3 transition-colors duration-200 text-sm ${
                                      isDarkMode 
                                        ? 'border-gray-600 bg-gray-600 hover:bg-gray-500 text-white' 
                                        : 'border-gray-200 hover:bg-teal-50 text-gray-800'
                                    }`}
                                  >
                                    <p>{subject}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          // Example Questions
                          exampleQuestions.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="mb-4">
                              <h4 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                {category.category}
                              </h4>
                              <div className="space-y-2">
                                {category.questions.map((question, questionIndex) => (
                                  <button
                                    key={questionIndex}
                                    onClick={() => handleSuggestedQuestion(question)}
                                    className={`text-left w-full border rounded-lg p-3 transition-colors duration-200 text-sm ${
                                      isDarkMode 
                                        ? 'border-gray-600 bg-gray-600 hover:bg-gray-500 text-white' 
                                        : 'border-gray-200 hover:bg-teal-50 text-gray-800'
                                    }`}
                                  >
                                    <p>{question}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'document-chat' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{translations[language]?.documentChat || 'Document Chat'}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{translations[language]?.documentChatDescription || 'Ask questions about your documents and get instant answers'}</p>
                
                {/* Mode selector for chat or feedback */}
                <div className="flex mb-6 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    className={`flex-1 py-3 px-4 text-center transition-all duration-200 ${
                      documentChatMode === 'chat' 
                        ? 'bg-teal-500 text-white font-medium' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setDocumentChatMode('chat')}
                  >
                    {translations[language]?.chat || 'Chat'}
                  </button>
                  <button 
                    className={`flex-1 py-3 px-4 text-center transition-all duration-200 ${
                      documentChatMode === 'feedback' 
                        ? 'bg-teal-500 text-white font-medium' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setDocumentChatMode('feedback')}
                  >
                    {translations[language]?.feedback || 'Feedback'}
                  </button>
                </div>
                
                {documentChatMode === 'chat' ? (
                  // Document chat UI
                  <div className="border dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{translations[language]?.chooseDocument || 'Choose a document to chat with'}</h3>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {translations[language]?.selectDocument || 'Select Document'}
                      </label>
                      <select
                        className="block w-full pl-4 pr-10 py-3 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                        value={selectedDocumentForChat?.id || ""}
                        onChange={(e) => {
                          const selectedDoc = documents.find(doc => doc.id === e.target.value);
                          setSelectedDocumentForChat(selectedDoc || null);
                        }}
                      >
                        <option value="">{translations[language]?.chooseDocument || 'Choose a document...'}</option>
                        {documents.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.title}</option>
                        ))}
                      </select>
                    </div>
                    <button className="w-full py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-sm">
                      {translations[language]?.startChat || 'Start Chat'}
                    </button>
                  </div>
                ) : (
                  // Feedback mode UI - Restored
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{translations[language]?.uploadWork || 'Upload Your Work'}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{translations[language]?.uploadWorkDescription || 'Get feedback on your work based on training materials'}</p>
                    
                    {!uploadedFile ? (
                      // File upload UI
                      <div>
                        {/* Document Type Dropdown */}
                        <div className="mb-6">
                          <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {translations[language]?.documentType || 'Document Type'}
                          </label>
                          <select
                            id="document-type"
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as '' | 'salesProposal' | 'marketingPlan' | 'customerServiceScript' | 'productDescription' | 'businessReport' | 'trainingMaterial' | 'other')}
                            className="block w-full px-3 py-2 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-700"
                          >
                            <option value="">{translations[language]?.selectDocumentType || 'Select document type'}</option>
                            <option value="salesProposal">{translations[language]?.salesProposal || 'Sales Proposal'}</option>
                            <option value="marketingPlan">{translations[language]?.marketingPlan || 'Marketing Plan'}</option>
                            <option value="customerServiceScript">{translations[language]?.customerServiceScript || 'Customer Service Script'}</option>
                            <option value="productDescription">{translations[language]?.productDescription || 'Product Description'}</option>
                            <option value="businessReport">{translations[language]?.businessReport || 'Business Report'}</option>
                            <option value="trainingMaterial">{translations[language]?.trainingMaterial || 'Training Material'}</option>
                            <option value="other">{translations[language]?.other || 'Other'}</option>
                          </select>
                        </div>
                        
                        {/* File Upload Area */}
                        <div className="mb-6">
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-teal-500 dark:hover:border-teal-400 transition-colors duration-200">
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setUploadedFile(e.target.files[0]);
                                }
                              }}
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <div className="flex flex-col items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {translations[language]?.dragAndDrop || 'Drag and drop your file here, or click to select'}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                                  {translations[language]?.supportedFormats || 'Supported formats: PDF, DOCX, TXT (Max 10MB)'}
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        <button 
                          className="w-full py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-sm"
                          onClick={() => {
                            if (documentType) {
                              setUploadedFile(new File(["dummy content"], "example-document.pdf", { type: "application/pdf" }));
                              setFeedbackMessages([
                                "Your document is well-structured but could benefit from more specific examples.",
                                "Consider adding more data to support your main arguments in section 2.",
                                "The conclusion could be strengthened by summarizing key points more clearly."
                              ]);
                            }
                          }}
                        >
                          {translations[language]?.uploadFileButton || 'Upload File'}
                        </button>
                      </div>
                    ) : (
                      // Feedback display UI
                      <div>
                        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <svg className="h-8 w-8 text-teal-600 dark:text-teal-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium text-gray-900 dark:text-white">{uploadedFile instanceof File ? uploadedFile.name : 'example-document.pdf'}</p>
                                <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                  {documentType || 'Document'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">245 KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setUploadedFile(null);
                              setFeedbackMessages([]);
                            }}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="mt-6">
                          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">{translations[language]?.improvement || 'Improvement Suggestions'}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{translations[language]?.basedOnKnowledge || 'Based on our knowledge base'}</p>
                          
                          <div className="space-y-4">
                            {feedbackMessages.map((message, index) => (
                              <div key={index} className="p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 rounded-lg">
                                <div className="flex">
                                  <svg className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-6">
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              // Handle chat submission
                            }} className="relative">
                              <input
                                type="text"
                                placeholder={translations[language]?.typeYourQuestion || 'Type your question...'}
                                className="w-full px-5 py-4 pr-20 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-200"
                              />
                              <button
                                type="submit"
                                className="absolute right-2 top-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-200 shadow-sm"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 