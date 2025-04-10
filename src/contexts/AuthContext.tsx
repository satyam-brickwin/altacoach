'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define user roles
export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin', // Add SUPER_ADMIN role
  USER = 'user',
  BUSINESS = 'business',
  STAFF = 'staff'
}

// Sample business data for demo purposes
export const sampleBusinesses = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'Globex Industries' },
  { id: '3', name: 'Wayne Enterprises' },
  { id: '4', name: 'Stark Industries' }
];

// Mock database for credentials
interface BusinessCredentials {
  businessId: string;
  email: string;
  password: string;
  role: UserRole;
}

// Initialize mock database
export const initMockDatabase = () => {
  // Check if database is already initialized
  const dbInitialized = localStorage.getItem('mockDatabaseInitialized');

  if (!dbInitialized) {
    console.log('Initializing mock business credentials database...');

    // Create sample business credentials
    const businessCredentials: BusinessCredentials[] = [];

    // Add super admin credentials - this is new
    businessCredentials.push({
      businessId: '', // Super admin doesn't belong to a specific business
      email: 'anupam.rai@brickwin.net',
      password: 'brickwin@123',
      role: UserRole.SUPER_ADMIN
    });

    // Add admin credentials - this is new
    businessCredentials.push({
      businessId: '', // Regular admin doesn't belong to a specific business
      email: 'admin@altacoach.com',
      password: 'admin123',
      role: UserRole.ADMIN
    });

    // Add sample business admin credentials
    sampleBusinesses.forEach(business => {
      businessCredentials.push({
        businessId: business.id,
        email: `admin@${business.name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'password',
        role: UserRole.BUSINESS
      });

      // Add sample staff credentials for each business
      businessCredentials.push({
        businessId: business.id,
        email: `staff@${business.name.toLowerCase().replace(/\s+/g, '')}.com`,
        password: 'password',
        role: UserRole.STAFF
      });
    });

    // Store in localStorage
    localStorage.setItem('mockBusinessCredentials', JSON.stringify(businessCredentials));
    localStorage.setItem('mockDatabaseInitialized', 'true');

    console.log('Mock database initialized with credentials:', businessCredentials);
    return businessCredentials;
  }

  // Return existing credentials
};

// Define user type
interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  businessId?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole, businessId?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => { },
  error: null,
});

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize mock database on component mount
  useEffect(() => {
    initMockDatabase();
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For now, use mock data for development
        // In a real app, you would fetch the user from an API
        const mockUser = localStorage.getItem('mockUser');

        if (mockUser) {
          setUser(JSON.parse(mockUser));
          setIsAuthenticated(true);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, role?: UserRole, businessId?: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      // Mock login for local testing
      if (
        (email === 'admin@altacoach.com' && password === 'admin123' && role === UserRole.ADMIN) ||
        (email === 'staff@acmecorporation.com' && password === 'password' && role === UserRole.STAFF)
      ) {
        const mockUser = {
          id: Date.now().toString(),
          name: role === UserRole.ADMIN ? 'Admin User' : 'Staff User',
          email,
          role,
          businessId: role === UserRole.STAFF ? businessId : undefined,
        };

        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }

      // Fallback to API call for other cases
      console.log('Logging in with', email, password);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', res.status);
      const data = await res.json();

      if (res.ok && data.success) {
        const loggedInUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          businessId: data.user.businessId,
        };

        localStorage.setItem('mockUser', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error');
    }

    setIsLoading(false);
    return false;
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear localStorage first
      localStorage.removeItem('mockUser');

      // Update state
      setUser(null);
      setIsAuthenticated(false);

      // Use window.location for more reliable navigation
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
      // Ensure navigation happens even on error
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Custom hook to protect routes
export function useAuthProtection(allowedRoles: UserRole[] = []) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Use a ref to track if this hook has been used before
  const initialRenderRef = React.useRef(true);

  // Stringify allowedRoles for stable dependencies
  const rolesKey = JSON.stringify(allowedRoles);

  useEffect(() => {
    console.log(`[useAuthProtection] Effect running for path: ${pathname}, isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`);

    // Skip if still loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('[useAuthProtection] Not authenticated, redirecting to login');
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      return;
    }

    // If no roles specified, any authenticated user is allowed
    if (allowedRoles.length === 0) {
      console.log('[useAuthProtection] No roles specified, user is authorized');
      setIsAuthorized(true);
      return;
    }

    // Check if user has an allowed role
    if (user && allowedRoles.includes(user.role)) {
      console.log('[useAuthProtection] User authorized:', {
        role: user.role,
        allowedRoles,
        path: pathname
      });
      setIsAuthorized(true);
    } else {
      console.log('[useAuthProtection] User unauthorized:', {
        userRole: user?.role,
        allowedRoles,
        path: pathname
      });
      // Redirect to unauthorized page
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLoading, user, router, pathname, rolesKey]);

  return { isLoading, isAuthenticated, user, isAuthorized };
}