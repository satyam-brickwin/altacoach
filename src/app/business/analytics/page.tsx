'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';

// Import translations from the main business page
const businessTranslations = {
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
    salesTrainingManual: 'Sales Training Manual',
    productKnowledgeBase: 'Product Knowledge Base',
    customerService: 'Customer Service Guidelines'
  },
  fr: {
    businessDashboard: 'Tableau de Bord d\'Entreprise',
    dashboard: 'Tableau de Bord',
    documents: 'Documents',
    staff: 'Personnel',
    analytics: 'Analyses',
    settings: 'Paramètres',
    selectLanguage: 'Choisir la langue',
    notifications: 'Notifications',
    uploadDocument: 'Télécharger un Document',
    inviteStaff: 'Inviter du Personnel',
    recentDocuments: 'Documents Récents',
    staffMembers: 'Membres du Personnel',
    documentStats: 'Statistiques des Documents',
    allDocuments: 'Tous les Documents',
    businessDocuments: 'Documents d\'Entreprise',
    adminDocuments: 'Documents d\'Administration',
    title: 'Titre',
    description: 'Description',
    type: 'Type',
    status: 'Statut',
    created: 'Créé',
    source: 'Source',
    actions: 'Actions',
    processed: 'Traité',
    processing: 'En Traitement',
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
    salesTrainingManual: 'Manuel de Formation des Ventes',
    productKnowledgeBase: 'Base de Connaissances Produit',
    customerService: 'Guide de Service Client'
  },
  de: {
    businessDashboard: 'Geschäfts-Dashboard',
    dashboard: 'Dashboard',
    documents: 'Dokumente',
    staff: 'Mitarbeiter',
    analytics: 'Analysen',
    settings: 'Einstellungen',
    selectLanguage: 'Sprache auswählen',
    notifications: 'Benachrichtigungen',
    uploadDocument: 'Dokument hochladen',
    inviteStaff: 'Mitarbeiter einladen',
    recentDocuments: 'Neueste Dokumente',
    staffMembers: 'Mitarbeiter',
    documentStats: 'Dokumentenstatistik',
    allDocuments: 'Alle Dokumente',
    businessDocuments: 'Geschäftsdokumente',
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
    businessStats: 'Geschäftsstatistiken',
    uploadNew: 'Neues hochladen',
    manageStaff: 'Mitarbeiter verwalten',
    manageDescription: 'Verwalten Sie Ihre Unternehmens-Trainingsmaterialien, Mitarbeiter und greifen Sie auf Analysen zu',
    aiInteractions: 'KI-Interaktionen',
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
    salesTrainingManual: 'Verkaufstrainingshandbuch',
    productKnowledgeBase: 'Produkt-Wissensdatenbank',
    customerService: 'Kundendienst-Richtlinien'
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
    processing: 'In Elaborazione',
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
    salesTrainingManual: 'Manuale di Formazione Vendite',
    productKnowledgeBase: 'Base di Conoscenza Prodotti',
    customerService: 'Linee Guida Servizio Clienti'
  },
  es: {
    businessDashboard: 'Panel de Control de Negocios',
    dashboard: 'Panel',
    documents: 'Documentos',
    staff: 'Personal',
    analytics: 'Análisis',
    settings: 'Configuración',
    selectLanguage: 'Seleccionar idioma',
    notifications: 'Notificaciones',
    uploadDocument: 'Subir Documento',
    inviteStaff: 'Invitar Personal',
    recentDocuments: 'Documentos Recientes',
    staffMembers: 'Miembros del Personal',
    documentStats: 'Estadísticas de Documentos',
    allDocuments: 'Todos los Documentos',
    businessDocuments: 'Documentos de Negocio',
    adminDocuments: 'Documentos de Administración',
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
    businessStats: 'Estadísticas de Negocio',
    uploadNew: 'Subir Nuevo',
    manageStaff: 'Gestionar Personal',
    manageDescription: 'Gestiona tus materiales de capacitación de la empresa, el personal y accede a las estadísticas',
    aiInteractions: 'Interacciones IA',
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
    salesTrainingManual: 'Manual de Formación de Ventas',
    productKnowledgeBase: 'Base de Conocimiento de Productos',
    customerService: 'Guía de Servicio al Cliente'
  }
};

