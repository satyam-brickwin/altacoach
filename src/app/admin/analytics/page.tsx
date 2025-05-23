'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { jsPDF } from "jspdf"; // ✨ Import at top
// import DatePicker from 'react-datepicker'; // You need to install react-datepicker
// import 'react-datepicker/dist/react-datepicker.css';

// Define chat duration data type
interface ChatDurationData {
  success?: boolean;
  totalChats?: number;
  totalDurationMinutes?: number;
  averageDurationMinutes?: number;
  businessChatStats?: Array<{
    businessId: string;
    businessName: string;
    totalChats: number;
    totalMessages: number;
    totalDurationMinutes: number;
    averageDurationMinutes: number;
    usersCount: number;
  }>;
}

// Sample analytics data for fallback
const sampleAnalyticsData = {
  userStats: {
    totalUsers: 1250,
    activeUsers: 875,
    newUsersThisMonth: 125,
    averageSessionTime: '18 minutes'
  },
  businessStats: {
    totalBusinesses: 48,
    activeBusinesses: 42,
    newBusinessesThisMonth: 5,
    averageUsersPerBusiness: 26
  },
  contentStats: {
    totalContent: 156,
    contentViews: 8750,
    mostPopularContentType: 'Course',
    averageCompletionRate: '68%'
  },
  aiStats: {
    totalInteractions: 12500,
    averageResponseTime: '1.2 seconds',
    satisfactionRate: '92%',
    mostCommonQueries: 'Training techniques'
  }
};

// Define translations for the admin dashboard
const adminTranslations = {
  en: {
    adminDashboard: 'Admin Dashboard',
    to:'to',
    ChatInteractionStatistics: 'Chat Interaction Statistics',
    ExportChatHistory: 'Export Chat History',
    TotalChatSessions: 'Total Chat Sessions',
    Suggestion:'Suggestion',
    admin:'Admin',
    Last: 'Last:',
    ThisMonth: 'This Month',
    ThisYear: 'This Year',
    SelectedPeriod: 'Selected Period',
    CurrentPeriod: 'Current Period',
    Noquestiondataavailablefortheselectedperiod: 'No question data available for the selected period.',  
    ChatConversations: 'Chat Conversations',
    AverageSessionTime: 'Average Session Time',
    PerChatSession: 'Per Chat Session',
    ActiveChatUsers: 'Active Chat Users',
    times: 'times',
    Asked: 'Asked',
    Top3MostAskedQuestions: 'Top 3 Most Asked Questions',
    UniqueUsers: 'Unique Users',
    ChatActivitybyBusiness: 'Chat Activity by Business',
    Business: 'Business',
    Users: 'Users',
    Chats: 'Chats',
    Messages: 'Messages',
    AvgDuration: 'Avg Duration',
    AverageDuration: 'Average Duration',
    Ok: 'OK',
    Year: 'Year',
    SignOut: 'Sign Out',
    Selectfilters: 'Select Filters',
    Admin: 'Admin',
    altamediaContent:'altamedia Content',
    Retry: 'Retry',
    Active: 'Active',
    dashboard: 'Dashboard',
    activeUserPercentage: 'Active User Percentage',
    businesses: 'Businesses',
    content: 'Content',
    userAccounts: 'User Accounts',
    settings: 'Settings',
    analytics: 'Analytics',
    prompts: 'Prompts',
    notifications: 'Notifications',
    analyticsOverview: 'Analytics Overview',
    userStatistics: 'User Statistics',
    businessStatistics: 'Business Statistics',
    contentStatistics: 'Content Statistics',
    aiStatistics: 'AI Interaction Statistics',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    newUsersThisMonth: 'New Users This Month',
    averageSessionTime: 'Average Session Time',
    totalBusinesses: 'Total Businesses',
    activeBusinesses: 'Active Businesses',
    newBusinessesThisMonth: 'New Businesses This Month',
    averageUsersPerBusiness: 'Average Users Per Business',
    totalContent: 'Total Content',
    contentViews: 'Content Views',
    mostPopularContentType: 'Most Popular Content Type',
    averageCompletionRate: 'Average Completion Rate',
    totalInteractions: 'Total Interactions',
    averageResponseTime: 'Average Response Time',
    satisfactionRate: 'Satisfaction Rate',
    mostCommonQueries: 'Most Common Queries',
    selectLanguage: 'Select Language',
    analyticsDescription: 'Platform performance metrics and insights',
    viewDetailedReport: 'View Detailed Report',
    exportData: 'Export Data',
    lastUpdated: 'Last Updated',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    timeRange: 'Time Range',
    filterBy: 'Filter By',
    all: 'All',
    usage: 'Usage',
    activeUsersDefinition: 'Active Users (Definition of Activity)',
    percentageActiveUsers: 'Percentage of Active Users',
    byBusiness: 'Active Users By Business',
    byLanguage: 'By Language',
    numberOfSessions: 'Number of Sessions',
    sessionDuration: 'Session Duration',
    device: 'Device',
    mobile: 'Mobile',
    desktop: 'Desktop',
    tablet: 'Tablet',
    other: 'Other'
    
  },
  fr: {
    adminDashboard: 'Tableau de Bord Admin',
    ChatInteractionStatistics: 'Statistiques d\'Interaction de Chat',
    to: 'à',
    TotalChatSessions: 'Total des Sessions de Chat',
    times: 'fois',
    Asked: 'Posé',
    Last: 'Dernier :',
    ThisYear: 'Cette Année',
    ThisMonth: 'Ce Mois',
    Selectfilters: 'Sélectionner les Filtres',
    SelectedPeriod: 'Période Sélectionnée',
    CurrentPeriod: 'Période Actuelle',
    ExportChatHistory: 'Exporter l\'Historique de Chat',
    Noquestiondataavailablefortheselectedperiod:'Aucune donnée de question disponible pour la période sélectionnée.',
    ChatConversations: 'Conversations de chat',
    AverageSessionTime: 'Durée moyenne de session',
    Top3MostAskedQuestions:' 3 Questions les Plus Posées',
    Active: 'Actif',
    PerChatSession: 'Par session de chat',
    ActiveChatUsers: 'Utilisateurs de chat actifs',
    UniqueUsers: 'Utilisateurs uniques',
    ChatActivitybyBusiness: 'Activité de chat par entreprise',
    Business: 'Entreprise',
    Users: 'Utilisateurs',
    Chats: 'Chats',
    Messages: 'Messages',
    AvgDuration: 'Durée moyenne',
    AverageDuration: 'Durée moyenne',
    Ok: 'OK',
    Year: 'Année',
    SignOut: 'Se déconnecter',
    Admin: 'Administrateur',
    Retry: 'Réessayer',
    min: 'min',

    activeUserPercentage: 'Pourcentage d\'Utilisateurs Actifs',
    dashboard: 'Tableau de Bord',
    businesses: 'Entreprises',
    content: 'Contenu',
    userAccounts: 'Comptes Utilisateurs',
    settings: 'Paramètres',
    analytics: 'Analyses',
    prompts: 'Invites',
    notifications: 'Notifications',
    analyticsOverview: 'Aperçu des Analyses',
    userStatistics: 'Statistiques Utilisateurs',
    businessStatistics: 'Statistiques Entreprises',
    contentStatistics: 'Statistiques Contenu',
    aiStatistics: 'Statistiques Interactions IA',
    totalUsers: 'Total Utilisateurs',
    activeUsers: 'Utilisateurs Actifs',
    newUsersThisMonth: 'Nouveaux Utilisateurs ce Mois',
    averageSessionTime: 'Temps de Session Moyen',
    totalBusinesses: 'Total Entreprises',
    activeBusinesses: 'Entreprises Actives',
    newBusinessesThisMonth: 'Nouvelles Entreprises ce Mois',
    averageUsersPerBusiness: 'Utilisateurs Moyens par Entreprise',
    totalContent: 'Total Contenu',
    contentViews: 'Vues du Contenu',
    mostPopularContentType: 'Type de Contenu le Plus Populaire',
    averageCompletionRate: 'Taux de Complétion Moyen',
    totalInteractions: 'Total Interactions',
    averageResponseTime: 'Temps de Réponse Moyen',
    satisfactionRate: 'Taux de Satisfaction',
    mostCommonQueries: 'Requêtes les Plus Communes',
    selectLanguage: 'Sélectionner la Langue',
    analyticsDescription: 'Métriques de performance et insights de la plateforme',
    viewDetailedReport: 'Voir Rapport Détaillé',
    exportData: 'Exporter les Données',
    lastUpdated: 'Dernière Mise à Jour',
    today: "Aujourd'hui",
    thisWeek: 'Cette Semaine',
    thisMonth: 'Ce Mois',
    thisYear: 'Cette Année',
    timeRange: 'Période',
    filterBy: 'Filtrer Par',
    all: 'Tous',
    usage: 'Utilisation',
    activeUsersDefinition: 'Utilisateurs Actifs (Définition de l\'Activité)',
    percentageActiveUsers: 'Pourcentage d\'Utilisateurs Actifs',
    byBusiness: 'Utilisateurs actifs par entreprise',
    byLanguage: 'Par Langue',
    numberOfSessions: 'Nombre de Sessions',
    sessionDuration: 'Durée de Session',
    device: 'Appareil',
    mobile: 'Mobile',
    desktop: 'Ordinateur',
    tablet: 'Tablette',
    other: 'Autre'
  },
  de: {
    adminDashboard: 'Admin-Dashboard',
    activeUserPercentage: 'Prozentsatz aktiver Benutzer',
    ChatInteractionStatistics: 'Chat-Interaktionsstatistiken',
    to: 'zu',
    Last: 'Letzte :',
    times: 'Mal',
    Asked: 'Gefragt',
    ThisYear: 'Dieses Jahr',
    ThisMonth: 'Diesen Monat',
    SelectedPeriod: 'Ausgewählter Zeitraum',
    CurrentPeriod: 'Aktueller Zeitraum',
    ExportChatHistory:'Chatverlauf exportieren',
    Top3MostAskedQuestions: 'Top 3 am häufigsten gestellte Fragen',
    Noquestiondataavailablefortheselectedperiod: 'Keine Frage Daten für den ausgewählten Zeitraum verfügbar.',
    ChatConversations: 'Chatgesprekken',
    AverageSessionTime: 'Gemiddelde sessieduur',
    Active: 'Aktiv',
    PerChatSession: 'Per chatsessie',
    ActiveChatUsers: 'Actieve chatgebruikers',
    UniqueUsers: 'Unieke gebruikers',
    ChatActivitybyBusiness: 'Chatactiviteit per bedrijf',
    Business: 'Bedrijf',
    Users: 'Gebruikers',
    Chats: 'Chats',
    Messages: 'Berichten',
    AvgDuration: 'Gemiddelde duur',
    AverageDuration: 'Gemiddelde duur',
    Ok: 'OK',
    Year: 'Jaar',
    SignOut: 'Afmelden',
    Admin: 'Beheerder',
    Retry: 'Opnieuw proberen',
    min: 'min',

    TotalChatSessions: 'Gesamtzahl der Chatsitzungen',
    dashboard: 'Dashboard',
    businesses: 'Unternehmen',
    content: 'Inhalt',
    userAccounts: 'Benutzerkonten',
    settings: 'Einstellungen',
    analytics: 'Analysen',
    prompts: 'Eingabeaufforderungen',
    notifications: 'Benachrichtigungen',
    analyticsOverview: 'Analyseübersicht',
    userStatistics: 'Benutzerstatistiken',
    businessStatistics: 'Unternehmensstatistiken',
    contentStatistics: 'Inhaltsstatistiken',
    aiStatistics: 'KI-Interaktionsstatistiken',
    totalUsers: 'Gesamtbenutzer',
    activeUsers: 'Aktive Benutzer',
    newUsersThisMonth: 'Neue Benutzer diesen Monat',
    averageSessionTime: 'Durchschnittliche Sitzungszeit',
    totalBusinesses: 'Gesamtunternehmen',
    activeBusinesses: 'Aktive Unternehmen',
    newBusinessesThisMonth: 'Neue Unternehmen diesen Monat',
    averageUsersPerBusiness: 'Durchschnittliche Benutzer pro Unternehmen',
    totalContent: 'Gesamtinhalt',
    contentViews: 'Inhaltsaufrufe',
    mostPopularContentType: 'Beliebtester Inhaltstyp',
    averageCompletionRate: 'Durchschnittliche Abschlussrate',
    totalInteractions: 'Gesamtinteraktionen',
    averageResponseTime: 'Durchschnittliche Antwortzeit',
    satisfactionRate: 'Zufriedenheitsrate',
    mostCommonQueries: 'Häufigste Anfragen',
    selectLanguage: 'Sprache auswählen',
    analyticsDescription: 'Plattformleistungsmetriken und Einblicke',
    viewDetailedReport: 'Detaillierten Bericht anzeigen',
    exportData: 'Daten exportieren',
    lastUpdated: 'Zuletzt aktualisiert',
    today: 'Heute',
    thisWeek: 'Diese Woche',
    thisMonth: 'Diesen Monat',
    thisYear: 'Dieses Jahr',
    timeRange: 'Zeitraum',
    filterBy: 'Filtern nach',
    all: 'Alle',
    usage: 'Nutzung',
    activeUsersDefinition: 'Aktive Benutzer (Definition der Aktivität)',
    percentageActiveUsers: 'Prozentsatz aktiver Benutzer',
    byBusiness: 'Nach Unternehmen',
    byLanguage: 'Nach Sprache',
    numberOfSessions: 'Anzahl der Sitzungen',
    sessionDuration: 'Sitzungsdauer',
    device: 'Gerät',
    mobile: 'Mobilgerät',
    Selectfilters: 'Filter auswählen',
    desktop: 'Desktop',
    tablet: 'Tablet',
    other: 'Andere'
  },
  it: {
    adminDashboard: 'Dashboard Admin',
    activeUserPercentage: 'Percentuale Utenti Attivi',
    to: 'a',
    ChatInteractionStatistics: 'Statistiche Interazione Chat',
    Last: 'Ultimo',
    times: 'volte',
    Selectfilters: 'Seleziona Filtri',
    Asked: 'Chiesto',
    ThisYear: 'Quest\'Anno',
    ThisMonth: 'Questo Mese',
    SelectedPeriod: 'Periodo Selezionato',
    CurrentPeriod: 'Periodo Corrente',
    ExportChatHistory:'Esporta Cronologia Chat',
    Active: 'Attivo',
    Top3MostAskedQuestions:'Le 3 domande più frequenti',
    Noquestiondataavailablefortheselectedperiod: 'Nessun dato disponibile per il periodo selezionato.',
    TotalChatSessions: 'Totale Sessioni Chat',
    ChatConversations: 'Conversazioni in chat',
    AverageSessionTime: 'Durata media della sessione',
    PerChatSession: 'Per sessione di chat',
    ActiveChatUsers: 'Utenti attivi in chat',
    UniqueUsers: 'Utenti unici',
    ChatActivitybyBusiness: 'Attività di chat per azienda',
    Business: 'Azienda',
    Users: 'Utenti',
    Chats: 'Chat',
    Messages: 'Messaggi',
    AvgDuration: 'Durata media',
    AverageDuration: 'Durata media',
    Ok: 'OK',
    Year: 'Anno',
    SignOut: 'Disconnettersi',
    Admin: 'Amministratore',
    Retry: 'Riprova',
    min: 'min',
    Businesses: 'Aziende',
    dashboard: 'Dashboard',
    businesses: 'Aziende',
    content: 'Contenuto',
    userAccounts: 'Account Utenti',
    settings: 'Impostazioni',
    analytics: 'Analisi',
    prompts: 'Prompt',
    notifications: 'Notifiche',
    analyticsOverview: 'Panoramica Analisi',
    userStatistics: 'Statistiche Utenti',
    businessStatistics: 'Statistiche Aziende',
    contentStatistics: 'Statistiche Contenuti',
    aiStatistics: 'Statistiche Interazioni IA',
    totalUsers: 'Totale Utenti',
    activeUsers: 'Utenti Attivi',
    newUsersThisMonth: 'Nuovi Utenti Questo Mese',
    averageSessionTime: 'Tempo Medio Sessione',
    totalBusinesses: 'Totale Aziende',
    activeBusinesses: 'Aziende Attive',
    newBusinessesThisMonth: 'Nuove Aziende Questo Mese',
    averageUsersPerBusiness: 'Media Utenti per Azienda',
    totalContent: 'Totale Contenuti',
    contentViews: 'Visualizzazioni Contenuti',
    mostPopularContentType: 'Tipo di Contenuto Più Popolare',
    averageCompletionRate: 'Tasso Medio di Completamento',
    totalInteractions: 'Totale Interazioni',
    averageResponseTime: 'Tempo Medio di Risposta',
    satisfactionRate: 'Tasso di Soddisfazione',
    mostCommonQueries: 'Domande Più Comuni',
    selectLanguage: 'Seleziona Lingua',
    analyticsDescription: 'Metriche di performance e approfondimenti della piattaforma',
    viewDetailedReport: 'Visualizza Rapporto Dettagliato',
    exportData: 'Esporta Dati',
    lastUpdated: 'Ultimo Aggiornamento',
    today: 'Oggi',
    thisWeek: 'Questa Settimana',
    thisMonth: 'Questo Mese',
    thisYear: 'Quest\'Anno',
    timeRange: 'Intervallo di Tempo',
    filterBy: 'Filtra Per',
    all: 'Tutti',
    usage: 'Utilizzo',
    activeUsersDefinition: 'Utenti Attivi (Definizione di Attività)',
    percentageActiveUsers: 'Percentuale di Utenti Attivi',
    byBusiness: 'Per Azienda',
    byLanguage: 'Per Lingua',
    numberOfSessions: 'Numero di Sessioni',
    sessionDuration: 'Durata Sessione',
    device: 'Dispositivo',
    mobile: 'Mobile',
    desktop: 'Desktop',
    tablet: 'Tablet',
    other: 'Altro'
  },
  // 
  
};

