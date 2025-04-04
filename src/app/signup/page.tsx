'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, sampleBusinesses, UserRole } from '@/contexts/AuthContext';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

// Translations for the signup page
const translations = {
  en: {
    signup: 'Sign Up',
    createAccount: 'Create your account',
    alreadyHaveAccount: 'Already have an account?',
    login: 'Log in',
    name: 'Full Name',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    register: 'Register',
    selectRole: 'Select your role',
    admin: 'Administrator',
    business: 'Business Owner',
    staff: 'Staff Member',
    selectBusiness: 'Select your business',
    createNewBusiness: 'Create new business',
    businessName: 'Business Name',
    businessNamePlaceholder: 'Enter your business name',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    passwordRequired: 'Password is required',
    passwordLength: 'Password must be at least 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    roleRequired: 'Please select a role',
    businessRequired: 'Please select or create a business',
    createYouraltacoachAccount: 'Create Your altacoach Account',
    joinAltaCoach: 'Join altaCoach to access powerful coaching tools and resources for your business or team.',
    byRegistering: 'By registering, you agree to our Terms of Service and Privacy Policy.',
    passwordMinLength: 'Password must be at least 6 characters',
    language: 'Language',
  },
  fr: {
    signup: "S'inscrire",
    createAccount: 'Créez votre compte',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    login: 'Se connecter',
    name: 'Nom complet',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    register: "S'inscrire",
    selectRole: 'Sélectionnez votre rôle',
    admin: 'Administrateur',
    business: "Propriétaire d'entreprise",
    staff: 'Membre du personnel',
    selectBusiness: 'Sélectionnez votre entreprise',
    createNewBusiness: 'Créer une nouvelle entreprise',
    businessName: "Nom de l'entreprise",
    businessNamePlaceholder: "Entrez le nom de votre entreprise",
    nameRequired: 'Le nom est requis',
    emailRequired: "L'e-mail est requis",
    emailInvalid: "L'e-mail est invalide",
    passwordRequired: 'Le mot de passe est requis',
    passwordLength: 'Le mot de passe doit contenir au moins 6 caractères',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    roleRequired: 'Veuillez sélectionner un rôle',
    businessRequired: 'Veuillez sélectionner ou créer une entreprise',
    createYourAltaCoachAccount: 'Créez Votre Compte altaCoach',
    joinAltaCoach: 'Rejoignez altaCoach pour accéder à des outils et ressources de coaching puissants pour votre entreprise ou équipe.',
    byRegistering: "En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.",
    passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères',
    language: 'Langue',
  },
  de: {
    signup: 'Registrieren',
    createAccount: 'Erstellen Sie Ihr Konto',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
    login: 'Anmelden',
    name: 'Vollständiger Name',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    register: 'Registrieren',
    selectRole: 'Wählen Sie Ihre Rolle',
    admin: 'Administrator',
    business: 'Geschäftsinhaber',
    staff: 'Mitarbeiter',
    selectBusiness: 'Wählen Sie Ihr Unternehmen',
    createNewBusiness: 'Neues Unternehmen erstellen',
    businessName: 'Unternehmensname',
    businessNamePlaceholder: 'Geben Sie Ihren Unternehmensnamen ein',
    nameRequired: 'Name ist erforderlich',
    emailRequired: 'E-Mail ist erforderlich',
    emailInvalid: 'E-Mail ist ungültig',
    passwordRequired: 'Passwort ist erforderlich',
    passwordLength: 'Passwort muss mindestens 6 Zeichen lang sein',
    passwordsDoNotMatch: 'Passwörter stimmen nicht überein',
    roleRequired: 'Bitte wählen Sie eine Rolle',
    businessRequired: 'Bitte wählen oder erstellen Sie ein Unternehmen',
    createYourAltaCoachAccount: 'Erstellen Sie Ihr AltaCoach-Konto',
    joinAltaCoach: 'Treten Sie AltaCoach bei, um auf leistungsstarke Coaching-Tools und Ressourcen für Ihr Unternehmen oder Team zuzugreifen.',
    byRegistering: 'Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen und Datenschutzrichtlinien zu.',
    passwordMinLength: 'Passwort muss mindestens 6 Zeichen lang sein',
    language: 'Sprache',
  },
  es: {
    signup: 'Registrarse',
    createAccount: 'Crea tu cuenta',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    login: 'Iniciar sesión',
    name: 'Nombre completo',
    email: 'Dirección de correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    register: 'Registrarse',
    selectRole: 'Selecciona tu rol',
    admin: 'Administrador',
    business: 'Propietario de negocio',
    staff: 'Miembro del personal',
    selectBusiness: 'Selecciona tu negocio',
    createNewBusiness: 'Crear nuevo negocio',
    businessName: 'Nombre del negocio',
    businessNamePlaceholder: 'Ingresa el nombre de tu negocio',
    nameRequired: 'El nombre es obligatorio',
    emailRequired: 'El correo electrónico es obligatorio',
    emailInvalid: 'El correo electrónico es inválido',
    passwordRequired: 'La contraseña es obligatoria',
    passwordLength: 'La contraseña debe tener al menos 6 caracteres',
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    roleRequired: 'Por favor selecciona un rol',
    businessRequired: 'Por favor selecciona o crea un negocio',
    createYourAltaCoachAccount: 'Crea Tu Cuenta de AltaCoach',
    joinAltaCoach: 'Únete a AltaCoach para acceder a potentes herramientas y recursos de coaching para tu negocio o equipo.',
    byRegistering: 'Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad.',
    passwordMinLength: 'La contraseña debe tener al menos 6 caracteres',
    language: 'Idioma',
  },
  it: {
    signup: 'Registrati',
    createAccount: 'Crea il tuo account',
    alreadyHaveAccount: 'Hai già un account?',
    login: 'Accedi',
    name: 'Nome completo',
    email: 'Indirizzo email',
    password: 'Password',
    confirmPassword: 'Conferma password',
    register: 'Registrati',
    selectRole: 'Seleziona il tuo ruolo',
    admin: 'Amministratore',
    business: 'Proprietario di azienda',
    staff: 'Membro dello staff',
    selectBusiness: 'Seleziona la tua azienda',
    createNewBusiness: 'Crea nuova azienda',
    businessName: 'Nome azienda',
    businessNamePlaceholder: 'Inserisci il nome della tua azienda',
    nameRequired: 'Il nome è obbligatorio',
    emailRequired: "L'email è obbligatoria",
    emailInvalid: "L'email non è valida",
    passwordRequired: 'La password è obbligatoria',
    passwordLength: 'La password deve contenere almeno 6 caratteri',
    passwordsDoNotMatch: 'Le password non corrispondono',
    roleRequired: 'Seleziona un ruolo',
    businessRequired: "Seleziona o crea un'azienda",
    createYourAltaCoachAccount: 'Crea Il Tuo Account AltaCoach',
    joinAltaCoach: 'Unisciti ad AltaCoach per accedere a potenti strumenti e risorse di coaching per la tua azienda o il tuo team.',
    byRegistering: 'Registrandoti, accetti i nostri Termini di Servizio e la nostra Politica sulla Privacy.',
    passwordMinLength: 'La password deve contenere almeno 6 caratteri',
    language: 'Lingua',
  }
};

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading, error } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { isDarkMode } = useDarkMode();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [businessId, setBusinessId] = useState('');
  const [createNewBusiness, setCreateNewBusiness] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [showBusinessSelect, setShowBusinessSelect] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Update error state when auth context error changes
  useEffect(() => {
    if (error) {
      setSignupError(error);
    }
  }, [error]);

  // Handle role selection
  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setShowBusinessSelect(selectedRole === 'business' || selectedRole === 'staff');
    
    // Reset business selection when role changes
    setBusinessId('');
    setCreateNewBusiness(false);
    setNewBusinessName('');
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    setIsSubmitting(true);

    // Validate form
    if (!name.trim()) {
      setSignupError(t('nameRequired'));
      setIsSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setSignupError(t('emailRequired'));
      setIsSubmitting(false);
      return;
    }

    if (!isValidEmail(email)) {
      setSignupError(t('emailInvalid'));
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setSignupError(t('passwordRequired'));
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setSignupError(t('passwordMinLength'));
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setSignupError(t('passwordsDoNotMatch'));
      setIsSubmitting(false);
      return;
    }

    if (!role) {
      setSignupError(t('roleRequired'));
      setIsSubmitting(false);
      return;
    }

    if ((role === 'business' || role === 'staff') && !businessId && !createNewBusiness) {
      setSignupError(t('businessRequired'));
      setIsSubmitting(false);
      return;
    }

    if (createNewBusiness && !newBusinessName.trim()) {
      setSignupError(t('businessNameRequired'));
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real app, we would create the business first if needed
      let businessIdToUse = businessId;
      
      if (createNewBusiness && newBusinessName) {
        // Simulate creating a new business
        // In a real app, we would make an API call here
        businessIdToUse = `new-business-${Date.now()}`;
        
        // For demo purposes, we would add the new business to the list
        // This is simplified for the demo; in a real app we would update the business list properly
        // sampleBusinesses.push({ id: businessIdToUse, name: newBusinessName });
      }

      const success = await signup(name, email, password, role as UserRole, businessIdToUse || undefined);
      
      if (success) {
        // Redirect to login with success message
        router.push('/login?registered=true');
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      setSignupError('An error occurred during signup');
      setIsSubmitting(false);
    }
  };

  // Custom translate function
  const t = (key: string) => {
    return translations[language]?.[key as keyof typeof translations[typeof language]] || key;
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${isDarkMode ? 'dark' : ''}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('Create Your altaoach Account')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('join altacoach')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Language selector */}
          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('language')}
            </label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={language}
              onChange={handleLanguageChange}
            >
              {Object.entries(languageLabels).map(([code, label]) => (
                <option key={code} value={code}>
                  {String(label)}
                </option>
              ))}
            </select>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('name')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('confirmPassword')}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('selectRole')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`${
                    role === 'admin'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {t('admin')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('business')}
                  className={`${
                    role === 'business'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {t('business')}
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('staff')}
                  className={`${
                    role === 'staff'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {t('staff')}
                </button>
              </div>
            </div>

            {/* Business selection for business and staff roles */}
            {showBusinessSelect && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selectBusiness')}
                </label>
                <div className="mb-3">
                  <select
                    id="business"
                    name="business"
                    className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
                      createNewBusiness ? 'opacity-50' : ''
                    }`}
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    disabled={createNewBusiness}
                  >
                    <option value="">-- {t('selectBusiness')} --</option>
                    {sampleBusinesses.map((business) => (
                      <option key={business.id} value={business.id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="createNewBusiness"
                    name="createNewBusiness"
                    type="checkbox"
                    checked={createNewBusiness}
                    onChange={(e) => {
                      setCreateNewBusiness(e.target.checked);
                      if (e.target.checked) {
                        setBusinessId('');
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="createNewBusiness" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('createNewBusiness')}
                  </label>
                </div>

                {createNewBusiness && (
                  <div className="mt-3">
                    <label htmlFor="newBusinessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('businessName')}
                    </label>
                    <input
                      type="text"
                      name="newBusinessName"
                      id="newBusinessName"
                      value={newBusinessName}
                      onChange={(e) => setNewBusinessName(e.target.value)}
                      placeholder={t('businessNamePlaceholder')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Error display */}
            {signupError && (
              <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{signupError}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {t('register')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {t('byRegistering')}
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t('alreadyHaveAccount')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('login')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 