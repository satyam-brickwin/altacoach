'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AddUserModal from '@/components/AddUserModal';
import EditUserModal from '@/components/EditUserModal';
import ViewUserModal from '@/components/ViewUserModal';

// Define user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive?: string;
  status: string;
  joinDate?: string;
  createdAt?: Date;
}

// Sample user data - will be replaced with database data
const sampleUserData = [
  // {
  //   id: '1',
  //   name: 'John Smith',
  //   email: 'john.smith@example.com',
  //   role: 'Business Admin',
  //   lastActive: '2023-08-15',
  //   status: 'active',
  //   joinDate: '2023-01-10'
  // },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'User',
    lastActive: '2023-08-14',
    status: 'active',
    joinDate: '2023-02-22'
  },
  // {
  //   id: '3',
  //   name: 'Michael Brown',
  //   email: 'michael.b@example.com',
  //   role: 'Business Admin',
  //   lastActive: '2023-08-10',
  //   status: 'active',
  //   joinDate: '2023-03-15'
  // },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    role: 'User',
    lastActive: '2023-07-30',
    status: 'suspended',
    joinDate: '2023-04-05'
  },
  // {
  //   id: '5',
  //   name: 'Robert Wilson',
  //   email: 'robert.w@example.com',
  //   role: 'System Admin',
  //   lastActive: '2023-08-15',
  //   status: 'active',
  //   joinDate: '2022-11-18'
  // }
];

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
    userManagement: 'User Management',
    activeUsers: 'Active Users',
    suspendedUsers: 'Suspended Users',
    pendingUsers: 'Pending Users',
    userStatistics: 'User Statistics',
    totalUsers: 'Total Users',
    businessAdmins: 'Business Admins',
    systemAdmins: 'System Admins',
    regularUsers: 'Regular Users',
    recentRegistrations: 'Recent Registrations',
    selectLanguage: 'Select Language',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    status: 'Status',
    lastActive: 'Last Active',
    joinDate: 'Join Date',
    actions: 'Actions',
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
    view: 'View',
    edit: 'Edit',
    suspend: 'Suspend',
    delete: 'Delete',
    activate: 'Activate',
    userManagementDesc: 'Manage user accounts and permissions',
    addNewUser: 'Add New User',
    filterByRole: 'Filter by Role:',
    allUsers: 'All Users',
    businessAdmin: 'Business Admin',
    systemAdmin: 'System Admin',
    user: 'User',
    search: 'Search',
    searchUsers: 'Search users...',
    showingRegularUsers: 'Showing Regular Users'
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
    userManagement: 'Gestion des Utilisateurs',
    activeUsers: 'Utilisateurs Actifs',
    suspendedUsers: 'Utilisateurs Suspendus',
    pendingUsers: 'Utilisateurs en Attente',
    userStatistics: 'Statistiques Utilisateurs',
    totalUsers: 'Total Utilisateurs',
    businessAdmins: 'Admins Entreprise',
    systemAdmins: 'Admins Système',
    regularUsers: 'Utilisateurs Réguliers',
    recentRegistrations: 'Inscriptions Récentes',
    selectLanguage: 'Sélectionner la Langue',
    name: 'Nom',
    email: 'Email',
    role: 'Rôle',
    status: 'Statut',
    lastActive: 'Dernière Activité',
    joinDate: "Date d'Inscription",
    actions: 'Actions',
    active: 'Actif',
    pending: 'En Attente',
    suspended: 'Suspendu',
    view: 'Voir',
    edit: 'Modifier',
    suspend: 'Suspendre',
    delete: 'Supprimer',
    activate: 'Activer',
    userManagementDesc: 'Gérer les comptes utilisateurs et les permissions',
    addNewUser: 'Ajouter Nouvel Utilisateur',
    filterByRole: 'Filtrer par Rôle:',
    allUsers: 'Tous les Utilisateurs',
    businessAdmin: 'Admin Entreprise',
    systemAdmin: 'Admin Système',
    user: 'Utilisateur',
    search: 'Rechercher',
    searchUsers: 'Rechercher des utilisateurs...',
    showingRegularUsers: 'Affichage des utilisateurs réguliers'
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
    userManagement: 'Benutzerverwaltung',
    activeUsers: 'Aktive Benutzer',
    suspendedUsers: 'Gesperrte Benutzer',
    pendingUsers: 'Ausstehende Benutzer',
    userStatistics: 'Benutzerstatistiken',
    totalUsers: 'Gesamtbenutzer',
    businessAdmins: 'Unternehmensadministratoren',
    systemAdmins: 'Systemadministratoren',
    regularUsers: 'Reguläre Benutzer',
    recentRegistrations: 'Neueste Registrierungen',
    selectLanguage: 'Sprache auswählen',
    name: 'Name',
    email: 'E-Mail',
    role: 'Rolle',
    status: 'Status',
    lastActive: 'Zuletzt Aktiv',
    joinDate: 'Beitrittsdatum',
    actions: 'Aktionen',
    active: 'Aktiv',
    pending: 'Ausstehend',
    suspended: 'Gesperrt',
    view: 'Ansehen',
    edit: 'Bearbeiten',
    suspend: 'Sperren',
    delete: 'Löschen',
    activate: 'Aktivieren',
    userManagementDesc: 'Benutzerkonten und Berechtigungen verwalten',
    addNewUser: 'Neuen Benutzer hinzufügen',
    filterByRole: 'Nach Rolle filtern:',
    allUsers: 'Alle Benutzer',
    businessAdmin: 'Unternehmensadministrator',
    systemAdmin: 'Systemadministrator',
    user: 'Benutzer',
    search: 'Suchen',
    searchUsers: 'Benutzer suchen...',
    showingRegularUsers: 'Reguläre Benutzer anzeigen'
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
    userManagement: 'Gestione Utenti',
    activeUsers: 'Utenti Attivi',
    suspendedUsers: 'Utenti Sospesi',
    pendingUsers: 'Utenti in Attesa',
    userStatistics: 'Statistiche Utenti',
    totalUsers: 'Totale Utenti',
    businessAdmins: 'Admin Aziendali',
    systemAdmins: 'Admin di Sistema',
    regularUsers: 'Utenti Regolari',
    recentRegistrations: 'Registrazioni Recenti',
    selectLanguage: 'Seleziona Lingua',
    name: 'Nome',
    email: 'Email',
    role: 'Ruolo',
    status: 'Stato',
    lastActive: 'Ultima Attività',
    joinDate: 'Data di Iscrizione',
    actions: 'Azioni',
    active: 'Attivo',
    pending: 'In Attesa',
    suspended: 'Sospeso',
    view: 'Visualizza',
    edit: 'Modifica',
    suspend: 'Sospendi',
    delete: 'Elimina',
    activate: 'Attiva',
    userManagementDesc: 'Gestisci account utenti e permessi',
    addNewUser: 'Aggiungi Nuovo Utente',
    filterByRole: 'Filtra per Ruolo:',
    allUsers: 'Tutti gli Utenti',
    businessAdmin: 'Admin Aziendale',
    systemAdmin: 'Admin di Sistema',
    user: 'Utente',
    search: 'Cerca',
    searchUsers: 'Cerca utenti...',
    showingRegularUsers: 'Mostrando utenti regolari'
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
    userManagement: 'Gestión de Usuarios',
    activeUsers: 'Usuarios Activos',
    suspendedUsers: 'Usuarios Suspendidos',
    pendingUsers: 'Usuarios Pendientes',
    userStatistics: 'Estadísticas de Usuarios',
    totalUsers: 'Total de Usuarios',
    businessAdmins: 'Administradores de Empresa',
    systemAdmins: 'Administradores de Sistema',
    regularUsers: 'Usuarios Regulares',
    recentRegistrations: 'Registros Recientes',
    selectLanguage: 'Seleccionar Idioma',
    name: 'Nombre',
    email: 'Correo Electrónico',
    role: 'Rol',
    status: 'Estado',
    lastActive: 'Última Actividad',
    joinDate: 'Fecha de Registro',
    actions: 'Acciones',
    active: 'Activo',
    pending: 'Pendiente',
    suspended: 'Suspendido',
    view: 'Ver',
    edit: 'Editar',
    suspend: 'Suspender',
    delete: 'Eliminar',
    activate: 'Activar',
    userManagementDesc: 'Gestionar cuentas de usuario y permisos',
    addNewUser: 'Añadir Nuevo Usuario',
    filterByRole: 'Filtrar por Rol:',
    allUsers: 'Todos los Usuarios',
    businessAdmin: 'Administrador de Empresa',
    systemAdmin: 'Administrador de Sistema',
    user: 'Usuario',
    search: 'Buscar',
    searchUsers: 'Buscar usuarios...',
    showingRegularUsers: 'Mostrando usuarios regulares'
  }
};

