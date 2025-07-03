import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import {
  BleManager,
  Device,
  BleError,
  State as BleState,
  ScanOptions,
  Characteristic,
  Service,
  UUID, // Import UUID type
} from 'react-native-ble-plx';
import { Buffer } from 'buffer'; // Import Buffer for base64 decoding

// Provided UUIDs
const ENV_SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb'; // Environmental Sensing
const GATT_SERVICE_UUID = '00001801-0000-1000-8000-00805f9b34fb'; // Generic Attribute Profile

const CHARACTERISTIC_UUIDS: Record<string, UUID> = {
  temperature: '00002a6e-0000-1000-8000-00805f9b34fb',
  humidity: '00002a6f-0000-1000-8000-00805f9b34fb',
  altitude: '00002ab3-0000-1000-8000-00805f9b34fb', // Example, add if needed
  pressure: '00002c11-0000-1000-8000-00805f9b34fb', // Example
  soilTemperature: '00002c14-0000-1000-8000-00805f9b34fb', // Custom or less common standard
  soilMoisture: '00002c15-0000-1000-8000-00805f9b34fb', // Custom or less common standard
  ec: '00002c06-0000-1000-8000-00805f9b34fb', // Custom or less common standard
  pH: '00002c07-0000-1000-8000-00805f9b34fb', // Custom or less common standard
  nitrogen: '00002c08-0000-1000-8000-00805f9b34fb', // Custom or less common standard
  phosphorus: '00002c09-0000-1000-8000-00805f9b34fb', // Custom or less common standard
  potassium: '00002c10-0000-1000-8000-00805f9b34fb', // Custom or less common standard
};

// Using the Environmental Sensing service as the primary for soil data
const SOIL_SENSOR_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
// We will read multiple characteristics, so no single SOIL_DATA_CHARACTERISTIC_UUID needed here

export interface BluetoothDevice {
  id: string;
  name?: string;
  connectable?: boolean;
  rssi?: number;
}

export interface SoilData {
  nitrogen?: number; // Make optional as not all might be read
  phosphorus?: number;
  potassium?: number;
  pH?: number;
  soilMoisture?: number;
  temperature?: number; // Added from your UUIDs
  humidity?: number; // Added
  soilTemperature?: number;
  ec?: number;
  timestamp?: string;
}

interface BluetoothContextType {
  isScanning: boolean;
  isConnecting: boolean;
  connectedDevice: BluetoothDevice | null;
  soilData: SoilData | null;
  devices: BluetoothDevice[];
  isBluetoothEnabled: boolean;
  scanForDevices: () => void;
  connectToDevice: (device: BluetoothDevice) => Promise<void>;
  disconnectFromDevice: () => Promise<void>;
  readSoilData: () => Promise<void>;
}

export const BluetoothContext = createContext<BluetoothContextType>({
  isScanning: false,
  isConnecting: false,
  connectedDevice: null,
  soilData: null,
  devices: [],
  isBluetoothEnabled: false,
  scanForDevices: () => {},
  connectToDevice: async () => {},
  disconnectFromDevice: async () => {},
  readSoilData: async () => {},
});

