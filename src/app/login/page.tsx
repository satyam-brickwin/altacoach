'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, sampleBusinesses, UserRole } from '@/contexts/AuthContext';
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

// Replace the existing loading check
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-gray-100/75 dark:bg-gray-900/75 flex items-center justify-center z-50 transition-opacity duration-300">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams?.get('registered') === 'true';
  const { login, isAuthenticated, isLoading, error: authError, user } = useAuth();

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

  // Get redirect path from URL if available
  const redirect = searchParams?.get('redirect') || '/';

  const getRedirectPath = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return '/superadmin';
      case UserRole.ADMIN:
        return '/admin';
      case UserRole.STAFF:
      case UserRole.USER:
        return '/staff';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = getRedirectPath(user.role);
      // Prefetch the destination page
      router.prefetch(redirectTo);
      // Use replace with shallow routing
      router.replace(redirectTo);
    }
  }, [isAuthenticated, user, router]);

  // Check for registration success message
  useEffect(() => {
    if (isRegistered) {
      setLoginSuccess(translations[language]?.registrationSuccess || translations.en.registrationSuccess);
    }
  }, [isRegistered, language]);

  // Update error state when auth context error changes
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  // Role selection handler
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowBusinessSelect(role === UserRole.BUSINESS || role === UserRole.STAFF);
  };

  // Login form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    setLoginError(null);
    setIsSubmitting(true);

    try {
      // Validate input before making the request
      if (!email?.trim() || !password?.trim()) {
        setLoginError(translate('invalidCredentials'));
        return;
      }

      // Prefetch potential redirect paths
      router.prefetch('/admin');
      router.prefetch('/staff');
      router.prefetch('/superadmin');

      const success = await login(
        email.trim(),
        password,
        selectedRole,
        selectedRole === UserRole.BUSINESS ? businessId : undefined
      );

      if (!success) {
        setLoginError(translate('invalidCredentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(translate('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine authentication checks
  const shouldShowLoading = isLoading || (isAuthenticated && user);

  if (shouldShowLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div 
      className={`
        min-h-screen bg-gray-50 dark:bg-gray-900 
        flex flex-col justify-center py-12 sm:px-6 lg:px-8 
        ${isDarkMode ? 'dark' : ''} 
        transition-colors duration-300 ease-in-out
      `}
    >
      <div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md 
        transition-transform duration-300 ease-in-out"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {translate('loginToAltaCoach')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {translate('welcomeBack')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-6 px-4 sm:py-8 sm:px-10 shadow sm:rounded-lg">
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
            {/* <div className="mb-6"> */}
              {/* <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {translate('language')}
              </label> */}
              {/* <select
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
              </select> */}
            {/* </div> */}

            {/* Role Selection */}
            <div className="mb-0">
              {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translate('selectRole')}
              </label> */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                {/* <button
                  type="button"
                  onClick={() => handleRoleSelect(UserRole.ADMIN)}
                  className={`${selectedRole === UserRole.ADMIN
                      ? 'bg-green-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } py-2 sm:py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {translate('admin')}
                </button> */}
                {/* <button
                  type="button"
                  onClick={() => handleRoleSelect(UserRole.STAFF)}
                  className={`${selectedRole === UserRole.STAFF
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } py-2 sm:py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {translate('staff')}
                </button> */}
                {/* <button
                  type="button"
                  onClick={() => handleRoleSelect(UserRole.SUPER_ADMIN)}
                  className={`${selectedRole === UserRole.SUPER_ADMIN
                      ? 'bg-red-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    } py-2 sm:py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {translate('super')}
                </button> */}
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
                  <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                    {translate('forgotPassword')}
                  </Link>
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
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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


            {/* Sign Up Link */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                {/* <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {translate('dontHaveAccount')}
                  </span>
                </div> */}
              </div>

              {/* Super Admin access button with matching Sign Up UI */}
              {/* <div className="mt-4">
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
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Super Admin Access
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}