export default function AdminUsers() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const router = useRouter();
  
  // Define all state hooks at the top of the component
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading, isAuthenticated, user } = useAuthProtection([UserRole.ADMIN]);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      
      // Format the user data
      const formattedUsers = data.users.map((user: any) => ({
        id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        lastActive: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
        status: user.status.toLowerCase(),
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
      }));
      
      setUsers(formattedUsers);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError((err as Error).message);
      setIsLoading(false);
      // Fall back to sample data if fetch fails
      setUsers(sampleUserData);
    }
  };

  useEffect(() => {
    // Only fetch users if authenticated
    if (isAuthenticated && !authLoading) {
      fetchUsers();
    }
  }, [isAuthenticated, authLoading]);
  
  // If still loading, show loading spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated or not an admin, the useAuthProtection hook will redirect to login
  // This is just an extra check
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Custom translate function that provides a fallback
  const t = (key: string) => {
    // First check admin translations
    let translation = adminTranslations[language] ? 
      (adminTranslations[language] as Record<string, string>)[key] : undefined;
    
    // If not found in admin translations, try global translations
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

  // Filter users based on role and search term
  const filteredUsers = users.filter(user => {
    // Only include regular users (USER role)
    const isRegularUser = user.role === 'USER';
    
    // Apply search filtering
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Only return true if it's a regular user AND matches the search
    return isRegularUser && matchesSearch;
  });

  const handleViewUser = (user: User) => {
    setViewUser(user);
    setIsViewUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setIsEditUserModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">AltaCoach</span>
              <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium rounded">
                Admin
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
              <li>
                <Link href="/admin/users" className="block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium">
                  {t('userAccounts')}
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
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
                {t('userAccounts')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('userManagementDesc')}
              </p>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('showingRegularUsers')} {/* Add this translation key */}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('userManagement')}
                </h2>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('addNewUser')}
                </button>
              </div>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500">{error}</p>
                  <p className="text-gray-500 mt-2">Showing sample data instead</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No users found matching your criteria</p>
                </div>
              ) : (
                /* Users Table */
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('name')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('email')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('role')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('status')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('lastActive')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {t('joinDate')}: {user.joinDate}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                : user.role === 'BUSINESS'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {user.role === 'ADMIN' ? 'System Admin' : 
                               user.role === 'BUSINESS' ? 'Business Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                                : user.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                            }`}>
                              {t(user.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.lastActive}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewUser(user)}
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                                {t('view')}
                              </button>
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                {t('edit')}
                              </button>
                              {user.status === 'active' ? (
                                <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                                  {t('suspend')}
                                </button>
                              ) : (
                                <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                                  {t('activate')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={fetchUsers}
        translate={t}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => setIsViewUserModalOpen(false)}
        user={viewUser}
        translate={t}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        user={editUser}
        translate={t}
        onSuccess={fetchUsers}
      />
    </div>
  );
}