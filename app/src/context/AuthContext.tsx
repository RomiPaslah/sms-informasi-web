import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, ApiError, type ApiUser } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccessAdmin: boolean;
  login: (email: string, password: string) => Promise<{ user: User | null; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  promoteUserToAdmin: (email: string) => Promise<boolean>;
  approveUser: (email: string) => Promise<boolean>;
  rejectUser: (email: string) => Promise<boolean>;
  changePassword: (email: string, newPassword: string, currentPassword?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function apiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    approved: apiUser.approved,
    createdAt: apiUser.createdAt,
    authProvider: (apiUser.authProvider as 'local') ?? 'local',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    authApi.me()
      .then(({ user: apiUser }) => {
        if (apiUser) setUser(apiUserToUser(apiUser));
      })
      .catch(() => {
        // No session or network error
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ user: User | null; error?: string }> => {
    try {
      const { user: apiUser } = await authApi.login(email, password);
      const u = apiUserToUser(apiUser);
      setUser(u);
      return { user: u };
    } catch (err) {
      if (err instanceof ApiError) {
        return { user: null, error: err.message };
      }
      return { user: null, error: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authApi.register(name, email, password);
      return { success: true, message: res.message };
    } catch (err) {
      if (err instanceof ApiError) {
        return { success: false, message: err.message };
      }
      return { success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  };

  const promoteUserToAdmin = async (email: string): Promise<boolean> => {
    try {
      await authApi.promoteUser(email);
      return true;
    } catch {
      return false;
    }
  };

  const approveUser = async (email: string): Promise<boolean> => {
    try {
      await authApi.approveUser(email);
      return true;
    } catch {
      return false;
    }
  };

  const rejectUser = async (email: string): Promise<boolean> => {
    try {
      await authApi.rejectUser(email);
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (
    email: string,
    newPassword: string,
    currentPassword?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await authApi.changePassword(email, newPassword, currentPassword);
      return { success: true, message: res.message };
    } catch (err) {
      if (err instanceof ApiError) {
        return { success: false, message: err.message };
      }
      return { success: false, message: 'Terjadi kesalahan saat mengubah password.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
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
        promoteUserToAdmin,
        approveUser,
        rejectUser,
        changePassword,
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
