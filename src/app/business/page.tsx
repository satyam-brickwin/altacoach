'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuth, useAuthProtection, UserRole, sampleBusinesses } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Define translations for the business dashboard
const translations: Record<string, Record<string, string>> = {
  en: {
    businessDashboard: 'Business Dashboard',
    dashboard: 'Dashboard',
    documents: 'Documents',
    staff: 'Staff',
    analytics: 'Analytics',
    settings: 'Settings',
    selectLanguage: 'Select language',
    notifications: 'Notifications',
    uploadDocument: 'Upload Document',
    inviteStaff: 'Invite Staff',
    recentDocuments: 'Recent Documents',
    staffMembers: 'Staff Members',
    documentStats: 'Document Statistics',
    allDocuments: 'All Documents',
    businessDocuments: 'Business Documents',
    adminDocuments: 'Admin Documents',
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
    delete: 'Delete',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    lastActive: 'Last Active',
    businessStats: 'Business Statistics',
    uploadNew: 'Upload New',
    manageStaff: 'Manage Staff',
    manageDescription: 'Manage your company\'s training materials, staff, and access analytics',
    aiInteractions: 'AI Interactions',
    accessedDocument: 'accessed the Sales Training Manual',
    uploadedDocument: 'uploaded a new document: Product Knowledge Base',
    completedTraining: 'completed Customer Service training',
    yesterdayAt: 'Yesterday at',
    hoursAgo: '{hours} hours ago',
    you: 'You',
    recentActivity: 'Recent Activity',
    activityFeed: 'Activity Feed',
    salesTrainingManual: 'Sales Training Manual',
    productKnowledgeBase: 'Product Knowledge Base',
    customerService: 'Customer Service',
    analyticsDescription: 'View detailed analytics and insights about your team\'s performance',
    timeFrame: 'Time Frame:',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    documentUsage: 'Document Usage',
    totalViews: 'Total Views',
    averageViewsPerDay: 'Avg. Per Day',
    activeUsers: 'Active Users',
    totalActiveUsers: 'Total Active Users',
    averageSessionTime: 'Avg. Session Time',
    minutes: 'min',
    totalInteractions: 'Total Interactions',
    questionsAsked: 'Questions Asked',
    documentsAnalyzed: 'Documents Analyzed',
    aiSatisfactionRating: 'AI Satisfaction Rating',
    popularDocuments: 'Popular Documents',
    document: 'Document',
    views: 'Views',
    aiQueries: 'AI Queries',
    popularity: 'Popularity',
    documentsDescription: 'Manage and organize all your business documents',
    inviteNew: 'Invite New',
    settingsDescription: 'Configure your business dashboard preferences',
    accountSettings: 'Account Settings',
    notificationSettings: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    browserNotifications: 'Browser Notifications',
    saveChanges: 'Save Changes'
  },
  fr: {
    businessDashboard: 'Tableau de Bord Entreprise',
    dashboard: 'Tableau de Bord',
    documents: 'Documents',
    staff: 'Personnel',
    analytics: 'Analytique',
    settings: 'Paramètres',
    selectLanguage: 'Choisir la langue',
    notifications: 'Notifications',
    uploadDocument: 'Télécharger un Document',
    inviteStaff: 'Inviter Personnel',
    recentDocuments: 'Documents Récents',
    staffMembers: 'Membres du Personnel',
    documentStats: 'Statistiques de Documents',
    allDocuments: 'Tous les Documents',
    businessDocuments: 'Documents d\'Entreprise',
    adminDocuments: 'Documents d\'Administration',
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
    delete: 'Supprimer',
    name: 'Nom',
    email: 'Email',
    role: 'Rôle',
    lastActive: 'Dernière Activité',
    businessStats: 'Statistiques d\'Entreprise',
    uploadNew: 'Télécharger Nouveau',
    manageStaff: 'Gérer le Personnel',
    manageDescription: 'Gérer les matériaux d\'apprentissage de votre entreprise, le personnel et accéder aux analyses',
    aiInteractions: 'Interactions IA',
    accessedDocument: 'a accédé au Manuel de Formation des Ventes',
    uploadedDocument: 'a téléchargé un nouveau document: Base de Connaissances Produit',
    completedTraining: 'a terminé la formation Service Client',
    yesterdayAt: 'Hier à',
    hoursAgo: '{hours} heures',
    you: 'Vous',
    recentActivity: 'Activité Récente',
    activityFeed: 'Flux d\'Activité',
    salesTrainingManual: 'Manuel de Formation des Ventes',
    productKnowledgeBase: 'Base de Connaissances Produit',
    customerService: 'Service Client',
    analyticsDescription: 'Visualisez des analyses et des aperçus détaillés des performances de votre équipe',
    timeFrame: 'Période:',
    week: 'Semaine',
    month: 'Mois',
    year: 'Année',
    documentUsage: 'Utilisation des Documents',
    totalViews: 'Vues Totales',
    averageViewsPerDay: 'Moy. par Jour',
    activeUsers: 'Utilisateurs Actifs',
    totalActiveUsers: 'Total Utilisateurs Actifs',
    averageSessionTime: 'Temps Moyen Session',
    minutes: 'min',
    totalInteractions: 'Interactions Totales',
    questionsAsked: 'Questions Posées',
    documentsAnalyzed: 'Documents Analysés',
    aiSatisfactionRating: 'Taux de Satisfaction IA',
    popularDocuments: 'Documents Populaires',
    document: 'Document',
    views: 'Vues',
    aiQueries: 'Requêtes IA',
    popularity: 'Popularité',
    documentsDescription: 'Gérez et organisez tous vos documents professionnels',
    inviteNew: 'Inviter Nouveau',
    settingsDescription: 'Configurez les préférences de votre tableau de bord professionnel',
    accountSettings: 'Paramètres du Compte',
    notificationSettings: 'Paramètres de Notification',
    emailNotifications: 'Notifications par Email',
    browserNotifications: 'Notifications du Navigateur',
    saveChanges: 'Enregistrer les Modifications'
  },
  de: {
    businessDashboard: 'Unternehmens-Dashboard',
    dashboard: 'Dashboard',
    documents: 'Dokumente',
    staff: 'Mitarbeiter',
    analytics: 'Analytik',
    settings: 'Einstellungen',
    selectLanguage: 'Sprache auswählen',
    notifications: 'Benachrichtigungen',
    uploadDocument: 'Dokument hochladen',
    inviteStaff: 'Mitarbeiter einladen',
    recentDocuments: 'Neueste Dokumente',
    staffMembers: 'Mitarbeiter',
    documentStats: 'Dokumentstatistik',
    allDocuments: 'Alle Dokumente',
    businessDocuments: 'Unternehmensdokumente',
    adminDocuments: 'Admin-Dokumente',
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
    delete: 'Löschen',
    name: 'Name',
    email: 'E-Mail',
    role: 'Rolle',
    lastActive: 'Zuletzt aktiv',
    businessStats: 'Unternehmensstatistik',
    uploadNew: 'Neu hochladen',
    manageStaff: 'Mitarbeiter verwalten',
    manageDescription: 'Verwalten Sie Ihre Unternehmens-Trainingsmaterialien, Mitarbeiter und greifen Sie auf Analysen zu',
    aiInteractions: 'KI-Interaktionen',
    accessedDocument: 'hat das',
    uploadedDocument: 'ein neues Dokument hochgeladen:',
    completedTraining: 'abgeschlossen',
    yesterdayAt: 'Gestern um',
    hoursAgo: '{hours} Stunden',
    you: 'Sie',
    recentActivity: 'Neueste Aktivitäten',
    activityFeed: 'Aktivitätsfeed',
    salesTrainingManual: 'Verkaufstrainingshandbuch',
    productKnowledgeBase: 'Produkt-Wissensdatenbank',
    customerService: 'Kundendienst',
    analyticsDescription: 'Detaillierte Analysen und Einblicke in die Leistung Ihres Teams anzeigen',
    timeFrame: 'Zeitraum:',
    week: 'Woche',
    month: 'Monat',
    year: 'Jahr',
    documentUsage: 'Dokumentnutzung',
    totalViews: 'Gesamtaufrufe',
    averageViewsPerDay: 'Durchschn. pro Tag',
    activeUsers: 'Aktive Benutzer',
    totalActiveUsers: 'Aktive Benutzer Gesamt',
    averageSessionTime: 'Durchschn. Sitzungszeit',
    minutes: 'Min',
    totalInteractions: 'Gesamtinteraktionen',
    questionsAsked: 'Gestellte Fragen',
    documentsAnalyzed: 'Analysierte Dokumente',
    aiSatisfactionRating: 'KI-Zufriedenheitsrate',
    popularDocuments: 'Beliebte Dokumente',
    document: 'Dokument',
    views: 'Aufrufe',
    aiQueries: 'KI-Abfragen',
    popularity: 'Beliebtheit',
    documentsDescription: 'Verwalten und organisieren Sie alle Ihre Geschäftsdokumente',
    inviteNew: 'Neuen Einladen',
    settingsDescription: 'Konfigurieren Sie Ihre Geschäftsdashboard-Einstellungen',
    accountSettings: 'Kontoeinstellungen',
    notificationSettings: 'Benachrichtigungseinstellungen',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    browserNotifications: 'Browser-Benachrichtigungen',
    saveChanges: 'Änderungen Speichern'
  },
  it: {
    businessDashboard: 'Dashboard Aziendale',
    dashboard: 'Dashboard',
    documents: 'Documenti',
    staff: 'Personale',
    analytics: 'Analisi',
    settings: 'Impostazioni',
    selectLanguage: 'Seleziona lingua',
    notifications: 'Notifiche',
    uploadDocument: 'Carica Documento',
    inviteStaff: 'Invita Personale',
    recentDocuments: 'Documenti Recenti',
    staffMembers: 'Membri del Personale',
    documentStats: 'Statistiche Documenti',
    allDocuments: 'Tutti i Documenti',
    businessDocuments: 'Documenti Aziendali',
    adminDocuments: 'Documenti Admin',
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
    delete: 'Elimina',
    name: 'Nome',
    email: 'Email',
    role: 'Ruolo',
    lastActive: 'Ultima Attività',
    businessStats: 'Statistiche Aziendali',
    uploadNew: 'Carica Nuovo',
    manageStaff: 'Gestisci Personale',
    manageDescription: 'Gestisci i materiali di addestramento dell\'azienda, il personale e accedi alle analisi',
    aiInteractions: 'Interazioni IA',
    accessedDocument: 'ha accesso al',
    uploadedDocument: 'ha caricato un nuovo documento:',
    completedTraining: 'completato',
    yesterdayAt: 'Ieri alle',
    hoursAgo: '{hours} ore',
    you: 'Tu',
    recentActivity: 'Attività Recenti',
    activityFeed: 'Feed di Attività',
    salesTrainingManual: 'Manuale di Formazione Vendite',
    productKnowledgeBase: 'Base di Conoscenza Prodotti',
    customerService: 'Servizio Clienti',
    analyticsDescription: 'Visualizza analisi dettagliate e approfondimenti sulle prestazioni del tuo team',
    timeFrame: 'Periodo:',
    week: 'Settimana',
    month: 'Mese',
    year: 'Anno',
    documentUsage: 'Utilizzo Documenti',
    totalViews: 'Visualizzazioni Totali',
    averageViewsPerDay: 'Media Giornaliera',
    activeUsers: 'Utenti Attivi',
    totalActiveUsers: 'Totale Utenti Attivi',
    averageSessionTime: 'Tempo Medio Sessione',
    minutes: 'min',
    totalInteractions: 'Interazioni Totali',
    questionsAsked: 'Domande Poste',
    documentsAnalyzed: 'Documenti Analizzati',
    aiSatisfactionRating: 'Livello Soddisfazione IA',
    popularDocuments: 'Documenti Popolari',
    document: 'Documento',
    views: 'Visualizzazioni',
    aiQueries: 'Query IA',
    popularity: 'Popolarità',
    documentsDescription: 'Gestisci e organizza tutti i tuoi documenti aziendali',
    inviteNew: 'Invita Nuovo',
    settingsDescription: 'Configura le preferenze della dashboard aziendale',
    accountSettings: 'Impostazioni Account',
    notificationSettings: 'Impostazioni Notifiche',
    emailNotifications: 'Notifiche Email',
    browserNotifications: 'Notifiche Browser',
    saveChanges: 'Salva Modifiche'
  },
  es: {
    businessDashboard: 'Panel de Empresa',
    dashboard: 'Panel',
    documents: 'Documentos',
    staff: 'Personal',
    analytics: 'Analítica',
    settings: 'Configuración',
    selectLanguage: 'Seleccionar idioma',
    notifications: 'Notificaciones',
    uploadDocument: 'Subir Documento',
    inviteStaff: 'Invitar Personal',
    recentDocuments: 'Documentos Recientes',
    staffMembers: 'Miembros del Personal',
    documentStats: 'Estadísticas de Documentos',
    allDocuments: 'Todos los Documentos',
    businessDocuments: 'Documentos de Empresa',
    adminDocuments: 'Documentos de Admin',
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
    delete: 'Eliminar',
    name: 'Nombre',
    email: 'Correo',
    role: 'Rol',
    lastActive: 'Última Actividad',
    businessStats: 'Estadísticas de Empresa',
    uploadNew: 'Subir Nuevo',
    manageStaff: 'Gestionar Personal',
    manageDescription: 'Gestiona tus materiales de capacitación de la empresa, el personal y accede a las estadísticas',
    aiInteractions: 'Interacciones IA',
    accessedDocument: 'ha accedido al',
    uploadedDocument: 'ha subido un nuevo documento:',
    completedTraining: 'completado',
    yesterdayAt: 'Ayer a las',
    hoursAgo: '{hours} horas',
    you: 'Tú',
    recentActivity: 'Actividad Reciente',
    activityFeed: 'Alimentación de Actividad',
    salesTrainingManual: 'Manual de Formación de Ventas',
    productKnowledgeBase: 'Base de Conocimiento de Productos',
    customerService: 'Servicio al Cliente',
    analyticsDescription: 'Ver análisis detallados y perspectivas sobre el rendimiento de su equipo',
    timeFrame: 'Período:',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
    documentUsage: 'Uso de Documentos',
    totalViews: 'Vistas Totales',
    averageViewsPerDay: 'Promedio por Día',
    activeUsers: 'Usuarios Activos',
    totalActiveUsers: 'Total Usuarios Activos',
    averageSessionTime: 'Tiempo Medio de Sesión',
    minutes: 'min',
    totalInteractions: 'Interacciones Totales',
    questionsAsked: 'Preguntas Realizadas',
    documentsAnalyzed: 'Documentos Analizados',
    aiSatisfactionRating: 'Índice de Satisfacción IA',
    popularDocuments: 'Documentos Populares',
    document: 'Documento',
    views: 'Vistas',
    aiQueries: 'Consultas IA',
    popularity: 'Popularidad',
    documentsDescription: 'Gestione y organice todos sus documentos empresariales',
    inviteNew: 'Invitar Nuevo',
    settingsDescription: 'Configure las preferencias de su panel empresarial',
    accountSettings: 'Configuración de Cuenta',
    notificationSettings: 'Configuración de Notificaciones',
    emailNotifications: 'Notificaciones por Email',
    browserNotifications: 'Notificaciones del Navegador',
    saveChanges: 'Guardar Cambios'
  }
};

