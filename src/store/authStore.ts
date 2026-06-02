import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User} from '@appTypes/api';
import {UserRole} from '@appTypes/navigation';

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (user, token) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
    set({user, token, role: user.role, isAuthenticated: true});
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    set({user: null, token: null, role: null, isAuthenticated: false});
  },

  restoreSession: async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
      ]);
      if (token && userStr) {
        const user: User = JSON.parse(userStr);
        set({user, token, role: user.role, isAuthenticated: true});
      }
    } finally {
      set({isLoading: false});
    }
  },

  setLoading: loading => set({isLoading: loading}),
}));
