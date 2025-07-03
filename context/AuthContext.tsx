import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { loginApi, registerApi } from '../services/api'; // <-- Import your API functions

// Define user type
export interface User {
  id: string;
  name: string;
  phone: string;
  location?: string;
  landSize?: string;
}

interface RegisterParams {
  name: string;
  phone: string;
  password: string;
  password_confirmation: string; // <-- add this
  location?: string;
  landSize?: string;
}

// Define context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

// Storage keys
const USER_STORAGE_KEY = 'farmer_assistant_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // REAL login function using Laravel Sanctum API
  const login = async (phone: string, password: string) => {
    try {
      setLoading(true);
      const result = await loginApi(phone, password);
      if (result.success && result.user) {
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(result.user)
        );
        setUser(result.user);
      } else {
        throw new Error(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // REAL register function using Laravel Sanctum API
  const register = async (params: RegisterParams) => {
    try {
      setLoading(true);
      const result = await registerApi(params);
      if (result.success && result.user) {
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(result.user)
        );
        setUser(result.user);
      } else {
        throw new Error(
          result.message || 'Registration failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const updatedUser = { ...user, ...data };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
