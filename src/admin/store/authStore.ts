/**
 * Auth Store - Autenticación con Supabase
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { UserRole } from '../../lib/database.types';

interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  avatar_url?: string | null;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

// Usuarios demo para modo offline/desarrollo
const DEMO_USERS = [
  { email: 'admin@cincel.com', password: 'cincel2024', id: 'demo-1', nombre: 'Administrador', role: 'admin' as UserRole },
  { email: 'mauro@cincel.com', password: 'cincel2024', id: 'demo-2', nombre: 'Mauro', role: 'admin' as UserRole },
  { email: 'comercial@cincel.com', password: 'cincel2024', id: 'demo-3', nombre: 'Comercial', role: 'comercial' as UserRole },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Si Supabase está configurado, intentar auth real
        if (isSupabaseConfigured() && supabase) {
          try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (authError) {
              console.warn('Supabase Auth failed, trying demo mode:', authError.message);
              // Si falla Supabase Auth, intentar modo demo
              throw authError;
            }
            
            if (authData.user) {
              // Obtener perfil del usuario
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
              
              if (profileError) {
                console.warn('Error fetching profile, trying demo mode:', profileError.message);
                throw profileError;
              }
              
              const typedProfile = profile as unknown as UserProfile;
              
              const user: AuthUser = {
                id: typedProfile.id,
                email: typedProfile.email,
                nombre: typedProfile.name, // Map 'name' from DB to 'nombre' in store
                role: typedProfile.role as UserRole,
                avatar_url: typedProfile.avatar,
              };
              
              set({ user, isAuthenticated: true, isLoading: false });
              return true;
            }
          } catch (error) {
            console.warn('Supabase authentication failed, falling back to demo mode');
            // Continuar al modo demo en lugar de retornar false
          }
        }
        
        // Modo demo (sin Supabase o como fallback)
        const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (demoUser) {
          const { password: _, ...userWithoutPassword } = demoUser;
          set({ 
            user: userWithoutPassword, 
            isAuthenticated: true, 
            isLoading: false 
          });
          console.log('✅ Logged in using demo mode');
          return true;
        }
        
        set({ 
          error: 'Email o contraseña incorrectos',
          isLoading: false 
        });
        return false;
      },
      
      logout: async () => {
        if (isSupabaseConfigured() && supabase) {
          await supabase.auth.signOut();
        }
        set({ user: null, isAuthenticated: false, error: null });
      },
      
      checkSession: async () => {
        if (!isSupabaseConfigured() || !supabase) {
          // En modo demo, mantener la sesión del localStorage
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              const typedProfile = profile as unknown as UserProfile;
              set({
                user: {
                  id: typedProfile.id,
                  email: typedProfile.email,
                  nombre: typedProfile.name, // Map 'name' from DB to 'nombre' in store
                  role: typedProfile.role as UserRole,
                  avatar_url: typedProfile.avatar,
                },
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
          
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cincel-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
