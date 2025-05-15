import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import brx from '../locales/brx.json'; // Assuming you have a brx.json file for Bodo language

// Define available languages
export type Language = 'en' | 'hi';

// Define context type
interface I18nContextType {
  t: (key: string, options?: Record<string, any>) => string;
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
}

// Create the context
export const I18nContext = createContext<I18nContextType>({
  t: (key: string) => key,
  language: 'en',
  setLanguage: async () => { },
});

// Storage key
const LANGUAGE_STORAGE_KEY = 'farmer_assistant_language';

// Translations
const translations = {
  en,
  hi,
  brx
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const i18n = new I18n(translations);

  // Set initial locale based on device settings
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Try to get saved language preference
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;

        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
          setLanguageState(savedLanguage);
        } else {
          // If no saved preference, use device locale
          const deviceLocale = Localization.locale.split('-')[0];
          setLanguageState(deviceLocale === 'hi' ? 'hi' : 'en');
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        // Default to English on error
        setLanguageState('en');
      }
    };

    initLanguage();
  }, []);

  // Update i18n locale when language changes
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  // Function to set language
  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Translation function
  const t = (key: string, options?: Record<string, any>) => {
    return i18n.t(key, options);
  };

  return (
    <I18nContext.Provider
      value={{
        t,
        language,
        setLanguage,
      }}>
      {children}
    </I18nContext.Provider>
  );
};