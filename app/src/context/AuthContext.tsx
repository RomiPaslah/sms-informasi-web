import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccessAdmin: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sms_auth';
const USERS_KEY = 'sms_users';

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
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
    }

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

  const login = async (email: string, password: string): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const normalizedEmail = email.trim().toLowerCase();
    const foundUser = users.find(
      (item: any) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!foundUser) {
      return null;
    }

    const { password: _password, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithoutPassword }));
    return userWithoutPassword;
  };

  const register = async (name: string, email: string, password: string): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((item: any) => item.email.toLowerCase() === normalizedEmail)) {
      return null;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'participant' as const,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithoutPassword }));
    return userWithoutPassword;
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
        canAccessAdmin: user?.role === 'admin' || user?.role === 'editor',
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
