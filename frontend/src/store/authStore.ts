import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  business_setup_completed?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  setToken: (token: string) => void;
  completeBusinessSetup: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: 1,
        email: 'test@businesspilot.ai',
        full_name: 'Test User',
        role: 'admin',
        business_setup_completed: false
      },
      token: 'demo-token-123',
      setUser: (user, token) => set({ user, token }),
      setToken: (token) => set({ token }),
      completeBusinessSetup: () => set((state) => ({ 
        user: state.user ? { ...state.user, business_setup_completed: true } : null 
      })),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);