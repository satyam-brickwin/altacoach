'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define user roles
export enum UserRole {
  ADMIN = 'admin',
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
  const credentials = localStorage.getItem('mockBusinessCredentials');
  return credentials ? JSON.parse(credentials) : [];
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
  logout: async () => {},
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

    console.log('Login attempt:', { email, role, businessId });

    try {
      // For now, use mock data for development
      // In a real app, you would call an API endpoint
      if (email === 'admin@altacoach.com' && password === 'admin123') {
        const mockUser = {
          id: '1',
          name: 'Admin User',
          email: 'admin@altacoach.com',
          role: UserRole.ADMIN,
        };
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        console.log('Admin login successful:', mockUser);
        return true;
      } else if (email === 'user@example.com' && password === 'password') {
        const mockUser = {
          id: '2',
          name: 'Regular User',
          email: 'user@example.com',
          role: UserRole.USER,
        };
        
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        console.log('User login successful:', mockUser);
        return true;
      } else if ((role === UserRole.BUSINESS || role === UserRole.STAFF) && businessId) {
        // Get business credentials from mock database
        const credentials = localStorage.getItem('mockBusinessCredentials');
        const businessCredentials: BusinessCredentials[] = credentials ? JSON.parse(credentials) : [];
        
        console.log('Checking business credentials:', businessCredentials);
        
        // Find matching credential
        const matchingCred = businessCredentials.find(cred => 
          cred.businessId === businessId && 
          cred.email === email && 
          cred.password === password &&
          cred.role === role
        );
        
        if (matchingCred) {
          // Find the business by ID
          const business = sampleBusinesses.find(b => b.id === businessId);
          if (!business) {
            setError('Business not found');
            setIsLoading(false);
            console.log('Business not found for ID:', businessId);
            return false;
          }
          
          const mockUser = {
            id: role === UserRole.BUSINESS ? '3' : '4',
            name: `${business.name} ${role === UserRole.BUSINESS ? 'Admin' : 'Staff'}`,
            email,
            role,
            businessId
          };
          
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          setUser(mockUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          console.log('Business/Staff login successful:', mockUser);
          return true;
        } else {
          // For demo purposes, still allow login with dummy password if no matching credential
          if (password === 'password') {
            // Find the business by ID
            const business = sampleBusinesses.find(b => b.id === businessId);
            if (!business) {
              setError('Business not found');
              setIsLoading(false);
              console.log('Business not found for ID:', businessId);
              return false;
            }
            
            const mockUser = {
              id: role === UserRole.BUSINESS ? '3' : '4',
              name: `${business.name} ${role === UserRole.BUSINESS ? 'Admin' : 'Staff'}`,
              email,
              role,
              businessId
            };
            
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            setUser(mockUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            console.log('Business/Staff login with dummy password successful:', mockUser);
            return true;
          }
          
          setError('Invalid credentials');
          setIsLoading(false);
          console.log('Invalid credentials');
          return false;
        }
      } else {
        setError('Invalid email or password');
        setIsLoading(false);
        console.log('Invalid email or password');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setIsLoading(false);
      return false;
    }
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