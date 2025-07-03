import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useSoilData } from '@/hooks/useSoilData';
import Colors from '@/constants/Colors';
import Card from '@/components/ui/Card';
import { Leaf, Droplet, FilterX, ArrowUpRight } from 'lucide-react-native';
import { getRecommendations } from '@/services/api';
import RecommendationCard from '@/components/recommendations/RecommendationCard';
import Markdown from 'react-native-markdown-display';

export default function RecommendationsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { recentReadings } = useSoilData();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && recentReadings.length > 0) {
      fetchRecommendations();
    }
  }, [user, recentReadings]);

  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await getRecommendations(user.id);
      if (response.success) {
        setRecommendations(response.data);
        // console.log('Fetched recommendations:', response.data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
  };

  // const filteredRecommendations = recommendations.filter((rec) => {
  //   if (selectedFilter === 'all') return true;
  //   return rec.category === selectedFilter;
  // });

  const mockRecommendations = [
    {
      id: '1',
      title: t('cropRecommendation'),
      category: 'crops',
      description: t('suitableCrops'),
      items: [
        {
          name: t('wheat'),
          score: 92,
          image:
            'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          name: t('maize'),
          score: 85,
          image:
            'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
        {
          name: t('soybean'),
          score: 78,
          image:
            'https://images.pexels.com/photos/5528991/pexels-photo-5528991.jpeg?auto=compress&cs=tinysrgb&w=800',
        },
      ],
    },
    {
      id: '2',
      title: t('fertilizerRecommendation'),
      category: 'fertilizers',
      description: t('recommendedFertilizers'),
      items: [
        { name: t('npk101010'), dosage: '120kg/ha', timing: t('prePlanting') },
        { name: t('urea'), dosage: '80kg/ha', timing: t('midGrowth') },
        {
          name: t('potassiumSulfate'),
          dosage: '40kg/ha',
          timing: t('flowering'),
        },
      ],
    },
    {
      id: '3',
      title: t('irrigationRecommendation'),
      category: 'irrigation',
      description: t('irrigationPlanning'),
      schedule: [
        { day: t('monday'), amount: '30mm', time: t('morning') },
        { day: t('thursday'), amount: '25mm', time: t('evening') },
      ],
      totalWater: '55mm/week',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title={t('recommendations')} showBackButton={false} />

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'all' && styles.filterTextActive,
              ]}
            >
              {t('all')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'crops' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('crops')}
          >
            <Leaf
              size={16}
              color={selectedFilter === 'crops' ? '#fff' : Colors.text.primary}
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'crops' && styles.filterTextActive,
              ]}
            >
              {t('crops')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'fertilizers' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('fertilizers')}
          >
            <FilterX
              size={16}
              color={
                selectedFilter === 'fertilizers' ? '#fff' : Colors.text.primary
              }
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'fertilizers' && styles.filterTextActive,
              ]}
            >
              {t('fertilizers')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'irrigation' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter('irrigation')}
          >
            <Droplet
              size={16}
              color={
                selectedFilter === 'irrigation' ? '#fff' : Colors.text.primary
              }
              style={styles.filterIcon}
            />
            <Text
              style={[
                styles.filterText,
                selectedFilter === 'irrigation' && styles.filterTextActive,
              ]}
            >
              {t('irrigation')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {t('loadingRecommendations')}
            </Text>
          </View>
        ) : recentReadings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Leaf color={Colors.text.secondary} size={48} />
            <Text style={styles.emptyTitle}>{t('noRecommendationsTitle')}</Text>
            <Text style={styles.emptyText}>{t('noRecommendationsDesc')}</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/scan')}
            >
              <Text style={styles.scanButtonText}>{t('takeReading')}</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {mockRecommendations
              .filter(
                (rec) =>
                  selectedFilter === 'all' || rec.category === selectedFilter
              )
              .map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
          </>
        )}

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>{t('advisoryTips')}</Text>
          <Text style={styles.tipsText}>{t('advisoryTipsContent')}</Text>
          <TouchableOpacity style={styles.learnMoreButton}>
            <Text style={styles.learnMoreText}>{t('learnMore')}</Text>
            <ArrowUpRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </Card>

        <ScrollView style={{ padding: 16 }}>
          <Markdown>{recommendations}</Markdown>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  filtersContainer: {
    backgroundColor: Colors.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 1,
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
  tipsCard: {
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  tipsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnMoreText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
});