export default function BusinessAnalytics() {
  const { language, setLanguage, translate } = useLanguage();
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('month');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Custom translate function that provides a fallback
  const t = (key: string) => {
    // First check business translations
    let translation = businessTranslations[language] ? 
      (businessTranslations[language] as Record<string, string>)[key] : undefined;
    
    // If not found in business translations, try global translations
    if (!translation) {
      translation = translate(key);
    }
    
    // If still not found, return the key itself with a console warning
    if (!translation || translation === key) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    return translation;
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
            {/* Language selector removed */}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/business" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/business/documents" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('documents')}
                </Link>
              </li>
              <li>
                <Link href="/business/staff" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('staff')}
                </Link>
              </li>
              <li>
                <Link href="/business/analytics" className="block px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/business/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
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
                {t('analytics')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('analyticsDescription') || 'View detailed analytics and insights about your team\'s performance'}
              </p>
            </div>

            {/* Time Frame Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-end">
                <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('timeFrame') || 'Time Frame:'}
                </span>
                <div className="inline-flex shadow-sm rounded-md" role="group">
                  <button
                    type="button"
                    onClick={() => setSelectedTimeFrame('week')}
                    className={`${
                      selectedTimeFrame === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } px-4 py-2 text-sm font-medium rounded-l-md focus:outline-none`}
                  >
                    {t('week') || 'Week'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeFrame('month')}
                    className={`${
                      selectedTimeFrame === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } px-4 py-2 text-sm font-medium focus:outline-none`}
                  >
                    {t('month') || 'Month'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeFrame('year')}
                    className={`${
                      selectedTimeFrame === 'year'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } px-4 py-2 text-sm font-medium rounded-r-md focus:outline-none`}
                  >
                    {t('year') || 'Year'}
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Document Usage Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('documentUsage') || 'Document Usage'}
                </h2>
                <div className="h-64 flex flex-col">
                  <div className="flex-1 flex items-end space-x-2">
                    <div className="w-1/6 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '30%' }}></div>
                    <div className="w-1/6 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '45%' }}></div>
                    <div className="w-1/6 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '60%' }}></div>
                    <div className="w-1/6 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '75%' }}></div>
                    <div className="w-1/6 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '50%' }}></div>
                    <div className="w-1/6 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '90%' }}></div>
                  </div>
                  <div className="mt-2 grid grid-cols-6 text-xs text-gray-500 dark:text-gray-400">
                    <div className="text-center">Mon</div>
                    <div className="text-center">Tue</div>
                    <div className="text-center">Wed</div>
                    <div className="text-center">Thu</div>
                    <div className="text-center">Fri</div>
                    <div className="text-center">Sat</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{t('totalViews') || 'Total Views'}: 1,248</span>
                    <span>{t('averageViewsPerDay') || 'Avg. Per Day'}: 208</span>
                  </div>
                </div>
              </div>
              
              {/* Active Users Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('activeUsers') || 'Active Users'}
                </h2>
                <div className="h-64 flex flex-col">
                  <div className="flex-1 flex items-end space-x-2">
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '20%' }}></div>
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '40%' }}></div>
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '30%' }}></div>
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '65%' }}></div>
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '45%' }}></div>
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '25%' }}></div>
                    <div className="w-1/7 bg-blue-400 dark:bg-blue-600 rounded-t" style={{ height: '10%' }}></div>
                  </div>
                  <div className="mt-2 grid grid-cols-7 text-xs text-gray-500 dark:text-gray-400">
                    <div className="text-center">Mon</div>
                    <div className="text-center">Tue</div>
                    <div className="text-center">Wed</div>
                    <div className="text-center">Thu</div>
                    <div className="text-center">Fri</div>
                    <div className="text-center">Sat</div>
                    <div className="text-center">Sun</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{t('totalActiveUsers') || 'Total Active Users'}: 24</span>
                    <span>{t('averageSessionTime') || 'Avg. Session Time'}: 18 {t('minutes') || 'min'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Interaction Analytics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('aiInteractions') || 'AI Interactions'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('totalInteractions') || 'Total Interactions'}
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">1,248</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('questionsAsked') || 'Questions Asked'}
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">986</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documentsAnalyzed') || 'Documents Analyzed'}
                  </h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">262</p>
                </div>
              </div>
              
              {/* AI Satisfaction Rating */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('aiSatisfactionRating') || 'AI Satisfaction Rating'}
                </h3>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 dark:bg-blue-600" style={{ width: '85%' }}></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0%</span>
                  <span>85%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            
            {/* Popular Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('popularDocuments') || 'Popular Documents'}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('document') || 'Document'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('views') || 'Views'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('aiQueries') || 'AI Queries'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('popularity') || 'Popularity'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('salesTrainingManual') || 'Sales Training Manual'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">452</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">218</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('productKnowledgeBase') || 'Product Knowledge Base'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">376</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">195</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('customerService') || 'Customer Service Guidelines'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">325</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">148</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-blue-500 dark:bg-blue-600 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 