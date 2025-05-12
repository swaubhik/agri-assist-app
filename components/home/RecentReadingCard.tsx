import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf, Calendar, MapPin, ArrowRight } from 'lucide-react-native';
import { SoilReading } from '@/context/SoilDataContext';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';

interface RecentReadingCardProps {
  reading: SoilReading;
}

export default function RecentReadingCard({ reading }: RecentReadingCardProps) {
  const t = useTranslation();
  const router = useRouter();
  
  const formattedDate = new Date(reading.timestamp).toLocaleDateString();
  const formattedTime = new Date(reading.timestamp).toLocaleTimeString();
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Leaf color={Colors.primary} size={18} style={styles.icon} />
          <Text style={styles.title}>{t('soilReading')}</Text>
        </View>
        <Text style={styles.timeInfo}>
          <Calendar color={Colors.text.secondary} size={12} style={styles.smallIcon} />
          {' '}{formattedDate} {formattedTime}
        </Text>
      </View>
      
      {reading.location && (
        <View style={styles.locationContainer}>
          <MapPin color={Colors.text.secondary} size={12} style={styles.smallIcon} />
          <Text style={styles.locationText}>
            {reading.location.latitude.toFixed(4)}, {reading.location.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      
      <View style={styles.nutrientContainer}>
        <View style={styles.nutrient}>
          <Text style={styles.nutrientLabel}>N</Text>
          <Text style={styles.nutrientValue}>{reading.nitrogen}</Text>
        </View>
        <View style={styles.nutrient}>
          <Text style={styles.nutrientLabel}>P</Text>
          <Text style={styles.nutrientValue}>{reading.phosphorus}</Text>
        </View>
        <View style={styles.nutrient}>
          <Text style={styles.nutrientLabel}>K</Text>
          <Text style={styles.nutrientValue}>{reading.potassium}</Text>
        </View>
        {reading.pH && (
          <View style={styles.nutrient}>
            <Text style={styles.nutrientLabel}>pH</Text>
            <Text style={styles.nutrientValue}>{reading.pH}</Text>
          </View>
        )}
        {reading.moisture && (
          <View style={styles.nutrient}>
            <Text style={styles.nutrientLabel}>{t('moisture')}</Text>
            <Text style={styles.nutrientValue}>{reading.moisture}%</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.viewButton}
        onPress={() => router.push('/soil-health')}>
        <Text style={styles.viewButtonText}>{t('viewDetails')}</Text>
        <ArrowRight color={Colors.primary} size={16} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  smallIcon: {
    marginRight: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  timeInfo: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  nutrientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.background.secondary,
  },
  nutrient: {
    alignItems: 'center',
  },
  nutrientLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  nutrientValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
});