'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/contexts/AuthContext';
import { useLanguage, languageLabels, SupportedLanguage } from '@/contexts/LanguageContext';

// Add translations for registration page
const translations = {
  en: {
    title: 'Create a new account',
    haveAccount: 'Or',
    signIn: 'sign in to your existing account',
    name: 'Full Name',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    company: 'Company (Optional)',
    language: 'Preferred Language',
    signUp: 'Sign up',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsMismatch: 'Passwords do not match',
    registrationFailed: 'Registration failed. Please try again.',
  },
  fr: {
    title: 'Créer un nouveau compte',
    haveAccount: 'Ou',
    signIn: 'connectez-vous à votre compte existant',
    name: 'Nom complet',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    company: 'Entreprise (Optionnel)',
    language: 'Langue préférée',
    signUp: "S'inscrire",
    nameRequired: 'Le nom est requis',
    emailRequired: "L'e-mail est requis",
    emailInvalid: "L'e-mail est invalide",
    passwordRequired: 'Le mot de passe est requis',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordsMismatch: 'Les mots de passe ne correspondent pas',
    registrationFailed: "L'inscription a échoué. Veuillez réessayer.",
  },
  de: {
    title: 'Neues Konto erstellen',
    haveAccount: 'Oder',
    signIn: 'melden Sie sich bei Ihrem bestehenden Konto an',
    name: 'Vollständiger Name',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    company: 'Unternehmen (Optional)',
    language: 'Bevorzugte Sprache',
    signUp: 'Registrieren',
    nameRequired: 'Name ist erforderlich',
    emailRequired: 'E-Mail ist erforderlich',
    emailInvalid: 'E-Mail ist ungültig',
    passwordRequired: 'Passwort ist erforderlich',
    passwordTooShort: 'Passwort muss mindestens 8 Zeichen lang sein',
    passwordsMismatch: 'Passwörter stimmen nicht überein',
    registrationFailed: 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
  },
  it: {
    title: 'Crea un nuovo account',
    haveAccount: 'O',
    signIn: 'accedi al tuo account esistente',
    name: 'Nome completo',
    email: 'Indirizzo email',
    password: 'Password',
    confirmPassword: 'Conferma password',
    company: 'Azienda (Opzionale)',
    language: 'Lingua preferita',
    signUp: 'Registrati',
    nameRequired: 'Il nome è obbligatorio',
    emailRequired: "L'email è obbligatoria",
    emailInvalid: "L'email non è valida",
    passwordRequired: 'La password è obbligatoria',
    passwordTooShort: 'La password deve contenere almeno 8 caratteri',
    passwordsMismatch: 'Le password non corrispondono',
    registrationFailed: 'Registrazione fallita. Per favore riprova.',
  },
  es: {
    title: 'Crear una nueva cuenta',
    haveAccount: 'O',
    signIn: 'inicia sesión en tu cuenta existente',
    name: 'Nombre completo',
    email: 'Dirección de correo',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    company: 'Empresa (Opcional)',
    language: 'Idioma preferido',
    signUp: 'Registrarse',
    nameRequired: 'El nombre es obligatorio',
    emailRequired: 'El correo es obligatorio',
    emailInvalid: 'El correo no es válido',
    passwordRequired: 'La contraseña es obligatoria',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
    passwordsMismatch: 'Las contraseñas no coinciden',
    registrationFailed: 'Registro fallido. Por favor, inténtalo de nuevo.',
  }
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: authLoading, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    preferredLanguage: language,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Get translations for the current language
  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    // Update the preferred language in the form when the global language changes
    setFormData((prev) => ({
      ...prev,
      preferredLanguage: language
    }));
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router, language]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }
    
    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 8) {
      newErrors.password = t.passwordTooShort;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.passwordsMismatch;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData);
      // No need to redirect here as the auth context will handle it
    } catch (error) {
      console.error('Registration error:', error);
      setErrors((prev) => ({
        ...prev,
        form: error instanceof Error ? error.message : t.registrationFailed,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setFormData((prev) => ({
      ...prev,
      preferredLanguage: lang
    }));
    setIsLanguageOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-bold text-blue-600">AltaCoach</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t.haveAccount}{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            {t.signIn}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {errors.form && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
              <p>{errors.form}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t.name}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.password}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t.confirmPassword}
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900`}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                {t.company}
              </label>
              <div className="mt-1">
                <input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="preferredLanguage" className="block text-sm font-medium text-gray-700">
                {t.language}
              </label>
              <div className="mt-1 relative">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  id="language-menu"
                  aria-haspopup="listbox"
                  aria-expanded={isLanguageOpen}
                >
                  <span className="block truncate">{languageLabels[formData.preferredLanguage as SupportedLanguage] || languageLabels.en}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
                {isLanguageOpen && (
                  <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10">
                    <ul 
                      className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                      tabIndex={-1}
                      role="listbox"
                      aria-labelledby="language-menu"
                    >
                      {Object.entries(languageLabels).map(([code, label]) => (
                        <li
                          key={code}
                          className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-50 ${
                            formData.preferredLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                          }`}
                          role="option"
                          aria-selected={formData.preferredLanguage === code}
                          onClick={() => handleLanguageChange(code as SupportedLanguage)}
                        >
                          <span className={`block truncate ${formData.preferredLanguage === code ? 'font-semibold' : 'font-normal'}`}>
                            {label}
                          </span>
                          {formData.preferredLanguage === code && (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || authLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoading || authLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {t.signUp}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 