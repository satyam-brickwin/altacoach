'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // Make sure you have this context
import AddUserModal from '@/components/AddUserModal';
import ViewUserModal from '@/components/ViewUserModal';
import EditUserModal from '@/components/EditUserModal';
import UploadDocumentModal from '@/components/UploadDocumentModal';
import UserDataActions from '@/components/UserDataActions';
import ViewDocumentModal from '@/components/ViewDocumentModal';
import { convertToCSV, downloadCSV } from '@/utils/exportHelpers';
import { useToast } from '@/contexts/ToastContext'; // Add this import

// Add this helper function near the top of the file with other utility functions
const isDuplicateUser = (newUser: NewUser, existingUsers: User[], currentBusinessId: string): boolean => {
  return existingUsers
    .filter(user => user.businessId === currentBusinessId) // Only check users in the current business
    .some(existing => 
      existing.email.toLowerCase() === newUser.email.toLowerCase() ||
      existing.name.toLowerCase() === newUser.name.toLowerCase()
    );
};

// Update the Business interface
interface Business {
  id: string;
  name: string;
  status: string;
  startDate?: string; // Changed from joinedDate
  endDate?: string;   // New field
  createdAt?: Date;   // Added
  modifiedAt?: Date;  // Added
  color?: string;     // New field
  
  // Optional plan field for backward compatibility
  plan?: string;
  
  // Keep joinedDate temporarily for backward compatibility
  joinedDate?: string;
  
  // Update the type of createdBy to match what the API returns
  createdBy?: { id: string; name: string; email: string } | string;
  
  // UI-only fields
  userCount?: number;
  logo?: string;
  colorTheme?: string;
  isActive?: boolean;
}

// Define Document type for better type safety
interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created: string;
  source: string;
  url?: string; // Add this field for document URL
}

// Add this interface definition at the top of the file with other interfaces
interface BusinessDocument {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  created: string;
  source: string;
  category: string; // Add category field for training materials
  url?: string;
  content?: string;
}

// Define User type for better type safety
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  businessId: string; // Add this field
  createdBy?: string;
  lastActive?: string;
  joinDate?: string;
  language?: string; // Add this field for user language preference
}

// Update the NewUser interface to include role
interface NewUser {
  name: string;
  email: string;
  status: string;
  language?: string;
  role?: string;  // Make it optional in the interface
}

// Update the EditUserModalProps interface in your code
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: (updatedUser: User) => void;  // Changed from () => void to accept the user parameter
  translate: (key: string) => string;
}

// Dummy data for documents and users
const dummyDocuments: BusinessDocument[] = [
  // Business Documents (Training Materials)
  {
    id: '1',
    title: 'AI-Powered Learning Guide',
    description: 'Complete guide to using altacoach AI-powered learning features',
    type: 'PDF',
    status: 'active',
    created: '2024-01-15',
    source: 'business',
    category: 'training',
    url: '/docs/ai-powered-learning-guide.pdf'
  },
  {
    id: '2',
    title: 'Post-Training Support Framework',
    description: 'Framework for implementing continuous learning support',
    type: 'PPTX',
    status: 'active',
    created: '2024-02-01',
    source: 'business',
    category: 'training',
    url: '/docs/post-training-support.pptx'
  },
  {
    id: '3',
    title: 'Knowledge Retention Strategies',
    description: 'Best practices for improving training retention rates',
    type: 'PDF',
    status: 'active',
    created: '2024-03-01',
    source: 'business',
    category: 'training',
    url: '/docs/retention-strategies.pdf'
  },
  {
    id: '4',
    title: 'Real-Time Coaching Manual',
    description: 'Guide to implementing real-time coaching features',
    type: 'DOCX',
    status: 'active',
    created: '2024-01-20',
    source: 'business',
    category: 'training',
    url: '/docs/coaching-manual.docx'
  },
  {
    id: '5',
    title: 'Analytics & Reporting Guide',
    description: 'How to use altacoach analytics for measuring training impact',
    type: 'PDF',
    status: 'active',
    created: '2024-02-15',
    source: 'business',
    category: 'analytics',
    url: '/docs/analytics-guide.pdf'
  },

  // Admin Documents
  {
    id: '6',
    title: 'Platform Implementation Guide',
    description: 'Technical guide for implementing altacoach',
    type: 'PDF',
    status: 'active',
    created: '2024-02-15',
    source: 'admin',
    category: 'technical',
    url: '/docs/implementation-guide.pdf'
  },
  {
    id: '7',
    title: 'Content Integration Manual',
    description: 'Guide for integrating training content with altacoach',
    type: 'DOCX',
    status: 'active',
    created: '2024-02-10',
    source: 'admin',
    category: 'technical',
    url: '/docs/content-integration.docx'
  },
  {
    id: '8',
    title: 'User Management Policy',
    description: 'Policies for managing user accounts and permissions',
    type: 'PDF',
    status: 'active',
    created: '2024-01-25',
    source: 'admin',
    category: 'policy',
    url: '/docs/user-management.pdf'
  },
  {
    id: '9',
    title: 'Performance Metrics Guide',
    description: 'Guide to tracking and analyzing learning performance',
    type: 'XLSX',
    status: 'active',
    created: '2024-03-01',
    source: 'admin',
    category: 'analytics',
    url: '/docs/performance-metrics.xlsx'
  },
  {
    id: '10',
    title: 'Training ROI Calculator',
    description: 'Spreadsheet for calculating training return on investment',
    type: 'XLSX',
    status: 'active',
    created: '2024-02-20',
    source: 'admin',
    category: 'analytics',
    url: '/docs/roi-calculator.xlsx'
  }
];

const dummyUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastActive: '2024-03-15',
    joinDate: '2023-06-01',
    language: 'en',
    businessId: '1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    lastActive: '2024-03-14',
    joinDate: '2023-07-15',
    language: 'fr',
    businessId: '1'
  }
];

