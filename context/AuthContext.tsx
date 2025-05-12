import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Mock login function
  const login = async (phone: string, password: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // For demo, simulate a delay and mock response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (phone === 'demo' && password === 'password') {
        const userData: User = {
          id: '12345',
          name: 'Demo Farmer',
          phone: '9876543210',
          location: 'Punjab, India',
          landSize: '5 acres',
        };
        
        // Save to storage
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        return;
      }
      
      // Mock any phone number and password combo will work for demo
      const userData: User = {
        id: Math.random().toString(36).substring(2, 15),
        name: 'Farmer User',
        phone,
        location: '',
        landSize: '',
      };
      
      // Save to storage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (params: RegisterParams) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      // For demo, simulate a delay and create a mock user
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: Math.random().toString(36).substring(2, 15),
        name: params.name,
        phone: params.phone,
        location: params.location,
        landSize: params.landSize,
      };
      
      // Save to storage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};