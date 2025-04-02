'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

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
    all: 'All'
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
    all: 'Tous'
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
    all: 'Alle'
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
    all: 'Tutti'
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
    all: 'Todos'
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
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading, isAuthenticated, user: authUser } = useAuthProtection([UserRole.ADMIN]);

  // Define all state hooks at the top of the component
  const [timeRange, setTimeRange] = useState('thisMonth');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userDisplayName = user?.name?.[0] || 'A';
  const isStaffUser = user?.role === UserRole.ADMIN;

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
        const response = await fetch('/api/admin/dashboard-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Update only the specific stats we want from real data
          setAnalyticsData(prev => ({
            ...prev,
            userStats: {
              ...prev.userStats,
              totalUsers: data.stats.users.total,
              activeUsers: data.stats.users.active,
              newUsersThisMonth: data.stats.users.newThisMonth
            },
            businessStats: {
              ...prev.businessStats,
              totalBusinesses: data.stats.businesses.total,
              activeBusinesses: data.stats.businesses.active,
              newBusinessesThisMonth: data.stats.businesses.newThisMonth
            },
            contentStats: {
              ...prev.contentStats,
              totalContent: data.stats.content.total
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError((err as Error).message);
        // Keep the sample data in case of error
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && !authLoading) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, authLoading]);

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
              --primary: #6b46c1;
              --primary-light: #9f7aea;
              --primary-dark: #553c9a;
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
              color: var(--primary);
              font-size: 1.8rem;
              margin: 0;
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
              background-color: var(--gray-100);
              padding: 1rem;
              border-radius: 0.375rem;
              margin-top: 2rem;
              display: flex;
              justify-content: space-between;
              color: var(--gray-500);
              font-size: 0.875rem;
              align-items: center;
            }
            
            .value-column {
              font-weight: 500;
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
                  <h1>AltaCoach</h1>
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
                    <td class="value-column">${analyticsData.userStats.activeUsers}</td>
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">altacoach</span>
                <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded">
                  Admin
                </span>
              </Link>
            </div>

            {/* Right-side items - dark mode, language, profile */}
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language selector */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  aria-expanded={isLanguageMenuOpen}
                >
                  <span>{languageLabels[language as SupportedLanguage]}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
                    className="max-w-xs bg-white dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="user-menu"
                    aria-expanded={isUserMenuOpen}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
                  {t('content')}
                </Link>
              </li>
              {/* <li>
                <Link href="/admin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('userAccounts')}
                </Link>
              </li> */}
              <li>
                <Link href="/admin/analytics" className="block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
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
                {t('analyticsDescription')}
              </p>
            </div>

            {/* Time Range Filter */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('timeRange')}:
                </span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
                >
                  <option value="today">{t('today')}</option>
                  <option value="thisWeek">{t('thisWeek')}</option>
                  <option value="thisMonth">{t('thisMonth')}</option>
                  <option value="thisYear">{t('thisYear')}</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleViewDetailedReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('viewDetailedReport')}
                </button>
                <button 
                  onClick={handleExportData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('exportData')}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-bold">Error loading dashboard data:</p>
                <p>{error}</p>
              </div>
            )}

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
                  iconBackground="bg-blue-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('activeUsers')}
                  value={analyticsData.userStats.activeUsers}
                  isLoading={isLoading}
                  iconBackground="bg-green-500"
                />
                <StatCard 
                  icon={<div className="bg-purple-600 text-white text-xs font-bold rounded px-1 absolute top-0 right-0">NEW</div>}
                  title={t('newUsersThisMonth')}
                  value={analyticsData.userStats.newUsersThisMonth}
                  isLoading={isLoading}
                  iconBackground="bg-purple-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  title={t('averageSessionTime')}
                  value={analyticsData.userStats.averageSessionTime}
                  iconBackground="bg-amber-500"
                />
              </div>
            </section>

            {/* Business Statistics */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('businessStatistics')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>}
                  title={t('totalBusinesses')}
                  value={analyticsData.businessStats.totalBusinesses}
                  isLoading={isLoading}
                  iconBackground="bg-blue-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  title={t('activeBusinesses')}
                  value={analyticsData.businessStats.activeBusinesses}
                  isLoading={isLoading}
                  iconBackground="bg-green-500"
                />
                <StatCard 
                  icon={<div className="bg-purple-600 text-white text-xs font-bold rounded px-1 absolute top-0 right-0">NEW</div>}
                  title={t('newBusinessesThisMonth')}
                  value={analyticsData.businessStats.newBusinessesThisMonth}
                  isLoading={isLoading}
                  iconBackground="bg-purple-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('averageUsersPerBusiness')}
                  value={analyticsData.businessStats.averageUsersPerBusiness}
                  iconBackground="bg-blue-500"
                />
              </div>
            </section>

            {/* Content Statistics */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('contentStatistics')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('totalContent')}
                  value={analyticsData.contentStats.totalContent}
                  isLoading={isLoading}
                  iconBackground="bg-pink-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                  title={t('contentViews')}
                  value={analyticsData.contentStats.contentViews}
                  isLoading={isLoading}
                  iconBackground="bg-teal-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('mostPopularContentType')}
                  value={analyticsData.contentStats.mostPopularContentType}
                  isLoading={isLoading}
                  iconBackground="bg-orange-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('averageCompletionRate')}
                  value={analyticsData.contentStats.averageCompletionRate}
                  isLoading={isLoading}
                  iconBackground="bg-green-500"
                />
              </div>
            </section>

            {/* AI Statistics */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {t('aiStatistics')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('totalInteractions')}
                  value={analyticsData.aiStats.totalInteractions}
                  isLoading={isLoading}
                  iconBackground="bg-purple-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('averageResponseTime')}
                  value={analyticsData.aiStats.averageResponseTime}
                  isLoading={isLoading}
                  iconBackground="bg-yellow-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('satisfactionRate')}
                  value={analyticsData.aiStats.satisfactionRate}
                  isLoading={isLoading}
                  iconBackground="bg-green-500"
                />
                <StatCard 
                  icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                  title={t('mostCommonQueries')}
                  value={analyticsData.aiStats.mostCommonQueries}
                  isLoading={isLoading}
                  iconBackground="bg-blue-500"
                />
              </div>
            </section>

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