const manager = new BleManager();

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] =
    useState<BluetoothDevice | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);

  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      let permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      if (apiLevel >= 31) {
        // Android 12+
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      } else {
        // Android 11 and below
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(
        permissionsToRequest
      );
      const allGranted = permissionsToRequest.every(
        (perm) => granted[perm] === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth and Location permissions are necessary to scan for devices.'
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const scanForDevices = useCallback(async () => {
    if (!isBluetoothEnabled) {
      Alert.alert(
        'Bluetooth Disabled',
        'Please enable Bluetooth to scan for devices.'
      );
      return;
    }
    const permissionsGranted = await requestAndroidPermissions();
    if (!permissionsGranted) return;

    console.log('Starting device scan...');
    setIsScanning(true);
    setDevices([]);

    manager.startDeviceScan(
      null,
      { allowDuplicates: false } as ScanOptions,
      (error, device) => {
        if (error) {
          console.error('Scan Error:', error.message, 'Code:', error.errorCode);
          setIsScanning(false);
          Alert.alert(
            'Scan Error',
            `Could not scan for devices: ${error.message}`
          );
          return;
        }
        // Only add the target device
        if (device && device.name === 'STIHUB CITK Soil IoT') {
          console.log(`Found device: ${device.name} (${device.id})`);
          setDevices((prevDevices) => {
            if (!prevDevices.find((d) => d.id === device.id)) {
              return [
                ...prevDevices,
                {
                  id: device.id,
                  name: device.name ?? undefined,
                  rssi: device.rssi ?? undefined,
                  connectable: device.isConnectable ?? undefined,
                },
              ];
            }
            return prevDevices;
          });
        }
      }
    );

    setTimeout(() => {
      if (isScanning) {
        manager.stopDeviceScan();
        setIsScanning(false);
        console.log('Scan stopped automatically.');
      }
    }, 15000);
  }, [isBluetoothEnabled, isScanning]);

  const connectToDevice = useCallback(
    async (deviceToConnect: BluetoothDevice) => {
      if (isConnecting || connectedDevice?.id === deviceToConnect.id) return;

      console.log(
        `Attempting to connect to ${deviceToConnect.name || deviceToConnect.id}`
      );
      setIsConnecting(true);
      manager.stopDeviceScan();
      setIsScanning(false);

      try {
        const connectedBleDevice = await manager.connectToDevice(
          deviceToConnect.id,
          { autoConnect: false, timeout: 15000 }
        );
        console.log(
          `Connected to ${connectedBleDevice.name || connectedBleDevice.id}`
        );
        await connectedBleDevice.discoverAllServicesAndCharacteristics();
        console.log('Services and characteristics discovered.');

        if (Platform.OS === 'android') {
          // Request higher connection priority for stability
          await connectedBleDevice.requestConnectionPriority(1); // 1 for ConnectionPriority.High
        }

        setConnectedDevice({
          id: connectedBleDevice.id,
          name: connectedBleDevice.name || 'Unknown Device',
        });
        // await readSoilData(); // Optionally read data immediately after connection
      } catch (error) {
        const bleError = error as BleError;
        console.error(
          `Connection to ${deviceToConnect.id} failed:`,
          bleError.message,
          'Code:',
          bleError.errorCode
        );
        Alert.alert(
          'Connection Failed',
          `Could not connect to ${deviceToConnect.name || 'device'}: ${
            bleError.message
          }`
        );
        setConnectedDevice(null);
      } finally {
        setIsConnecting(false);
      }
    },
    [isConnecting, connectedDevice]
  );

  const disconnectFromDevice = useCallback(async () => {
    if (!connectedDevice) return;
    console.log(
      `Disconnecting from ${connectedDevice.name || connectedDevice.id}`
    );
    try {
      await manager.cancelDeviceConnection(connectedDevice.id);
      console.log('Disconnected successfully.');
    } catch (error) {
      console.error('Disconnection error:', (error as BleError).message);
    } finally {
      setConnectedDevice(null);
      setSoilData(null);
    }
  }, [connectedDevice]);

  // Helper to decode characteristic based on its assumed type
  // THIS IS VERY SIMPLISTIC - REAL DECODING NEEDS TO RESPECT GATT SPECS FOR EACH CHARACTERISTIC
  const decodeCharacteristicValue = (
    charName: string,
    base64Value: string | null | undefined
  ): number | undefined => {
    if (!base64Value) return undefined;

    const buffer = Buffer.from(base64Value, 'base64').toString('utf-8');

    // Check for insufficient data
    if (buffer.length < 2) {
      console.warn(
        `Skipping ${charName} — buffer too short or invalid (length ${buffer.length})`
      );
      return undefined;
    }
    try {
      const ascii = Buffer.from(base64Value, 'base64').toString('utf-8');
      console.log(`${charName} decoded ASCII:`, ascii);

      // Match pattern like "pH:6.4" or "N:40"
      const match = ascii.match(/[:=](\d+(\.\d+)?)/); // Matches :40 or :6.4
      if (!match) {
        console.warn(`Unable to extract value from ${ascii}`);
        return undefined;
      }

      const value = parseFloat(match[1]);
      return isNaN(value) ? undefined : value;
    } catch (e) {
      console.error(`Error decoding ${charName}:`, e, 'Raw:', base64Value);
      return undefined;
    }
  };

  const readSoilData = useCallback(async () => {
    if (!connectedDevice) {
      Alert.alert('Not Connected', 'No device is connected to read data from.');
      return;
    }

    try {
      const discoveredDevice = await manager.connectToDevice(
        connectedDevice.id
      );
      await discoveredDevice.discoverAllServicesAndCharacteristics();
      const services = await discoveredDevice.services();

      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          if (
            Object.values(CHARACTERISTIC_UUIDS).includes(characteristic.uuid)
          ) {
            console.log(`Setting monitor on ${characteristic.uuid}`);
            characteristic.monitor((error, char) => {
              if (error) {
                console.error('Monitor error:', error);
                return;
              }

              if (char?.value) {
                const value = parseCharacteristicValue(char);
                const key = getCharacteristicName(characteristic.uuid);

                if (key && typeof value === 'number') {
                  // console.log(`Monitored ${key}: ${value}`);
                  setSoilData((prev) => ({
                    ...prev,
                    [key]: value,
                    timestamp: new Date().toISOString(),
                  }));
                }
              }
            });
          }
        }
      }
      const getCharacteristicName = (
        uuid: string
      ): keyof SoilData | undefined => {
        const entry = Object.entries(CHARACTERISTIC_UUIDS).find(
          ([, val]) => val === uuid
        );
        return entry?.[0] as keyof SoilData | undefined;
      };
      console.log('All characteristics monitored successfully.');
      console.log('Monitoring set up on all characteristics.');
    } catch (error) {
      console.error('Error in readSoilData monitor setup:', error);
      Alert.alert(
        'Monitor Setup Error',
        'Could not start monitoring soil data.'
      );
    }
  }, [connectedDevice]);
  function parseCharacteristicValue(characteristic: Characteristic): number {
    const buffer = Buffer.from(characteristic.value!, 'base64');
    // Get the characteristic name by UUID
    const charName = Object.keys(CHARACTERISTIC_UUIDS).find(
      (key) => CHARACTERISTIC_UUIDS[key] === characteristic.uuid
    );

    // List of soil characteristics that should NOT be divided by 100
    const soilKeys = [
      // 'soilTemperature',
      'soilMoisture',
      'ec',
      'pH',
      'nitrogen',
      'phosphorus',
      'potassium',
    ];

    if (charName && soilKeys.includes(charName)) {
      // For soil characteristics, just return the raw value (Int16LE)
      return buffer.readInt16LE();
    } else {
      // For others (like temperature, humidity), divide by 100
      return buffer.readInt16LE() / 100;
    }
  }

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      console.log('Bluetooth state changed to:', state);
      const newBluetoothEnabled = state === BleState.PoweredOn;
      setIsBluetoothEnabled(newBluetoothEnabled);
      if (!newBluetoothEnabled) {
        setIsScanning(false);
        manager.stopDeviceScan();
        setDevices([]);
        if (connectedDevice) {
          setConnectedDevice(null);
          setSoilData(null);
        }
        if (state !== BleState.Unknown && state !== BleState.Resetting) {
          Alert.alert(
            'Bluetooth Off',
            'Bluetooth has been turned off. Please turn it on to use BLE features.'
          );
        }
      }
    }, true);
    return () => {
      subscription.remove();
      console.log(
        'BluetoothProvider unmounted or BleManager state listener removed.'
      );
    };
  }, [connectedDevice]); // Re-run if connectedDevice changes to handle its state in BT off scenario.

  return (
    <BluetoothContext.Provider
      value={{
        isScanning,
        isConnecting,
        connectedDevice,
        soilData,
        devices,
        isBluetoothEnabled,
        scanForDevices,
        connectToDevice,
        disconnectFromDevice,
        readSoilData,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};
