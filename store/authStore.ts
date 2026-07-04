import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const AUTH_STORAGE_KEY = '@auth_user';
const USERS_STORAGE_KEY = '@registered_users';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

interface StoredUser {
  user: User;
  password: string;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  loadSession: async () => {
    try {
      const userJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (userJson) {
        const user: User = JSON.parse(userJson);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      const found = users.find(
        (u) => u.user.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!found) {
        return { success: false, error: 'Email o contraseña incorrectos' };
      }

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found.user));
      set({ user: found.user, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, error: 'Error inesperado. Intenta de nuevo.' };
    }
  },

  register: async (name: string, email: string, phone: string, password: string) => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];

      // Verificar si el email ya existe
      const exists = users.find(
        (u) => u.user.email.toLowerCase() === email.toLowerCase()
      );

      if (exists) {
        return { success: false, error: 'Ya existe una cuenta con ese email' };
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };

      const storedUser: StoredUser = { user: newUser, password };

      const updatedUsers = [...users, storedUser];
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));

      set({ user: newUser, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      console.error('Error al registrar:', error);
      return { success: false, error: 'Error inesperado. Intenta de nuevo.' };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  updateUser: async (updates: Partial<User>) => {
    try {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser = { ...currentUser, ...updates };

      // Actualizar en sesión
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

      // Actualizar en la lista de usuarios registrados
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];
      const updatedUsers = users.map((u) =>
        u.user.id === currentUser.id ? { ...u, user: updatedUser } : u
      );
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

      set({ user: updatedUser });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  },
}));
