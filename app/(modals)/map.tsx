import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useSoilData } from '@/hooks/useSoilData';
import Colors from '@/constants/Colors';
import Header from '@/components/ui/Header';
import { Map as MapIcon, Navigation } from 'lucide-react-native';

export default function MapScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { recentReadings } = useSoilData();
  
  return (
    <View style={styles.container}>
      <Header
        title={t('fieldMap')}
        onBackPress={() => router.back()}
      />
      
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1482777/pexels-photo-1482777.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
          style={styles.mapImage}
        />
        
        {recentReadings.map((reading, index) => (
          reading.location && (
            <View 
              key={index}
              style={[
                styles.mapPin,
                {
                  // Position pins based on "random" locations for demo
                  // In a real app, these would be calculated from GPS coordinates
                  top: `${20 + index * 15}%`,
                  left: `${30 + (index % 3) * 20}%`
                }
              ]}>
              <View 
                style={[
                  styles.pinDot,
                  { backgroundColor: index === 0 ? Colors.primary : Colors.secondary }
                ]} 
              />
              {index === 0 && (
                <View style={styles.pinInfo}>
                  <Text style={styles.pinText}>
                    N: {reading.nitrogen}, P: {reading.phosphorus}, K: {reading.potassium}
                  </Text>
                  <Text style={styles.pinDate}>
                    {new Date(reading.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )
        ))}
      </View>
      
      <View style={styles.mapOverlay}>
        <Text style={styles.overlayTitle}>{t('soilReadingLocations')}</Text>
        <Text style={styles.overlayDescription}>
          {t('mapDescription')}
        </Text>
        
        <View style={styles.pinLegend}>
          <View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>{t('latestReading')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
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
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  pinInfo: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    width: 140,
  },
  pinText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.text.primary,
  },
  pinDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 2,
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