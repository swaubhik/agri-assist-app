import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import Colors from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { Navigation } from 'lucide-react-native';
import { getUserSoilReadings } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function MapScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      if (!user?.id) return;
      setLoading(true);
      const result = await getUserSoilReadings(user.id);
      if (result.success && Array.isArray(result.data)) {
        setReadings(result.data);
      } else {
        setReadings([]);
      }
      setLoading(false);
    };
    fetchReadings();
  }, [user?.id]);

  // Find the first reading with valid coordinates for initial region
  const firstValid = readings.find(
    (r) =>
      r.latitude &&
      r.longitude &&
      !isNaN(Number(r.latitude)) &&
      !isNaN(Number(r.longitude))
  );
  const initialRegion = firstValid
    ? {
        latitude: parseFloat(firstValid.latitude),
        longitude: parseFloat(firstValid.longitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 26.5,
        longitude: 90.5,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

  return (
    <View style={styles.container}>
      <Header title={t('fieldMap')} onBackPress={() => router.back()} />

      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
          >
            {readings
              .filter(
                (r) =>
                  r.latitude &&
                  r.longitude &&
                  !isNaN(Number(r.latitude)) &&
                  !isNaN(Number(r.longitude))
              )
              .map((reading, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: parseFloat(reading.latitude),
                    longitude: parseFloat(reading.longitude),
                  }}
                  pinColor={index === 0 ? Colors.primary : Colors.secondary}
                  title={`N: ${reading.nitrogen}, P: ${reading.phosphorus}, K: ${reading.potassium}`}
                  description={new Date(
                    reading.timestamp ||
                      reading.reading_time ||
                      reading.created_at ||
                      ''
                  ).toLocaleDateString()}
                />
              ))}
          </MapView>
        )}
      </View>

      <View style={styles.mapOverlay}>
        <Text style={styles.overlayTitle}>{t('soilReadingLocations')}</Text>
        <Text style={styles.overlayDescription}>{t('mapDescription')}</Text>

        <View style={styles.pinLegend}>
          <View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.primary }]}
              />
              <Text style={styles.legendText}>{t('latestReading')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: Colors.secondary },
                ]}
              />
              <Text style={styles.legendText}>{t('previousReadings')}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.navigationButton}>
            <Navigation color="#fff" size={16} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>{t('directions')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
  },
  overlayTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  overlayDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  pinLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  navigationButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
});
