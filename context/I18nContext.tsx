import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from '../locales/en.json';

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
  // Add Hindi translations here
  hi: {
    // App
    appName: 'किसान सहायक',
    appTagline: 'बेहतर फसल के लिए स्मार्ट मिट्टी की निगरानी',

    // Auth
    login: 'लॉगिन',
    register: 'पंजीकरण',
    loginToAccount: 'अपने खाते में लॉगिन करें',
    createAccount: 'नया खाता बनाएं',
    name: 'पूरा नाम',
    phone: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    // Removed duplicate key to resolve error
    landSize: 'भूमि का आकार',
    enterName: 'अपना पूरा नाम दर्ज करें',
    enterPhone: 'अपना फोन नंबर दर्ज करें',
    enterPassword: 'अपना पासवर्ड दर्ज करें',
    enterLocation: 'अपना स्थान दर्ज करें',
    enterLandSizeInAcres: 'एकड़ में भूमि का आकार दर्ज करें',
    noAccount: 'खाता नहीं है?',
    alreadyHaveAccount: 'पहले से ही खाता है?',
    createOne: 'एक बनाएं',
    loginHere: 'यहां लॉगिन करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    mockLoginNotice: 'यह एक डेमो है। परीक्षण के लिए, आप डेमो खाते का उपयोग कर सकते हैं।',
    useDemoAccount: 'डेमो खाता उपयोग करें',
    allFieldsRequired: 'सभी फ़ील्ड आवश्यक हैं',
    requiredFieldsMissing: 'कृपया सभी आवश्यक फ़ील्ड भरें',
    registrationSuccess: 'पंजीकरण सफल',
    accountCreated: 'आपका खाता सफलतापूर्वक बनाया गया है। आप अब लॉगिन कर सकते हैं।',
    continue: 'जारी रखें',
    error: 'त्रुटि',
    unknownError: 'एक अज्ञात त्रुटि हुई',

    // Tabs
    home: 'होम',
    scan: 'स्कैन',
    recommendations: 'सिफारिशें',
    soilHealth: 'मिट्टी स्वास्थ्य',
    profile: 'प्रोफ़ाइल',

    // Home
    welcome: 'स्वागत, {{name}}',
    quickActions: 'त्वरित कार्य',
    scanSoil: 'मिट्टी स्कैन करें',
    viewRecommendations: 'सिफारिशें देखें',
    fieldMap: 'खेत का नक्शा',
    recentReadings: 'हाल की रीडिंग',
    noRecentReadings: 'कोई हालिया मिट्टी रीडिंग नहीं',
    takeReading: 'रीडिंग लें',
    dailyTips: 'दैनिक सुझाव',
    soilTipTitle: 'मिट्टी स्वास्थ्य अनुकूलन',
    soilTipText: 'नियमित मिट्टी परीक्षण आपकी फसलों के लिए सही पोषक तत्वों का निर्धारण करने में मदद करता है। सर्वोत्तम परिणामों के लिए प्रत्येक रोपण मौसम में कम से कम एक बार परीक्षण करें।',

    // Weather
    weather: 'मौसम',
    loadingWeather: 'मौसम डेटा लोड हो रहा है...',
    unableToFetchWeather: 'मौसम डेटा लाने में असमर्थ',
    unknownLocation: 'अज्ञात स्थान',
    location: 'स्थान',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    windSpeed: 'हवा की गति',
    condition: 'स्थिति',
    feels: 'महसूस होता है',
    wind: 'हवा',
    sunrise: 'सूर्योदय',
    rainfall: 'वृष्टि',
    sunset: 'सूर्यास्त',
    weatherForecast: 'मौसम पूर्वानुमान',
    // Scan
    soilScan: 'मिट्टी स्कैन',
    noDeviceConnected: 'कोई डिवाइस कनेक्ट नहीं है',
    connectedTo: '{{name}} से कनेक्ट है',
    disconnect: 'डिस्कनेक्ट',
    soilNutrients: 'मिट्टी के पोषक तत्व',
    read: 'डेटा पढ़ें',
    nitrogen: 'नाइट्रोजन',
    phosphorus: 'फॉस्फोरस',
    potassium: 'पोटेशियम',
    dataActions: 'डेटा कार्रवाई',
    saveData: 'डेटा सहेजें',
    viewOnMap: 'नक्शे पर देखें',
    share: 'साझा करें',
    locationNotAvailable: 'स्थान डेटा उपलब्ध नहीं है',
    refreshLocation: 'स्थान रीफ्रेश करें',
    loginRequired: 'लॉगिन आवश्यक है',
    noSoilData: 'जमा करने के लिए कोई मिट्टी डेटा उपलब्ध नहीं है',
    dataSaved: 'मिट्टी डेटा सफलतापूर्वक सहेजा गया',
    ok: 'ठीक है',
    submissionFailed: 'मिट्टी डेटा जमा करने में विफल',
    comingSoon: 'जल्द आ रहा है',
    featureNotAvailable: 'यह सुविधा अभी उपलब्ध नहीं है',

    // Bluetooth
    bluetoothWebNotSupported: 'वेब ब्राउज़र में ब्लूटूथ कार्यक्षमता समर्थित नहीं है',
    notSupported: 'समर्थित नहीं',
    availableDevices: 'उपलब्ध उपकरण',
    noDevicesFound: 'कोई उपकरण नहीं मिला',
    scanning: 'स्कैनिंग...',
    scanForDevices: 'उपकरणों के लिए स्कैन करें',
    connect: 'कनेक्ट करें',

    // Recommendations
    loadingRecommendations: 'सिफारिशें लोड हो रही हैं...',
    noRecommendationsTitle: 'अभी तक कोई सिफारिश नहीं',
    noRecommendationsDesc: 'अपने खेत के लिए व्यक्तिगत सिफारिशें प्राप्त करने के लिए पहले मिट्टी की रीडिंग लें।',
    all: 'सभी',
    crops: 'फसलें',
    fertilizers: 'उर्वरक',
    irrigation: 'सिंचाई',
    advisoryTips: 'सलाहकार सुझाव',
    advisoryTipsContent: 'अपनी मिट्टी में पोषक तत्वों के अवशोषण को अधिकतम करने के लिए, मिट्टी के तापमान को नियंत्रित करने और नमी बनाए रखने के लिए जैविक मल्च का उपयोग करने पर विचार करें।',
    learnMore: 'और जानें',

    // Crop types
    wheat: 'गेहूं',
    maize: 'मक्का',
    soybean: 'सोयाबीन',

    // Fertilizer types
    npk101010: 'एनपीके 10-10-10',
    urea: 'यूरिया',
    potassiumSulfate: 'पोटेशियम सल्फेट',

    // Fertilizer timing
    prePlanting: 'रोपण से पहले',
    midGrowth: 'मध्य विकास',
    flowering: 'फूल आना',

    // Irrigation days
    monday: 'सोमवार',
    thursday: 'गुरुवार',

    // Time of day
    morning: 'सुबह',
    evening: 'शाम',

    // Recommendations
    cropRecommendation: 'फसल सिफारिशें',
    suitableCrops: 'आपकी मिट्टी विश्लेषण के आधार पर, ये फसलें अच्छी तरह से उगेंगी:',
    fertilizerRecommendation: 'उर्वरक सिफारिशें',
    recommendedFertilizers: 'इष्टतम विकास के लिए इन उर्वरकों का प्रयोग करें:',
    irrigationRecommendation: 'सिंचाई सिफारिशें',
    irrigationPlanning: 'अनुशंसित सिंचाई अनुसूची:',

    // Soil Health
    soilHealthCard: 'मिट्टी स्वास्थ्य कार्ड',
    selectReading: 'रीडिंग चुनें',
    download: 'डाउनलोड',
    soilHealthHistory: 'मिट्टी स्वास्थ्य इतिहास',
    soilHealthHistoryDesc: 'ऐतिहासिक डेटा विज़ुअलाइज़ेशन के साथ देखें कि आपकी मिट्टी का स्वास्थ्य समय के साथ कैसे बदला है।',
    viewTrends: 'रुझान देखें',
    noReadingsTitle: 'कोई रीडिंग उपलब्ध नहीं',
    noReadingsDesc: 'मिट्टी स्वास्थ्य कार्ड बनाने के लिए अपनी पहली मिट्टी की रीडिंग लें।',

    // Sharing
    sharingNotSupportedWeb: 'वेब संस्करण में साझाकरण समर्थित नहीं है',
    noReadingToShare: 'साझा करने के लिए कोई रीडिंग उपलब्ध नहीं है',
    mock: 'डेमो मोड',
    pdfGenerationMock: 'एक उत्पादन ऐप में, यह साझा करने के लिए एक वास्तविक पीडीएफ बनाएगा',
    sharingNotAvailable: 'इस डिवाइस पर साझाकरण उपलब्ध नहीं है',
    sharingFailed: 'मिट्टी स्वास्थ्य कार्ड साझा करने में विफल',
    downloadMock: 'एक उत्पादन ऐप में, यह एक वास्तविक पीडीएफ डाउनलोड करेगा',

    // Profile
    editProfile: 'प्रोफ़ाइल संपादित करें',
    settings: 'सेटिंग्स',
    notifications: 'सूचनाएँ',
    language: 'भाषा',
    help: 'सहायता और समर्थन',
    contactSupport: 'समर्थन से संपर्क करें',
    logout: 'लॉगआउट',
    logoutConfirm: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    notSpecified: 'निर्दिष्ट नहीं',
    totalReadings: 'कुल रीडिंग',
    success: 'सफलता',
    profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट किया गया',
    profileUpdateFailed: 'प्रोफ़ाइल अपडेट करने में विफल',
  }
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