interface Document {
  id: string;
  title: string;
  description: string;
  fileType?: string;
  type?: string;
  status: string;
  createdAt?: string;
  created?: string;
  source: 'admin' | 'business' | string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}

// Add missing Activity interface
interface Activity {
  id: string;
  userFullname: string;
  actionKey: string;
  documentTitleKey: string;
  timestamp: string;
  timeValue?: string;
}

// Add interfaces for stats objects
interface DocumentStats {
  totalDocuments: number;
  businessDocuments: number;
  adminDocuments: number;
  processed: number;
  processing: number;
}

interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  adminStaff: number;
}

interface AIStats {
  totalInteractions: number;
  questionsAsked: number;
  documentsAnalyzed: number;
}

// Business dashboard component
export default function BusinessDashboard() {
  // Move all hooks to the top for consistent ordering
  const router = useRouter();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  
  // Use useMemo for stable reference to allowed roles
  const allowedRoles = useMemo(() => [UserRole.BUSINESS], []);
  
  // Protect this page - only allow business users
  const { isLoading: authLoading } = useAuthProtection(allowedRoles);
  
  // Initialize component state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [documentStats, setDocumentStats] = useState<DocumentStats>({
    totalDocuments: 0,
    businessDocuments: 0,
    adminDocuments: 0,
    processed: 0,
    processing: 0
  });
  const [staffStats, setStaffStats] = useState<StaffStats>({
    totalStaff: 0,
    activeStaff: 0,
    adminStaff: 0
  });
  const [aiStats, setAiStats] = useState<AIStats>({
    totalInteractions: 0,
    questionsAsked: 0,
    documentsAnalyzed: 0
  });
  const pathname = usePathname();
  
  // Get business name based on businessId
  const businessName = useMemo(() => {
    if (!user || !user?.businessId) return 'No Business';
    
    // For this demo, we'll hardcode some sample businesses
    const sampleBusinesses = [
      { id: '1', name: 'Acme Corporation' },
      { id: '2', name: 'Globex Industries' },
      { id: '3', name: 'Wayne Enterprises' },
      { id: '4', name: 'Stark Industries' }
    ];
    const business = sampleBusinesses.find(b => b.id === user.businessId);
    return business?.name || 'Unknown Business';
  }, [user]);

  // Load mock data once on component mount
  useEffect(() => {
    // Simulate API call to load documents and staff
    setTimeout(() => {
      const documentsData = [
        {
          id: '1',
          title: 'Sales Training Manual',
          description: 'Comprehensive guide for sales team training',
          type: 'business',
          status: 'processed',
          created: '2023-06-15',
          source: 'Admin'
        },
        {
          id: '2',
          title: 'Customer Service Guidelines',
          description: 'Best practices for customer interactions',
          type: 'business',
          status: 'processed',
          created: '2023-07-10',
          source: 'Admin'
        },
        {
          id: '3',
          title: 'Product Knowledge Base',
          description: 'Detailed information about products and services',
          type: 'business',
          status: 'processing',
          created: '2023-08-05',
          source: 'Business'
        },
        {
          id: '4',
          title: 'Onboarding Checklist',
          description: 'Steps for onboarding new employees',
          type: 'admin',
          status: 'processed',
          created: '2023-05-20',
          source: 'Admin'
        },
        {
          id: '5',
          title: 'Marketing Strategy 2023',
          description: 'Annual marketing plan and strategies',
          type: 'business',
          status: 'processing',
          created: '2023-08-01',
          source: 'Business'
        }
      ];
      
      setDocuments(documentsData as Document[]);
      setRecentDocuments(documentsData.slice(0, 3) as Document[]);

      const staffData = [
        {
          id: '1',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'Sales Manager',
          lastActive: '2023-08-10'
        },
        {
          id: '2',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'Sales Representative',
          lastActive: '2023-08-09'
        },
        {
          id: '3',
          name: 'Emily Johnson',
          email: 'emily.johnson@example.com',
          role: 'Customer Service',
          lastActive: '2023-08-08'
        },
        {
          id: '4',
          name: 'Michael Brown',
          email: 'michael.brown@example.com',
          role: 'Marketing Specialist',
          lastActive: '2023-08-07'
        }
      ];
      
      setStaff(staffData);

      const activitiesData = [
        {
          id: '1',
          userFullname: 'Jane Smith',
          actionKey: 'accessedDocument',
          documentTitleKey: 'salesTrainingManual',
          timestamp: 'yesterdayAt'
        },
        {
          id: '2',
          userFullname: 'you',
          actionKey: 'uploadedDocument',
          documentTitleKey: 'productKnowledgeBase',
          timestamp: 'hoursAgo',
          timeValue: '2'
        },
        {
          id: '3',
          userFullname: 'John Doe',
          actionKey: 'completedTraining',
          documentTitleKey: 'customerService',
          timestamp: 'hoursAgo',
          timeValue: '5'
        }
      ];
      
      setActivities(activitiesData);

      // Update the stats to match the image
      setStaffStats({
        totalStaff: 24,   // Updated to match image
        activeStaff: 20,
        adminStaff: 4
      });

      setDocumentStats({
        totalDocuments: 18,  // Updated to match image
        businessDocuments: 12,
        adminDocuments: 6,
        processed: 15,
        processing: 3
      });

      setAiStats({
        totalInteractions: 1248,  // Updated to match image
        questionsAsked: 986,
        documentsAnalyzed: 262
      });

      setDocumentsLoading(false);
    }, 1000);
  }, []);

  // Update the translation function to handle parameters
  const t = (key: string, params?: Record<string, string>) => {
    // First check local translations
    let translation = translations[language] ? translations[language][key] : undefined;
    
    // If not found in local translations, try global translations
    if (!translation) {
      translation = translate(key);
    }
    
    // If still not found, return the key itself
    if (!translation || translation === key) {
      return key;
    }
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation!.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return translation;
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // If still loading or not authenticated, show loading spinner
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user isn't a business member, don't render anything (useAuthProtection will redirect)
  if (user?.role !== UserRole.BUSINESS) {
    return null;
  }

  // Get the active menu based on the current path
  const getActiveMenu = (path: string) => {
    if (path === '/business') return 'dashboard';
    if (path.startsWith('/business/documents')) return 'documents';
    if (path.startsWith('/business/staff')) return 'staff';
    if (path.startsWith('/business/analytics')) return 'analytics';
    if (path.startsWith('/business/settings')) return 'settings';
    return 'dashboard';
  };

  // Check if a menu item is active
  const isMenuActive = (menuName: string) => {
    return getActiveMenu(pathname || '') === menuName;
  };

  // Get the appropriate class for menu items
  const getMenuItemClass = (menuName: string) => {
    return `block px-4 py-2 rounded-md ${
      isMenuActive(menuName)
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    } font-medium`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Business badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">AltaCoach</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded">
                Business
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-md w-full md:w-64 md:min-h-screen">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {/* Removed language selector from here */}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/business" className={getMenuItemClass('dashboard')}>
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/business/documents" className={getMenuItemClass('documents')}>
                  {t('documents')}
                </Link>
              </li>
              <li>
                <Link href="/business/staff" className={getMenuItemClass('staff')}>
                  {t('staff')}
                </Link>
              </li>
              <li>
                <Link href="/business/analytics" className={getMenuItemClass('analytics')}>
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/business/settings" className={getMenuItemClass('settings')}>
                  {t('settings')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('businessDashboard')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('manageDescription')}
              </p>
            </div>

            {/* Dashboard Overview Cards - Updated to match the image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card: Staff Members */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t('staffMembers')}</h2>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{staffStats.totalStaff}</p>
                  </div>
                </div>
              </div>

              {/* Card: Documents */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t('documents')}</h2>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{documentStats.totalDocuments}</p>
                  </div>
                </div>
              </div>

              {/* Card: AI Interactions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-800 rounded-full p-3 mr-4">
                    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t('aiInteractions')}</h2>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{aiStats.totalInteractions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Authentication Link */}
            <div className="flex justify-end mb-6">
              <Link href="/business/test" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Authentication
              </Link>
            </div>

            {/* Rest of the dashboard content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Documents */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('recentDocuments')}
                  </h2>
                  <Link href="/business/documents" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    {t('viewAll')}
                  </Link>
                </div>
                <div className="p-6">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentDocuments.map((doc) => (
                      <li key={doc.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {doc.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {doc.description}
                            </p>
                            <div className="mt-1 flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                doc.status === 'processed' 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                              }`}>
                                {doc.status === 'processed' ? t('processed') : t('processing')}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {doc.created || doc.createdAt}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 self-center flex">
                            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('recentActivity')}
                  </h2>
                </div>
                <div className="p-6">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activities.map((activity) => (
                      <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {activity.userFullname === 'you' 
                                  ? t('you').charAt(0) 
                                  : activity.userFullname.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {activity.userFullname === 'you' ? t('you') : activity.userFullname}
                              </span>{' '}
                              {t(activity.actionKey)}{' '}
                              <span className="font-medium">{t(activity.documentTitleKey)}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {activity.timestamp === 'hoursAgo' && activity.timeValue 
                                ? `${activity.timeValue} hours ago`
                                : `${t(activity.timestamp)} 15:30`}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {documentsLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
} 