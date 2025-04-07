'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useRouter } from 'next/navigation';
import { Import } from 'lucide-react';

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
    guides: 'Guides',
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
  const { isDarkMode } = useDarkMode();
  const router = useRouter();

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
    createdBy: 'Current Admin' // Set default or get from user context
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

  // State for profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mock user data (replace with actual user data in production)
  const user = {
    name: 'Admin User',
    email: 'admin@example.com'
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
      createdBy: business.createdBy // Include the createdBy field
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
          createdBy: 'admin' // In a real app, this would be the logged-in admin's ID
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

  // Logout handler
  const handleLogout = () => {
    // Add actual logout logic here
    router.push('/login');
  };

  // Toggle dark mode handler
  const toggleDarkMode = () => {
    // This should be handled by your DarkModeContext
    // If not already defined, implement the toggle logic
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
          <div className="flex items-center h-16">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/Logo_Altamedia_sans-fond.png"
                  alt="Altamedia Logo"
                  width={120}  // Increased from 80
                  height={120} // Increased from 80
                  className="h-10 w-auto" // Increased from h-10
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
                <span className="ml-2 px-2 py-1 bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] text-xs font-medium rounded">
                  Super Admin
                </span>
              </div>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C72026] focus:ring-offset-2"
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
                  onChange={handleLanguageChange}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C72026] focus:ring-offset-2"
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
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/superadmin" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/businesses" className="block px-4 py-2 rounded-md bg-[#C72026]/10 dark:bg-[#C72026]/20 text-[#C72026] dark:text-[#C72026] font-medium">
                  {t('businesses')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/content" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('altamedia Content')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/users" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {'Admin Accounts'}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('analytics')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/settings" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                  {t('settings')}
                </Link>
              </li>
              <li>
                <Link href="/superadmin/permissions" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
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
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C72026] hover:bg-[#C72026]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C72026]"
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
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] rounded-md"
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
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
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
                        <tr key={business.id} className="hover:bg-[#C72026]/5 dark:hover:bg-[#C72026]/10">
                          {/* Name cell */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-[#C72026]/10 dark:bg-[#C72026]/20 flex items-center justify-center">
                                <span className="text-lg font-semibold text-[#C72026] dark:text-[#C72026]">
                                  {business.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {business.name}
                                </div>
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
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${business.status === 'active'
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
                                className={`${business.isActive
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
                    />
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] hover:bg-[#C72026]/90 text-white focus:ring-[#C72026] sm:col-start-2 sm:text-sm"
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedBusiness.status === 'active'
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedBusiness.isActive
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
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] hover:bg-[#C72026]/90 text-white focus:ring-[#C72026] sm:text-sm"
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
                      {t('businessName')}
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
                          style={{ backgroundColor: editFormData.colorTheme }}
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
                        className="ml-2 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:ring-[#C72026] focus:border-[#C72026] sm:text-sm"
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
                      className="h-4 w-4 text-[#C72026] focus:ring-[#C72026] border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      {t('isActive')}
                    </label>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      disabled={isEditSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#C72026] hover:bg-[#C72026]/90 text-white focus:ring-[#C72026] sm:col-start-2 sm:text-sm"
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
    </div>
  );
}