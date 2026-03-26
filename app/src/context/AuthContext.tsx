import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sms_auth';
const USERS_KEY = 'sms_users';

// Default admin account
const DEFAULT_ADMIN = {
  id: 'admin-1',
  name: 'Administrator',
  email: 'admin@sinergimudastrategis.com',
  password: 'admin123',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default admin if no users exist
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }

    // Check for existing session
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setUser(session.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithoutPassword }));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: 'editor' as const,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithoutPassword }));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
