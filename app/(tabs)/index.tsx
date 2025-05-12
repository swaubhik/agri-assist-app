import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { Leaf, Map, Bell, Scan, Cloud, Droplet } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import Card from '@/components/ui/Card';
import WeatherCard from '@/components/home/WeatherCard';
import RecentReadingCard from '@/components/home/RecentReadingCard';
import { useSoilData } from '@/hooks/useSoilData';
import { useEffect } from 'react';

export default function HomeScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { recentReadings } = useSoilData();
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, router]);

  if (!user) {
    return null; // Render nothing while redirecting
  }

  return (
    <View style={styles.container}>
      <Header
        title={t('welcome', { name: user.name.split(' ')[0] })}
        rightIcon={<Bell color={Colors.text.primary} size={24} />}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        
        <WeatherCard />
        
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => router.push('/scan')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
                <Scan color="#fff" size={24} />
              </View>
              <Text style={styles.actionText}>{t('scanSoil')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/recommendations')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
                <Leaf color="#fff" size={24} />
              </View>
              <Text style={styles.actionText}>{t('viewRecommendations')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/soil-health')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.accent }]}>
                <Cloud color="#fff" size={24} />
              </View>
              <Text style={styles.actionText}>{t('soilHealth')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(modals)/map')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.tertiary }]}>
                <Map color="#fff" size={24} />
              </View>
              <Text style={styles.actionText}>{t('fieldMap')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.readingsContainer}>
          <Text style={styles.sectionTitle}>{t('recentReadings')}</Text>
          {recentReadings.length > 0 ? (
            recentReadings.map((reading, index) => (
              <RecentReadingCard key={index} reading={reading} />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Droplet color={Colors.text.secondary} size={36} />
              <Text style={styles.emptyText}>{t('noRecentReadings')}</Text>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={() => router.push('/scan')}>
                <Text style={styles.scanButtonText}>{t('takeReading')}</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>{t('dailyTips')}</Text>
          <Card style={styles.tipCard}>
            <Text style={styles.tipTitle}>{t('soilTipTitle')}</Text>
            <Text style={styles.tipText}>{t('soilTipText')}</Text>
          </Card>
        </View>
        
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
  actionsContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  readingsContainer: {
    marginVertical: 16,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginVertical: 12,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  scanButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
  tipsContainer: {
    marginVertical: 16,
  },
  tipCard: {
    padding: 16,
  },
  tipTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});