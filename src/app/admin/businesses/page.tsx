'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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

// Sample business data
const businessData = [
  {
    id: '1',
    name: 'Acme Corporation',
    plan: 'Enterprise',
    userCount: 45,
    status: 'active',
    joinedDate: '2023-05-15',
    logo: '',
    colorTheme: '#4F46E5',
    isActive: true,
    createdBy: 'John Smith'
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

// Define Business type for better type safety
interface Business {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  status: string;
  joinedDate: string;
  logo?: string;
  colorTheme?: string;
  isActive: boolean;
  createdBy: string; // Add this new field
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
  url?: string;
  content?: string;
}

// Define User type for better type safety
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive?: string;
  status: string;
  joinDate?: string;
}

// Dummy data for documents and users
const dummyDocuments: BusinessDocument[] = [
  {
    id: '1',
    title: 'Business Plan 2024',
    description: 'Annual business plan document',
    type: 'PDF',
    status: 'active',
    created: '2024-01-15',
    source: 'business',
    url: 'https://your-domain.com/path/to/business-plan.pdf' // Replace with actual URL
  },
  {
    id: '2',
    title: 'Employee Handbook',
    description: 'Company policies and procedures',
    type: 'DOCX',
    status: 'active',
    created: '2024-02-01',
    source: 'admin',
    url: 'https://your-domain.com/path/to/handbook.docx' // Replace with actual URL
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
    joinDate: '2023-06-01'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    lastActive: '2024-03-14',
    joinDate: '2023-07-15'
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
    businessOverview: 'Business Overview',
    activeBusinesses: 'Active Businesses',
    pendingBusinesses: 'Pending Businesses',
    suspendedBusinesses: 'Suspended Businesses',
    contentManagement: 'Content Management',
    contentItems: 'Content Items',
    exercises: 'Exercises',
    faqs: 'FAQs',
    viewAll: 'View All',
    manage: 'Manage',
    approve: 'Approve',
    suspend: 'Suspend',
    delete: 'Delete',
    userStatistics: 'User Statistics',
    totalBusinesses: 'Total Businesses',
    totalContent: 'Total Content',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    adminUsers: 'Admin Users',
    courses: 'Courses',
    guides: 'Guides',
    recentRegistrations: 'Recent Registrations',
    selectLanguage: 'Select Language',
    name: 'Name',
    plan: 'Plan',
    userCount: 'Users',
    status: 'Status',
    joined: 'Joined',
    actions: 'Actions',
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
    view: 'View',
    edit: 'Edit',
    logo: 'Logo',
    colorTheme: 'Color Theme',
    isActive: 'Active Status',
    activate: 'Activate',
    deactivate: 'Deactivate',
    uploadLogo: 'Upload Logo',
    selectColorTheme: 'Select Color Theme',
    saveChanges: 'Save Changes',
    businessUpdatedSuccessfully: 'Business updated successfully!',
    errorUpdatingBusiness: 'Error updating business. Please try again later.',
    businessManagement: 'Business Management',
    addNewBusiness: 'Add New Business',
    filterByStatus: 'Filter by Status:',
    allBusinesses: 'All Businesses',
    search: 'Search',
    searchBusinesses: 'Search businesses...',
    businessAddedSuccessfully: 'Business added successfully!',
    errorAddingBusiness: 'Error adding business. Please try again later.',
    businessName: 'Business Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
    address: 'Address',
    submitting: 'Submitting...',
    add: 'Add',
    cancel: 'Cancel',
    loading: 'Loading...',
    refresh: 'Refresh',
    noBusinessesFound: 'No businesses found',
    createdBy: 'Created By',
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
    businessOverview: 'Aperçu des Entreprises',
    activeBusinesses: 'Entreprises Actives',
    pendingBusinesses: 'Entreprises en Attente',
    suspendedBusinesses: 'Entreprises Suspendues',
    contentManagement: 'Gestion de Contenu',
    contentItems: 'Éléments de Contenu',
    exercises: 'Exercices',
    faqs: 'FAQs',
    viewAll: 'Voir Tout',
    manage: 'Gérer',
    approve: 'Approuver',
    suspend: 'Suspendre',
    delete: 'Supprimer',
    userStatistics: 'Statistiques Utilisateurs',
    totalBusinesses: 'Total Entreprises',
    totalContent: 'Total Contenu',
    totalUsers: 'Total Utilisateurs',
    activeUsers: 'Utilisateurs Actifs',
    adminUsers: 'Utilisateurs Admin',
    courses: 'Cours',
    guides: 'Guide',
    recentRegistrations: 'Inscriptions Récentes',
    selectLanguage: 'Sélectionner la Langue',
    name: 'Nom',
    plan: 'Plan',
    userCount: 'Utilisateurs',
    status: 'Statut',
    joined: 'Inscrit',
    actions: 'Actions',
    active: 'Actif',
    pending: 'En Attente',
    suspended: 'Suspendu',
    view: 'Voir',
    edit: 'Modifier',
    logo: 'Logo',
    colorTheme: 'Thème de Couleur',
    isActive: 'Statut Actif',
    activate: 'Activer',
    deactivate: 'Désactiver',
    uploadLogo: 'Télécharger Logo',
    selectColorTheme: 'Sélectionner Thème de Couleur',
    saveChanges: 'Enregistrer les Modifications',
    businessUpdatedSuccessfully: 'Entreprise mise à jour avec succès!',
    errorUpdatingBusiness: 'Erreur lors de la mise à jour de l\'entreprise. Veuillez réessayer plus tard.',
    businessManagement: 'Gestion des Entreprises',
    addNewBusiness: 'Ajouter une Nouvelle Entreprise',
    filterByStatus: 'Filtrer par Statut:',
    allBusinesses: 'Toutes les Entreprises',
    search: 'Rechercher',
    searchBusinesses: 'Rechercher des entreprises...',
    businessAddedSuccessfully: 'Entreprise ajoutée avec succès !',
    errorAddingBusiness: 'Erreur lors de l\'ajout de l\'entreprise. Veuillez réessayer plus tard.',
    businessName: 'Nom de l\'Entreprise',
    email: 'Email',
    phoneNumber: 'Téléphone',
    address: 'Adresse',
    submitting: 'Envoi...',
    add: 'Ajouter',
    cancel: 'Annuler',
    loading: 'Chargement...',
    refresh: 'Rafraîchir',
    noBusinessesFound: 'Aucune entreprise trouvée',
    createdBy: 'Créé Par',
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
    businessOverview: 'Unternehmensübersicht',
    activeBusinesses: 'Aktive Unternehmen',
    pendingBusinesses: 'Ausstehende Unternehmen',
    suspendedBusinesses: 'Gesperrte Unternehmen',
    contentManagement: 'Inhaltsverwaltung',
    contentItems: 'Inhaltselemente',
    exercises: 'Übungen',
    faqs: 'FAQs',
    viewAll: 'Alle anzeigen',
    manage: 'Verwalten',
    approve: 'Genehmigen',
    suspend: 'Sperren',
    delete: 'Löschen',
    userStatistics: 'Benutzerstatistiken',
    totalBusinesses: 'Gesamtunternehmen',
    totalContent: 'Gesamtinhalt',
    totalUsers: 'Gesamtbenutzer',
    activeUsers: 'Aktive Benutzer',
    adminUsers: 'Admin-Benutzer',
    courses: 'Kurse',
    guides: 'Anleitungen',
    recentRegistrations: 'Neueste Registrierungen',
    selectLanguage: 'Sprache auswählen',
    name: 'Name',
    plan: 'Plan',
    userCount: 'Benutzer',
    status: 'Status',
    joined: 'Beigetreten',
    actions: 'Aktionen',
    active: 'Aktiv',
    pending: 'Ausstehend',
    suspended: 'Gesperrt',
    view: 'Ansehen',
    edit: 'Bearbeiten',
    logo: 'Logo',
    colorTheme: 'Farbthema',
    isActive: 'Aktiver Status',
    activate: 'Aktivieren',
    deactivate: 'Deaktivieren',
    uploadLogo: 'Logo hochladen',
    selectColorTheme: 'Farbthema auswählen',
    saveChanges: 'Änderungen speichern',
    businessUpdatedSuccessfully: 'Unternehmen erfolgreich aktualisiert!',
    errorUpdatingBusiness: 'Fehler beim Aktualisieren des Unternehmens. Bitte versuchen Sie es später erneut.',
    businessManagement: 'Unternehmensverwaltung',
    addNewBusiness: 'Neues Unternehmen hinzufügen',
    filterByStatus: 'Nach Status filtern:',
    allBusinesses: 'Alle Unternehmen',
    search: 'Suchen',
    searchBusinesses: 'Unternehmen suchen...',
    businessAddedSuccessfully: 'Unternehmen erfolgreich hinzugefügt!',
    errorAddingBusiness: 'Fehler beim Hinzufügen des Unternehmens. Bitte versuchen Sie es später erneut.',
    businessName: 'Unternehmenname',
    email: 'E-Mail',
    phoneNumber: 'Telefonnummer',
    address: 'Adresse',
    submitting: 'Einreichen...',
    add: 'Hinzufügen',
    cancel: 'Abbrechen',
    loading: 'Laden...',
    refresh: 'Aktualisieren',
    noBusinessesFound: 'Keine Unternehmen gefunden',
    createdBy: 'Erstellt Von',
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
    businessOverview: 'Panoramica Aziende',
    activeBusinesses: 'Aziende Attive',
    pendingBusinesses: 'Aziende in Attesa',
    suspendedBusinesses: 'Aziende Sospese',
    contentManagement: 'Gestione Contenuti',
    contentItems: 'Elementi di Contenuto',
    exercises: 'Esercizi',
    faqs: 'FAQ',
    viewAll: 'Vedi Tutti',
    manage: 'Gestisci',
    approve: 'Approva',
    suspend: 'Sospendi',
    delete: 'Elimina',
    userStatistics: 'Statistiche Utenti',
    totalBusinesses: 'Totale Aziende',
    totalContent: 'Totale Contenuti',
    totalUsers: 'Totale Utenti',
    activeUsers: 'Utenti Attivi',
    adminUsers: 'Utenti Admin',
    courses: 'Corsi',
    guides: 'Guide',
    recentRegistrations: 'Registrazioni Recenti',
    selectLanguage: 'Seleziona Lingua',
    name: 'Nome',
    plan: 'Piano',
    userCount: 'Utenti',
    status: 'Stato',
    joined: 'Iscritto',
    actions: 'Azioni',
    active: 'Attivo',
    pending: 'In Attesa',
    suspended: 'Sospeso',
    view: 'Visualizza',
    edit: 'Modifica',
    logo: 'Logo',
    colorTheme: 'Tema Colore',
    isActive: 'Stato Attivo',
    activate: 'Attivare',
    deactivate: 'Disattivare',
    uploadLogo: 'Carica Logo',
    selectColorTheme: 'Seleziona Tema Colore',
    saveChanges: 'Salva Modifiche',
    businessUpdatedSuccessfully: 'Azienda aggiornata con successo!',
    errorUpdatingBusiness: 'Errore durante la modifica dell\'azienda. Per favore riprova più tardi.',
    businessManagement: 'Gestione Aziende',
    addNewBusiness: 'Aggiungi Nuova Azienda',
    filterByStatus: 'Filtra per Stato:',
    allBusinesses: 'Tutte le Aziende',
    search: 'Cerca',
    searchBusinesses: 'Cerca aziende...',
    businessAddedSuccessfully: 'Azienda aggiunta con successo!',
    errorAddingBusiness: 'Errore durante l\'aggiunta dell\'azienda. Per favore riprova più tardi.',
    businessName: 'Nome Azienda',
    email: 'Email',
    phoneNumber: 'Telefono',
    address: 'Indirizzo',
    submitting: 'Inviando...',
    add: 'Aggiungi',
    cancel: 'Annulla',
    loading: 'Caricamento...',
    refresh: 'Aggiorna',
    noBusinessesFound: 'Nessuna azienda trovata',
    createdBy: 'Creato Da',
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

interface BusinessFormData {
  name: string;
  plan: string;
  status: string;
  email: string;
  phoneNumber: string;
  address: string;
  logo?: string;
  colorTheme: string;
  isActive: boolean;
  createdBy: string; // Add this field
}

export default function AdminBusinesses() {
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const { user, signOut } = useAuth(); // Get user and signOut from auth context

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for businesses data
  const [businesses, setBusinesses] = useState<Business[]>([]);

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
    colorTheme: '#4F46E5',
    isActive: true,
    createdBy: 'Current Admin' // Default value
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
    colorTheme: '#4F46E5',
    isActive: true,
    createdBy: 'Current Admin' // Set default or get from user context
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
      await signOut(); // Call signOut from auth context
      window.location.href = '/login'; // Use direct navigation for full page reload
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback navigation if needed
      window.location.href = '/login';
    }
  };

  // State for selected business view and view mode
  const [selectedBusinessView, setSelectedBusinessView] = useState<Business | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const handleBusinessClick = (business: Business) => {
    setSelectedBusinessView(business);
    setViewMode('detail');
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
  const [users, setUsers] = useState(dummyUsers);

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleUploadDocument = () => {
    setIsUploadDocumentModalOpen(true);
  };

  // Add this handler function
  const handleToggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
    // In a real app, you would make an API call here
    // For demo purposes, we'll just update the state
    setUsers(currentUsers =>
      currentUsers.map(u =>
        u.id === user.id
          ? { ...u, status: newStatus }
          : u
      )
    );

    // Show confirmation toast/alert
    alert(`User ${user.name} has been ${newStatus}`);
  };

  // Fetch businesses from API
  const fetchBusinesses = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/admin/businesses');
      // const data = await response.json();
      // setBusinesses(data.businesses);

      // For demo purposes, we'll use the sample data
      setTimeout(() => {
        setBusinesses(businessData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError(typeof error === 'string' ? error : (error instanceof Error ? error.message : 'An unknown error occurred'));
      setIsLoading(false);
    }
  };

  // Fetch businesses when component mounts
  useEffect(() => {
    fetchBusinesses();
  }, []);

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
    const matchesStatus = statusFilter === 'all' || business.status === statusFilter;
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
      plan: business.plan,
      status: business.status,
      email: '', // In a real app, you would fetch these from the API
      phoneNumber: '',
      address: '',
      logo: business.logo || '',
      colorTheme: business.colorTheme || '#4F46E5',
      isActive: business.isActive,
      createdBy: business.createdBy // Preserve the original creator
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

  // Handle form submission for adding a new business
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/admin/businesses', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      // const data = await response.json();

      // For demo purposes, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = {
        success: true,
        business: {
          id: Date.now().toString(),
          name: formData.name,
          plan: formData.plan,
          userCount: 0,
          status: formData.status,
          joinedDate: new Date().toISOString().split('T')[0],
          logo: formData.logo,
          colorTheme: formData.colorTheme,
          isActive: formData.isActive,
          createdBy: 'admin' // Hardcoded as 'admin' instead of using formData.createdBy
        }
      };

      console.log('Business created successfully:', data);

      // Add the new business to our state
      const newBusiness = data.business;
      setBusinesses(prev => [newBusiness, ...prev]);

      // Close the modal and reset form
      closeModal();
      setFormData({
        name: '',
        plan: 'Business',
        status: 'pending',
        email: '',
        phoneNumber: '',
        address: '',
        logo: '',
        colorTheme: '#4F46E5',
        isActive: true,
        createdBy: 'Current Admin' // Reset this too
      });

      // Show success message
      alert(t('businessAddedSuccessfully'));

    } catch (error) {
      console.error('Error creating business:', error);
      setError(typeof error === 'string' ? error : (error instanceof Error ? error.message : 'An unknown error occurred'));
      alert(t('errorAddingBusiness') + (error instanceof Error ? `: ${error.message}` : ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission for editing a business
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditSubmitting || !selectedBusiness) return;

    setIsEditSubmitting(true);
    setError('');

    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/admin/businesses/${selectedBusiness.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(editFormData),
      // });
      // const data = await response.json();

      // For demo purposes, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the business in our state
      setBusinesses(prev => prev.map(business =>
        business.id === selectedBusiness.id
          ? {
              ...business,
              name: editFormData.name,
              plan: editFormData.plan,
              status: editFormData.status,
              logo: editFormData.logo,
              colorTheme: editFormData.colorTheme,
              isActive: editFormData.isActive
            }
          : business
      ));

      // Close the modal
      closeEditModal();

      // Show success message
      alert(t('businessUpdatedSuccessfully'));

    } catch (error) {
      console.error('Error updating business:', error);
      setError(typeof error === 'string' ? error : (error instanceof Error ? error.message : 'An unknown error occurred'));
      alert(t('errorUpdatingBusiness') + (error instanceof Error ? `: ${error.message}` : ''));
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
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with logo and Admin badge */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Admin badge */}
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
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/admin/businesses" className="block px-4 py-2 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 font-medium">
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
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                      className="mt-1 block w-40 pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md"
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
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}
                
                {/* Businesses Table */}
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
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
                            {t('plan')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('userCount')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('status')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('joined')}
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
                                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                      {business.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <button 
                                      onClick={() => handleBusinessClick(business)}
                                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
                                    >
                                      {business.name}
                                    </button>
                                  </div>
                                </div>
                              </td>
                              {/* Plan cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{business.plan}</div>
                              </td>
                              {/* User count cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{business.userCount}</div>
                              </td>
                              {/* Status cell */}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  business.status === 'active' 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                                    : business.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                                }`}>
                                  {t(business.status)}
                                </span>
                              </td>
                              {/* Joined date cell */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {business.joinedDate}
                              </td>
                              {/* Created By cell - new */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {business.createdBy}
                              </td>
                              {/* Actions cell */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => openViewModal(business)}
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                                  >
                                    {t('view')}
                                  </button>
                                  <button 
                                    onClick={() => openEditModal(business)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  >
                                    {t('edit')}
                                  </button>
                                  {business.status === 'pending' && (
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
                                  )}
                                  <button 
                                    onClick={() => toggleBusinessActive(business)}
                                    className={`${
                                      business.isActive 
                                        ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300' 
                                        : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
                                    }`}
                                  >
                                    {business.isActive ? t('deactivate') : t('activate')}
                                  </button>
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
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
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
                            ? 'border-purple-500 text-purple-600 dark:text-purple-400' // Changed from blue to purple
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
                        <UserDataActions 
                          users={users}
                          onImportUsers={(importedUsers) => {
                            setUsers(prevUsers => [...prevUsers, ...importedUsers]);
                          }}
                        />
                        <button 
                          onClick={handleAddUser}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                        >
                          Add User
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleUploadDocument}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
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
                      className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.role}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-3">
                                  <button 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsViewUserModalOpen(true);
                                    }}
                                    className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400"
                                  >
                                    View
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditUserModalOpen(true);
                                    }}
                                    className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-400"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleToggleUserStatus(user)}
                                    className={`${
                                      user.status === 'active'
                                        ? 'text-red-600 hover:text-red-900 dark:hover:text-red-400'
                                        : 'text-green-600 hover:text-green-900 dark:hover:text-green-400'
                                    }`}
                                  >
                                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      // Documents Table
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
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
                                      className="text-purple-600 hover:text-purple-900 mr-3"
                                      onClick={() => {
                                        setSelectedDocument(document);
                                        setIsViewDocumentModalOpen(true);
                                      }}
                                    >
                                      View
                                    </button>
                                    <button 
                                      className="text-purple-600 hover:text-purple-900 inline-flex items-center"
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
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
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
                      {t('businessName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('plan')}
                    </label>
                    <select
                      name="plan"
                      id="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Business">Business</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="active">{t('active')}</option>
                      <option value="suspended">{t('suspended')}</option>
                    </select>
                  </div>

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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                    >
                      {isSubmitting ? t('submitting') : t('add')}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                        style={{ backgroundColor: selectedBusiness.colorTheme || '#4F46E5' }}
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
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('plan')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedBusiness.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBusiness.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                            : selectedBusiness.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }`}>
                          {t(selectedBusiness.status)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('userCount')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedBusiness.userCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('joined')}</p>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedBusiness.joinedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('colorTheme')}</p>
                      <div className="mt-1 flex items-center">
                        <div 
                          className="h-6 w-6 rounded-full mr-2" 
                          style={{ backgroundColor: selectedBusiness.colorTheme || '#4F46E5' }}
                        ></div>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedBusiness.colorTheme || '#4F46E5'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('isActive')}</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedBusiness.isActive 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                        }`}>
                          {selectedBusiness.isActive ? t('active') : t('deactivate')}
                        </span>
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
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
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
                    className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                      {t('businessName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="edit-name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
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
                          style={{ backgroundColor: editFormData.colorTheme }}
                        >
                          <span className="text-2xl font-bold text-white">
                            {editFormData.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <label htmlFor="logo-upload" className="ml-5 cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
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
                    <label htmlFor="colorTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('colorTheme')}
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="color"
                        name="colorTheme"
                        id="colorTheme"
                        value={editFormData.colorTheme}
                        onChange={handleEditInputChange}
                        className="h-8 w-8 rounded-md border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="colorTheme"
                        value={editFormData.colorTheme}
                        onChange={handleEditInputChange}
                        className="ml-2 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Plan */}
                  <div>
                    <label htmlFor="edit-plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('plan')}
                    </label>
                    <select
                      name="plan"
                      id="edit-plan"
                      value={editFormData.plan}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="Starter">Starter</option>
                      <option value="Business">Business</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('status')}
                    </label>
                    <select
                      name="status"
                      id="edit-status"
                      value={editFormData.status}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="active">{t('active')}</option>
                      <option value="suspended">{t('suspended')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-createdBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('createdBy')}
                    </label>
                    <input
                      type="text"
                      name="createdBy"
                      id="edit-createdBy"
                      value={editFormData.createdBy}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    />
                  </div>
                  
                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={editFormData.isActive}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      {t('isActive')}
                    </label>
                  </div>
                  
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isEditSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-2 sm:text-sm"
                    >
                      {isEditSubmitting ? t('submitting') : t('saveChanges')}
                    </button>
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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
          setIsEditUserModalOpen(false);
        }}
        translate={(key: string) => key}
      />
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={() => {
          setIsAddUserModalOpen(false);
        }}
        translate={(key: string) => key}
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