import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Cloud, Wind, Thermometer, Droplets, MapPin } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import * as Location from 'expo-location';
import axios from 'axios';

// OpenWeatherMap API key - In production, this should be in environment variables
const WEATHER_API_KEY = '8d2de98e089f1c28e1a22fc19a24ef04';

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
}

export default function WeatherCard() {
  const t = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // Fetch weather data from OpenWeatherMap API
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );

      const data = response.data;
      setWeather({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        icon: data.weather[0].icon,
        location: data.name
      });
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card style={styles.loadingCard}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('loadingWeather')}</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.errorCard}>
        <Cloud color={Colors.error} size={24} />
        <Text style={styles.errorText}>{error}</Text>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.mainInfo}>
        <View style={styles.weatherInfo}>
          <View style={styles.locationContainer}>
            <MapPin color={Colors.text.secondary} size={16} style={styles.locationIcon} />
            <Text style={styles.location}>{weather.location}</Text>
          </View>
          <View style={styles.temperature}>
            <Text style={styles.tempValue}>{weather.temp}°C</Text>
            <Text style={styles.condition}>{weather.condition}</Text>
          </View>
          <Text style={styles.date}>
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
        
        <View style={styles.iconContainer}>
          <Image 
            source={{ 
              uri: `https://openweathermap.org/img/wn/${weather.icon}@4x.png`
            }}
            style={styles.weatherIcon}
          />
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Thermometer color={Colors.text.secondary} size={16} />
          <Text style={styles.detailLabel}>{t('feels')}</Text>
          <Text style={styles.detailValue}>{weather.temp}°C</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Wind color={Colors.text.secondary} size={16} />
          <Text style={styles.detailLabel}>{t('wind')}</Text>
          <Text style={styles.detailValue}>{weather.windSpeed} km/h</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Droplets color={Colors.text.secondary} size={16} />
          <Text style={styles.detailLabel}>{t('humidity')}</Text>
          <Text style={styles.detailValue}>{weather.humidity}%</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  loadingCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
  },
  temperature: {
    marginBottom: 4,
  },
  tempValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: Colors.text.primary,
  },
  condition: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  iconContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherIcon: {
    width: '100%',
    height: '100%',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    marginVertical: 4,
  },
  detailValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
});