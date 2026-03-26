import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccessAdmin: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  register: (name: string, email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'sms_auth';
const USERS_KEY = 'sms_users';

const PRIMARY_ADMIN = {
  id: 'admin-utama-1',
  name: 'Admin Utama',
  email: 'romipaslah027@gmail.com',
  password: 'admin123',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
  isPrimaryAdmin: true,
  authProvider: 'local',
};

const DEMO_EDITOR = {
  id: 'editor-demo-1',
  name: 'Admin Demo',
  email: 'admin@sinergimudastrategis.com',
  password: 'admin123',
  role: 'editor' as const,
  createdAt: new Date().toISOString(),
  authProvider: 'local',
};

const sanitizeUser = (rawUser: any): User => {
  const { password: _password, ...userWithoutPassword } = rawUser;
  return userWithoutPassword;
};

const ensureDefaultUsers = (rawUsers: unknown) => {
  const users = Array.isArray(rawUsers) ? [...rawUsers] : [];

  const hasPrimaryAdmin = users.some(
    (item: any) => item?.email?.toLowerCase?.() === PRIMARY_ADMIN.email.toLowerCase()
  );
  const hasDemoEditor = users.some(
    (item: any) => item?.email?.toLowerCase?.() === DEMO_EDITOR.email.toLowerCase()
  );

  if (!hasPrimaryAdmin) {
    users.unshift(PRIMARY_ADMIN);
  }

  if (!hasDemoEditor) {
    users.push(DEMO_EDITOR);
  } else {
    return users.map((item: any) =>
      item?.email?.toLowerCase?.() === DEMO_EDITOR.email.toLowerCase()
        ? { ...item, role: 'editor' }
        : item
    );
  }

  return users;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const users = ensureDefaultUsers(JSON.parse(localStorage.getItem(USERS_KEY) || '[]'));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

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

    const userWithoutPassword = sanitizeUser(foundUser);
    setUser(userWithoutPassword);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userWithoutPassword }));
    return userWithoutPassword;
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    const { requestGoogleCredential } = await import('@/lib/google-auth');
    const profile = await requestGoogleCredential();

    if (!profile.email_verified) {
      return null;
    }

    const users = ensureDefaultUsers(JSON.parse(localStorage.getItem(USERS_KEY) || '[]'));
    const normalizedEmail = profile.email.trim().toLowerCase();
    const existingUser = users.find(
      (item: any) => item.email.toLowerCase() === normalizedEmail
    );

    let sessionUser: User;

    if (existingUser) {
      sessionUser = sanitizeUser(existingUser);
    } else {
      const newGoogleUser = {
        id: `google-${profile.sub}`,
        name: profile.name?.trim() || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: 'participant' as const,
        createdAt: new Date().toISOString(),
        authProvider: 'google',
        avatar: profile.picture,
      };

      users.push(newGoogleUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      sessionUser = sanitizeUser(newGoogleUser);
    }

    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: sessionUser }));
    return sessionUser;
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
      authProvider: 'local' as const,
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const userWithoutPassword = sanitizeUser(newUser);
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
        loginWithGoogle,
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
