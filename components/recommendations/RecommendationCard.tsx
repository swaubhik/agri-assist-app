import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Leaf, ArrowUpRight } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';

// Define recommendation interface
interface Recommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  items?: Array<{
    name: string;
    score?: number;
    image?: string;
    dosage?: string;
    timing?: string;
  }>;
  schedule?: Array<{
    day: string;
    amount: string;
    time: string;
  }>;
  totalWater?: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const t = useTranslation();
  
  const renderCropItems = () => {
    return recommendation.items?.map((item, index) => (
      <View key={index} style={styles.cropItem}>
        {item.image && (
          <Image 
            source={{ uri: item.image }} 
            style={styles.cropImage}
          />
        )}
        <View style={styles.cropInfo}>
          <Text style={styles.cropName}>{item.name}</Text>
          {item.score && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>{t('suitabilityScore')}</Text>
              <Text style={styles.scoreValue}>{item.score}%</Text>
            </View>
          )}
        </View>
      </View>
    ));
  };
  
  const renderFertilizerItems = () => {
    return recommendation.items?.map((item, index) => (
      <View key={index} style={styles.fertilizerItem}>
        <Text style={styles.fertilizerName}>{item.name}</Text>
        <View style={styles.fertilizerDetails}>
          {item.dosage && (
            <Text style={styles.fertilizerDetail}>
              <Text style={styles.detailLabel}>{t('dosage')}: </Text>
              {item.dosage}
            </Text>
          )}
          {item.timing && (
            <Text style={styles.fertilizerDetail}>
              <Text style={styles.detailLabel}>{t('timing')}: </Text>
              {item.timing}
            </Text>
          )}
        </View>
      </View>
    ));
  };
  
  const renderIrrigationSchedule = () => {
    return (
      <View style={styles.irrigationContainer}>
        <View style={styles.scheduleContainer}>
          {recommendation.schedule?.map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
              <Text style={styles.scheduleDay}>{item.day}</Text>
              <Text style={styles.scheduleAmount}>{item.amount}</Text>
              <Text style={styles.scheduleTime}>{item.time}</Text>
            </View>
          ))}
        </View>
        
        {recommendation.totalWater && (
          <View style={styles.totalWaterContainer}>
            <Text style={styles.totalWaterLabel}>{t('totalWeeklyWater')}</Text>
            <Text style={styles.totalWaterValue}>{recommendation.totalWater}</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Leaf color={Colors.primary} size={20} style={styles.icon} />
          <Text style={styles.title}>{recommendation.title}</Text>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <ArrowUpRight color={Colors.primary} size={16} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>{recommendation.description}</Text>
      
      {recommendation.category === 'crops' && renderCropItems()}
      {recommendation.category === 'fertilizers' && renderFertilizerItems()}
      {recommendation.category === 'irrigation' && renderIrrigationSchedule()}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
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
    marginRight: 8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
  },
  detailsButton: {
    padding: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  cropItem: {
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cropImage: {
    width: 80,
    height: 80,
  },
  cropInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cropName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  fertilizerItem: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  fertilizerName: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  fertilizerDetails: {
    marginTop: 4,
  },
  fertilizerDetail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    color: Colors.text.secondary,
  },
  irrigationContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  scheduleContainer: {
    padding: 12,
    backgroundColor: Colors.background.secondary,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scheduleDay: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  scheduleAmount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.accent,
    flex: 1,
    textAlign: 'center',
  },
  scheduleTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    textAlign: 'right',
  },
  totalWaterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primary,
  },
  totalWaterLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#fff',
  },
  totalWaterValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#fff',
  },
});