import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useSoilData } from '@/hooks/useSoilData';
import Header from '@/components/ui/Header';
import Colors from '@/constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import Card from '@/components/ui/Card';

export default function SoilTrendsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { recentReadings } = useSoilData();
  
  // Extract data for charts
  const labels = recentReadings
    .slice()
    .reverse()
    .map(reading => {
      const date = new Date(reading.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
  
  const nitrogenData = recentReadings
    .slice()
    .reverse()
    .map(reading => reading.nitrogen);
  
  const phosphorusData = recentReadings
    .slice()
    .reverse()
    .map(reading => reading.phosphorus);
  
  const potassiumData = recentReadings
    .slice()
    .reverse()
    .map(reading => reading.potassium);
  
  const chartWidth = Dimensions.get('window').width - 32;
  
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
    },
  };
  
  return (
    <View style={styles.container}>
      <Header
        title={t('soilTrends')}
        onBackPress={() => router.back()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        <Text style={styles.description}>
          {t('soilTrendsDescription')}
        </Text>
        
        {recentReadings.length > 1 ? (
          <>
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('nitrogenTrend')}</Text>
              <LineChart
                data={{
                  labels,
                  datasets: [
                    {
                      data: nitrogenData,
                      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                }}
                bezier
                style={styles.chart}
              />
            </Card>
            
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('phosphorusTrend')}</Text>
              <LineChart
                data={{
                  labels,
                  datasets: [
                    {
                      data: phosphorusData,
                      color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                }}
                bezier
                style={styles.chart}
              />
            </Card>
            
            <Card style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('potassiumTrend')}</Text>
              <LineChart
                data={{
                  labels,
                  datasets: [
                    {
                      data: potassiumData,
                      color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                }}
                bezier
                style={styles.chart}
              />
            </Card>
            
            <Card style={styles.insightsCard}>
              <Text style={styles.insightsTitle}>{t('soilInsights')}</Text>
              <Text style={styles.insightsText}>
                {t('trendInsights')}
              </Text>
            </Card>
          </>
        ) : (
          <Card style={styles.notEnoughDataCard}>
            <Text style={styles.notEnoughDataTitle}>{t('notEnoughData')}</Text>
            <Text style={styles.notEnoughDataText}>
              {t('needMoreReadings')}
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  insightsCard: {
    padding: 16,
    marginBottom: 16,
  },
  insightsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  insightsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  notEnoughDataCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notEnoughDataTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  notEnoughDataText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});