'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
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
    dashboard: 'Dashboard',
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
    byBusiness: 'By Business',
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
    byBusiness: 'Par Entreprise',
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
    desktop: 'Desktop',
    tablet: 'Tablet',
    other: 'Andere'
  },
  it: {
    adminDashboard: 'Dashboard Admin',
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
  es: {
    adminDashboard: 'Panel de Administrador',
    dashboard: 'Panel',
    businesses: 'Empresas',
    content: 'Contenido',
    userAccounts: 'Cuentas de Usuario',
    settings: 'Configuración',
    analytics: 'Analíticas',
    prompts: 'Indicaciones',
    notifications: 'Notificaciones',
    analyticsOverview: 'Resumen de Analíticas',
    userStatistics: 'Estadísticas de Usuarios',
    businessStatistics: 'Estadísticas de Empresas',
    contentStatistics: 'Estadísticas de Contenido',
    aiStatistics: 'Estadísticas de Interacción con IA',
    totalUsers: 'Total de Usuarios',
    activeUsers: 'Usuarios Activos',
    newUsersThisMonth: 'Nuevos Usuarios Este Mes',
    averageSessionTime: 'Tiempo Promedio de Sesión',
    totalBusinesses: 'Total de Empresas',
    activeBusinesses: 'Empresas Activas',
    newBusinessesThisMonth: 'Nuevas Empresas Este Mes',
    averageUsersPerBusiness: 'Promedio de Usuarios por Empresa',
    totalContent: 'Total de Contenido',
    contentViews: 'Vistas de Contenido',
    mostPopularContentType: 'Tipo de Contenido Más Popular',
    averageCompletionRate: 'Tasa Promedio de Finalización',
    totalInteractions: 'Total de Interacciones',
    averageResponseTime: 'Tiempo Promedio de Respuesta',
    satisfactionRate: 'Tasa de Satisfacción',
    mostCommonQueries: 'Consultas Más Comunes',
    selectLanguage: 'Seleccionar Idioma',
    analyticsDescription: 'Métricas de rendimiento e información de la plataforma',
    viewDetailedReport: 'Ver Informe Detallado',
    exportData: 'Exportar Datos',
    lastUpdated: 'Última Actualización',
    today: 'Hoy',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    thisYear: 'Este Año',
    timeRange: 'Rango de Tiempo',
    filterBy: 'Filtrar Por',
    all: 'Todos',
    usage: 'Uso',
    activeUsersDefinition: 'Usuarios Activos (Definición de Actividad)',
    percentageActiveUsers: 'Porcentaje de Usuarios Activos',
    byBusiness: 'Por Empresa',
    byLanguage: 'Por Idioma',
    numberOfSessions: 'Número de Sesiones',
    sessionDuration: 'Duración de Sesión',
    device: 'Dispositivo',
    mobile: 'Móvil',
    desktop: 'Escritorio',
    tablet: 'Tableta',
    other: 'Otro'
  }
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
  const handleExportData = () => {
    try {
      // Format date for filename
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      const filename = `altacoach-analytics-${formattedDate}.csv`;
      
      // Create CSV content
      let csvContent = 'Category,Metric,Value\n';
      
      // Add user statistics
      csvContent += `User Statistics,Total Users,${analyticsData.userStats.totalUsers}\n`;
      csvContent += `User Statistics,Active Users,${analyticsData.userStats.activeUsers}\n`;
      csvContent += `User Statistics,New Users This Month,${analyticsData.userStats.newUsersThisMonth}\n`;
      csvContent += `User Statistics,Average Session Time,${analyticsData.userStats.averageSessionTime}\n`;
      
      // Add business statistics
      csvContent += `Business Statistics,Total Businesses,${analyticsData.businessStats.totalBusinesses}\n`;
      csvContent += `Business Statistics,Active Businesses,${analyticsData.businessStats.activeBusinesses}\n`;
      csvContent += `Business Statistics,New Businesses This Month,${analyticsData.businessStats.newBusinessesThisMonth}\n`;
      csvContent += `Business Statistics,Average Users Per Business,${analyticsData.businessStats.averageUsersPerBusiness}\n`;
      
      // Add content statistics
      csvContent += `Content Statistics,Total Content,${analyticsData.contentStats.totalContent}\n`;
      csvContent += `Content Statistics,Content Views,${analyticsData.contentStats.contentViews}\n`;
      csvContent += `Content Statistics,Most Popular Content Type,${analyticsData.contentStats.mostPopularContentType}\n`;
      csvContent += `Content Statistics,Average Completion Rate,${analyticsData.contentStats.averageCompletionRate}\n`;
      
      // Add AI statistics
      csvContent += `AI Interaction Statistics,Total Interactions,${analyticsData.aiStats.totalInteractions}\n`;
      csvContent += `AI Interaction Statistics,Average Response Time,${analyticsData.aiStats.averageResponseTime}\n`;
      csvContent += `AI Interaction Statistics,Satisfaction Rate,${analyticsData.aiStats.satisfactionRate}\n`;
      csvContent += `AI Interaction Statistics,Most Common Queries,${analyticsData.aiStats.mostCommonQueries}\n`;
      
      // Add export metadata
      csvContent += `\nExport Date,${date.toLocaleString()}\n`;
      csvContent += `Time Range,${t(timeRange)}\n`;

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
    }
  }, [isAuthenticated, authLoading, periodType, selectedYear, selectedMonth, dateFrom, dateTo, selectedBusinesses]);

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
              contentStats: {
                ...prev.contentStats,
                totalContent: data.stats?.content?.total || prev.contentStats.totalContent
              }
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
  const handleViewDetailedReport = () => {
    try {
      // Create a more beautiful HTML representation of the data
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="${language}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AltaCoach Analytics - Detailed Report</title>
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
            }
          </style>
        </head>
        <body>
          <header>
            <div class="container">
              <div class="header-content">
                <div class="logo">
                  <h1>
                    <span>alta</span>
                    <span class="red">c</span>
                    <span>oach</span>
                    <span class="admin-badge">Admin</span>
                  </h1>
                </div>
                <button onclick="window.close()" class="back-button">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </header>
          
          <div class="container">
            <div class="report-header">
              <h1>AltaCoach Analytics - Detailed Report</h1>
              <p>A comprehensive view of platform performance metrics and insights.</p>
            </div>
            
            <section>
              <h2>User Statistics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th class="value-column">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Users</td>
                    <td class="value-column">${analyticsData.userStats.totalUsers}</td>
                  </tr>
                  <tr>
                    <td>Active Users</td>
                    <td className="value-column">${analyticsData.userStats.activeUsers}</td>
                  </tr>
                  <tr>
                    <td>New Users This Month</td>
                    <td class="value-column">${analyticsData.userStats.newUsersThisMonth}</td>
                  </tr>
                  <tr>
                    <td>Average Session Time</td>
                    <td class="value-column">${analyticsData.userStats.averageSessionTime}</td>
                  </tr>
                </tbody>
              </table>
            </section>
            
            <section>
              <h2>Business Statistics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th class="value-column">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Businesses</td>
                    <td class="value-column">${analyticsData.businessStats.totalBusinesses}</td>
                  </tr>
                  <tr>
                    <td>Active Businesses</td>
                    <td class="value-column">${analyticsData.businessStats.activeBusinesses}</td>
                  </tr>
                  <tr>
                    <td>New Businesses This Month</td>
                    <td class="value-column">${analyticsData.businessStats.newBusinessesThisMonth}</td>
                  </tr>
                  <tr>
                    <td>Average Users Per Business</td>
                    <td class="value-column">${analyticsData.businessStats.averageUsersPerBusiness}</td>
                  </tr>
                </tbody>
              </table>
            </section>
            
            <section>
              <h2>Content Statistics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th class="value-column">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Content</td>
                    <td class="value-column">${analyticsData.contentStats.totalContent}</td>
                  </tr>
                  <tr>
                    <td>Content Views</td>
                    <td class="value-column">${analyticsData.contentStats.contentViews}</td>
                  </tr>
                  <tr>
                    <td>Most Popular Content Type</td>
                    <td class="value-column">${analyticsData.contentStats.mostPopularContentType}</td>
                  </tr>
                  <tr>
                    <td>Average Completion Rate</td>
                    <td class="value-column">${analyticsData.contentStats.averageCompletionRate}</td>
                  </tr>
                </tbody>
              </table>
            </section>
            
            <section>
              <h2>AI Interaction Statistics</h2>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th class="value-column">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Interactions</td>
                    <td class="value-column">${analyticsData.aiStats.totalInteractions}</td>
                  </tr>
                  <tr>
                    <td>Average Response Time</td>
                    <td class="value-column">${analyticsData.aiStats.averageResponseTime}</td>
                  </tr>
                  <tr>
                    <td>Satisfaction Rate</td>
                    <td class="value-column">${analyticsData.aiStats.satisfactionRate}</td>
                  </tr>
                  <tr>
                    <td>Most Common Queries</td>
                    <td class="value-column">${analyticsData.aiStats.mostCommonQueries}</td>
                  </tr>
                </tbody>
              </table>
            </section>


            {/* Last Updated */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {t('lastUpdated')}: {currentTime}
            </div>

            <div class="meta-info">
                <div>
                  <p>Report generated on ${new Date().toLocaleString()}</p>
                  <p>Time Range: ${t(timeRange)}</p>
                </div>
                <div>
                  <button onclick="window.print()" class="print-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                  </button>
                </div>
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
          Retry
        </button>
      </div>
    </div>
  );

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
                  Admin
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
                        className={`${
                          language === code
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
                      Sign out
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
                  {t('altamedia Content')}
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
                    ? t('Select filters...') // Show placeholder if nothing selected
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
                        Year
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
                        Month
                      </label>
                      {periodType === 'month' && (
                        <div className="flex gap-2 mt-1">
                          <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="block w-28 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString(language, { month: 'long' })}</option>
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
                      OK
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
              <div className="mb-6 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('activeUsersDefinition')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  A user is considered active if they have logged in at least once in the selected time period and have performed at least one meaningful interaction (such as viewing content or participating in a chat).
                </p>
              </div>
              
              {/* Usage Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {t('percentageActiveUsers')}
                  </h3>
                  <div className="flex justify-center">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 36 36" className="w-full h-full">
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
                          Active
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 012 2z"></path>
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
                        {periodType === 'month' ? 'This Month' : 
                          periodType === 'year' ? 'This Year' : 
                            periodType === 'range' ? 'Selected Period' : 'Current Period'}
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
                          {usageStats.sessionDuration} <span className="text-xl">min</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Average Duration
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
                      No business data available for the selected period.
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
                      No language data available for the selected period.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Device Breakdown */}
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
                Chat Interaction Statistics
              </h2>
              
              {/* Description */}
              <div className="mb-6 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  Chat statistics show how users are engaging with the platform through conversations. Session duration is calculated based on chat activity timing.
                </p>
              </div>
              
              {/* Chat Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Total Chat Sessions
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
                          {usageStats.chatStats && usageStats.chatStats.reduce((sum, stat) => sum + stat.totalChats, 0) || 0}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chat Conversations
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Average Session Time
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
                        Per Chat Session
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Active Chat Users
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
                        Unique Users
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Stats By Business */}
              {usageStats.chatStats && usageStats.chatStats.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Chat Activity by Business
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Users
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Chats
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Messages
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Avg Duration
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
                              {Math.round(stat.averageDurationMinutes)} min
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
            </div>

            {/* Last Updated */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {t('lastUpdated')}: {currentTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}