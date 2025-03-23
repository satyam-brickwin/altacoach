'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';

// Sample staff data
const staffData = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Sales Manager',
    department: 'Sales',
    lastActive: '2023-08-10',
    status: 'active'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Sales Representative',
    department: 'Sales',
    lastActive: '2023-08-09',
    status: 'active'
  },
  {
    id: '3',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    role: 'Customer Service',
    department: 'Support',
    lastActive: '2023-08-08',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    role: 'Marketing Specialist',
    department: 'Marketing',
    lastActive: '2023-08-07',
    status: 'active'
  }
];

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
    staffDescription: 'Manage your team members and their access',
    department: 'Department',
    inviteNew: 'Invite New',
    active: 'Active',
    inactive: 'Inactive',
    edit: 'Edit',
    sales: 'Sales',
    support: 'Support',
    marketing: 'Marketing',
    allDepartments: 'All Departments',
    filterByDepartment: 'Filter by Department:'
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
    staffDescription: 'Gérez les membres de votre équipe et leur accès',
    department: 'Département',
    inviteNew: 'Inviter Nouveau',
    active: 'Actif',
    inactive: 'Inactif',
    edit: 'Modifier',
    sales: 'Ventes',
    support: 'Support',
    marketing: 'Marketing',
    allDepartments: 'Tous les Départements',
    filterByDepartment: 'Filtrer par Département:'
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
    staffDescription: 'Verwalten Sie Ihre Teammitglieder und deren Zugriff',
    department: 'Abteilung',
    inviteNew: 'Neuen Einladen',
    active: 'Aktiv',
    inactive: 'Inaktiv',
    edit: 'Bearbeiten',
    sales: 'Vertrieb',
    support: 'Support',
    marketing: 'Marketing',
    allDepartments: 'Alle Abteilungen',
    filterByDepartment: 'Nach Abteilung filtern:'
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
    staffDescription: 'Gestisci i membri del tuo team e il loro accesso',
    department: 'Dipartimento',
    inviteNew: 'Invita Nuovo',
    active: 'Attivo',
    inactive: 'Inattivo',
    edit: 'Modifica',
    sales: 'Vendite',
    support: 'Supporto',
    marketing: 'Marketing',
    allDepartments: 'Tutti i Dipartimenti',
    filterByDepartment: 'Filtra per Dipartimento:'
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
    staffDescription: 'Gestione los miembros de su equipo y su acceso',
    department: 'Departamento',
    inviteNew: 'Invitar Nuevo',
    active: 'Activo',
    inactive: 'Inactivo',
    edit: 'Editar',
    sales: 'Ventas',
    support: 'Soporte',
    marketing: 'Marketing',
    allDepartments: 'Todos los Departamentos',
    filterByDepartment: 'Filtrar por Departamento:'
  }
};

export default function BusinessStaff() {
  const { language, setLanguage, translate } = useLanguage();
  const [staff] = useState(staffData);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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

  const filteredStaff = selectedDepartment === 'all' 
    ? staff 
    : staff.filter(member => member.department.toLowerCase() === selectedDepartment);

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
                <Link href="/business/staff" className="block px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium">
                  {t('staff')}
                </Link>
              </li>
              <li>
                <Link href="/business/analytics" className="block px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
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
                {t('staff')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('manageDescription') || 'Manage your team members and their access permissions'}
              </p>
            </div>

            {/* Department Filter */}
            <div className="mb-6">
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('filterByDepartment') || 'Filter by Department:'}
                </span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-sm text-black border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                >
                  <option value="all">{t('allDepartments') || 'All Departments'}</option>
                  <option value="sales">{t('sales') || 'Sales'}</option>
                  <option value="support">{t('support') || 'Support'}</option>
                  <option value="marketing">{t('marketing') || 'Marketing'}</option>
                </select>
              </div>
            </div>

            {/* Staff Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('staffMembers')}
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('inviteStaff')}
                </button>
              </div>
              
              {/* Staff Table */}
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
                        {t('department') || 'Department'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('lastActive')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('status') || 'Status'}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{t(member.department.toLowerCase()) || member.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.lastActive}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {t(member.status) || member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              {t('edit') || 'Edit'}
                            </button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                              {t('delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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