// Update the handleDownloadSampleTemplate function
const handleDownloadSampleTemplate = () => {
  // Define fields and mark required ones with asterisks
  const headers = [
    'name*',          // Required
    'email*',         // Required
    'language*',      // Required
    'status'          // Optional
  ];
  
  // Create a simple HTML table that Excel can open
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>User Import Template</title>
        <style>
          table {border-collapse: collapse; width: 100%;}
          th {background-color: #f2f2f2; font-weight: bold; text-align: left; padding: 8px; border: 1px solid #ddd;}
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Empty row for users to fill in -->
            <tr>
              ${headers.map(() => '<td></td>').join('')}
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  // Create a Blob with the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'user_import_template.xls');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Define translations for the admin dashboard
const adminTranslations = {
  en: {
    dashboard: 'Dashboard',
    businesses: 'Businesses',
    businessManagement: 'Manage businesses and their details',
    addNewBusiness: 'Add New Business',
    filterByStatus: 'Filter by Status:',
    allBusinesses: 'All Businesses',
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
    searchBusinesses: 'Search businesses...',
    loading: 'Loading...',
    noBusinessesFound: 'No businesses found',
    name: 'Name',
    userCount: 'Users',
    status: 'Status',
    StartDate: 'Start Date',
    createdBy: 'Created By',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    approve: 'Approve',
    suspend: 'Suspend',
    deactivate: 'Deactivate',
    activate: 'Activate',
    submitting: 'Submitting...',
    add: 'Add',
    cancel: 'Cancel',
    error: 'An error occurred. Please try again.',
    EndDate: 'End Date',
    backToBusinesses: 'Back to Businesses',
    allDocuments: 'All Documents',
    userAccounts: 'User Accounts',
    businessDocuments: 'Business Documents',
    adminDocuments: 'Admin Documents',
    searchUsers: 'Search users...',
    searchDocuments: 'Search documents...',
    addUser: 'Add User',
    uploadDocument: 'Upload Document',
    downloadSampleTemplate: 'Download sample template',
    duplicateUsersFound: 'Duplicate users found:',
    successfullyImportedUsers: 'Successfully imported {count} users',
    failedToImportUsers: 'Failed to import users. Please try again.',
    userName: 'Name',
    userEmail: 'Email',
    userLanguage: 'Language',
    userStatus: 'Status',
    userCreatedBy: 'Created By',
    userActions: 'Actions',
    editUser: 'Edit',
    deactivateUser: 'Deactivate',
    activateUser: 'Activate',
    documentTitle: 'Title',
    documentType: 'Type',
    documentSource: 'Source',
    documentCreated: 'Created',
    documentActions: 'Actions',
    viewDocument: 'View',
    downloadDocument: 'Download',
    selectDocumentsFirst: 'Please select documents first',
    downloadingDocuments: 'Downloading {count} documents',
    failedToDownloadDocument: 'Error downloading document. Please try again.',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    businesses: 'Entreprises',
    businessManagement: 'Gérer les entreprises et leurs détails',
    addNewBusiness: 'Ajouter une Nouvelle Entreprise',
    filterByStatus: 'Filtrer par Statut:',
    allBusinesses: 'Toutes les Entreprises',
    active: 'Actif',
    pending: 'En Attente',
    suspended: 'Suspendu',
    searchBusinesses: 'Rechercher des entreprises...',
    loading: 'Chargement...',
    noBusinessesFound: 'Aucune entreprise trouvée',
    name: 'Nom',
    userCount: 'Utilisateurs',
    status: 'Statut',
    StartDate: 'Date de Début',
    createdBy: 'Créé Par',
    actions: 'Actions',
    view: 'Voir',
    edit: 'Modifier',
    approve: 'Approuver',
    suspend: 'Suspendre',
    deactivate: 'Désactiver',
    activate: 'Activer',
    submitting: 'Envoi...',
    add: 'Ajouter',
    cancel: 'Annuler',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    EndDate: 'Date de Fin',
    backToBusinesses: 'Retour aux entreprises',
    allDocuments: 'Tous les documents',
    userAccounts: 'Comptes utilisateurs',
    businessDocuments: 'Documents d\'entreprise',
    adminDocuments: 'Documents administratifs',
    searchUsers: 'Rechercher des utilisateurs...',
    searchDocuments: 'Rechercher des documents...',
    addUser: 'Ajouter un utilisateur',
    uploadDocument: 'Télécharger un document',
    downloadSampleTemplate: 'Télécharger un modèle d\'exemple',
    duplicateUsersFound: 'Utilisateurs en double trouvés :',
    successfullyImportedUsers: '{count} utilisateurs importés avec succès',
    failedToImportUsers: 'Échec de l\'importation des utilisateurs. Veuillez réessayer.',
    userName: 'Nom',
    userEmail: 'Email',
    userLanguage: 'Langue',
    userStatus: 'Statut',
    userCreatedBy: 'Créé par',
    userActions: 'Actions',
    editUser: 'Modifier',
    deactivateUser: 'Désactiver',
    activateUser: 'Activer',
    documentTitle: 'Titre',
    documentType: 'Type',
    documentSource: 'Source',
    documentCreated: 'Créé',
    documentActions: 'Actions',
    viewDocument: 'Voir',
    downloadDocument: 'Télécharger',
    selectDocumentsFirst: 'Veuillez d\'abord sélectionner des documents',
    downloadingDocuments: 'Téléchargement de {count} documents',
    failedToDownloadDocument: 'Erreur lors du téléchargement du document. Veuillez réessayer.',
  },
  de: {
    dashboard: 'Dashboard',
    businesses: 'Unternehmen',
    businessManagement: 'Unternehmen und ihre Details verwalten',
    addNewBusiness: 'Neues Unternehmen hinzufügen',
    filterByStatus: 'Nach Status filtern:',
    allBusinesses: 'Alle Unternehmen',
    active: 'Aktiv',
    pending: 'Ausstehend',
    suspended: 'Gesperrt',
    searchBusinesses: 'Unternehmen suchen...',
    loading: 'Laden...',
    noBusinessesFound: 'Keine Unternehmen gefunden',
    name: 'Name',
    userCount: 'Benutzer',
    status: 'Status',
    StartDate: 'Startdatum',
    createdBy: 'Erstellt Von',
    actions: 'Aktionen',
    view: 'Ansehen',
    edit: 'Bearbeiten',
    approve: 'Genehmigen',
    suspend: 'Sperren',
    deactivate: 'Deaktivieren',
    activate: 'Aktivieren',
    submitting: 'Einreichen...',
    add: 'Hinzufügen',
    cancel: 'Abbrechen',
    error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    EndDate: 'Enddatum',
  },
  it: {
    dashboard: 'Dashboard',
    businesses: 'Aziende',
    businessManagement: 'Gestisci aziende e i loro dettagli',
    addNewBusiness: 'Aggiungi Nuova Azienda',
    filterByStatus: 'Filtra per Stato:',
    allBusinesses: 'Tutte le Aziende',
    active: 'Attivo',
    pending: 'In Attesa',
    suspended: 'Sospeso',
    searchBusinesses: 'Cerca aziende...',
    loading: 'Caricamento...',
    noBusinessesFound: 'Nessuna azienda trovata',
    name: 'Nome',
    userCount: 'Utenti',
    status: 'Stato',
    StartDate: 'Data di Inizio',
    createdBy: 'Creato Da',
    actions: 'Azioni',
    view: 'Visualizza',
    edit: 'Modifica',
    approve: 'Approva',
    suspend: 'Sospendi',
    deactivate: 'Disattiva',
    activate: 'Attiva',
    submitting: 'Inviando...',
    add: 'Aggiungi',
    cancel: 'Annulla',
    error: 'Si è verificato un errore. Per favore riprova.',
    EndDate: 'Data di Fine',
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
    businessOverview: 'Resumen de Empresas',
    activeBusinesses: 'Empresas Activas',
    pendingBusinesses: 'Empresas Pendientes',
    suspendedBusinesses: 'Empresas Suspendidas',
    contentManagement: 'Gestión de Contenido',
    contentItems: 'Elementos de Contenido',
    exercises: 'Ejercicios',
    faqs: 'Preguntas Frecuentes',
    viewAll: 'Ver Todo',
    manage: 'Gestionar',
    approve: 'Aprobar',
    suspend: 'Suspender',
    delete: 'Eliminar',
    userStatistics: 'Estadísticas de Usuarios',
    totalBusinesses: 'Total de Empresas',
    totalContent: 'Total de Contenido',
    totalUsers: 'Total de Usuarios',
    activeUsers: 'Usuarios Activos',
    adminUsers: 'Usuarios Administradores',
    courses: 'Cursos',
    guides: 'Guías',
    recentRegistrations: 'Registros Recientes',
    selectLanguage: 'Seleccionar Idioma',
    name: 'Nombre',
    plan: 'Plan',
    userCount: 'Usuarios',
    status: 'Estado',
    joined: 'Unido',
    actions: 'Acciones',
    active: 'Activo',
    pending: 'Pendiente',
    suspended: 'Suspendido',
    view: 'Ver',
    edit: 'Editar',
    logo: 'Logo',
    colorTheme: 'Tema de Color',
    isActive: 'Estado Activo',
    activate: 'Activar',
    deactivate: 'Desactivar',
    uploadLogo: 'Subir Logo',
    selectColorTheme: 'Seleccionar Tema de Color',
    saveChanges: 'Guardar Cambios',
    businessUpdatedSuccessfully: 'Empresa actualizada exitosamente!',
    errorUpdatingBusiness: 'Error al actualizar la empresa. Por favor, inténtelo más tarde.',
    businessManagement: 'Gestión de Empresas',
    addNewBusiness: 'Añadir Nueva Empresa',
    filterByStatus: 'Filtrar por Estado:',
    allBusinesses: 'Todas las Empresas',
    search: 'Buscar',
    searchBusinesses: 'Buscar empresas...',
    businessAddedSuccessfully: 'Empresa agregada exitosamente!',
    errorAddingBusiness: 'Error al agregar la empresa. Por favor, inténtelo más tarde.',
    businessName: 'Nombre de la Empresa',
    email: 'Correo Electrónico',
    phoneNumber: 'Número de Teléfono',
    address: 'Dirección',
    submitting: 'Enviando...',
    add: 'Agregar',
    cancel: 'Cancelar',
    loading: 'Cargando...',
    refresh: 'Actualizar',
    noBusinessesFound: 'No se encontraron empresas',
    createdBy: 'Creado Por',
  }
};

// Update BusinessFormData interface
interface BusinessFormData {
  name: string;
  status: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logo?: string;
  colorTheme?: string;
  isActive: boolean;
  createdBy?: string;
  startDate: string; // Changed from joinedDate
  endDate: string;
  color?: string;
  plan?: string; // Made optional
}

const validateImportedUser = (user: NewUser): boolean => {
  if (!user.name || !user.email) {
    return false;
  }
  // Add additional validation as needed
  return true;
};

const processImportedUsers = (users: NewUser[]): NewUser[] => {
  return users
    .filter(validateImportedUser)
    .map(user => ({
      ...user,
      status: user.status || 'active',
      language: user.language || 'en',
      role: user.role || 'User'
    }));
};

export default function AdminBusinesses() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const { user, logout } = useAuth(); // Get user and signOut from auth context
  const { showToast } = useToast(); // Add this hook

  // Move the state declarations inside the component
  const [selectedBusinessView, setSelectedBusinessView] = useState<Business | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  // Move businessData here, after user is available
  const businessData = [
    {
      id: '1',
      name: 'Acme Corporation',
      plan: 'Enterprise',
      userCount: 45,
      status: 'active',
      joinedDate: '2023-05-15',
      logo: '',
      colorTheme: '#C72026',
      isActive: true,
      createdBy: user?.name || 'Admin' // Set current admin's name
    },
    {
      id: '2',
      name: 'Globex Industries',
      plan: 'Business',
      userCount: 28,
      status: 'active',
      joinedDate: '2023-06-22',
      logo: '',
      colorTheme: '#10B981',
      isActive: true,
      createdBy: 'Sarah Johnson'
    },
    {
      id: '3',
      name: 'Stark Enterprises',
      plan: 'Enterprise',
      userCount: 120,
      status: 'active',
      joinedDate: '2023-04-10',
      logo: '',
      colorTheme: '#F59E0B',
      isActive: true,
      createdBy: 'Michael Chen'
    },
    {
      id: '4',
      name: 'Wayne Industries',
      plan: 'Business',
      userCount: 35,
      status: 'pending',
      joinedDate: '2023-08-05',
      logo: '',
      colorTheme: '#3B82F6',
      isActive: false,
      createdBy: 'Emily Wilson'
    },
    {
      id: '5',
      name: 'Umbrella Corp',
      plan: 'Starter',
      userCount: 12,
      status: 'suspended',
      joinedDate: '2023-07-18',
      logo: '',
      colorTheme: '#EC4899',
      isActive: false,
      createdBy: 'Carlos Rodriguez'
    }
  ];

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for businesses data
  const [businesses, setBusinesses] = useState<Business[]>(businessData);

  // State for filtering and search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // State for add business modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    plan: 'Business',
    status: 'pending',
    email: '',
    phoneNumber: '',
    address: '',
    logo: '',
    colorTheme: '#C72026',
    isActive: true,
    createdBy: user?.name || ' Admin', // Set current admin's name
    startDate: '', // Default value
    endDate: '' // Default value
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for edit business modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [editFormData, setEditFormData] = useState<BusinessFormData>({
    name: '',
    plan: 'Business',
    status: 'pending',
    email: '',
    phoneNumber: '',
    address: '',
    logo: '',
    colorTheme: '#C72026',
    isActive: true,
    createdBy: 'Current Admin', // Set default or get from user context
    startDate: '', // Default value
    endDate: '' // Default value
  });
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // State for view business modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // State for language and user menu
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userDisplayName = user?.name?.[0] || 'A'; // Updated userDisplayName logic
  const isStaffUser = true; // Replace with actual user role check
  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false); // Close the menu first
      await logout(); // Call signOut from auth context
      window.location.href = '/login'; // Use direct navigation for full page reload
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback navigation if needed
      window.location.href = '/login';
    }
  };

  const loadUsersForBusiness = useCallback(async (businessId: string) => {
    try {
      console.log(`Fetching users for business: ${businessId}`);
      const response = await fetch(`/api/admin/users?businessId=${businessId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`Found ${data.users.length} users for business ${businessId}`);
        
        // Update users array
        setUsers(data.users);
        
        // Update usersMap
        setUsersMap(prev => ({
          ...prev,
          [businessId]: data.users
        }));
        
        return data.users;
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error(`Error loading users for business ${businessId}:`, error);
      return [];
    }
  }, []);

  const handleAddUserSuccess = async (newUser: any) => {
    if (!newUser?.name || !selectedBusinessView) return;

    try {
      // Ensure business ID is included in the payload
      // Add the missing 'role' property to satisfy the type constraint
      const userPayload = {
        ...newUser,
        businessId: selectedBusinessView.id,
        language: newUser.language || 'en',
        status: newUser.status || 'ACTIVE',
        role: newUser.role || 'USER' // Add the role property if it's missing
      };

      console.log('Submitting user to API:', userPayload);

      // Make API call to create user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from API:', errorData);
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create user');
      }

      console.log('User created successfully:', data.user);

      // Update local users state immediately
      const newUserWithAllFields = {
        ...data.user,
        joinDate: data.user.joinDate || new Date().toISOString().split('T')[0],
        lastActive: data.user.lastActive || new Date().toISOString().split('T')[0],
      };
      
      // Update the users state
      setUsers(prevUsers => [newUserWithAllFields, ...prevUsers]);
      
      // Update the usersMap
      setUsersMap(prev => ({
        ...prev,
        [selectedBusinessView.id]: [newUserWithAllFields, ...(prev[selectedBusinessView.id] || [])]
      }));
      
      // Update the business user count
      setBusinesses(prevBusinesses =>
        prevBusinesses.map(business =>
          business.id === selectedBusinessView.id
            ? { ...business, userCount: (business.userCount || 0) + 1 }
            : business
        )
      );
      
      // Update the selected business view
      setSelectedBusinessView(prev => 
        prev ? { ...prev, userCount: (prev.userCount || 0) + 1 } : null
      );

      // Close modal and show success message
      setIsAddUserModalOpen(false);
      showToast(`User ${data.user.name} created successfully`, 'success');
      
    } catch (error) {
      console.error('Error creating user:', error);
      showToast(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleAddUser = () => {
    if (!selectedBusinessView) {
      showToast('Please select a business first', 'warning');
      return;
    }
    setIsAddUserModalOpen(true);
  };

  const handleBusinessClick = async (business: Business) => {
    setSelectedBusinessView(business); // Use the correct state setter
    setViewMode('detail');
    
    // Load users for this business
    const users = await loadUsersForBusiness(business.id);
    
    // Update the userCount on the selected business
    setSelectedBusinessView(prev => 
      prev ? { ...prev, userCount: users.length } : null
    );
    
    // Update the userCount in the businesses list
    setBusinesses(prevBusinesses => 
      prevBusinesses.map(b => 
        b.id === business.id 
          ? { ...b, userCount: users.length } 
          : b
      )
    );
  };

  const handleBackToList = () => {
    setSelectedBusinessView(null);
    setViewMode('list');
  };

  // State for user modals
  const [activeFilter, setActiveFilter] = useState('all');
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Add this state to track user status changes
  const [users, setUsers] = useState<User[]>([]);

  // Add this near your other state declarations
  const [usersMap, setUsersMap] = useState<Record<string, User[]>>({});

  const handleUploadDocument = () => {
    setIsUploadDocumentModalOpen(true);
  }; // Add the closing semicolon here

  // Update the handleToggleUserStatus function with proper typing

  const handleToggleUserStatus = async (user: User) => {
    try {
      // Normalize status case for comparison - make status check case-insensitive
      const isCurrentlyActive = user.status?.toUpperCase() === 'ACTIVE';
      const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';
      
      console.log(`Toggling status for user ${user.name} (${user.id}) from ${user.status} to ${newStatus}`);
      
      // Optimistically update UI
      setUsers((prevUsers: User[]) => 
        prevUsers.map(u =>
          u.id === user.id
            ? { ...u, status: newStatus }
            : u
        )
      );

      // Make API call to update status
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add this line to include auth cookies
        body: JSON.stringify({ status: newStatus }),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update user status');
      }

      console.log('User status updated successfully:', data);
      
      // Show success toast notification
      showToast(`User ${user.name} ${newStatus.toLowerCase() === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      
    } catch (error) {
      console.error('Error updating user status:', error);
      
      // Revert the UI update on error
      if (user && user.id) {
        setUsers((prevUsers: User[]) => 
          prevUsers.map(u =>
            u.id === user.id
              ? { ...u, status: user.status }
              : u
          )
        );
      }
      
      // Refresh the users list in case of error
      if (selectedBusinessView?.id) {
        loadUsersForBusiness(selectedBusinessView.id);
      }
      
      // Show error notification
      showToast(`Failed to update user status: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Update the fetchBusinesses function:

  const fetchBusinesses = async () => {
    setIsLoading(true);
    setError('');

    try {
      // First fetch businesses
      const response = await fetch('/api/admin/businesses');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      // Get user counts for each business
      const userCountPromises = data.businesses.map(async (business: Business) => {
        try {
          // Fetch users for this specific business
          const usersResponse = await fetch(`/api/admin/users?businessId=${business.id}`);
          const usersData = await usersResponse.json();
          
          if (usersData.success) {
            // Update the business with the correct user count
            business.userCount = usersData.users.length;
            
            // Also update the usersMap
            setUsersMap(prev => ({
              ...prev,
              [business.id]: usersData.users
            }));
          }
          
          return business;
        } catch (error) {
          console.error(`Failed to fetch users for business ${business.id}:`, error);
          return business; // Return the business without updated userCount
        }
      });

      // Wait for all user count queries to complete
      const businessesWithCounts = await Promise.all(userCountPromises);
      
      setBusinesses(businessesWithCounts);
      
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError(typeof error === 'string' ? error : 'Failed to fetch businesses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch businesses when component mounts
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Initialize users in useEffect
  useEffect(() => {
    setUsers(dummyUsers);
  }, []);

  // Update the fetch users function
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      // Group users by business ID
      const usersByBusiness = data.users.reduce((acc: Record<string, User[]>, user: User) => {
        if (!acc[user.businessId]) {
          acc[user.businessId] = [];
        }
        acc[user.businessId].push(user);
        return acc;
      }, {});

      setUsersMap(usersByBusiness);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Update useEffect to fetch users
  // useEffect(() => {
  //   if (selectedBusinessView) {
  //     fetchUsers(selectedBusinessView.id);
  //   }
  // }, [selectedBusinessView]);

  useEffect(() => {
    fetchUsers();
  }, []); // Only fetch once when component mounts

  // Add near other state declarations
  const refreshUsers = useCallback(async () => {
    try {
      // Fetch latest users data
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      // Update users state
      setUsers(data.users);
      
      // Update usersMap
      const updatedUsersMap = data.users.reduce((acc: Record<string, User[]>, user: User) => {
        if (!acc[user.businessId]) {
          acc[user.businessId] = [];
        }
        acc[user.businessId].push(user);
        return acc;
      }, {});
      
      setUsersMap(updatedUsersMap);
      
      // Force re-render by updating search term
      setUserSearchTerm(prev => prev);
      
      showToast('User list updated successfully', 'success');
    } catch (error) {
      console.error('Error refreshing users:', error);
      showToast('Failed to refresh user list', 'error');
    }
  }, [showToast]);

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // Translation helper
  const t = (key: string) => {
    const translations = adminTranslations[language as keyof typeof adminTranslations] || adminTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };

  // Filter businesses based on status and search term
  const filteredBusinesses = businesses.filter(business => {
    // Make status comparison case-insensitive
    const businessStatus = business.status ? business.status.toLowerCase() : '';
    const filterStatus = statusFilter === 'all' ? '' : statusFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || businessStatus === filterStatus;
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Modal functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // View modal functions
  const openViewModal = (business: Business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => {
    setSelectedBusiness(null);
    setIsViewModalOpen(false);
  };

  // Edit modal functions
  const openEditModal = (business: Business) => {
    setSelectedBusiness(business);
    setEditFormData({
      name: business.name,
      status: business.status,
      email: '', // In a real app, you would fetch these from the API
      phoneNumber: '',
      address: '',
      logo: business.logo || '',
      colorTheme: business.colorTheme || business.color || '#C72026',
      isActive: business.isActive || business.status?.toLowerCase() === 'active',
      startDate: business.startDate ? new Date(business.startDate).toISOString().split('T')[0] : 
                (business.joinedDate ? business.joinedDate.split('T')[0] : ''),
      endDate: business.endDate ? new Date(business.endDate).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedBusiness(null);
    setIsEditModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for isActive
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server and get a URL back
      // For demo purposes, we'll create a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Include all necessary fields including startDate and endDate
      const businessData = {
        name: formData.name,
        plan: formData.plan || 'BUSINESS',
        status: formData.status || 'PENDING',
        createdBy: user?.name || 'Admin',
        // Format dates properly for the API
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        // Add color if available
        color: formData.color || '#C72026'
      };

      const response = await fetch('/api/admin/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create business');
      }

      // Enhance the returned business with UI-only properties
      const newBusiness = {
        ...data.business,
        userCount: 0,
        logo: '',
        colorTheme: businessData.color,
        isActive: data.business.status === 'ACTIVE',
        // Make sure these dates are properly included in the UI state
        startDate: businessData.startDate,
        endDate: businessData.endDate
      };

      // Update the UI with the new business
      setBusinesses(prevBusinesses => [newBusiness, ...prevBusinesses]);

      // Close modal and reset form
      closeModal();
      setFormData({
        name: '',
        plan: 'Business',
        status: 'pending',
        email: '',
        phoneNumber: '',
        address: '',
        logo: '',
        colorTheme: '#C72026',
        isActive: true,
        createdBy: user?.name || 'Admin',
        startDate: '',
        endDate: ''
      });

      // Show success message
      showToast('Business created successfully', 'success');

    } catch (error) {
      console.error('Error creating business:', error);
      setError(typeof error === 'string' ? error : 'Failed to create business');
      showToast('Failed to create business', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace the handleEditSubmit function with this updated version:

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditSubmitting || !selectedBusiness) return;

    setIsEditSubmitting(true);
    setError('');

    try {
      // Prepare the data to send to the API
      const businessData = {
        name: editFormData.name,
        status: editFormData.status,
        color: editFormData.color || editFormData.colorTheme,
        startDate: editFormData.startDate ? new Date(editFormData.startDate).toISOString() : null,
        endDate: editFormData.endDate ? new Date(editFormData.endDate).toISOString() : null,
        isActive: editFormData.isActive,
      };

      // Make the API call to update the business
      const response = await fetch(`/api/admin/businesses/${selectedBusiness.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update business');
      }

      // Update the business in our state
      setBusinesses(prev => prev.map(business =>
        business.id === selectedBusiness.id
          ? {
              ...business,
              name: editFormData.name,
              status: editFormData.status,
              logo: editFormData.logo,
              color: editFormData.color || editFormData.colorTheme,
              colorTheme: editFormData.colorTheme,
              isActive: editFormData.isActive,
              startDate: editFormData.startDate,
              endDate: editFormData.endDate
            }
          : business
      ));

      // Close the modal
      closeEditModal();

      // Show success message
      showToast('Business updated successfully', 'success');

    } catch (error) {
      console.error('Error updating business:', error);
      setError(typeof error === 'string' ? error : (error instanceof Error ? error.message : 'An unknown error occurred'));
      showToast('Error updating business: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Toggle business active status
  const toggleBusinessActive = (business: Business) => {
    setBusinesses(prev => prev.map(b =>
      b.id === business.id
        ? { ...b, isActive: !b.isActive }
        : b
    ));
  };

  // State for upload document modal
  const [isUploadDocumentModalOpen, setIsUploadDocumentModalOpen] = useState(false);

  // State for view document modal
  const [isViewDocumentModalOpen, setIsViewDocumentModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);

  const handleDownload = async (doc: BusinessDocument) => {
    try {
      if (doc.url) {
        // For URL-based documents (PDF, DOC, etc.)
        const response = await fetch(doc.url);
        
        // Check if the response is ok
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Set the correct file extension based on document type
        const fileExtension = doc.type.toLowerCase();
        const fileName = `${doc.title}.${fileExtension}`;
        
        // Set content type based on file type
        let contentType = 'application/octet-stream';
        switch (fileExtension) {
          case 'pdf':
            contentType = 'application/pdf';
            break;
          case 'doc':
          case 'docx':
            contentType = 'application/msword';
            break;
          default:
            contentType = 'application/octet-stream';
        }

        // Create blob with correct content type
        const fileBlob = new Blob([blob], { type: contentType });
        const fileUrl = window.URL.createObjectURL(fileBlob);

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = fileName;

        // Append, click, and cleanup
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(fileUrl);
        
        // Show success toast notification
        showToast(`Downloaded: ${doc.title}`, 'success');
      } else {
        // For non-URL documents, export as CSV
        const exportData = [{
          Title: doc.title,
          Type: doc.type,
          Description: doc.description,
          Source: doc.source,
          Created: doc.created,
          Status: doc.status
        }];

        const csvString = [
          Object.keys(exportData[0]).join(','),
          Object.values(exportData[0]).join(',')
        ].join('\n');

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Show success toast notification
        showToast(`Exported: ${doc.title}`, 'success');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      // Replace alert with toast notification 
      showToast('Error downloading document. Please try again.', 'error');
    }
  };

  // Add this to your state declarations
  const [selectedDocuments, setSelectedDocuments] = useState<{ [key: string]: boolean }>({});

  // Add a function to handle bulk actions
  const handleBulkAction = (action: string) => {
    const selectedIds = Object.entries(selectedDocuments)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      // Replace alert with toast notification
      showToast('Please select documents first', 'warning');
      return;
    }

    // Perform bulk action based on the action type
    switch (action) {
      case 'download':
        selectedIds.forEach(id => {
          const doc = dummyDocuments.find(d => d.id === id);
          if (doc) handleDownload(doc);
        });
        showToast(`Downloading ${selectedIds.length} documents`, 'success');
        break;
      // Add other bulk actions as needed
      default:
        break;
    }
  };

  // Update the filteredUsers memoized value to correctly check businessId
  const filteredUsers = useMemo(() => {
    // First, check if we have users data at all
    if (!users || users.length === 0) {
      console.log("No users data available");
      return [];
    }

    // Log the selected business and available users for debugging
    console.log("Selected business:", selectedBusinessView?.id);
    console.log("Available users:", users);
    
    return users.filter(user => {
      // Make sure user is a valid object with required properties
      if (!user) return false;
      
      // Check if the user's businessId matches the selected business
      const matchesBusiness = selectedBusinessView && user.businessId === selectedBusinessView.id;
      
      // Check if the user matches the search term (case insensitive)
      const matchesSearch = !userSearchTerm || 
        (user.name && user.name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase()));
      
      return matchesBusiness && matchesSearch;
    });
  }, [users, selectedBusinessView, userSearchTerm]);

  const calculateUserCount = useCallback((businessId: string): number => {
    return usersMap[businessId]?.length || 0;
  }, [usersMap]);

  const refreshUserCounts = useCallback(async () => {
    await fetchUsers();
    setBusinesses(prevBusinesses => 
      prevBusinesses.map(business => ({
        ...business,
        userCount: usersMap[business.id]?.length || 0
      }))
    );
  }, [fetchUsers, usersMap]);

  useEffect(() => {
    // Calculate counts for all businesses at once
    const updatedBusinesses = businesses.map(business => ({
      ...business,
      userCount: users.filter(user => user.businessId === business.id).length
    }));
    
    setBusinesses(updatedBusinesses);
  }, [users]); // Only depend on users array changes

  // Add this function where you have other handler functions
  const handleDocumentSelection = (documentId: string, filter: 'all' | 'admin' | 'business') => {
    setSelectedDocuments(prevSelected => ({
      ...prevSelected,
      [documentId]: !prevSelected[documentId]
    }));
  };

  useEffect(() => {
    // Initialize usersMap for all businesses
    const loadUserMap = async () => {
      const promises = businesses.map(async (business) => {
        try {
          const response = await fetch(`/api/admin/users?businessId=${business.id}`);
          const data = await response.json();
          
          if (data.success) {
            return { businessId: business.id, users: data.users };
          }
          return { businessId: business.id, users: [] };
        } catch (error) {
          console.error(`Error loading users for business ${business.id}:`, error);
          return { businessId: business.id, users: [] };
        }
      });
      
      const results = await Promise.all(promises);
      
      const newUsersMap: Record<string, User[]> = {};
      results.forEach(({ businessId, users }) => {
        newUsersMap[businessId] = users;
      });
      
      setUsersMap(newUsersMap);
    };
    
    loadUserMap();
  }, [businesses]);

  // Update the useEffect that fetches users for a business:

  useEffect(() => {
    if (selectedBusinessView) {
      const fetchBusinessUsers = async () => {
        try {
          console.log(`Fetching users for business ID: ${selectedBusinessView.id}`);
          
          // For testing, try using the dummy data directly
          if (process.env.NODE_ENV === 'development' && dummyUsers.length > 0) {
            console.log("Using dummy users data for development");
            // Filter dummy users for this business
            const businessUsers = dummyUsers.filter(user => 
              user.businessId === selectedBusinessView.id
            );
            console.log("Filtered users:", businessUsers);
            setUsers(businessUsers);
          } else {
            const response = await fetch(`/api/admin/users?businessId=${selectedBusinessView.id}`);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch users: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
              console.log(`Found ${data.users.length} users for business ${selectedBusinessView.id}`);
              setUsers(data.users);
              
              // Update the usersMap
              setUsersMap(prev => ({
                ...prev,
                [selectedBusinessView.id]: data.users
              }));
            } else {
              throw new Error(data.error || 'Failed to fetch users');
            }
          }
          
        } catch (error) {
          console.error('Error fetching users for business:', error);
          showToast('Failed to load user data', 'error');
        }
      };

      fetchBusinessUsers();
    }
  }, [selectedBusinessView?.id]); // Depend only on the business ID

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 9 9 0 018.646 3.646A9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
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
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-[#C72026]/10 dark:hover:bg-[#C72026]/20"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 3 0 01-3 3H6a3 3 3 0 01-3-3V7a3 3 3 0 013-3h4a3 3 3 0 013 3v1" />
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
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/admin/businesses" className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026]">
                  {t('businesses')}
                </Link>
              </li>
              <li>
                <Link href="/admin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('altamedia Content')}
                </Link>
              </li>
              {/* <li>
                <Link href="/admin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('userAccounts')}
                </Link>
              </li> */}
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
            {!selectedBusinessView ? (
              <div>
                <div className="mb-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('businesses')}
                      </h1>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {t('businessManagement')}
                      </p>
                    </div>
                    <button 
                      onClick={openModal}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {t('addNewBusiness')}
                    </button>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('filterByStatus')}
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="mt-1 block w-42 pl-3 pr-10 py-2 text-sm text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] rounded-md"
                    >
                      <option value="all">{t('allBusinesses')}</option>
                      <option value="active">{t('active')}</option>
                      <option value="pending">{t('pending')}</option>
                      <option value="suspended">{t('suspended')}</option>
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('searchBusinesses')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 4 0 100 8 4 4 0 000-8zM2 8a6 6 6 6 0 1110.89 3.476l4.817 4.817a1 1 1 01-1.414 1.414l-4-4a6 6 6 6 0 01-8.89-3.476z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Businesses Table */}
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72026]"></div>
                      <span className="ml-2">{t('loading')}</span>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('name')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('userCount')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('status')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('Start Date')} {/* Changed from t('joined') to t('Start Date') */}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('createdBy')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredBusinesses.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                              {t('noBusinessesFound')}
                            </td>
                          </tr>
                        ) : (
                          filteredBusinesses.map((business: Business) => (
                            <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              {/* Name cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-[#C72026] dark:text-[#C72026]">
                                      {business.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <button 
                                      onClick={() => handleBusinessClick(business)}
                                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#C72026] dark:hover:text-[#C72026]/80"
                                    >
                                      {business.name}
                                    </button>
                                  </div>
                                </div>
                              </td>
                              {/* User count cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {usersMap[business.id]?.length || 0}
                                </div>
                              </td>
                              {/* Status cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  business.status?.toUpperCase() === 'ACTIVE' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                                    : business.status?.toUpperCase() === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                                }`}>
                                  {t(business.status?.toLowerCase())}
                                </span>
                              </td>
                              {/* Joined date cell */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {business.joinedDate?.split('T')[0] || business.startDate?.split('T')[0] || 'N/A'}
                              </td>
                              {/* Created By cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {typeof business.createdBy === 'string' ? business.createdBy : business.createdBy?.name || user?.name || 'Admin'}
                                </div>
                              </td>
                              {/* Actions cell */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => openViewModal(business)}
                                    className="text-[#C72026] hover:text-[#C72026]/80"
                                  >
                                    {t('view')}
                                  </button>
                                  <button 
                                    onClick={() => openEditModal(business)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  >
                                    {t('edit')}
                                  </button>
                                  {/* {business.status === 'pending' && (
                                    <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">
                                      {t('approve')}
                                    </button>
                                  )}
                                  {business.status === 'active' && (
                                    <button className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                                      {t('suspend')}
                                    </button>
                                  )}
                                  {business.status === 'suspended' && (
                                    <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300">
                                      {t('approve')}
                                    </button>
                                  )} */}
                                  {/* <button 
                                    onClick={() => toggleBusinessActive(business)}
                                    className={`${
                                      business.isActive 
                                        ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300' 
                                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
                                    }`}
                                  >
                                    {business.isActive ? t('deactivate') : t('activate')}
                                  </button> */}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={handleBackToList}
                      className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Back to Businesses
                    </button>
                    <h2 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">
                      {selectedBusinessView?.name}
                    </h2>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {['all', 'business', 'admin', 'users'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`${
                          activeFilter === filter
                            ? 'border-[#C72026] text-[#C72026] dark:text-[#C72026]' // Changed from blue to purple
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                      >
                        {filter === 'all' ? 'All Documents' : 
                         filter === 'users' ? 'User Accounts' :
                         `${filter} Documents`}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content Area */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {activeFilter === 'users' ? 'User Accounts' : 
                       activeFilter === 'all' ? 'All Documents' : 
                       `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Documents`}
                    </h3>
                    
                    {/* Add appropriate action button based on active filter */}
                    {activeFilter === 'users' ? (
                      <div className="flex space-x-2">
                        <div className="flex flex-col">
                          <div className="mb-1">
                            <UserDataActions 
                              users={users}
                              onImportUsers={async (importedUsers) => {
                                try {
                                  // First, validate for duplicates
                                  const duplicates = importedUsers.filter(newUser => 
                                    isDuplicateUser(newUser, users, selectedBusinessView.id)
                                  );
                            
                                  if (duplicates.length > 0) {
                                    // Replace alert with toast notification
                                    showToast(`Duplicate users found: ${duplicates.map(d => d.email).join(', ')}`, 'warning');
                                    return;
                                  }
                            
                                  // Add business ID and other required fields to each imported user
                                  const enrichedUsers = importedUsers.map(user => ({
                                    ...user,
                                    id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique temporary ID
                                    businessId: selectedBusinessView.id,
                                    joinDate: new Date().toISOString().split('T')[0],
                                    lastActive: new Date().toISOString().split('T')[0],
                                    status: user.status || 'active',
                                    createdBy: user?.name || 'Admin',
                                    role: user.role || 'User', // Default role if not provided,
                                  }));
                            
                                  // Make API call to bulk create users
                                  const response = await fetch('/api/admin/users/bulk', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      users: enrichedUsers,
                                      businessId: selectedBusinessView.id
                                    }),
                                  });
                            
                                  const data = await response.json();
                            
                                  if (!data.success) {
                                    throw new Error(data.error || 'Failed to import users');
                                  }
                            
                                  // Process the response to ensure users have all required fields
                                  const newUsers = data.users.map((user: any) => ({
                                    ...user,
                                    // Ensure these fields exist for UI rendering purposes
                                    joinDate: user.joinDate || new Date().toISOString().split('T')[0],
                                    lastActive: user.lastActive || new Date().toISOString().split('T')[0],
                                    status: user.status || 'active',
                                    createdBy: user.createdBy || user?.name || 'Admin',
                                  }));
                            
                                  // Update users state with proper typing
                                  setUsers(prevUsers => [...newUsers, ...prevUsers]); // Changed order to put new users first
                            
                                  // Update usersMap properly
                                  setUsersMap(prev => {
                                    const existingUsers = prev[selectedBusinessView.id] || [];
                                    return {
                                      ...prev,
                                      [selectedBusinessView.id]: [...newUsers, ...existingUsers] // Changed order to put new users first
                                    };
                                  });
                            
                                  // Update business user count
                                  setBusinesses(prevBusinesses =>
                                    prevBusinesses.map(business =>
                                      business.id === selectedBusinessView.id
                                        ? { ...business, userCount: (business.userCount || 0) + newUsers.length }
                                        : business
                                    )
                                  );
                            
                                  // Update selected business view
                                  if (selectedBusinessView) {
                                    setSelectedBusinessView({
                                      ...selectedBusinessView,
                                      userCount: (selectedBusinessView.userCount || 0) + newUsers.length,
                                    });
                                  }
                            
                                  // Replace alert with toast notification
                                  showToast(`Successfully imported ${newUsers.length} users`, 'success');
                            
                                  // Force a re-render of filtered users
                                  setUserSearchTerm(prev => prev + '');
                            
                                } catch (error) {
                                  console.error('Error importing users:', error);
                                  // Replace alert with toast notification
                                  showToast('Failed to import users. Please try again.', 'error');
                                }
                              }}
                              businessId={selectedBusinessView.id}
                            />
                          </div>
                          <button
                            onClick={handleDownloadSampleTemplate}
                            className="text-[10px] text-[#C72026] hover:text-[#C72026]/80 font-medium transition-colors duration-200 hover:underline self-start"
                          >
                            Download sample template
                          </button>
                        </div>
                        
                        <button 
                          onClick={handleAddUser}
                          className="h-[36px] inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90"
                        >
                          Add User
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleUploadDocument}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90"
                      >
                        Upload Document
                      </button>
                    )}
                  </div>

                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder={`Search ${activeFilter === 'users' ? 'users' : 'documents'}...`}
                      value={activeFilter === 'users' ? userSearchTerm : documentSearchTerm}
                      onChange={(e) => activeFilter === 'users' 
                        ? setUserSearchTerm(e.target.value)
                        : setDocumentSearchTerm(e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-md focus:ring-[#C72026] focus:border-[#C72026]"
                    />
                  </div>

                  {/* Inside the business details view content area */}
                  <div className="overflow-x-auto">
                    {activeFilter === 'users' ? (
                      // Users Table
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Language</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th> */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                No users found for this business
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user?.email || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {(() => {
                                      // If language is missing, default to English
                                      if (!user?.language) return 'English';
                                      
                                      // Create a mapping for all possible formats
                                      const languageDisplayMap: Record<string, string> = {
                                        // Full names
                                        'English': 'English',
                                        'Español': 'Español',
                                        'Français': 'Français',
                                        'Deutsch': 'Deutsch',
                                        'Português': 'Português',
                                        'Italiano': 'Italiano',
                                        
                                        // Uppercase codes
                                        'EN': 'English',
                                        'ES': 'Español',
                                        'FR': 'Français',
                                        'DE': 'Deutsch',
                                        'PT': 'Português',
                                        'IT': 'Italiano',
                                        
                                        // Lowercase codes
                                        'en': 'English',
                                        'es': 'Español',
                                        'fr': 'Français',
                                        'de': 'Deutsch',
                                        'pt': 'Português',
                                        'it': 'Italiano'
                                      };
                                      
                                      // Try to find the language in our mapping
                                      return languageDisplayMap[user.language] || user.language;
                                    })()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user?.status === 'active' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {user?.status || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedBusinessView?.name || user.createdBy || 'Admin'}
                                  </div>
                                </td>
                                {/* <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}
                                  </div>
                                </td> */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsEditUserModalOpen(true);
                                      }}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserStatus(user)}
                                      className={`${
                                        user.status?.toLowerCase() === 'active'
                                          ? 'text-red-600 hover:text-red-900'
                                          : 'text-green-600 hover:text-green-900'
                                      }`}
                                    >
                                      {user.status?.toLowerCase() === 'active' ? t('deactivate') : t('activate')}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    ) : (
                      // Documents Table
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {/* Only show checkbox column for admin documents */}
                            {activeFilter === 'admin' && (
                              <th scope="col" className="px-6 py-4 whitespace-nowrap text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                
                              </th>
                            )}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {dummyDocuments
                            .filter(doc => activeFilter === 'all' || doc.source === activeFilter)
                            .map((document) => (
                              <tr key={document.id}>
                                {/* Only show checkbox cell for admin documents */}
                                {activeFilter === 'admin' && (
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedDocuments[document.id] || false}
                                      onChange={() => handleDocumentSelection(document.id, activeFilter as 'all' | 'admin' | 'business')}
                                      className="h-4 w-4 text-[#C72026] border-gray-300 rounded focus:ring-[#C72026] focus:ring-offset-0"
                                    />
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{document.title}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{document.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{document.type}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{document.source}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {document.created}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex space-x-3">
                                    <button 
                                      className="text-[#C72026] hover:text-[#C72026]/80 mr-3"
                                      onClick={() => {
                                        setSelectedDocument(document);
                                        setIsViewDocumentModalOpen(true);
                                      }}
                                    >
                                      View
                                    </button>
                                    <button 
                                      className="text-[#C72026] hover:text-[#C72026]/80 inline-flex items-center"
                                      onClick={() => handleDownload(document)}
                                    >
                                      <svg 
                                        className="w-4 h-4 mr-1" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24" 
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M4 16v1a3 3 3 0 003 3h10a3 3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                      </svg>
                                      Download
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  {t('addNewBusiness')}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('Business Name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>
                  
                  {/* <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('address')}
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    ></textarea>
                  </div> */}

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('Start Date')}
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('End Date')}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('status')}
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="active">{t('active')}</option>
                      <option value="suspended">{t('suspended')}</option>
                    </select>
                  </div>
{/* 
                  <div>
                    <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('createdBy')}
                    </label>
                    <input
                      type="text"
                      name="createdBy"
                      id="createdBy"
                      value={formData.createdBy}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div> */}
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] text-white hover:bg-[#C72026]/90 sm:col-start-2 sm:text-sm"
                    >
                      {isSubmitting ? t('submitting') : t('add')}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Business Modal */}
      {isViewModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeViewModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {selectedBusiness.name}
                  </h3>
                  <button
                    type="button"
                    onClick={closeViewModal}
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 space-y-4">
                  {/* Logo */}
                  <div className="flex justify-center">
                    {selectedBusiness.logo ? (
                      <img 
                        src={selectedBusiness.logo} 
                        alt={`${selectedBusiness.name} logo`} 
                        className="h-24 w-24 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div 
                        className="h-24 w-24 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                        style={{ backgroundColor: selectedBusiness.color || selectedBusiness.colorTheme || '#C72026' }}
                      >
                        <span className="text-3xl font-bold text-white">
                          {selectedBusiness.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Business Details */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBusiness.status === 'active' || selectedBusiness.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                            : selectedBusiness.status === 'pending' || selectedBusiness.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }`}>
                          {t(selectedBusiness.status.toLowerCase())}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('userCount')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedBusiness.userCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('StartDate')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedBusiness.startDate ? new Date(selectedBusiness.startDate).toLocaleDateString() : 
                         selectedBusiness.joinedDate ? selectedBusiness.joinedDate : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('EndDate')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedBusiness.endDate ? new Date(selectedBusiness.endDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Color')}</p>
                      <div className="mt-1 flex items-center">
                        <div 
                          className="h-6 w-6 rounded-full mr-2" 
                          style={{ backgroundColor: selectedBusiness.color || selectedBusiness.colorTheme || '#C72026' }}
                        ></div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedBusiness.color || selectedBusiness.colorTheme || '#C72026'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('createdBy')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {typeof selectedBusiness.createdBy === 'string' 
                          ? selectedBusiness.createdBy 
                          : selectedBusiness.createdBy?.name || 'Admin'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      closeViewModal();
                      openEditModal(selectedBusiness);
                    }}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] text-base font-medium text-white hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:text-sm"
                  >
                    {t('edit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {isEditModalOpen && selectedBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeEditModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {t('edit')} - {selectedBusiness.name}
                  </h3>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                  {/* Business Name */}
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="edit-name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>
                  
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('logo')}
                    </label>
                    <div className="mt-1 flex items-center">
                      {editFormData.logo ? (
                        <div className="relative">
                          <img 
                            src={editFormData.logo} 
                            alt="Business logo" 
                            className="h-16 w-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => setEditFormData(prev => ({ ...prev, logo: '' }))}
                            className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 text-gray-400 hover:text-gray-500"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="h-16 w-16 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center"
                          style={{ backgroundColor: editFormData.colorTheme || editFormData.color || '#C72026' }}
                        >
                          <span className="text-2xl font-bold text-white">
                            {editFormData.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <label htmlFor="logo-upload" className="ml-5 cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]">
                          {t('uploadLogo')}
                        </span>
                        <input
                          id="logo-upload"
                          name="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                  
                  {/* Color Theme */}
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('Color')}
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        name="color"
                        id="color"
                        value={editFormData.color || editFormData.colorTheme || '#C72026'}
                        onChange={handleEditInputChange}
                        className="h-8 w-8 rounded-md border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="color"
                        value={editFormData.color || editFormData.colorTheme || '#C72026'}
                        onChange={handleEditInputChange}
                        className="ml-2 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Start Date */}
                  {/* <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('StartDate')}
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={editFormData.startDate || ''}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div> */}

                  {/* End Date */}
                  {/* <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('EndDate')}
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={editFormData.endDate || ''}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div> */}
                  
                  {/* Status */}
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('Status')}
                    </label>
                    <select
                      name="status"
                      id="edit-status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="active">{t('active')}</option>
                      <option value="suspended">{t('suspended')}</option>
                    </select>
                  </div>
                  
                  {/* Active Status Switch */}
                  {/* <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-[#C72026] focus:ring-[#C72026] border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      {t('isActive')}
                    </label>
                  </div> */}
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isEditSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] text-white hover:bg-[#C72026]/90 sm:col-start-2 sm:text-sm"
                    >
                      {isEditSubmitting ? t('submitting') : t('saveChanges')}
                    </button>
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026] sm:mt-0 sm:col-start-1 sm:text-sm"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modals */}
      <ViewUserModal
        isOpen={isViewUserModalOpen}
        onClose={() => setIsViewUserModalOpen(false)}
        user={selectedUser}
        translate={(key: string) => key}
      />
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        user={selectedUser}
        onSuccess={() => {
          refreshUsers()
            .then(() => {
              setIsEditUserModalOpen(false);
              showToast(`User updated successfully`, 'success');
            })
            .catch(error => {
              console.error('Error after updating user:', error);
              showToast('Failed to refresh user list', 'error');
            });
        }}
        translate={(key: string) => key}
      />
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleAddUserSuccess}
        translate={(key: string) => key}
        businessId={selectedBusinessView?.id} // Make sure selectedBusinessView exists before accessing id
      />
      <UploadDocumentModal
        isOpen={isUploadDocumentModalOpen}
        onClose={() => setIsUploadDocumentModalOpen(false)}
        onSuccess={() => {
          setIsUploadDocumentModalOpen(false);
          // Refresh documents list if needed
        }}
        translate={t}
      />
      <ViewDocumentModal
        isOpen={isViewDocumentModalOpen}
        onClose={() => setIsViewDocumentModalOpen(false)}
        document={selectedDocument}
        translate={t}
      />
    </div>
  );
}