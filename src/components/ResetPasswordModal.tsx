import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  language: string;
}

// Translations for the password reset modal
const translations = {
  en: {
    title: "Reset Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    submit: "Update Password",
    cancel: "Cancel",
    passwordRequirements: "Password must be at least 8 characters long, include a number, an uppercase letter, a lowercase letter, and a special character.",
    passwordsDontMatch: "Passwords don't match",
    currentPasswordRequired: "Current password is required",
    success: "Password updated successfully",
  },
  fr: {
    title: "Réinitialiser le mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    submit: "Mettre à jour le mot de passe",
    cancel: "Annuler",
    passwordRequirements: "Le mot de passe doit comporter au moins 8 caractères, inclure un chiffre, une lettre majuscule, une lettre minuscule et un caractère spécial.",
    passwordsDontMatch: "Les mots de passe ne correspondent pas",
    currentPasswordRequired: "Le mot de passe actuel est requis",
    success: "Mot de passe mis à jour avec succès",
  },
  de: {
    title: "Passwort zurücksetzen",
    currentPassword: "Aktuelles Passwort",
    newPassword: "Neues Passwort",
    confirmPassword: "Passwort bestätigen",
    submit: "Passwort aktualisieren",
    cancel: "Abbrechen",
    passwordRequirements: "Das Passwort muss mindestens 8 Zeichen lang sein und eine Zahl, einen Großbuchstaben, einen Kleinbuchstaben und ein Sonderzeichen enthalten.",
    passwordsDontMatch: "Passwörter stimmen nicht überein",
    currentPasswordRequired: "Aktuelles Passwort ist erforderlich",
    success: "Passwort erfolgreich aktualisiert",
  },
  it: {
    title: "Reimposta password",
    currentPassword: "Password attuale",
    newPassword: "Nuova password",
    confirmPassword: "Conferma password",
    submit: "Aggiorna password",
    cancel: "Annulla",
    passwordRequirements: "La password deve contenere almeno 8 caratteri, includere un numero, una lettera maiuscola, una lettera minuscola e un carattere speciale.",
    passwordsDontMatch: "Le password non corrispondono",
    currentPasswordRequired: "La password attuale è richiesta",
    success: "Password aggiornata con successo",
  },
  es: {
    title: "Restablecer contraseña",
    currentPassword: "Contraseña actual",
    newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    submit: "Actualizar contraseña",
    cancel: "Cancelar",
    passwordRequirements: "La contraseña debe tener al menos 8 caracteres, incluir un número, una letra mayúscula, una letra minúscula y un carácter especial.",
    passwordsDontMatch: "Las contraseñas no coinciden",
    currentPasswordRequired: "Se requiere la contraseña actual",
    success: "Contraseña actualizada con éxito",
  }
};

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  language = 'en' 
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations] || translations.en;

  // Password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Check if current password is provided
    if (!currentPassword.trim()) {
      setError(t.currentPasswordRequired);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDontMatch);
      return;
    }

    // Validate password strength
    if (!passwordRegex.test(newPassword)) {
      setError(t.passwordRequirements);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(currentPassword, newPassword);
      setSuccessMessage(t.success);
      
      // Reset form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t.title}</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.currentPassword}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.newPassword}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.confirmPassword}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#C72026] focus:border-[#C72026] dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t.passwordRequirements}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-[#C72026] text-white rounded-md text-sm hover:bg-[#C72026]/90 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                t.submit
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
