'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

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
    customerService: 'Customer Service Guidelines',
    emailNotifications: 'Email Notifications',
    browserNotifications: 'Browser Notifications',
    accountSettings: 'Account Settings',
    notificationSettings: 'Notification Settings',
    securitySettings: 'Security Settings',
    apiSettings: 'API Settings',
    saveChanges: 'Save Changes'
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
    customerService: 'Guide de Service Client',
    emailNotifications: 'Notifications par Email',
    browserNotifications: 'Notifications du Navigateur',
    accountSettings: 'Paramètres du Compte',
    notificationSettings: 'Paramètres de Notification',
    securitySettings: 'Paramètres de Sécurité',
    apiSettings: 'Paramètres API',
    saveChanges: 'Enregistrer les Modifications'
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
    customerService: 'Kundendienst-Richtlinien',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    browserNotifications: 'Browser-Benachrichtigungen',
    accountSettings: 'Kontoeinstellungen',
    notificationSettings: 'Benachrichtigungseinstellungen',
    securitySettings: 'Sicherheitseinstellungen',
    apiSettings: 'API-Einstellungen',
    saveChanges: 'Änderungen speichern'
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
    customerService: 'Linee Guida Servizio Clienti',
    emailNotifications: 'Notifiche Email',
    browserNotifications: 'Notifiche Browser',
    accountSettings: 'Impostazioni Account',
    notificationSettings: 'Impostazioni Notifiche',
    securitySettings: 'Impostazioni Sicurezza',
    apiSettings: 'Impostazioni API',
    saveChanges: 'Salva Modifiche'
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
    customerService: 'Guía de Servicio al Cliente',
    emailNotifications: 'Notificaciones por Correo',
    browserNotifications: 'Notificaciones del Navegador',
    accountSettings: 'Configuración de Cuenta',
    notificationSettings: 'Configuración de Notificaciones',
    securitySettings: 'Configuración de Seguridad',
    apiSettings: 'Configuración de API',
    saveChanges: 'Guardar Cambios'
  }
};

export default function BusinessSettings() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);

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
                <Link href="/business/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/business/settings" className="block px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium">
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
                {t('settings')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('manageDescription')}
              </p>
            </div>

            {/* Settings Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="space-y-6">
                {/* Language Settings */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('selectLanguage')}
                  </h2>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <option key={code} value={code}>
                        {String(label)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dark Mode Toggle */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('appearance') || 'Appearance'}
                  </h2>
                  <button
                    onClick={toggleDarkMode}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isDarkMode ? t('lightMode') || 'Switch to Light Mode' : t('darkMode') || 'Switch to Dark Mode'}
                  </button>
                </div>

                {/* Notification Settings Example */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('notifications') || 'Notifications'}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="email-notifications"
                        name="email-notifications"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="email-notifications" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {t('emailNotifications') || 'Email Notifications'}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="browser-notifications"
                        name="browser-notifications"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="browser-notifications" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {t('browserNotifications') || 'Browser Notifications'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 