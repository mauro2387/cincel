/**
 * Auth Store - Autenticación del Admin
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  error: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

// Usuarios hardcodeados (en producción usar API)
const USERS = [
  { id: '1', username: 'admin', password: 'cincel2024', name: 'Administrador', role: 'admin' as const },
  { id: '2', username: 'mauro', password: 'cincel2024', name: 'Mauro', role: 'admin' as const },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      
      login: (username: string, password: string) => {
        const user = USERS.find(u => u.username === username && u.password === password);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword, isAuthenticated: true, error: null });
          return true;
        }
        set({ error: 'Usuario o contraseña incorrectos' });
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'cincel-auth',
    }
  )
);
