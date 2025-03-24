'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, sampleBusinesses, UserRole, initMockDatabase } from '@/contexts/AuthContext';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';

// Add translations for login page
const translations = {
  en: {
    title: 'Sign in to your account',
    noAccount: "Don't have an account?",
    createAccount: 'Create a new account',
    forgotPassword: 'Forgot your password?',
    email: 'Email address',
    rememberMe: 'Remember me',
    signIn: 'Sign in',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    passwordRequired: 'Password is required',
    invalidCredentials: 'Invalid email or password',
    registrationSuccess: 'Registration successful! Please log in with your new account.',
    signUp: 'Sign up',
    quickAccess: 'Quick Access',
    noLoginRequired: 'No Login Required',
  },
  fr: {
    title: 'Connectez-vous à votre compte',
    noAccount: "Vous n'avez pas de compte ?",
    createAccount: 'Créer un nouveau compte',
    forgotPassword: 'Mot de passe oublié ?',
    email: 'Adresse e-mail',
    rememberMe: 'Se souvenir de moi',
    signIn: 'Se connecter',
    emailRequired: "L'e-mail est requis",
    emailInvalid: "L'e-mail est invalide",
    passwordRequired: 'Le mot de passe est requis',
    invalidCredentials: 'E-mail ou mot de passe invalide',
    registrationSuccess: 'Inscription réussie ! Veuillez vous connecter avec votre nouveau compte.',
    signUp: 'S\'inscrire',
    quickAccess: 'Accès Rapide',
    noLoginRequired: 'Pas de Connexion Requise',
  },
  de: {
    title: 'In Ihr Konto einloggen',
    noAccount: 'Haben Sie kein Konto?',
    createAccount: 'Neues Konto erstellen',
    forgotPassword: 'Passwort vergessen?',
    email: 'E-Mail-Adresse',
    rememberMe: 'Angemeldet bleiben',
    signIn: 'Anmelden',
    emailRequired: 'E-Mail ist erforderlich',
    emailInvalid: 'E-Mail ist ungültig',
    passwordRequired: 'Passwort ist erforderlich',
    invalidCredentials: 'Ungültige E-Mail oder Passwort',
    registrationSuccess: 'Registrierung erfolgreich! Bitte melden Sie sich mit Ihrem neuen Konto an.',
    signUp: 'Registrieren',
    quickAccess: 'Schneller Zugriff',
    noLoginRequired: 'Keine Anmeldung erforderlich',
  },
  it: {
    title: 'Accedi al tuo account',
    noAccount: 'Non hai un account?',
    createAccount: 'Crea un nuovo account',
    forgotPassword: 'Hai dimenticato la password?',
    email: 'Indirizzo email',
    rememberMe: 'Ricordami',
    signIn: 'Accedi',
    emailRequired: "L'email è obbligatoria",
    emailInvalid: "L'email non è valida",
    passwordRequired: 'La password è obbligatoria',
    invalidCredentials: 'Email o password non validi',
    registrationSuccess: 'Registrazione riuscita! Accedi con il tuo nuovo account.',
    signUp: 'Registrati',
    quickAccess: 'Accesso Rapido',
    noLoginRequired: 'Nessuna Accesso Richiesto',
  },
  es: {
    title: 'Inicia sesión en tu cuenta',
    noAccount: '¿No tienes una cuenta?',
    createAccount: 'Crear una nueva cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    email: 'Dirección de correo',
    rememberMe: 'Recuérdame',
    signIn: 'Iniciar sesión',
    emailRequired: 'El correo es obligatorio',
    emailInvalid: 'El correo no es válido',
    passwordRequired: 'La contraseña es obligatoria',
    invalidCredentials: 'Correo o contraseña inválidos',
    registrationSuccess: '¡Registro exitoso! Por favor inicia sesión con tu nueva cuenta.',
    signUp: 'Registrarse',
    quickAccess: 'Acceso Rápido',
    noLoginRequired: 'Sin Iniciar Sesión',
  }
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams?.get('registered') === 'true';
  const { login, isAuthenticated, isLoading, error: authError } = useAuth();
  const { language, setLanguage, translate } = useLanguage();
  const { isDarkMode } = useDarkMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [businessId, setBusinessId] = useState('');
  const [showBusinessSelect, setShowBusinessSelect] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [businessCredentials, setBusinessCredentials] = useState<any[]>([]);

  // Get redirect path from URL if available
  const redirect = searchParams?.get('redirect') || '/';

  // Check for registration success message
  useEffect(() => {
    if (isRegistered) {
      setLoginSuccess(translations[language]?.registrationSuccess || translations.en.registrationSuccess);
    }
  }, [isRegistered, language]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push(redirect);
    }
  }, [isAuthenticated, isLoading, router, redirect]);

  // Update error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  // Initialize database and load credentials
  useEffect(() => {
    const credentials = initMockDatabase();
    setBusinessCredentials(credentials);
  }, []);

  // Role selection handler
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowBusinessSelect(role === UserRole.BUSINESS || role === UserRole.STAFF);
  };

  // Login form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    // Validate email and password
    if (!email) {
      setLoginError(translate('emailRequired'));
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setLoginError(translate('passwordRequired'));
      setIsSubmitting(false);
      return;
    }

    try {
      // If role is business or staff, we need a business ID
      if ((selectedRole === UserRole.BUSINESS || selectedRole === UserRole.STAFF) && !businessId) {
        setLoginError(translate('selectBusiness'));
        setIsSubmitting(false);
        return;
      }

      // Call the login function from auth context
      const success = await login(email, password, selectedRole, businessId);

      if (success) {
        router.push(redirect);
      } else {
        setLoginError(authError || translate('invalidCredentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(translate('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${isDarkMode ? 'dark' : ''}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {translate('loginToAltaCoach')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {translate('welcomeBack')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Registration success message */}
          {loginSuccess && (
            <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{loginSuccess}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Language selector */}
          <div className="mb-6">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {translate('language')}
            </label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            >
              {Object.entries(languageLabels).map(([code, label]) => (
                <option key={code} value={code}>
                  {String(label)}
                </option>
              ))}
            </select>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translate('selectRole')}
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.ADMIN)}
                className={`${
                  selectedRole === UserRole.ADMIN
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {translate('admin')}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.SUPER_ADMIN)}
                className={`${
                  selectedRole === UserRole.SUPER_ADMIN
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                {translate('super')}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.BUSINESS)}
                className={`${
                  selectedRole === UserRole.BUSINESS
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
              >
                {translate('business')}
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect(UserRole.STAFF)}
                className={`${
                  selectedRole === UserRole.STAFF
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                } py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {translate('staff')}
              </button>
            </div>
          </div>

          {/* Business selection for business and staff roles */}
          {showBusinessSelect && (
            <div className="mb-6">
              <label htmlFor="business" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translate('selectBusiness')}
              </label>
              <select
                id="business"
                name="business"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
              >
                <option value="">-- {translate('selectBusiness')} --</option>
                {sampleBusinesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translate('email')}
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translate('password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  {translate('rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  {translate('forgotPassword')}
                </a>
              </div>
            </div>

            {/* Login Error */}
            {loginError && (
              <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{loginError}</p>
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
                {translate('signIn')}
              </button>
            </div>
          </form>

          {/* Quick Access Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {translate('quickAccess')} ({translate('noLoginRequired')})
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  const success = await login('admin@altacoach.com', 'admin123', UserRole.ADMIN);
                  if (success) {
                    router.push('/admin');
                  } else {
                    setLoginError('Failed to login as admin');
                  }
                  setIsSubmitting(false);
                }}
                className="py-2 px-4 border border-green-500 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Admin Dashboard
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  const success = await login('superadmin@altacoach.com', 'superadmin123', UserRole.SUPER_ADMIN);
                  if (success) {
                    router.push('/superadmin');
                  } else {
                    setLoginError('Failed to login as super admin');
                  }
                  setIsSubmitting(false);
                }}
                className="py-2 px-4 border border-red-500 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  // Use Acme Corporation (ID: 1) as the default business
                  const success = await login(
                    'admin@acmecorporation.com', 
                    'password', 
                    UserRole.BUSINESS, 
                    '1'
                  );
                  if (success) {
                    router.push('/business');
                  } else {
                    setLoginError('Failed to login as business');
                  }
                  setIsSubmitting(false);
                }}
                className="py-2 px-4 border border-purple-500 rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Business Dashboard
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsSubmitting(true);
                  // Use Acme Corporation (ID: 1) as the default business for staff
                  const success = await login(
                    'staff@acmecorporation.com', 
                    'password', 
                    UserRole.STAFF, 
                    '1'
                  );
                  if (success) {
                    router.push('/staff');
                  } else {
                    setLoginError('Failed to login as staff');
                  }
                  setIsSubmitting(false);
                }}
                className="py-2 px-4 border border-blue-500 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Staff Dashboard
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {translate('dontHaveAccount')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/signup" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {translate('signUp')}
              </Link>
            </div>
          </div>
          
          {/* Developer Section for Business Credentials */}
          <div className="mt-8 border-t border-gray-300 dark:border-gray-600 pt-6">
            <button 
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2"
            >
              {showCredentials ? 'Hide Developer Info' : 'Show Developer Info'}
            </button>
            
            {showCredentials && (
              <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                <h3 className="font-medium mb-2">Available Business Credentials:</h3>
                <button
                  onClick={() => {
                    localStorage.removeItem('mockDatabaseInitialized');
                    const credentials = initMockDatabase();
                    setBusinessCredentials(credentials);
                  }}
                  className="mb-4 text-xs bg-indigo-600 text-white px-2 py-1 rounded"
                >
                  Reinitialize Database
                </button>
                
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Business</th>
                        <th className="px-2 py-1">Role</th>
                        <th className="px-2 py-1">Email</th>
                        <th className="px-2 py-1">Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businessCredentials.map((cred, index) => {
                        const business = sampleBusinesses.find(b => b.id === cred.businessId);
                        return (
                          <tr key={index} className="border-t border-gray-200 dark:border-gray-600">
                            <td className="px-2 py-1">{business?.name}</td>
                            <td className="px-2 py-1">{cred.role}</td>
                            <td className="px-2 py-1">{cred.email}</td>
                            <td className="px-2 py-1">{cred.password}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}