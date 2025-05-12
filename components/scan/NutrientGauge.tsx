import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface NutrientGaugeProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
  icon?: React.ReactNode;
}

export default function NutrientGauge({
  title,
  value,
  maxValue,
  color,
  icon,
}: NutrientGaugeProps) {
  // Calculate percentage for gauge
  const percentage = Math.min(100, (value / maxValue) * 100);
  
  // Determine level text and color
  const getLevel = () => {
    if (percentage < 33) return { text: 'Low', color: '#FF5252' };
    if (percentage < 66) return { text: 'Medium', color: '#FFC107' };
    return { text: 'Good', color: '#4CAF50' };
  };
  
  const level = getLevel();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeBackground}>
          <View 
            style={[
              styles.gaugeProgress, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={[styles.level, { color: level.color }]}>
            {level.text}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 4,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  gaugeBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  gaugeProgress: {
    height: '100%',
    borderRadius: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  value: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: Colors.text.primary,
  },
  level: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});