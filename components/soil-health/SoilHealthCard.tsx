import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Leaf } from 'lucide-react-native';
import { SoilReading } from '@/context/SoilDataContext';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';

interface SoilHealthCardProps {
  reading: SoilReading;
  userName: string;
}

export default function SoilHealthCard({ reading, userName }: SoilHealthCardProps) {
  const t = useTranslation();
  
  // Define health ratings based on nutrient levels
  const getNitrogenRating = (value: number) => {
    if (value < 30) return { text: t('low'), color: '#FF5252' };
    if (value < 60) return { text: t('medium'), color: '#FFC107' };
    return { text: t('high'), color: '#4CAF50' };
  };
  
  const getPhosphorusRating = (value: number) => {
    if (value < 25) return { text: t('low'), color: '#FF5252' };
    if (value < 50) return { text: t('medium'), color: '#FFC107' };
    return { text: t('high'), color: '#4CAF50' };
  };
  
  const getPotassiumRating = (value: number) => {
    if (value < 35) return { text: t('low'), color: '#FF5252' };
    if (value < 70) return { text: t('medium'), color: '#FFC107' };
    return { text: t('high'), color: '#4CAF50' };
  };
  
  const getPHRating = (value: number | undefined) => {
    if (!value) return { text: t('notMeasured'), color: Colors.text.secondary };
    if (value < 5.5) return { text: t('acidic'), color: '#FF5252' };
    if (value > 7.5) return { text: t('alkaline'), color: '#2196F3' };
    return { text: t('neutral'), color: '#4CAF50' };
  };
  
  // Overall soil health score calculation (0-100)
  const calculateOverallScore = () => {
    const nScore = (reading.nitrogen / 100) * 33;
    const pScore = (reading.phosphorus / 100) * 33;
    const kScore = (reading.potassium / 100) * 33;
    
    // Calculate with pH if available
    let phScore = 0;
    if (reading.pH) {
      const phOptimal = 6.5; // Optimal pH
      const phFactor = 1 - Math.min(Math.abs(reading.pH - phOptimal) / 3, 1);
      phScore = phFactor * 10;
    }
    
    return Math.min(100, Math.round(nScore + pScore + kScore + phScore));
  };
  
  const overallScore = calculateOverallScore();
  
  const getOverallRating = () => {
    if (overallScore < 40) return { text: t('poor'), color: '#FF5252' };
    if (overallScore < 70) return { text: t('moderate'), color: '#FFC107' };
    return { text: t('excellent'), color: '#4CAF50' };
  };
  
  const overallRating = getOverallRating();
  const nitrogenRating = getNitrogenRating(reading.nitrogen);
  const phosphorusRating = getPhosphorusRating(reading.phosphorus);
  const potassiumRating = getPotassiumRating(reading.potassium);
  const phRating = getPHRating(reading.pH);
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Leaf color={Colors.primary} size={24} style={styles.icon} />
          <View>
            <Text style={styles.title}>{t('soilHealthCard')}</Text>
            <Text style={styles.subtitle}>{t('issuedTo', { name: userName })}</Text>
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(reading.timestamp).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreValue}>{overallScore}</Text>
          <Text style={[styles.scoreRating, { color: overallRating.color }]}>
            {overallRating.text}
          </Text>
        </View>
        <View style={styles.scoreDetails}>
          <Text style={styles.scoreTitle}>{t('soilHealthScore')}</Text>
          <Text style={styles.scoreDescription}>
            {t('scoreDescription')}
          </Text>
        </View>
      </View>
      
      <View style={styles.nutrientsContainer}>
        <Text style={styles.sectionTitle}>{t('nutrientLevels')}</Text>
        
        <View style={styles.nutrientRow}>
          <Text style={styles.nutrientName}>{t('nitrogen')} (N)</Text>
          <View style={styles.nutrientValue}>
            <View style={[styles.valueBar, {
              width: `${Math.min(100, reading.nitrogen)}%`,
              backgroundColor: nitrogenRating.color,
            }]} />
          </View>
          <Text style={styles.nutrientReading}>{reading.nitrogen}</Text>
          <Text style={[styles.nutrientStatus, { color: nitrogenRating.color }]}>
            {nitrogenRating.text}
          </Text>
        </View>
        
        <View style={styles.nutrientRow}>
          <Text style={styles.nutrientName}>{t('phosphorus')} (P)</Text>
          <View style={styles.nutrientValue}>
            <View style={[styles.valueBar, {
              width: `${Math.min(100, reading.phosphorus)}%`,
              backgroundColor: phosphorusRating.color,
            }]} />
          </View>
          <Text style={styles.nutrientReading}>{reading.phosphorus}</Text>
          <Text style={[styles.nutrientStatus, { color: phosphorusRating.color }]}>
            {phosphorusRating.text}
          </Text>
        </View>
        
        <View style={styles.nutrientRow}>
          <Text style={styles.nutrientName}>{t('potassium')} (K)</Text>
          <View style={styles.nutrientValue}>
            <View style={[styles.valueBar, {
              width: `${Math.min(100, reading.potassium)}%`,
              backgroundColor: potassiumRating.color,
            }]} />
          </View>
          <Text style={styles.nutrientReading}>{reading.potassium}</Text>
          <Text style={[styles.nutrientStatus, { color: potassiumRating.color }]}>
            {potassiumRating.text}
          </Text>
        </View>
        
        {reading.pH && (
          <View style={styles.nutrientRow}>
            <Text style={styles.nutrientName}>pH</Text>
            <View style={styles.nutrientValue}>
              <View style={[styles.valueBar, {
                width: `${(reading.pH / 14) * 100}%`,
                backgroundColor: phRating.color,
              }]} />
            </View>
            <Text style={styles.nutrientReading}>{reading.pH}</Text>
            <Text style={[styles.nutrientStatus, { color: phRating.color }]}>
              {phRating.text}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.recommendationsContainer}>
        <Text style={styles.sectionTitle}>{t('recommendations')}</Text>
        <View style={styles.recommendationItem}>
          <Text style={styles.recommendationTitle}>{t('fertilizerRecommendation')}</Text>
          <Text style={styles.recommendationText}>
            {nitrogenRating.text === t('low') ? t('applyNitrogenFertilizer') : 
             phosphorusRating.text === t('low') ? t('applyPhosphorusFertilizer') :
             potassiumRating.text === t('low') ? t('applyPotassiumFertilizer') :
             t('balancedFertilizer')}
          </Text>
        </View>
        
        <View style={styles.recommendationItem}>
          <Text style={styles.recommendationTitle}>{t('cropSuggestions')}</Text>
          <Text style={styles.recommendationText}>
            {overallRating.text === t('excellent') ? t('excellentCropSuggestion') :
             overallRating.text === t('moderate') ? t('moderateCropSuggestion') :
             t('poorCropSuggestion')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
    color: '#fff',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#fff',
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.text.primary,
  },
  scoreRating: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  scoreDetails: {
    flex: 1,
  },
  scoreTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  scoreDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  nutrientsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutrientName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    width: 100,
  },
  nutrientValue: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  valueBar: {
    height: '100%',
    borderRadius: 4,
  },
  nutrientReading: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    width: 40,
    textAlign: 'right',
    marginRight: 8,
  },
  nutrientStatus: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    width: 70,
    textAlign: 'right',
  },
  recommendationsContainer: {
    padding: 16,
  },
  recommendationItem: {
    marginBottom: 12,
  },
  recommendationTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recommendationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});