import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { BluetoothDevice } from '@/context/BluetoothContext';
import { Bluetooth, RefreshCw } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import Colors from '@/constants/Colors';

interface DeviceListProps {
  devices: BluetoothDevice[];
  onDevicePress: (device: BluetoothDevice) => void;
  isScanning: boolean;
  onRefresh: () => void;
}

export default function DeviceList({
  devices,
  onDevicePress,
  isScanning,
  onRefresh,
}: DeviceListProps) {
  const t = useTranslation();

  const renderDevice = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => onDevicePress(item)}>
      <View style={styles.deviceInfo}>
        <Bluetooth color={Colors.primary} size={18} style={styles.deviceIcon} />
        <View>
          <Text style={styles.deviceName}>
            {item.name || t('unknownDevice')}
          </Text>
          <Text style={styles.deviceId}>ID: {item.id}</Text>
        </View>
      </View>
      <Text style={styles.rssi}>
        {item.rssi ? `${item.rssi} dBm` : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('availableDevices')}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={isScanning}>
          {isScanning ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <RefreshCw color={Colors.primary} size={18} />
          )}
        </TouchableOpacity>
      </View>

      {devices.length > 0 ? (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          nestedScrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {isScanning ? (
            <Text style={styles.emptyText}>{t('scanning')}</Text>
          ) : (
            <Text style={styles.emptyText}>{t('noDevicesFound')}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  refreshButton: {
    padding: 4,
  },
  list: {
    maxHeight: 200,
  },
  listContent: {
    paddingVertical: 4,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    marginRight: 8,
  },
  deviceName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  deviceId: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  rssi: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});