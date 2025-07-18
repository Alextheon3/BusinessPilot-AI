import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  business_setup_completed?: boolean;
  business_name?: string;
  business_type?: string;
  avatar?: string;
  created_at?: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User, token: string) => void;
  setToken: (token: string) => void;
  completeBusinessSetup: () => void;
  logout: () => void;
  initializeAuth: () => void;
  mockLogin: (email?: string, password?: string) => Promise<void>;
}

// Default demo user for offline/development use
const defaultUser: User = {
  id: 1,
  email: 'test@businesspilot.ai',
  full_name: 'Αλέξανδρος Παπαδόπουλος',
  role: 'admin',
  business_setup_completed: true,
  business_name: 'Greek Business Demo',
  business_type: 'Retail',
  avatar: '🇬🇷',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString()
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: defaultUser,
      token: 'demo-token-123-persistent',
      isAuthenticated: true,
      isLoading: false,
      
      setUser: (user, token) => set({ 
        user: { ...user, last_login: new Date().toISOString() }, 
        token, 
        isAuthenticated: true,
        isLoading: false 
      }),
      
      setToken: (token) => set({ token }),
      
      completeBusinessSetup: () => set((state) => ({ 
        user: state.user ? { ...state.user, business_setup_completed: true } : null 
      })),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
      
      initializeAuth: () => {
        const state = get();
        if (!state.user || !state.token) {
          // Restore default user if no auth data exists
          set({
            user: defaultUser,
            token: 'demo-token-123-persistent',
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          set({
            isAuthenticated: true,
            isLoading: false
          });
        }
      },
      
      mockLogin: async (email = 'test@businesspilot.ai', password = 'testpassword123') => {
        set({ isLoading: true });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Always succeed with demo user for offline use
        const mockUser: User = {
          ...defaultUser,
          email,
          last_login: new Date().toISOString()
        };
        
        set({ 
          user: mockUser,
          token: `demo-token-${Date.now()}`,
          isAuthenticated: true,
          isLoading: false
        });
      }
    }),
    {
      name: 'auth-storage',
      // Ensure auth persists across sessions
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);