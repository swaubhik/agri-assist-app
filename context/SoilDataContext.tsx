import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SoilData } from './BluetoothContext';

// Extended soil data with location information
export interface SoilReading extends SoilData {
  id?: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Define context type
interface SoilDataContextType {
  recentReadings: SoilReading[];
  saveSoilReading: (reading: SoilReading) => Promise<void>;
  clearReadings: () => Promise<void>;
}

// Create the context
export const SoilDataContext = createContext<SoilDataContextType>({
  recentReadings: [],
  saveSoilReading: async () => {},
  clearReadings: async () => {},
});

// Storage key
const READINGS_STORAGE_KEY = 'farmer_assistant_readings';

export const SoilDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentReadings, setRecentReadings] = useState<SoilReading[]>([]);

  // Load readings from storage on mount
  useEffect(() => {
    const loadReadings = async () => {
      try {
        const storedReadings = await AsyncStorage.getItem(READINGS_STORAGE_KEY);
        if (storedReadings) {
          setRecentReadings(JSON.parse(storedReadings));
        }
      } catch (error) {
        console.error('Error loading soil readings:', error);
      }
    };

    loadReadings();
  }, []);

  // Save reading function
  const saveSoilReading = async (reading: SoilReading) => {
    try {
      // Ensure we have a timestamp
      if (!reading.timestamp) {
        reading.timestamp = new Date().toISOString();
      }
      
      // Add an id if it doesn't have one
      if (!reading.id) {
        reading.id = Math.random().toString(36).substring(2, 15);
      }
      
      // Add to recent readings (newest first)
      const updatedReadings = [reading, ...recentReadings];
      
      // Limit to 10 most recent readings
      const limitedReadings = updatedReadings.slice(0, 10);
      
      // Save to storage
      await AsyncStorage.setItem(READINGS_STORAGE_KEY, JSON.stringify(limitedReadings));
      
      // Update state
      setRecentReadings(limitedReadings);
    } catch (error) {
      console.error('Error saving soil reading:', error);
      throw new Error('Failed to save soil reading');
    }
  };

  // Clear readings function
  const clearReadings = async () => {
    try {
      await AsyncStorage.removeItem(READINGS_STORAGE_KEY);
      setRecentReadings([]);
    } catch (error) {
      console.error('Error clearing soil readings:', error);
      throw new Error('Failed to clear soil readings');
    }
  };

  return (
    <SoilDataContext.Provider
      value={{
        recentReadings,
        saveSoilReading,
        clearReadings,
      }}>
      {children}
    </SoilDataContext.Provider>
  );
};