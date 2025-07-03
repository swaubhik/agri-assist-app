import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useSoilData } from '@/hooks/useSoilData';
import Colors from '@/constants/Colors';
import Card from '@/components/ui/Card';
import {
  Share2,
  PlusCircle,
  BarChart3,
  FileDown,
  Leaf,
} from 'lucide-react-native';
import SoilHealthCard from '@/components/soil-health/SoilHealthCard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getUserSoilReadings } from '@/services/api';

export default function SoilHealthScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [recentReadings, setRecentReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReadingIndex, setSelectedReadingIndex] = useState(0);

  const selectedReading = recentReadings[selectedReadingIndex];

  const fetchReadings = async () => {
    if (!user?.id) return;
    setLoadingReadings(true);
    const result = await getUserSoilReadings(user.id);
    if (result.success && Array.isArray(result.data)) {
      setRecentReadings(result.data);
    } else {
      setRecentReadings([]);
    }
    setLoadingReadings(false);
  };

  useEffect(() => {
    fetchReadings();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReadings();
    setRefreshing(false);
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(t('notSupported'), t('sharingNotSupportedWeb'));
      return;
    }

    if (!selectedReading) {
      Alert.alert(t('error'), t('noReadingToShare'));
      return;
    }

    try {
      // In a real app, we'd generate a PDF or image here
      const pdfUrl = FileSystem.documentDirectory + 'soil-health-card.pdf';

      // This is a mock - in a real app, you'd generate a real PDF
      Alert.alert(t('mock'), t('pdfGenerationMock'));

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(pdfUrl);
      } else {
        Alert.alert(t('error'), t('sharingNotAvailable'));
      }
    } catch (error) {
      console.error('Error sharing soil health card:', error);
      Alert.alert(t('error'), t('sharingFailed'));
    }
  };

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <View style={styles.container}>
      <Header title={t('soilHealthCard')} showBackButton={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {recentReadings.length > 0 ? (
          <>
            <View style={styles.readingSelector}>
              <Text style={styles.selectorTitle}>{t('selectReading')}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.readingsList}
              >
                {recentReadings.map((reading, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.readingItem,
                      selectedReadingIndex === index &&
                        styles.selectedReadingItem,
                    ]}
                    onPress={() => setSelectedReadingIndex(index)}
                  >
                    <Text
                      style={[
                        styles.readingDate,
                        selectedReadingIndex === index &&
                          styles.selectedReadingDate,
                      ]}
                    >
                      {new Date(reading.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedReading && (
              <>
                <SoilHealthCard
                  reading={selectedReading}
                  userName={user.name}
                />

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                  >
                    <Share2 color={Colors.primary} size={20} />
                    <Text style={styles.actionText}>{t('share')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      Alert.alert(t('mock'), t('downloadMock'));
                    }}
                  >
                    <FileDown color={Colors.primary} size={20} />
                    <Text style={styles.actionText}>{t('download')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/recommendations')}
                  >
                    <BarChart3 color={Colors.primary} size={20} />
                    <Text style={styles.actionText}>
                      {t('viewRecommendations')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Card style={styles.historyCard}>
                  <Text style={styles.historyTitle}>
                    {t('soilHealthHistory')}
                  </Text>
                  <Text style={styles.historyDescription}>
                    {t('soilHealthHistoryDesc')}
                  </Text>
                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => router.push('/(modals)/soil-trends')}
                  >
                    <Text style={styles.historyButtonText}>
                      {t('viewTrends')}
                    </Text>
                  </TouchableOpacity>
                </Card>
              </>
            )}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Leaf color={Colors.text.secondary} size={48} />
            <Text style={styles.emptyTitle}>{t('noReadingsTitle')}</Text>
            <Text style={styles.emptyText}>{t('noReadingsDesc')}</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/scan')}
            >
              <PlusCircle color="#fff" size={18} style={styles.buttonIcon} />
              <Text style={styles.scanButtonText}>{t('takeReading')}</Text>
            </TouchableOpacity>
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
  readingSelector: {
    marginBottom: 16,
  },
  selectorTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  readingsList: {
    paddingVertical: 4,
    gap: 8,
  },
  readingItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
  },
  selectedReadingItem: {
    backgroundColor: Colors.primary,
  },
  readingDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  selectedReadingDate: {
    color: '#fff',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    padding: 16,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  historyCard: {
    padding: 16,
    marginTop: 8,
  },
  historyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  historyDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  historyButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  historyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginVertical: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  scanButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
});