export default function AdminAnalytics() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [analyticsData, setAnalyticsData] = useState(sampleAnalyticsData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgUsersPerBusinessPercent, setAvgUsersPerBusinessPercent] = useState<number>(0);

  // Protect this page - only allow admin users
  const { isLoading: authLoading, isAuthenticated, user: authUser } = useAuthProtection([UserRole.ADMIN]);

  // Define all state hooks at the top of the component
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userDisplayName = user?.name?.[0] || 'A';
  const isStaffUser = user?.role === UserRole.ADMIN;

  // New filter states
  const [periodType, setPeriodType] = useState<'year' | 'month' | 'range' | ''>(''); // '' means nothing selected
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const [businessList, setBusinessList] = useState<{ id: string, name: string }[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]); // empty means nothing selected

  // Add at the top of your component (if not already present)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Add new state for usage statistics and device stats
  const [deviceStats, setDeviceStats] = useState({
    mobile: 35,
    desktop: 55,
    tablet: 8,
    other: 2
  });

  const [usageStats, setUsageStats] = useState({
    sessionCount: 4850,
    sessionDuration: 18,
    businessBreakdown: [] as { id: string, name: string, activeUserCount: number, percent: number }[],
    languageBreakdown: [] as { language: string, activeUserCount: number, percent: number }[],
    chatStats: [] as ChatDurationData['businessChatStats']
  });

  // Add this interface with your other interfaces
  interface TopQuestion {
    content: string;
    count: number;
    id: string;
    created_at: string;
  }

  // Add this state variable with your other state variables
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  // Fetch business list on mount
  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const res = await fetch('/api/admin/businesses');
        const data = await res.json();
        setBusinessList(data.businesses || []);
      } catch (e) {
        setBusinessList([]);
      }
    }
    fetchBusinesses();
  }, []);

  // Update the current time on the client side only
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString(language));
  }, [language]);

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Custom translate function that provides a fallback
  function t(key: string): string {
    // First check admin translations
    let translation = adminTranslations[language as SupportedLanguage] ?
      (adminTranslations[language as SupportedLanguage] as Record<string, string>)[key] : undefined;

    // If not found in admin translations, try global translations
    if (!translation) {
      translation = translate(key);
    }

    // If still not found, return the key itself
    if (!translation || translation === key) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }

    return translation;
  }

  // Function to handle data export
  const handleViewDetailedReport = () => {
    try {
      // Define translations for report elements
      const translations = {
        en: {
          title: "altacoach Analytics - Detailed Report",
          year: "Year",
          backToDashboard: "Back to Dashboard",
          headerTitle: "altacoach Analytics - Detailed Report",
          headerDescription: "A comprehensive view of platform performance metrics and insights for",
          userStats: "User Statistics",
          userStatsSubtitle: "Key metrics about platform users and their engagement",
          totalUsers: "Total Users",
          activeUsers: "Active Users",
          activeUserPercentage: "Active User Percentage",
          averageSessionTime: "Average Session Time",
          businessStats: "Business Statistics",
          businessStatsSubtitle: "Data about business accounts and their usage",
          metric: "Metric",
          value: "Value",
          description: "Description",
          totalBusinesses: "Total Businesses",
          totalBusinessesDesc: "Total number of business accounts on the platform",
          activeBusinesses: "Active Businesses",
          activeBusinessesDesc: "Business accounts with active users in the last 30 days",
          newBusinessesThisPeriod: "New Businesses This Period",
          newBusinessesThisPeriodDesc: "New business accounts created during the selected time period",
          averageUsersPerBusiness: "Average Users Per Business",
          averageUsersPerBusinessDesc: "Average number of users associated with each business",
          activeUsersByBusiness: "Active Users by Business",
          businessName: "Business Name",
          percentage: "Percentage",
          usageStatistics: "Usage Statistics",
          usageStatisticsSubtitle: "Platform usage metrics and user engagement patterns",
          sessionCount: "Session Count",
          avgSessionDuration: "Avg. Session Duration",
          totalChatSessions: "Total Chat Sessions",
          deviceUsageBreakdown: "Device Usage Breakdown",
          mobile: "Mobile",
          desktop: "Desktop",
          tablet: "Tablet",
          other: "Other",
          usageByLanguage: "Usage by Language",
          language: "Language",
          topQuestions: "Top 3 Most Asked Questions",
          topQuestionsSubtitle: "Most frequently asked questions by users",
          question: "Question",
          count: "Count",
          chatInteractionStats: "Chat Interaction Statistics",
          chatInteractionStatsSubtitle: "Detailed metrics about user chat sessions and engagement",
          chatActivityByBusiness: "Chat Activity by Business",
          business: "Business",
          users: "Users",
          chats: "Chats",
          messages: "Messages",
          avgDuration: "Avg Duration",
          reportGeneratedOn: "Report generated on",
          timePeriod: "Time Period",
          printReport: "Print Report",
          min: "min",
          allTime: "All Time",
          to: "to",
        },
        fr: {
          title: "altacoach Analytique - Rapport Détaillé",
          year: "Année",
          backToDashboard: "Retour au Tableau de Bord",
          headerTitle: "altacoach Analytique - Rapport Détaillé",
          headerDescription: "Une vue complète des métriques de performance de la plateforme et des insights pour",
          userStats: "Statistiques des Utilisateurs",
          userStatsSubtitle: "Métriques clés sur les utilisateurs de la plateforme et leur engagement",
          totalUsers: "Nombre Total d'Utilisateurs",
          activeUsers: "Utilisateurs Actifs",
          activeUserPercentage: "Pourcentage d'Utilisateurs Actifs",
          averageSessionTime: "Durée Moyenne de Session",
          businessStats: "Statistiques des Entreprises",
          businessStatsSubtitle: "Données sur les comptes entreprises et leur utilisation",
          metric: "Métrique",
          value: "Valeur",
          description: "Description",
          totalBusinesses: "Nombre Total d'Entreprises",
          totalBusinessesDesc: "Nombre total de comptes entreprises sur la plateforme",
          activeBusinesses: "Entreprises Actives",
          activeBusinessesDesc: "Comptes entreprises avec des utilisateurs actifs au cours des 30 derniers jours",
          newBusinessesThisPeriod: "Nouvelles Entreprises Cette Période",
          newBusinessesThisPeriodDesc: "Nouveaux comptes entreprises créés pendant la période sélectionnée",
          averageUsersPerBusiness: "Moyenne d'Utilisateurs par Entreprise",
          averageUsersPerBusinessDesc: "Nombre moyen d'utilisateurs associés à chaque entreprise",
          activeUsersByBusiness: "Utilisateurs Actifs par Entreprise",
          businessName: "Nom de l'Entreprise",
          percentage: "Pourcentage",
          usageStatistics: "Statistiques d'Utilisation",
          usageStatisticsSubtitle: "Métriques d'utilisation de la plateforme et modèles d'engagement des utilisateurs",
          sessionCount: "Nombre de Sessions",
          avgSessionDuration: "Durée Moyenne de Session",
          totalChatSessions: "Nombre Total de Sessions de Chat",
          deviceUsageBreakdown: "Répartition par Appareil",
          mobile: "Mobile",
          desktop: "Ordinateur",
          tablet: "Tablette",
          other: "Autre",
          usageByLanguage: "Utilisation par Langue",
          language: "Langue",
          topQuestions: "Top 3 des Questions les Plus Posées",
          topQuestionsSubtitle: "Questions les plus fréquemment posées par les utilisateurs",
          question: "Question",
          count: "Nombre",
          chatInteractionStats: "Statistiques d'Interaction de Chat",
          chatInteractionStatsSubtitle: "Métriques détaillées sur les sessions de chat des utilisateurs et l'engagement",
          chatActivityByBusiness: "Activité de Chat par Entreprise",
          business: "Entreprise",
          users: "Utilisateurs",
          chats: "Chats",
          messages: "Messages",
          avgDuration: "Durée Moyenne",
          reportGeneratedOn: "Rapport généré le",
          timePeriod: "Période",
          printReport: "Imprimer le Rapport",
          min: "min",
          allTime: "Tout Temps",
          to: "à",
        },
        de: {
          title: "altacoach Analytik - Detaillierter Bericht",
          backToDashboard: "Zurück zum Dashboard",
          headerTitle: "altacoach Analytik - Detaillierter Bericht",
          year: "Jahr",
          headerDescription: "Ein umfassender Überblick über Plattformleistungskennzahlen und Erkenntnisse für",
          userStats: "Benutzerstatistiken",
          userStatsSubtitle: "Wichtige Kennzahlen zu Plattformbenutzern und deren Engagement",
          totalUsers: "Gesamtzahl der Benutzer",
          activeUsers: "Aktive Benutzer",
          activeUserPercentage: "Prozentsatz aktiver Benutzer",
          averageSessionTime: "Durchschnittliche Sitzungszeit",
          businessStats: "Unternehmensstatistiken",
          businessStatsSubtitle: "Daten zu Unternehmenskonten und deren Nutzung",
          metric: "Kennzahl",
          value: "Wert",
          description: "Beschreibung",
          totalBusinesses: "Gesamtzahl der Unternehmen",
          totalBusinessesDesc: "Gesamtzahl der Unternehmenskonten auf der Plattform",
          activeBusinesses: "Aktive Unternehmen",
          activeBusinessesDesc: "Unternehmenskonten mit aktiven Benutzern in den letzten 30 Tagen",
          newBusinessesThisPeriod: "Neue Unternehmen in diesem Zeitraum",
          newBusinessesThisPeriodDesc: "Neue Unternehmenskonten, die während des ausgewählten Zeitraums erstellt wurden",
          averageUsersPerBusiness: "Durchschnittliche Benutzer pro Unternehmen",
          averageUsersPerBusinessDesc: "Durchschnittliche Anzahl von Benutzern, die jedem Unternehmen zugeordnet sind",
          activeUsersByBusiness: "Aktive Benutzer nach Unternehmen",
          businessName: "Unternehmensname",
          percentage: "Prozentsatz",
          usageStatistics: "Nutzungsstatistiken",
          usageStatisticsSubtitle: "Plattformnutzungskennzahlen und Benutzerengagement-Muster",
          sessionCount: "Anzahl der Sitzungen",
          avgSessionDuration: "Durchschn. Sitzungsdauer",
          totalChatSessions: "Gesamtzahl der Chat-Sitzungen",
          deviceUsageBreakdown: "Gerätenutzung-Aufschlüsselung",
          mobile: "Mobil",
          desktop: "Desktop",
          tablet: "Tablet",
          other: "Andere",
          usageByLanguage: "Nutzung nach Sprache",
          language: "Sprache",
          topQuestions: "Top 3 der am häufigsten gestellten Fragen",
          topQuestionsSubtitle: "Am häufigsten von Benutzern gestellte Fragen",
          question: "Frage",
          count: "Anzahl",
          chatInteractionStats: "Chat-Interaktionsstatistiken",
          chatInteractionStatsSubtitle: "Detaillierte Kennzahlen zu Benutzer-Chat-Sitzungen und Engagement",
          chatActivityByBusiness: "Chat-Aktivität nach Unternehmen",
          business: "Unternehmen",
          users: "Benutzer",
          chats: "Chats",
          messages: "Nachrichten",
          avgDuration: "Durchschn. Dauer",
          reportGeneratedOn: "Bericht erstellt am",
          timePeriod: "Zeitraum",
          printReport: "Bericht drucken",
          min: "Min",
          allTime: "Gesamter Zeitraum",
          to: "zu"
        },
        it: {
          title: "altacoach Analytics - Rapporto Dettagliato",
          backToDashboard: "Torna alla Dashboard",
          headerTitle: "altacoach Analytics - Rapporto Dettagliato",
          year: "Anno",
          headerDescription: "Una visione completa delle metriche di performance della piattaforma e degli insight per",
          userStats: "Statistiche Utenti",
          userStatsSubtitle: "Metriche chiave sugli utenti della piattaforma e il loro coinvolgimento",
          totalUsers: "Utenti Totali",
          activeUsers: "Utenti Attivi",
          activeUserPercentage: "Percentuale Utenti Attivi",
          averageSessionTime: "Tempo Medio di Sessione",
          businessStats: "Statistiche Aziendali",
          businessStatsSubtitle: "Dati sugli account aziendali e il loro utilizzo",
          metric: "Metrica",
          value: "Valore",
          description: "Descrizione",
          totalBusinesses: "Aziende Totali",
          totalBusinessesDesc: "Numero totale di account aziendali sulla piattaforma",
          activeBusinesses: "Aziende Attive",
          activeBusinessesDesc: "Account aziendali con utenti attivi negli ultimi 30 giorni",
          newBusinessesThisPeriod: "Nuove Aziende in Questo Periodo",
          newBusinessesThisPeriodDesc: "Nuovi account aziendali creati durante il periodo selezionato",
          averageUsersPerBusiness: "Media Utenti per Azienda",
          averageUsersPerBusinessDesc: "Numero medio di utenti associati a ciascuna azienda",
          activeUsersByBusiness: "Utenti Attivi per Azienda",
          businessName: "Nome Azienda",
          percentage: "Percentuale",
          usageStatistics: "Statistiche di Utilizzo",
          usageStatisticsSubtitle: "Metriche di utilizzo della piattaforma e modelli di coinvolgimento degli utenti",
          sessionCount: "Numero di Sessioni",
          avgSessionDuration: "Durata Media Sessione",
          totalChatSessions: "Sessioni di Chat Totali",
          deviceUsageBreakdown: "Suddivisione Utilizzo Dispositivi",
          mobile: "Mobile",
          desktop: "Desktop",
          tablet: "Tablet",
          other: "Altro",
          usageByLanguage: "Utilizzo per Lingua",
          language: "Lingua",
          topQuestions: "Top 3 Domande Più Frequenti",
          topQuestionsSubtitle: "Domande poste più frequentemente dagli utenti",
          question: "Domanda",
          count: "Conteggio",
          chatInteractionStats: "Statistiche Interazioni Chat",
          chatInteractionStatsSubtitle: "Metriche dettagliate sulle sessioni di chat degli utenti e sul coinvolgimento",
          chatActivityByBusiness: "Attività Chat per Azienda",
          business: "Azienda",
          users: "Utenti",
          chats: "Chat",
          messages: "Messaggi",
          avgDuration: "Durata Media",
          reportGeneratedOn: "Rapporto generato il",
          timePeriod: "Periodo di Tempo",
          printReport: "Stampa Rapporto",
          min: "min",
          allTime: "Tutto il Periodo",
          to: "a"
        }
      };
  
      // Get translation based on current language setting
      const t = translations[language] || translations.en;
  
      // Create a more beautiful HTML representation of the data
      let htmlContent = `
      <!DOCTYPE html>
      <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #C72026;
            --primary-light: rgba(199, 32, 38, 0.1);
            --primary-medium: rgba(199, 32, 38, 0.2);
            --primary-dark: #a51a1f;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
          }
          
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--gray-800);
            background-color: var(--gray-50);
            padding: 0;
            margin: 0;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          header {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1rem 0;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .logo {
            display: flex;
            align-items: center;
          }
          
          .logo h1 {
            color: var(--gray-900);
            font-size: 1.8rem;
            margin: 0;
            font-weight: 700;
            font-style: italic;
            letter-spacing: 0.1em;
          }
          
          .logo h1 span {
            color: var(--gray-900); /* All spans are black by default */
          }
          
          .logo h1 span.red {
            color: var(--primary); /* Only the span with class "red" will be red */
          }
          
          .back-button {
            display: inline-flex;
            align-items: center;
            background-color: var(--primary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
            border: none;
            cursor: pointer;
            font-size: 0.875rem;
          }
          
          .back-button:hover {
            background-color: var(--primary-dark);
          }
          
          .back-button svg {
            margin-right: 0.5rem;
            width: 1rem;
            height: 1rem;
          }
          
          .report-header {
            margin: 2rem 0;
          }
          
          .report-header h1 {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
          }
          
          .report-header p {
            color: var(--gray-600);
            font-size: 1.1rem;
            max-width: 800px;
          }
          
          section {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          
          section h2 {
            color: var(--gray-800);
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--gray-200);
          }
          
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 1rem;
          }
          
          th, td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--gray-200);
          }
          
          th {
            background-color: var(--gray-100);
            font-weight: 600;
            color: var(--gray-700);
            position: sticky;
            top: 73px;
          }
          
          th:first-child {
            border-top-left-radius: 0.375rem;
          }
          
          th:last-child {
            border-top-right-radius: 0.375rem;
          }
          
          tr:last-child td:first-child {
            border-bottom-left-radius: 0.375rem;
          }
          
          tr:last-child td:last-child {
            border-bottom-right-radius: 0.375rem;
          }
          
          tr:hover td {
            background-color: var(--gray-50);
          }
          
          .meta-info {
            background-color: var(--primary-light);
            padding: 1rem;
            border-radius: 0.375rem;
            margin-top: 2rem;
            display: flex;
            justify-content: space-between;
            color: var(--gray-700);
            font-size: 0.875rem;
            align-items: center;
          }
          
          .value-column {
            font-weight: 500;
            color: var(--primary);
          }
          
          .print-button {
            background-color: var(--gray-200);
            color: var(--gray-700);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            margin-left: 0.5rem;
            transition: background-color 0.2s;
          }
          
          .print-button:hover {
            background-color: var(--gray-300);
          }
          
          .print-button svg {
            margin-right: 0.5rem;
            width: 1rem;
            height: 1rem;
          }
          
          .admin-badge {
            display: inline-block;
            margin-left: 0.5rem;
            padding: 0.25rem 0.5rem;
            background-color: var(--primary-light);
            color: var(--primary);
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 0.25rem;
          }
          
          .chart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 2rem 0;
            height: 300px;
          }
          
          .chart-placeholder {
            width: 100%;
            height: 100%;
            background-color: var(--gray-100);
            border-radius: 0.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--gray-500);
            font-style: italic;
          }
          
          .stat-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .stat-card {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            padding: 1.25rem;
            display: flex;
            align-items: center;
          }
          
          .stat-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            flex-shrink: 0;
          }
          
          .stat-content h3 {
            font-size: 0.875rem;
            color: var(--gray-500);
            margin-bottom: 0.25rem;
          }
          
          .stat-content p {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--gray-900);
          }
          
          .section-subtitle {
            color: var(--gray-600);
            font-size: 1rem;
            margin: -1rem 0 1.5rem 0;
          }
          
          .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          @media print {
            header, .back-button, .print-button {
              display: none;
            }
            
            body {
              background-color: white;
            }
            
            .container {
              padding: 0;
            }
            
            section {
              box-shadow: none;
              margin-bottom: 1rem;
              page-break-inside: avoid;
            }
            
            table {
              page-break-inside: avoid;
            }
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 1rem;
            }
            
            th, td {
              padding: 0.75rem 0.5rem;
            }
            
            .report-header h1 {
              font-size: 2rem;
            }
            
            .chart-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container" style="padding: 0.75rem;">
            <div class="header-content" style="justify-content: space-between; align-items: center;">
              <div class="logo">
                <h1 style="font-size: 1.2rem; margin: 0; display: flex; align-items: center;">
                  <span>alta</span>
                  <span class="red">c</span>
                  <span>oach</span>
                  <span class="admin-badge" style="font-size: 0.6rem; padding: 0.15rem 0.35rem; margin-left: 0.3rem;">Admin</span>
                </h1>
              </div>
              <button onclick="window.close()" class="back-button" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="14" height="14">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                ${t.backToDashboard}
              </button>
            </div>
          </div>
        </header>
        
        <div class="container">
          <div class="report-header">
            <h1>${t.headerTitle}</h1>
            <p>${t.headerDescription} ${periodType === 'year' ? `${t.year} ${selectedYear}` :
          periodType === 'month' ? `${new Date(0, selectedMonth - 1).toLocaleString(language, { month: 'long' })} ${selectedYear}` :
            periodType === 'range' && dateFrom && dateTo ? `${dateFrom.toISOString().split('T')[0]} ${t.to} ${dateTo.toISOString().split('T')[0]}` :
              t.allTime
        }</p>
          </div>
          
          <!-- User Statistics Section -->
          <section>
            <h2>${t.userStats}</h2>
            <p class="section-subtitle">${t.userStatsSubtitle}</p>
            
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #C72026; color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <h3>${t.totalUsers}</h3>
                  <p>${analyticsData.userStats.totalUsers}</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #10B981; color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <h3>${t.activeUsers}</h3>
                  <p>${analyticsData.userStats.activeUsers}</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #3B82F6; color: white;">
                  <span style="font-size: 20px; font-weight: bold;">%</span>
                </div>
                <div class="stat-content">
                  <h3>${t.activeUserPercentage}</h3>
                  <p>${avgUsersPerBusinessPercent}%</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #F59E0B; color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <h3>${t.averageSessionTime}</h3>
                  <p>${analyticsData.userStats.averageSessionTime}</p>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Business Statistics Section -->
          <section>
            <h2>${t.businessStats}</h2>
            <p class="section-subtitle">${t.businessStatsSubtitle}</p>
            
            <table>
              <thead>
                <tr>
                  <th>${t.metric}</th>
                  <th class="value-column">${t.value}</th>
                  <th>${t.description}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${t.totalBusinesses}</td>
                  <td class="value-column">${analyticsData.businessStats.totalBusinesses}</td>
                  <td>${t.totalBusinessesDesc}</td>
                </tr>
                <tr>
                  <td>${t.activeBusinesses}</td>
                  <td class="value-column">${analyticsData.businessStats.activeBusinesses}</td>
                  <td>${t.activeBusinessesDesc}</td>
                </tr>
                <tr>
                  <td>${t.newBusinessesThisPeriod}</td>
                  <td class="value-column">${analyticsData.businessStats.newBusinessesThisMonth}</td>
                  <td>${t.newBusinessesThisPeriodDesc}</td>
                </tr>
                <tr>
                  <td>${t.averageUsersPerBusiness}</td>
                  <td class="value-column">${analyticsData.businessStats.averageUsersPerBusiness}</td>
                  <td>${t.averageUsersPerBusinessDesc}</td>
                </tr>
              </tbody>
            </table>
            
            ${usageStats.businessBreakdown.length > 0 ? `
              <h3 style="margin-top: 2rem; font-size: 1.25rem; color: var(--gray-700);">${t.activeUsersByBusiness}</h3>
              <table style="margin-top: 1rem;">
                <thead>
                  <tr>
                    <th>${t.businessName}</th>
                    <th class="value-column">${t.activeUsers}</th>
                    <th>${t.percentage}</th>
                  </tr>
                </thead>
                <tbody>
                  ${usageStats.businessBreakdown.map(biz => `
                    <tr>
                      <td>${biz.name}</td>
                      <td class="value-column">${biz.activeUserCount}</td>
                      <td>
                        <div style="width: 100%; background-color: var(--gray-200); height: 8px; border-radius: 4px;">
                          <div style="width: ${biz.percent}%; background-color: var(--primary); height: 8px; border-radius: 4px;"></div>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--gray-600);">${biz.percent}%</span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </section>
          
          <!-- Usage Statistics Section -->
          <section>
            <h2>${t.usageStatistics}</h2>
            <p class="section-subtitle">${t.usageStatisticsSubtitle}</p>
            
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #3B82F6; color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 012 2z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <h3>${t.sessionCount}</h3>
                  <p>${usageStats.sessionCount.toLocaleString()}</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #F59E0B; color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <h3>${t.avgSessionDuration}</h3>
                  <p>${usageStats.sessionDuration} ${t.min}</p>
                </div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon" style="background-color: #8B5CF6; color: white;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                </div>
                <div class="stat-content">
                  <h3>${t.totalChatSessions}</h3>
                  <p>${usageStats.chatStats ? usageStats.chatStats.reduce((sum, stat) => sum + stat.totalChats, 0).toLocaleString() : 0}</p>
                </div>
              </div>
            </div>
            
            <h3 style="margin-top: 2rem; font-size: 1.25rem; color: var(--gray-700);">${t.deviceUsageBreakdown}</h3>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-around; margin: 1.5rem 0;">
              <div style="text-align: center; padding: 1rem; min-width: 150px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background-color: rgba(79, 70, 229, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                  <span style="font-size: 1.75rem; font-weight: 700; color: #4F46E5;">${deviceStats.mobile}%</span>
                </div>
                <p style="font-weight: 500; color: var(--gray-700);">${t.mobile}</p>
              </div>
              
              <div style="text-align: center; padding: 1rem; min-width: 150px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background-color: rgba(59, 130, 246, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                  <span style="font-size: 1.75rem; font-weight: 700; color: #3B82F6;">${deviceStats.desktop}%</span>
                </div>
                <p style="font-weight: 500; color: var(--gray-700);">${t.desktop}</p>
              </div>
              
              <div style="text-align: center; padding: 1rem; min-width: 150px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background-color: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                  <span style="font-size: 1.75rem; font-weight: 700; color: #8B5CF6;">${deviceStats.tablet}%</span>
                </div>
                <p style="font-weight: 500; color: var(--gray-700);">${t.tablet}</p>
              </div>
              
              <div style="text-align: center; padding: 1rem; min-width: 150px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background-color: rgba(107, 114, 128, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                  <span style="font-size: 1.75rem; font-weight: 700; color: #6B7280;">${deviceStats.other}%</span>
                </div>
                <p style="font-weight: 500; color: var(--gray-700);">${t.other}</p>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem;">
              ${usageStats.languageBreakdown.length > 0 ? `
                <div>
                  <h3 style="font-size: 1.25rem; color: var(--gray-700); margin-bottom: 1rem;">${t.usageByLanguage}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>${t.language}</th>
                        <th class="value-column">${t.percentage}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${usageStats.languageBreakdown.map(lang => `
                        <tr>
                          <td>${lang.language}</td>
                          <td class="value-column">${lang.percent}%</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              ` : ''}
            </div>
          </section>
  
          <!-- Top Questions Section -->
          ${topQuestions.length > 0 ? `
            <section>
              <h2>${t.topQuestions}</h2>
              <p class="section-subtitle">${t.topQuestionsSubtitle}</p>
              
              <table>
                <thead>
                  <tr>
                    <th>${t.question}</th>
                    <th class="value-column">${t.count}</th>
                  </tr>
                </thead>
                <tbody>
                  ${topQuestions.map(question => `
                    <tr>
                      <td>${question.content}</td>
                      <td class="value-column">${question.count}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>-
          ` : ''} 
          
          <!-- Chat Statistics Section -->
          ${usageStats.chatStats && usageStats.chatStats.length > 0 ? `
            <section>
              <h2>${t.chatInteractionStats}</h2>
              <p class="section-subtitle">${t.chatInteractionStatsSubtitle}</p>
              
              <div class="stat-cards">
                <div class="stat-card">
                  <div class="stat-icon" style="background-color: #8B5CF6; color: white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                  </div>
                  <div class="stat-content">
                    <h3>${t.totalChatSessions}</h3>
                    <p>${usageStats.chatStats.reduce((sum, stat) => sum + stat.totalChats, 0).toLocaleString()}</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon" style="background-color: #F59E0B; color: white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="stat-content">
                    <h3>${t.avgSessionDuration}</h3>
                    <p>${usageStats.sessionDuration} ${t.min}</p>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon" style="background-color: #3B82F6; color: white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                  </div>
                  <div class="stat-content">
                    <h3>${t.activeUsers}</h3>
                    <p>${usageStats.chatStats.reduce((sum, stat) => sum + stat.usersCount, 0)}</p>
                  </div>
                </div>
              </div>
              
              <h3 style="margin-top: 2rem; font-size: 1.25rem; color: var(--gray-700);">${t.chatActivityByBusiness}</h3>
              <table style="margin-top: 1rem;">
                <thead>
                  <tr>
                    <th>${t.business}</th>
                    <th>${t.users}</th>
                    <th>${t.chats}</th>
                    <th>${t.messages}</th>
                    <th>${t.avgDuration}</th>
                  </tr>
                </thead>
                <tbody>
                  ${usageStats.chatStats.map((stat, index) => `
                    <tr>
                      <td style="font-weight: 500; color: var(--gray-800);">${stat.businessName}</td>
                      <td>${stat.usersCount}</td>
                      <td>${stat.totalChats}</td>
                      <td>${stat.totalMessages}</td>
                      <td>${Math.round(stat.averageDurationMinutes)} ${t.min}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>
          ` : ''}
            
          <div class="meta-info">
            <div>
              <p>${t.reportGeneratedOn} ${new Date().toLocaleString(language)}</p>
              <p>${t.timePeriod}: ${periodType === 'year' ? `${t.year} ${selectedYear}` :
          periodType === 'month' ? `${new Date(0, selectedMonth - 1).toLocaleString(language, { month: 'long' })} ${selectedYear}` :
            periodType === 'range' && dateFrom && dateTo ? `${dateFrom.toISOString().split('T')[0]} ${t.to} ${dateTo.toISOString().split('T')[0]}` :
              t.allTime
        }</p>
            </div>
            <div>
              <button onclick="window.print()" class="print-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 012 2z" />
                </svg>
                ${t.printReport}
              </button>
            </div>
          </div>
        </div>
        
        <script>
          // Add event listener for the back button
          document.querySelector('.back-button').addEventListener('click', function() {
            window.close();
          });
        </script>
      </body>
      </html>
    `;
  
      // Create a blob and open in a new tab
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
  
      // Clean up URL object after the tab is opened
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Error generating detailed report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };


  // Function to handle data export
  const handleExportData = () => {
    try {
      // Format date for filename
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];

      // Create filename with period info if applicable
      let periodInfo = 'all-time';
      if (periodType === 'year') {
        periodInfo = `year-${selectedYear}`;
      } else if (periodType === 'month') {
        periodInfo = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
      } else if (periodType === 'range' && dateFrom && dateTo) {
        periodInfo = `${dateFrom.toISOString().split('T')[0]}-to-${dateTo.toISOString().split('T')[0]}`;
      }

      const filename = `altacoach-analytics-${periodInfo}-${formattedDate}.csv`;

      // Create CSV content using the current data in the dashboard
      // Using "=====" as visual separators to make headers stand out
      let csvContent = '======== ALTACOACH ANALYTICS REPORT ========\n\n';

      // Add report metadata
      csvContent += `Report Date,${date.toLocaleString()}\n`;
      csvContent += `Time Period,${periodType === 'year' ? `Year ${selectedYear}` :
        periodType === 'month' ? `${new Date(0, selectedMonth - 1).toLocaleString(language, { month: 'long' })} ${selectedYear}` :
          periodType === 'range' && dateFrom && dateTo ? `${dateFrom.toISOString().split('T')[0]} to ${dateTo.toISOString().split('T')[0]}` :
            'All Time'
        }\n\n`;

      // Add user statistics with clear section header
      csvContent += '======== USER STATISTICS ========\n';
      csvContent += 'Metric,Value,Description\n';
      csvContent += `Total Users,${analyticsData.userStats.totalUsers},Total number of registered users\n`;
      csvContent += `Active Users,${analyticsData.userStats.activeUsers},Users who logged in during the period\n`;
      csvContent += `New Users This Period,${analyticsData.userStats.newUsersThisMonth},New user registrations during the selected time period\n`;
      csvContent += `Average Session Time,${analyticsData.userStats.averageSessionTime},Average time users spend on the platform per session\n`;
      csvContent += `Active User Percentage,${avgUsersPerBusinessPercent}%,Percentage of total users who are active\n\n`;

      // Add business statistics with clear section header
      csvContent += '======== BUSINESS STATISTICS ========\n';
      csvContent += 'Metric,Value,Description\n';
      csvContent += `Total Businesses,${analyticsData.businessStats.totalBusinesses},Total number of business accounts\n`;
      csvContent += `Active Businesses,${analyticsData.businessStats.activeBusinesses},Business accounts with active users\n`;
      csvContent += `New Businesses This Period,${analyticsData.businessStats.newBusinessesThisMonth},New business accounts created during the selected time period\n`;
      csvContent += `Average Users Per Business,${analyticsData.businessStats.averageUsersPerBusiness},Average number of users associated with each business\n\n`;

      // Add usage statistics with clear section header
      csvContent += '======== USAGE STATISTICS ========\n';
      csvContent += 'Metric,Value,Description\n';
      csvContent += `Session Count,${usageStats.sessionCount},Total number of user sessions\n`;
      csvContent += `Average Session Duration,${usageStats.sessionDuration} minutes,Average time users spend in a session\n\n`;

      // Add device statistics with clear section header
      csvContent += '======== DEVICE STATISTICS ========\n';
      csvContent += 'Device Type,Percentage,\n';
      csvContent += `Mobile,${deviceStats.mobile}%,\n`;
      csvContent += `Desktop,${deviceStats.desktop}%,\n`;
      csvContent += `Tablet,${deviceStats.tablet}%,\n`;
      csvContent += `Other,${deviceStats.other}%,\n\n`;

      // Add business breakdown if available
      if (usageStats.businessBreakdown.length > 0) {
        csvContent += '======== BUSINESS BREAKDOWN ========\n';
        csvContent += 'Business Name,Active Users,Percentage\n';
        usageStats.businessBreakdown.forEach(biz => {
          csvContent += `${biz.name},${biz.activeUserCount},${biz.percent}%\n`;
        });
        csvContent += '\n';
      }

      // Add language breakdown if available
      if (usageStats.languageBreakdown.length > 0) {
        csvContent += '======== LANGUAGE BREAKDOWN ========\n';
        csvContent += 'Language,Percentage,\n';
        usageStats.languageBreakdown.forEach(lang => {
          csvContent += `${lang.language},${lang.percent}%,\n`;
        });
        csvContent += '\n';
      }

      // Add chat statistics if available
      if (usageStats.chatStats && usageStats.chatStats.length > 0) {
        csvContent += '======== CHAT STATISTICS BY BUSINESS ========\n';
        csvContent += 'Business Name,Users,Chats,Messages,Avg Duration (minutes)\n';
        usageStats.chatStats.forEach(stat => {
          csvContent += `${stat.businessName},${stat.usersCount},${stat.totalChats},${stat.totalMessages},${Math.round(stat.averageDurationMinutes)}\n`;
        });

        const totalChats = usageStats.chatStats.reduce((sum, stat) => sum + stat.totalChats, 0);
        const totalChatUsers = usageStats.chatStats.reduce((sum, stat) => sum + stat.usersCount, 0);

        csvContent += `TOTAL,${totalChatUsers},${totalChats},,\n\n`;
      }

      // Add export footer
      csvContent += '======== END OF REPORT ========\n';
      csvContent += 'Generated by altacoach Analytics Dashboard\n';

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  // Function to fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);

        // Build query params based on selected filters
        const queryParams = new URLSearchParams();

        // Add period type filters
        if (periodType === 'year' && selectedYear) {
          queryParams.append('periodType', 'year');
          queryParams.append('year', selectedYear.toString());
        } else if (periodType === 'month' && selectedYear && selectedMonth) {
          queryParams.append('periodType', 'month');
          queryParams.append('year', selectedYear.toString());
          queryParams.append('month', selectedMonth.toString());
        } else if (periodType === 'range' && dateFrom && dateTo) {
          queryParams.append('periodType', 'range');
          queryParams.append('dateFrom', dateFrom.toISOString().split('T')[0]);
          queryParams.append('dateTo', dateTo.toISOString().split('T')[0]);
        }

        // Add business filters
        if (selectedBusinesses.length > 0) {
          if (selectedBusinesses.includes('all')) {
            // If 'all' is selected, don't filter by business
          } else {
            // Add comma-separated list of business IDs
            queryParams.append('businesses', selectedBusinesses.join(','));
          }
        }

        // Construct the URL with query parameters
        const apiUrl = `/api/admin/dashboard-stats2?${queryParams.toString()}`;
        console.log('Fetching analytics with URL:', apiUrl);

        // Add cache control to prevent stale data
        const response = await fetch(apiUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch dashboard statistics (${response.status})`);
        }

        const data = await response.json();
        console.log('Fetched analytics data:', data);

        // Also fetch chat duration data
        let chatDurationData: ChatDurationData = {};
        try {
          const chatResponse = await fetch(`/api/admin/chat-duration?${queryParams.toString()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (chatResponse.ok) {
            chatDurationData = await chatResponse.json();
            console.log('Fetched chat duration data:', chatDurationData);
          }
        } catch (chatError) {
          console.error('Error fetching chat duration:', chatError);
          // Don't fail the whole process, just log the error
        }

        if (data.success) {
          // Get regular users (non-admin) data from the API response
          const regularUsers = data.stats?.users?.regular || 0;
          const activeRegularUsers = data.stats?.users?.activeRegularFiltered || 0;

          // Calculate average users per business more accurately
          const totalBusinesses = data.stats?.businesses?.total || 1; // Avoid division by zero
          const averageUsersPerBusiness = totalBusinesses > 0 ?
            Math.round(regularUsers / totalBusinesses) :
            0;

          // Calculate percentage of active users
          const activeUserPercent = regularUsers > 0 ?
            Math.round((activeRegularUsers / regularUsers) * 100) :
            0;

          // Set the percentage for use in the UI
          setAvgUsersPerBusinessPercent(activeUserPercent);

          // Get average session duration from chat data if available
          let sessionDuration = Math.max(8, Math.min(25, Math.round(regularUsers / 50))); // Default
          if (chatDurationData.success && chatDurationData.averageDurationMinutes) {
            sessionDuration = Math.round(chatDurationData.averageDurationMinutes);
          }

          // Update usage statistics with business and language breakdown
          setUsageStats(prev => ({
            ...prev,
            businessBreakdown: data.businessActiveUserStats || [],
            languageBreakdown: data.languageActiveUserStats || [],
            sessionCount: chatDurationData.totalChats || Math.round(regularUsers * 3.5), // Use actual chat count when available
            sessionDuration: sessionDuration, // Use chat duration if available
            chatStats: chatDurationData.businessChatStats || [] // Add chat stats by business
          }));

          // Update only the specific stats we want from real data
          setAnalyticsData(prev => ({
            ...prev,
            userStats: {
              ...prev.userStats,
              totalUsers: regularUsers, // Use regular users (non-admin) count
              activeUsers: activeRegularUsers, // Use the direct filtered active count
              newUsersThisMonth: data.stats?.users?.newThisPeriod || prev.userStats.newUsersThisMonth,
              averageSessionTime: `${sessionDuration} minutes` // More realistic session time from chat data
            },
            businessStats: {
              ...prev.businessStats,
              totalBusinesses: data.stats?.businesses?.total || prev.businessStats.totalBusinesses,
              activeBusinesses: data.stats?.businesses?.active || prev.businessStats.activeBusinesses,
              newBusinessesThisMonth: data.stats?.businesses?.newThisPeriod || prev.businessStats.newBusinessesThisMonth,
              averageUsersPerBusiness: averageUsersPerBusiness, // More accurate calculation
            }
          }));

          // Update content statistics if available
          if (data.stats?.content) {
            setAnalyticsData(prev => ({
              ...prev,
              contentStats: {
                ...prev.contentStats,
                totalContent: data.stats.content.total || prev.contentStats.totalContent,
                contentViews: data.stats.content.views || prev.contentStats.contentViews,
                mostPopularContentType: data.stats.content.mostPopularType || prev.contentStats.mostPopularContentType,
                averageCompletionRate: data.stats.content.averageCompletionRate || prev.contentStats.averageCompletionRate,
              }
            }));
          }

          // Update AI statistics if available
          if (data.stats?.ai) {
            setAnalyticsData(prev => ({
              ...prev,
              aiStats: {
                ...prev.aiStats,
                totalInteractions: data.stats.ai.totalInteractions || prev.aiStats.totalInteractions,
                averageResponseTime: data.stats.ai.averageResponseTime || prev.aiStats.averageResponseTime,
                satisfactionRate: data.stats.ai.satisfactionRate || prev.aiStats.satisfactionRate,
                mostCommonQueries: data.stats.ai.mostCommonQueries || prev.aiStats.mostCommonQueries,
              }
            }));
          }
        } else {
          console.warn('API returned success: false', data);
          // Keep using sample data
        }

        // Now fetch device statistics
        try {
          const deviceResponse = await fetch(`/api/admin/device-stats?${queryParams.toString()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (deviceResponse.ok) {
            const deviceData = await deviceResponse.json();

            if (deviceData.success) {
              console.log('Fetched device data:', deviceData);

              // Update device statistics with real data
              setDeviceStats({
                mobile: deviceData.percentages.mobile || 0,
                desktop: deviceData.percentages.desktop || 0,
                tablet: deviceData.percentages.tablet || 0,
                other: deviceData.percentages.other || 0
              });
            }
          }
        } catch (deviceError) {
          console.error('Error fetching device statistics:', deviceError);
          // Don't fail the whole process, just log the error
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError((err as Error).message || 'Failed to fetch dashboard statistics');
        // Show an improved error message to the user
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data if user is authenticated and not during auth loading
    if (isAuthenticated && !authLoading) {
      fetchDashboardStats();
      fetchTopQuestions(); // Add this line to fetch questions
    }
  }, [isAuthenticated, authLoading, periodType, selectedYear, selectedMonth, dateFrom, dateTo, selectedBusinesses]);

  // Add this function to fetch top questions
  // Update the fetchTopQuestions function in your analytics page
const fetchTopQuestions = async () => {
  try {
    setIsQuestionsLoading(true);
    
    // Build query params based on selected filters
    let businessesToExport = selectedBusinesses;
    let dateRange = null;
    
    if (periodType === 'range' && dateFrom && dateTo) {
      dateRange = {
        startDate: dateFrom.toISOString(),
        endDate: dateTo.toISOString()
      };
    }

    if (businessesToExport.length === 0) {
      const res = await fetch('/api/admin/businesses');
      const data = await res.json();
      businessesToExport = (data.businesses || []).map((b: any) => b.id);
    }

    const response = await fetch('/api/admin/export-chat-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        selectedBusinesses: businessesToExport,
        dateRange: dateRange
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch top questions');
    }

    // Process the questions to find the most common ones
    const questionCounts = new Map<string, { content: string, count: number, id: string, created_at: string }>();
    
    data.data.forEach((chat: any) => {
      if (chat.chat_history && Array.isArray(chat.chat_history)) {
        chat.chat_history.forEach((msg: any) => {
          if (msg.question) {  // Check for question field instead of role & content
            // Normalize the question text for better matching
            const normalizedQuestion = msg.question.trim().toLowerCase();
            
            if (questionCounts.has(normalizedQuestion)) {
              const existingQuestion = questionCounts.get(normalizedQuestion)!;
              questionCounts.set(normalizedQuestion, {
                ...existingQuestion,
                count: existingQuestion.count + 1
              });
            } else {
              questionCounts.set(normalizedQuestion, {
                content: msg.question,  // Use question field instead of content
                count: 1,
                id: msg.id,
                created_at: msg.created_at
              });
            }
          }
        });
      }
    });

    // Convert Map to array and sort by count (descending)
    const sortedQuestions = Array.from(questionCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Get top 3

    setTopQuestions(sortedQuestions);
  } catch (error) {
    console.error('Error fetching top questions:', error);
  } finally {
    setIsQuestionsLoading(false);
  }
};

  const handleExportChatHistory = async () => {
    try {
      let businessesToExport = selectedBusinesses;

      if (businessesToExport.length === 0) {
        const res = await fetch('/api/admin/businesses');
        const data = await res.json();
        businessesToExport = (data.businesses || []).map((b: any) => b.id);
      }

      const response = await fetch('/api/admin/export-chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedBusinesses: businessesToExport }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to export chat history');
      }

      const doc = new jsPDF();
      let y = 10; // start position

      data.data.forEach((chat: any, index: number) => {
        if (index > 0) {
          doc.addPage();
          y = 10; // Reset after new page
        }

        doc.setFontSize(16);
        doc.text(`Chat: ${chat.name || 'Untitled Chat'}`, 10, y);
        y += 10;
        doc.setFontSize(12);
        doc.text(`User ID: ${chat.user_id}`, 10, y);
        y += 7;
        doc.text(`Created At: ${chat.created_at}`, 10, y);
        y += 10;
        doc.setFontSize(14);
        doc.text('--- Conversation ---', 10, y);
        y += 10;

        if (chat.chat_history.length === 0) {
          doc.text('(No messages)', 10, y);
          y += 10;
        } else {
          chat.chat_history.forEach((entry: any) => {
            // Add question
            doc.setFontSize(12);
            const questionLines = doc.splitTextToSize(`Q: ${entry.question}`, 180);
            questionLines.forEach((line: string) => {
              doc.text(line, 10, y);
              y += 7;
            });

            // Add answer
            const answerLines = doc.splitTextToSize(`A: ${entry.answer}`, 180);
            answerLines.forEach((line: string) => {
              doc.text(line, 10, y);
              y += 7;
            });

            y += 5; // Gap between Q&A pairs

            // If page bottom is reached, add new page
            if (y > 270) {
              doc.addPage();
              y = 10;
            }
          });
        }
      });

      doc.save(`altacoach-chat-history-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Export Chat History PDF error:', err);
      alert('Failed to export chat history. Please try again.');
    }
  };


  // Enhance the error display with option to retry
  const handleRetry = () => {
    setError(null);
    if (isAuthenticated && !authLoading) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('/api/admin/dashboard-stats', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch dashboard statistics (${response.status})`);
          }

          const data = await response.json();

          if (data.success) {
            // Get only regular users (not admins)
            const regularUsers = data.stats?.users?.regular || 0;
            const activeRegularUsers = Math.round(regularUsers * 0.8);

            // Calculate average users per business more accurately
            const totalBusinesses = data.stats?.businesses?.total || 1;
            const averageUsersPerBusiness = totalBusinesses > 0 ?
              Math.round(regularUsers / totalBusinesses) :
              0;

            // Calculate a more reasonable session time based on user activity
            const averageSessionTime = `${Math.max(5, Math.min(25, Math.round(regularUsers / 10)))} minutes`;

            setAnalyticsData(prev => ({
              ...prev,
              userStats: {
                ...prev.userStats,
                totalUsers: regularUsers,
                activeUsers: activeRegularUsers,
                newUsersThisMonth: data.stats?.users?.newThisMonth || prev.userStats.newUsersThisMonth,
                averageSessionTime: averageSessionTime
              },
              businessStats: {
                ...prev.businessStats,
                totalBusinesses: data.stats?.businesses?.total || prev.businessStats.totalBusinesses,
                activeBusinesses: data.stats?.businesses?.active || prev.businessStats.activeBusinesses,
                newBusinessesThisMonth: data.stats?.businesses?.newThisMonth || prev.businessStats.newBusinessesThisMonth,
                averageUsersPerBusiness: averageUsersPerBusiness
              },
            }));
          }
        } catch (err) {
          console.error('Error on retry:', err);
          setError((err as Error).message || 'Failed to fetch dashboard statistics');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  };

  // Stat Card Component
  const StatCard = ({
    icon,
    title,
    value,
    isLoading = false,
    iconBackground = 'bg-blue-500'
  }: {
    icon: React.ReactNode,
    title: string,
    value: string | number,
    isLoading?: boolean,
    iconBackground?: string
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
          <div className={`${iconBackground} w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Function to handle detailed report view
  // Function to handle detailed report view
  

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false); // Close menu before logout
      await logout();
      // The auth context will handle the redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback navigation if needed
      window.location.href = '/login';
    }
  };

  // When rendering the error message, add a retry button
  const ErrorMessage = () => (
    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">Error loading dashboard data:</p>
          <p>{error}</p>
          <p className="text-sm mt-1">Note: Sample data is shown below</p>
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          {t('Retry')}
        </button>
      </div>
    </div>
  );

  // Question Card Component
  const QuestionCard = ({ question, rank }: { 
    question: { 
      content: string, 
      count: number, 
      id: string, 
      created_at: string 
    }, 
    rank: number 
  }) => {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
            rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'
          }`}>
            <span className="text-white font-bold">{rank}</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-medium line-clamp-3">
              {question.content}
            </p>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {translate('Asked')} {question.count} {translate('times')}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {t('Last')} {new Date(question.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}  // Increased size
                  height={120} // Increased size
                  className="h-12 w-auto" // Increased height
                  priority
                  quality={100}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    height: 'auto' // Explicit height
                  }}
                />
              </Link>
            </div>

            {/* Center - Title and Admin badge */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center">
                <span className="text-lg font-bold tracking-wider font-['Helvetica'] italic">
                  <span className="text-gray-900 dark:text-white tracking-[.10em]">alta</span>
                  <span className="text-[#C72026] tracking-[.10em]">c</span>
                  <span className="text-gray-900 dark:text-white tracking-[.10em]">oach</span>
                </span>
                <span className="ml-2 px-2 py-1 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-sm font-medium rounded">
                  {translate('Admin')}
                </span>
              </div>
            </div>

            {/* Right-side items - dark mode, language, profile */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language selector */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026] rounded-full p-1"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  aria-expanded={isLanguageMenuOpen}
                >
                  <span>{languageLabels[language as SupportedLanguage]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLanguageMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLanguage(code as SupportedLanguage);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`${language === code
                          ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-200'
                          } block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600`}
                        role="menuitem"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                    id="user-menu"
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center text-[#C72026] dark:text-[#C72026] font-semibold">
                      {userDisplayName}
                    </div>
                  </button>
                </div>

                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    {!isStaffUser && (
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                        {user?.email}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('SignOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <div className="bg-white dark:bg-gray-800 shadow-md w-full md:w-64 md:min-h-screen">
          <div className="p-0 border-b border-gray-200 dark:border-gray-700">
            {/* Empty div - language selector removed */}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/admin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('businesses')}
                </Link>
              </li>
              <li>
                <Link href="/admin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('altamediaContent')}
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics"
                  className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('settings')}
                </Link>
              </li>
              <li>
                <Link href="/admin/suggestion" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {translate('Suggestion')}
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
                {t('analyticsDescription')}
              </p>
            </div>

            {/* Unified Filter Dropdown */}
            <div className="relative mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('filterBy')}
              </label>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(open => !open)}
                className="w-full min-h-[44px] text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white flex items-center"
              >
                {/* Button summary */}
                <span className="truncate text-gray-400">
                  {periodType === '' && selectedBusinesses.length === 0
                    ? t('Selectfilters') // Show placeholder if nothing selected
                    : <>
                      {periodType === 'year' && `Year: ${selectedYear}`}
                      {periodType === 'month' && `Month: ${new Date(0, selectedMonth - 1).toLocaleString(language, { month: 'long' })} ${selectedYear}`}
                      {periodType === 'range' && `From: ${dateFrom ? dateFrom.toISOString().split('T')[0] : ''} To: ${dateTo ? dateTo.toISOString().split('T')[0] : ''}`}
                      {selectedBusinesses.includes('all')
                        ? `, ${t('all')}`
                        : selectedBusinesses.length > 0
                          ? `, ${selectedBusinesses.length} ${t('businesses')}`
                          : ''}
                    </>
                  }
                </span>
                <span className="ml-auto text-gray-400">&#9662;</span>
              </button>
              {isFilterDropdownOpen && (
                <>
                  {/* Backdrop for click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute left-0 z-50 mt-1 w-full max-w-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-2xl p-4 overflow-y-auto"
                    style={{ minWidth: '320px', maxHeight: '420px' }}
                  >
                    {/* Selected tags */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {/* Period Tag */}
                      {periodType === 'year' && (
                        <span className="inline-flex items-center bg-[#C72026]/10 text-[#C72026] px-2 py-1 rounded text-xs">
                          Year: {selectedYear}
                          <button
                            type="button"
                            className="ml-1 text-[#C72026] hover:text-red-700"
                            onClick={() => setPeriodType('month')}
                          >×</button>
                        </span>
                      )}
                      {periodType === 'month' && (
                        <span className="inline-flex items-center bg-[#C72026]/10 text-[#C72026] px-2 py-1 rounded text-xs">
                          Month: {new Date(0, selectedMonth - 1).toLocaleString(language, { month: 'long' })} {selectedYear}
                          <button
                            type="button"
                            className="ml-1 text-[#C72026] hover:text-red-700"
                            onClick={() => setPeriodType('year')}
                          >×</button>
                        </span>
                      )}
                      {periodType === 'range' && (
                        <span className="inline-flex items-center bg-[#C72026]/10 text-[#C72026] px-2 py-1 rounded text-xs">
                          {dateFrom ? dateFrom.toISOString().split('T')[0] : ''} - {dateTo ? dateTo.toISOString().split('T')[0] : ''}
                          <button
                            type="button"
                            className="ml-1 text-[#C72026] hover:text-red-700"
                            onClick={() => { setPeriodType('month'); setDateFrom(null); setDateTo(null); }}
                          >×</button>
                        </span>
                      )}
                      {/* Business Tags */}
                      {selectedBusinesses.includes('all') ? (
                        <span className="inline-flex items-center bg-[#C72026]/10 text-[#C72026] px-2 py-1 rounded text-xs">
                          {t('all')}
                          <button
                            type="button"
                            className="ml-1 text-[#C72026] hover:text-red-700"
                            onClick={() => setSelectedBusinesses([])}
                          >×</button>
                        </span>
                      ) : (
                        businessList
                          .filter(biz => selectedBusinesses.includes(biz.id))
                          .map(biz => (
                            <span key={biz.id} className="inline-flex items-center bg-[#C72026]/10 text-[#C72026] px-2 py-1 rounded text-xs">
                              {biz.name}
                              <button
                                type="button"
                                className="ml-1 text-[#C72026] hover:text-red-700"
                                onClick={() => setSelectedBusinesses(selectedBusinesses.filter(id => id !== biz.id))}
                              >×</button>
                            </span>
                          ))
                      )}
                    </div>
                    {/* Period Section */}
                    <div className="mb-4">
                      <div className="font-semibold mb-2">{t('timeRange')}</div>
                      <label className="flex items-center mb-1">
                        <input
                          type="radio"
                          name="periodType"
                          value="year"
                          checked={periodType === 'year'}
                          onChange={() => setPeriodType('year')}
                          className="mr-2"
                        />
                        {t('Year')}
                      </label>
                      {periodType === 'year' && (
                        <input
                          type="number"
                          min="2000"
                          max={new Date().getFullYear()}
                          value={selectedYear}
                          onChange={e => setSelectedYear(Number(e.target.value))}
                          className="block w-full mt-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      )}
                      <label className="flex items-center mb-1">
                        <input
                          type="radio"
                          name="periodType"
                          value="month"
                          checked={periodType === 'month'}
                          onChange={() => setPeriodType('month')}
                          className="mr-2"
                        />
                        {t('Month')}
                      </label>
                      {periodType === 'month' && (
                        <div className="flex gap-2 mt-1">
                          <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="block w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString(language, { month: 'long' })}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="2000"
                            max={new Date().getFullYear()}
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="block w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                      )}
                      <label className="flex items-center mb-1">
                        <input
                          type="radio"
                          name="periodType"
                          value="range"
                          checked={periodType === 'range'}
                          onChange={() => setPeriodType('range')}
                          className="mr-2"
                        />
                        From / To
                      </label>
                      {periodType === 'range' && (
                        <div className="flex gap-2 mt-1">
                          <input
                            type="date"
                            value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                            onChange={e => setDateFrom(e.target.value ? new Date(e.target.value) : null)}
                            className="block w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                          />
                          <input
                            type="date"
                            value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
                            min={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                            onChange={e => setDateTo(e.target.value ? new Date(e.target.value) : null)}
                            className="block w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                      )}
                    </div>
                    {/* Business Section */}
                    <div>
                      <div className="font-semibold mb-2">{t('businesses')}</div>
                      <label className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          checked={selectedBusinesses.includes('all')}
                          onChange={() => {
                            if (selectedBusinesses.includes('all')) {
                              setSelectedBusinesses([]);
                            } else {
                              setSelectedBusinesses(['all']);
                            }
                          }}
                          className="mr-2"
                        />
                        {t('all')}
                      </label>
                      <div className="max-h-32 overflow-y-auto">
                        {businessList.map(biz => (
                          <label key={biz.id} className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              checked={selectedBusinesses.includes(biz.id)}
                              onChange={() => {
                                if (selectedBusinesses.includes('all')) {
                                  setSelectedBusinesses([biz.id]);
                                } else if (selectedBusinesses.includes(biz.id)) {
                                  setSelectedBusinesses(selectedBusinesses.filter(id => id !== biz.id));
                                } else {
                                  setSelectedBusinesses([...selectedBusinesses, biz.id]);
                                }
                              }}
                              className="mr-2"
                            />
                            {biz.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      className="mt-4 w-full bg-[#C72026] text-white py-1 rounded"
                      onClick={() => setIsFilterDropdownOpen(false)}
                    >
                      {t('Ok')}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && <ErrorMessage />}

            {/* User Statistics */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('userStatistics')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('totalUsers')}
                  value={analyticsData.userStats.totalUsers}
                  isLoading={isLoading}
                  iconBackground="bg-[#C72026]"
                />
                <StatCard
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('activeUsers')}
                  value={analyticsData.userStats.activeUsers}
                  isLoading={isLoading}
                  iconBackground="bg-green-500"
                />
                <StatCard
                  icon={<span className="text-white font-bold text-lg">%</span>}
                  title={t('activeUserPercentage')}
                  value={`${avgUsersPerBusinessPercent}%`}
                  isLoading={isLoading}
                  iconBackground="bg-blue-500"
                />
                <StatCard
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  title={t('averageSessionTime')}
                  value={analyticsData.userStats.averageSessionTime}
                  iconBackground="bg-amber-500"
                />
              </div>
            </section>

            {/* NEW USAGE SECTION */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('usage')}
              </h2>

              {/* Active Users Definition */}

              {/* Usage Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('percentageActiveUsers')}
                  </h3>
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        ```html
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1            0 -31.831"
                          fill="none"
                          stroke="#eee"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#C72026"
                          strokeWidth="3"
                          strokeDasharray={`${avgUsersPerBusinessPercent}, 100`}
                        />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          {avgUsersPerBusinessPercent}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {translate('Active')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('numberOfSessions')}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 012 2z"></path>
                      </svg>
                    </div>
                    <div>
                      {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                          {usageStats.sessionCount.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {periodType === 'month' ? t('ThisMonth') :
                          periodType === 'year' ? t('ThisYear') :
                          periodType === 'range' ? t('SelectedPeriod') :
                          t('CurrentPeriod')}
                      </p>

                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('sessionDuration')}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                          {usageStats.sessionDuration} <span className="text-xl">{t('min')}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('AverageDuration')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Business & By Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('byBusiness')}
                  </h3>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ) : usageStats.businessBreakdown.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      <ul className="space-y-3">
                        {usageStats.businessBreakdown.slice(0, 5).map((biz) => (
                          <li key={biz.id} className="flex items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {biz.name}
                              </p>
                            </div>
                            <div className="ml-2 w-24 flex items-center">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${biz.percent}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                {biz.percent}%
                              </span>
                            </div>
                          </li>
                        ))}
                        {usageStats.businessBreakdown.length > 5 && (
                          <li className="text-sm text-center text-gray-500 dark:text-gray-400">
                            +{usageStats.businessBreakdown.length - 5} more businesses
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                      {t('NoLanguageDataAvailableForTheSelectedPeriod.')}
                    </p>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('byLanguage')}
                  </h3>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  ) : usageStats.languageBreakdown.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      <ul className="space-y-3">
                        {usageStats.languageBreakdown.map((lang) => (
                          <li key={lang.language} className="flex items-center">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {lang.language}
                              </p>
                            </div>
                            <div className="ml-2 w-24 flex items-center">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${lang.percent}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                {lang.percent}%
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-6">
                      {t('NoLanguageDataAvailableForTheSelectedPeriod.')}
                    </p>
                  )}
                </div>
              </div>
            </section>
            {/* Device Breakdown */}
            <section>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('device')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 012 2z"></path>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('mobile')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {deviceStats.mobile}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('desktop')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {deviceStats.desktop}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 012 2z"></path>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('tablet')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {deviceStats.tablet}%
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 012 2z"></path>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t('other')}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {deviceStats.other}%
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Chat Statistics Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('ChatInteractionStatistics')}
              </h2>

              {/* Description */}

              {/* Chat Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('TotalChatSessions')}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                    </div>
                    <div>
                      {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                          {(usageStats.chatStats ?? []).reduce((sum, stat) => sum + stat.totalChats, 0).toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('ChatConversations')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('AverageSessionTime')}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                          {usageStats.sessionDuration} <span className="text-xl">min</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('PerChatSession')}
                      </p>
                    </div>
                  </div>
                </div>


                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('ActiveChatUsers')}
                  </h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                    </div>
                    <div>
                      {isLoading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ) : (
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                          {usageStats.chatStats?.reduce((sum, stat) => sum + stat.usersCount, 0) || 0}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('UniqueUsers')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Stats By Business */}
              {usageStats.chatStats && usageStats.chatStats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('ChatActivitybyBusiness')}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate('Business')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate('Users')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate('Chats')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {translate('Messages')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('AvgDuration')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {usageStats.chatStats.map((stat, index) => (
                          <tr key={stat.businessId} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                              {stat.businessName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {stat.usersCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {stat.totalChats}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {stat.totalMessages}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {Math.round(stat.averageDurationMinutes)} {t('min')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* Top Questions Section */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('Top3MostAskedQuestions')}
              </h2>
                        
              {isQuestionsLoading ? (
                <div className="grid grid-cols-1 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
                      <div className="flex items-start">
                        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 mr-4"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                          <div className="mt-2 flex justify-between">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : topQuestions.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {topQuestions.map((question, index) => (
                    <QuestionCard 
                      key={question.id} 
                      question={question} 
                      rank={index + 1} 
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('Noquestiondataavailablefortheselectedperiod')}
                  </p>
                </div>
              )}
            </section>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4 mb-8">
              <button
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={handleViewDetailedReport}
              >
                {t('viewDetailedReport')}
              </button>
              <button
                className="px-4 py-2 bg-[#C72026] text-white rounded hover:bg-[#a51a1f] transition-colors"
                onClick={handleExportData}
              >
                {t('exportData')}
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                onClick={handleExportChatHistory}
              >
                {t('ExportChatHistory')}
              </button>

            </div>

            {/* Last Updated */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {t('lastUpdated')}: {currentTime}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
