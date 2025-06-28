import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useSoilData } from '@/hooks/useSoilData';
import { useLocation } from '@/hooks/useLocation';
import Colors from '@/constants/Colors';
import { Bluetooth, RefreshCw, Leaf, Save, Share, Map, Droplet, Thermometer, CloudRain, Sun, FlaskConical, Gauge, Waves } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import NutrientGauge from '@/components/scan/NutrientGauge';
import Button from '@/components/ui/Button';
import DeviceList from '@/components/scan/DeviceList';
import { submitSoilData } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function ScanScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const {
    isScanning,
    connectedDevice,
    soilData,
    devices,
    scanForDevices,
    connectToDevice,
    disconnectFromDevice,
    readSoilData
  } = useBluetooth();
  const { saveSoilReading } = useSoilData();
  const { currentLocation, getLocation } = useLocation();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      getLocation();
    }
  }, []);

  const handleSubmitData = async () => {
    if (!user) {
      Alert.alert(t('error'), t('loginRequired'));
      return;
    }

    if (!soilData) {
      Alert.alert(t('error'), t('noSoilData'));
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting soil data:', soilData);
      const dataToSubmit = {
        farmerId: user.id,
        nitrogenValue: soilData.nitrogen ?? 0,
        phosphorusValue: soilData.phosphorus ?? 0,
        potassiumValue: soilData.potassium ?? 0,
        ecValue: soilData.ec ?? 0,
        pHValue: soilData.pH ?? 0,
        soilMoistureValue: soilData.soilMoisture ?? 0,
        temperatureValue: soilData.temperature ?? 0,
        location: currentLocation ? {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        } : undefined
      };

      const response = await submitSoilData(dataToSubmit);

      if (response.success) {
        saveSoilReading({
          ...soilData,
          timestamp: new Date().toISOString(),
          location: currentLocation ? {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          } : undefined
        });

        Alert.alert(
          t('success'),
          t('dataSaved'),
          [
            {
              text: t('viewRecommendations'),
              onPress: () => router.push('/recommendations')
            },
            {
              text: t('ok'),
              style: 'cancel'
            }
          ]
        );
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      Alert.alert(t('error'), t('submissionFailed'));
      console.error('Error submitting soil data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('soilScan')}
        showBackButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Card style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceTitle}>
              {connectedDevice
                ? t('connectedTo', { name: connectedDevice.name || connectedDevice.id })
                : t('noDeviceConnected')}
            </Text>

            {connectedDevice ? (
              <TouchableOpacity
                style={[styles.deviceButton, styles.disconnectButton]}
                onPress={disconnectFromDevice}>
                <Text style={styles.disconnectButtonText}>{t('disconnect')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.deviceButton, isScanning ? styles.scanningButton : styles.scanButton]}
                onPress={() => {
                  if (isScanning) return;
                  if (Platform.OS === 'web') {
                    Alert.alert(t('notSupported'), t('bluetoothWebNotSupported'));
                    return;
                  }
                  setShowDeviceList(true);
                  scanForDevices();
                }}>
                {isScanning ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Bluetooth color="#fff" size={16} style={styles.buttonIcon} />
                    <Text style={styles.scanButtonText}>{t('scan')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {showDeviceList && (
            <DeviceList
              devices={devices}
              onDevicePress={(device) => {
                connectToDevice(device);
                setShowDeviceList(false);
              }}
              isScanning={isScanning}
              onRefresh={scanForDevices}
            />
          )}
        </Card>

        <Card style={styles.readingsCard}>
          {/* Header */}
          <View style={styles.readingsHeader}>
            <Text style={styles.readingsTitle}>{t('soilNutrients')}</Text>
            <TouchableOpacity
              style={[
                styles.readButton,
                connectedDevice ? styles.activeReadButton : styles.inactiveReadButton,
              ]}
              disabled={!connectedDevice}
              onPress={readSoilData}
            >
              <RefreshCw
                color={connectedDevice ? '#fff' : Colors.text.disabled}
                size={16}
                style={styles.buttonIcon}
              />
              <Text style={[
                styles.readButtonText,
                !connectedDevice && styles.disabledText
              ]}>
                {t('read')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gauges Grid */}
          <View style={styles.grid}>
            {[
              { key: 'nitrogen', value: soilData?.nitrogen, max: 30000, color: '#4CAF50', icon: <Leaf color="#4CAF50" size={20} /> },
              { key: 'phosphorus', value: soilData?.phosphorus, max: 30000, color: '#FF9800', icon: <Leaf color="#FF9800" size={20} /> },
              { key: 'potassium', value: soilData?.potassium, max: 30000, color: '#2196F3', icon: <Leaf color="#2196F3" size={20} /> },
              { key: 'ec', value: soilData?.ec, max: 30000, color: '#9C27B0', icon: <Gauge color="#9C27B0" size={20} /> },
              { key: 'pH', value: soilData?.pH, max: 14, color: '#00BCD4', icon: <FlaskConical color="#00BCD4" size={20} /> },
              { key: 'soilMoisture', value: soilData?.soilMoisture, max: 30000, color: '#795548', icon: <Droplet color="#795548" size={20} /> },
              { key: 'temperature', value: soilData?.temperature, max: 100, color: '#E91E63', icon: <Thermometer color="#E91E63" size={20} /> },
              { key: 'humidity', value: soilData?.humidity, max: 100, color: '#3F51B5', icon: <CloudRain color="#3F51B5" size={20} /> },
              { key: 'soilTemperature', value: soilData?.soilTemperature, max: 100, color: '#607D8B', icon: <Sun color="#607D8B" size={20} /> },
            ].map((gauge) => (
              <View key={gauge.key} style={styles.gaugeItem}>
                <NutrientGauge
                  title={t(gauge.key)}
                  value={gauge.value ?? 0}
                  maxValue={gauge.max}
                  color={gauge.color}
                  icon={gauge.icon}
                />
              </View>
            ))}
          </View>


          {/* Timestamp */}
          {soilData?.timestamp && (
            <Text style={styles.timestampText}>
              {t('timestamp')}: {new Date(soilData.timestamp).toLocaleString()}
            </Text>
          )}
        </Card>


        {soilData && (
          <Card style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>{t('dataActions')}</Text>

            <View style={styles.buttonsContainer}>
              <Button
                label={t('saveData')}
                onPress={handleSubmitData}
                icon={<Save size={18} color="#fff" />}
                isLoading={isSubmitting}
                style={styles.primaryButton}
              />

              <View style={styles.buttonRow}>
                <Button
                  label={t('viewOnMap')}
                  onPress={() => router.push('/(modals)/map')}
                  icon={<Map size={18} color="#fff" />}
                  style={StyleSheet.flatten([styles.secondaryButton, styles.halfButton])}
                  variant="secondary"
                />

                <Button
                  label={t('share')}
                  onPress={() => {
                    // Share functionality would be implemented here
                    Alert.alert(t('comingSoon'), t('featureNotAvailable'));
                  }}
                  icon={<Share size={18} color="#fff" />}
                  style={StyleSheet.flatten([styles.secondaryButton, styles.halfButton])}
                  variant="secondary"
                />
              </View>
            </View>
          </Card>
        )}

        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>{t('location')}</Text>
          <Card style={styles.locationCard}>
            {currentLocation ? (
              <Text style={styles.locationText}>
                {`${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`}
              </Text>
            ) : (
              <Text style={styles.locationTextDisabled}>{t('locationNotAvailable')}</Text>
            )}

            <TouchableOpacity
              style={styles.refreshLocationButton}
              onPress={getLocation}>
              <RefreshCw color={Colors.primary} size={16} />
              <Text style={styles.refreshLocationText}>{t('refreshLocation')}</Text>
            </TouchableOpacity>
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
  deviceCard: {
    marginBottom: 16,
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  deviceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: Colors.primary,
  },
  scanningButton: {
    backgroundColor: Colors.secondary,
  },
  disconnectButton: {
    backgroundColor: Colors.error,
  },
  buttonIcon: {
    marginRight: 4,
  },
  scanButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
  disconnectButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#fff',
  },
  readingsCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
  },
  readingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeReadButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveReadButton: {
    backgroundColor: '#ddd',
  },
  readButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gaugeItem: {
    width: '48%', // Two items per row with space
    marginBottom: 16,
  },
  timestampText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    color: '#666',
  },
  gaugesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  actionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  actionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: Colors.background.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  locationCard: {
    padding: 16,
  },
  locationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  locationTextDisabled: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.disabled,
    marginBottom: 8,
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshLocationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
  },
});