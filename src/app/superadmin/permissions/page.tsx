'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAuthProtection, UserRole } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import PermissionModal from '@/components/PermissionModal'; // Correct 
import Image from 'next/image';

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
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Business Admin',
    lastActive: '2023-08-15',
    status: 'active',
    joinDate: '2023-01-10'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'User',
    lastActive: '2023-08-14',
    status: 'active',
    joinDate: '2023-02-22'
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    role: 'Business Admin',
    lastActive: '2023-08-10',
    status: 'active',
    joinDate: '2023-03-15'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    role: 'User',
    lastActive: '2023-07-30',
    status: 'suspended',
    joinDate: '2023-04-05'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.w@example.com',
    role: 'System Admin',
    lastActive: '2023-08-15',
    status: 'active',
    joinDate: '2022-11-18'
  }
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
    searchUsers: 'Search admins...',
    managePermissions: 'Manage Permissions',
    allAdmins: 'All Admins',
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
    searchUsers: 'Rechercher des administrateurs...',
    managePermissions: 'Gérer les Permissions',
    allAdmins: 'Tous les Administrateurs',
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
    searchUsers: 'Administratoren suchen...',
    managePermissions: 'Berechtigungen verwalten',
    allAdmins: 'Alle Administratoren',
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
    searchUsers: 'Cerca amministratori...',
    managePermissions: 'Gestisci Permessi',
    allAdmins: 'Tutti gli Amministratori',
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
    searchUsers: 'Buscar administradores...',
    managePermissions: 'Gestionar Permisos',
    allAdmins: 'Todos los Administradores',
  }
};

function getRoleDisplay(role: string): string {
  if (role.toUpperCase() === 'ADMIN') return 'Admin';
  if (role.toUpperCase() === 'BUSINESS') return 'Business Admin';
  return role; // Default fallback
}

export default function AdminUsers() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  
  // Define all state hooks at the top of the component
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Protect this page - only allow admin users
  const { isLoading: authLoading, isAuthenticated, user } = useAuthProtection([UserRole.SUPER_ADMIN]);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/apisuper/user');  // Updated endpoint
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
        <div className="w-12 h-12 border-4 border-[#C72026] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated or not an admin, the useAuthProtection hook will redirect to login
  // This is just an extra check
  if (!isAuthenticated || user?.role !== 'super_admin') {
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
    // Check if user has a role that should be included (case insensitive)
    const isAdminUser = 
      user.role.toUpperCase() === 'ADMIN' || 
      user.role.toUpperCase() === 'BUSINESS' ||
      user.role.includes('Admin'); // This will match "Business Admin", "System Admin", etc.
    
    // Additional role filter if specific admin type is selected
    const matchesRoleFilter = 
      roleFilter === 'all' || 
      (roleFilter === 'businessAdmin' && (user.role.toUpperCase() === 'BUSINESS' || user.role.includes('Business Admin'))) ||
      (roleFilter === 'systemAdmin' && (user.role.toUpperCase() === 'ADMIN' || user.role.includes('System Admin')));
    
    // Search term filter
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // User must be admin AND match the role filter AND match search term
    return isAdminUser && matchesRoleFilter && matchesSearch;
  });

  const handleOpenPermissionModal = (user: User) => {
    setSelectedUser(user);
    setIsPermissionModalOpen(true);
  };

  const handleClosePermissionModal = () => {
    setIsPermissionModalOpen(false);
    setSelectedUser(null);
  };

  const handleLogout = async () => {
    try {
      setIsProfileOpen(false); // Close the dropdown immediately
      
      // Step 1: Disable any auto-redirect in your app by setting a flag in session storage
      sessionStorage.setItem('manual_logout', 'true');
      
      // Step 2: First clear client-side storage immediately
      localStorage.clear();
      sessionStorage.clear();
      
      // Step 3: Clear all cookies 
      document.cookie.split(";").forEach((c) => {
        const cookieName = c.trim().split("=")[0];
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // Step 4: Use both endpoints simultaneously to ensure logout happens
      // try {
      //   // Try the super admin logout
      //   await fetch('/apisuper/auth/logout', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     credentials: 'include',
      //   });
      // } catch (e) {
      //   console.warn("Super admin logout failed, continuing...");
      // }
      
      try {
        // Also try the regular logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
      } catch (e) {
        console.warn("Regular logout failed, continuing...");
      }

      // Step 5: Force redirect with a random parameter to prevent caching
      const timestamp = new Date().getTime();
      window.location.replace(`/login?t=${timestamp}`);
    } catch (error) {
      console.error('Error during logout:', error);
      // If all else fails, force hard redirect to login
      window.location.replace('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}
                  height={120}
                  className="h-10 w-auto"
                  priority
                  quality={100}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </Link>
            </div>

            {/* Center - Title and Admin badge */}
            <div className="flex-1 flex justify-center">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold tracking-wider font-['Helvetica'] italic">
                  <span className="text-gray-900 dark:text-white tracking-[.15em]">alta</span>
                  <span className="text-[#C72026] tracking-[.15em]">c</span>
                  <span className="text-gray-900 dark:text-white tracking-[.15em]">oach</span>
                </span>
                <span className="px-3 py-1.5 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-sm font-medium rounded-md">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-6">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
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
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C72026]"
                >
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 bg-[#C72026]/10 dark:bg-[#C72026]/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-[#C72026] dark:text-[#C72026]">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-50 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                      {user?.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {translate('signOut')}
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
            {/* Language selector removed */}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/superadmin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              {/* <li>
                <Link href="/superadmin/businesses" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('businesses')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('altamedia Content')}
                </Link>
              </li> */}
              <li>
                <Link href="/superadmin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {'Admin Accounts'}
                </Link>
              </li>
              {/* <li>
                <Link href="/superadmin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('analytics')}
                </Link>
              </li> */}
              <li>
                <Link href="/superadmin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('settings')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/permissions" 
                  className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                  {t('Permissions')}
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

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('userManagement')}
                </h2>
              </div>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-12 h-12 border-4 border-[#C72026] border-t-transparent rounded-full animate-spin"></div>
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
                        {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('lastActive')}
                        </th> */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-[#C72026]/5 dark:hover:bg-[#C72026]/10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center">
                                <span className="text-lg font-semibold text-[#C72026] dark:text-[#C72026]">
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
                                ? 'bg-[#C72026]/10 text-[#C72026] dark:bg-[#C72026]/20 dark:text-[#C72026]' 
                                : user.role === 'BUSINESS'
                                ? 'bg-[#C72026]/10 text-[#C72026] dark:bg-[#C72026]/20 dark:text-[#C72026]'
                                : 'bg-[#C72026]/10 text-[#C72026] dark:bg-[#C72026]/20 dark:text-[#C72026]'
                            }`}>
                              {getRoleDisplay(user.role)}
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
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.lastActive}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex space-x-2">
                              {/* <button className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
                                {t('view')}
                              </button>
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                {t('edit')}
                              </button>
                              {user.status === 'active' ? (
                                <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                                  {t('suspend')}
                                </button>
                              ) : (
                                <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                                  {t('activate')}
                                </button> */}
                              {/* )} */}
                              <button 
                                className="text-[#C72026] dark:text-[#C72026] hover:text-[#C72026]/80 dark:hover:text-[#C72026]/80"
                                onClick={() => handleOpenPermissionModal(user)}
                              >
                                {t('managePermissions')}
                              </button>
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

      {isPermissionModalOpen && selectedUser && (
        <PermissionModal 
          onClose={() => {
            setIsPermissionModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
}