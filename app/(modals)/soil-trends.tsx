import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Colors from '@/constants/Colors';
import { LineChart } from 'react-native-chart-kit';
import Card from '@/components/ui/Card';
import { getUserSoilReadings } from '@/services/api';

export default function SoilTrendsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user } = useAuth();

  type SoilReading = {
    nitrogen?: number | string;
    phosphorus?: number | string;
    potassium?: number | string;
    timestamp?: string;
    reading_time?: string;
    created_at?: string;
    // Add any other fields as needed
  };

  const [readings, setReadings] = useState<SoilReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchReadings();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadings();
    setRefreshing(false);
  };

  // Extract data for charts
  const labels = readings
    .slice()
    .reverse()
    .map((reading) => {
      const dateStr = reading.timestamp || reading.created_at || '';
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

  const nitrogenData = readings
    .slice()
    .reverse()
    .map((reading) => Number(reading.nitrogen ?? 0));
  const phosphorusData = readings
    .slice()
    .reverse()
    .map((reading) => Number(reading.phosphorus ?? 0));
  const potassiumData = readings
    .slice()
    .reverse()
    .map((reading) => Number(reading.potassium ?? 0));

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
      <Header title={t('soilTrends')} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.description}>{t('soilTrendsDescription')}</Text>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 32 }} />
        ) : readings.length > 1 ? (
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
              <Text style={styles.insightsText}>{t('trendInsights')}</Text>
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
