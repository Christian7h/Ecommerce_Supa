import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string; // 'admin' o 'customer'
}

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      error: null,
      
      initialize: async () => {
        set({ loading: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              set({
                user: {
                  id: user.id,
                  email: user.email!,
                  name: user.user_metadata.name,
                  role: user.user_metadata.role || 'customer',
                },
                session,
              });
            }
          }
          
          // Setup auth state change listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                set({
                  user: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata.name,
                    role: user.user_metadata.role || 'customer',
                  },
                  session,
                });
              }
            }
            
            if (event === 'SIGNED_OUT') {
              set({ user: null, session: null });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ error: 'Failed to initialize authentication' });
        } finally {
          set({ loading: false });
        }
      },
      
      login: async (email, password) => {
        set({ loading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          set({
            user: {
              id: data.user!.id,
              email: data.user!.email!,
              name: data.user!.user_metadata.name,
              role: data.user!.user_metadata.role || 'customer',
            },
            session: data.session,
          });
        } catch (error: unknown) {
          console.error('Login error:', error);
          let errorMessage = 'Failed to login';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },
      
      register: async (email, password, name, role = 'customer') => {
        set({ loading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { 
                name,
                role // Guardamos el rol en los metadatos de autenticación
              },
            },
          });
          
          if (error) throw error;
          
          if (data.user) {
            set({
              user: {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata.name,
                role: data.user.user_metadata.role || 'customer',
              },
              session: data.session,
            });
          }
        } catch (error: unknown) {
          console.error('Registration error:', error);
          let errorMessage = 'Failed to register';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },
      
      logout: async () => {
        set({ loading: true, error: null });
        
        try {
          await supabase.auth.signOut();
          set({ user: null, session: null });
        } catch (error: unknown) {
          console.error('Logout error:', error);
          let errorMessage = 'Failed to logout';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },
      
      updateProfile: async (data) => {
        set({ loading: true, error: null });
        
        try {
          const { error } = await supabase.auth.updateUser({
            data,
          });
          
          if (error) throw error;
          
          set({
            user: { ...get().user, ...data } as User,
          });
        } catch (error: unknown) {
          console.error('Profile update error:', error);
          let errorMessage = 'Failed to update profile';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'adidas-auth',
    }
  )
);