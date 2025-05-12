import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getLocation = async () => {
    if (Platform.OS === 'web') {
      setErrorMsg('Location services are limited in web environments');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setCurrentLocation(location);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg('Error getting location');
      console.error('Location error:', error);
    }
  };

  // Get location on mount (for non-web platforms)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      getLocation();
    }
  }, []);

  return {
    currentLocation,
    errorMsg,
    getLocation,
  };
}