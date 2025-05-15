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
const ENV_SERVICE_UUID = "0000181a-0000-1000-8000-00805f9b34fb"; // Environmental Sensing
const GATT_SERVICE_UUID = "00001801-0000-1000-8000-00805f9b34fb"; // Generic Attribute Profile

const CHARACTERISTIC_UUIDS: Record<string, UUID> = {
  temperature: "00002a6e-0000-1000-8000-00805f9b34fb",
  humidity: "00002a6f-0000-1000-8000-00805f9b34fb",
  // altitude: "00002ab3-0000-1000-8000-00805f9b34fb", // Example, add if needed
  // pressure: "00002c11-0000-1000-8000-00805f9b34fb", // Example
  soilTemperature: "00002c14-0000-1000-8000-00805f9b34fb", // Custom or less common standard
  soilMoisture: "00002c15-0000-1000-8000-00805f9b34fb", // Custom or less common standard
  ec: "00002c06-0000-1000-8000-00805f9b34fb", // Custom or less common standard
  pH: "00002c07-0000-1000-8000-00805f9b34fb", // Custom or less common standard
  nitrogen: "00002c08-0000-1000-8000-00805f9b34fb", // Custom or less common standard
  phosphorus: "00002c09-0000-1000-8000-00805f9b34fb", // Custom or less common standard
  potassium: "00002c10-0000-1000-8000-00805f9b34fb", // Custom or less common standard
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
  humidity?: number;    // Added
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
  scanForDevices: () => { },
  connectToDevice: async () => { },
  disconnectFromDevice: async () => { },
  readSoilData: async () => { },
});

const manager = new BleManager();

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);

  const requestAndroidPermissions = async () => {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      let permissionsToRequest = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];

      if (apiLevel >= 31) { // Android 12+
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      } else { // Android 11 and below
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
      }

      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      const allGranted = permissionsToRequest.every(perm => granted[perm] === PermissionsAndroid.RESULTS.GRANTED);

      if (!allGranted) {
        Alert.alert('Permissions Required', 'Bluetooth and Location permissions are necessary to scan for devices.');
        return false;
      }
      return true;
    }
    return true;
  };

  const scanForDevices = useCallback(async () => {
    if (!isBluetoothEnabled) {
      Alert.alert('Bluetooth Disabled', 'Please enable Bluetooth to scan for devices.');
      return;
    }
    const permissionsGranted = await requestAndroidPermissions();
    if (!permissionsGranted) return;

    console.log('Starting device scan...');
    setIsScanning(true);
    setDevices([]);

    manager.startDeviceScan(null, { allowDuplicates: false } as ScanOptions, (error, device) => {
      if (error) {
        console.error('Scan Error:', error.message, 'Code:', error.errorCode);
        setIsScanning(false);
        Alert.alert('Scan Error', `Could not scan for devices: ${error.message}`);
        return;
      }
      if (device) {
        // Filter out devices that are not connectable or have no name
        console.log(`Found device: ${device.name} (${device.id})`);
        setDevices(prevDevices => {
          if (!prevDevices.find(d => d.id === device.id)) {
            return [...prevDevices, {
              id: device.id,
              name: device.name || 'Unknown Device',
              rssi: device.rssi ?? undefined,
              connectable: device.isConnectable ?? undefined,
            }];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      if (isScanning) {
        manager.stopDeviceScan();
        setIsScanning(false);
        console.log('Scan stopped automatically.');
      }
    }, 15000);
  }, [isBluetoothEnabled, isScanning]);

  const connectToDevice = useCallback(async (deviceToConnect: BluetoothDevice) => {
    if (isConnecting || connectedDevice?.id === deviceToConnect.id) return;

    console.log(`Attempting to connect to ${deviceToConnect.name || deviceToConnect.id}`);
    setIsConnecting(true);
    manager.stopDeviceScan();
    setIsScanning(false);

    try {
      const connectedBleDevice = await manager.connectToDevice(deviceToConnect.id, { autoConnect: false, timeout: 15000 });
      console.log(`Connected to ${connectedBleDevice.name || connectedBleDevice.id}`);
      await connectedBleDevice.discoverAllServicesAndCharacteristics();
      console.log('Services and characteristics discovered.');

      if (Platform.OS === 'android') { // Request higher connection priority for stability
        await connectedBleDevice.requestConnectionPriority(1); // 1 for ConnectionPriority.High
      }

      setConnectedDevice({ id: connectedBleDevice.id, name: connectedBleDevice.name || 'Unknown Device' });
      // await readSoilData(); // Optionally read data immediately after connection
    } catch (error) {
      const bleError = error as BleError;
      console.error(`Connection to ${deviceToConnect.id} failed:`, bleError.message, 'Code:', bleError.errorCode);
      Alert.alert('Connection Failed', `Could not connect to ${deviceToConnect.name || 'device'}: ${bleError.message}`);
      setConnectedDevice(null);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, connectedDevice]);

  const disconnectFromDevice = useCallback(async () => {
    if (!connectedDevice) return;
    console.log(`Disconnecting from ${connectedDevice.name || connectedDevice.id}`);
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
  const decodeCharacteristicValue = (charName: string, base64Value: string | null | undefined): number | undefined => {
    if (!base64Value) return undefined;

    const buffer = Buffer.from(base64Value, 'base64').toString('utf-8');

    // Check for insufficient data
    if (buffer.length < 2) {
      console.warn(`Skipping ${charName} — buffer too short or invalid (length ${buffer.length})`);
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

    // try {
    //   let value: number;
    //   // Refer to Bluetooth GATT Specification for data types of standard characteristics
    //   // For custom characteristics, refer to your device's documentation
    //   switch (charName) {
    //     case 'temperature':
    //     case 'soilTemperature':
    //       value = buffer.readInt16LE(0) / 100.0;
    //       break;

    //     case 'humidity':
    //       value = buffer.readUInt16LE(0) / 100.0;
    //       break;

    //     case 'pH':
    //       value = buffer.readUInt16LE(0) / 100.0;
    //       break;

    //     case 'soilMoisture':
    //     case 'nitrogen':
    //     case 'phosphorus':
    //     case 'potassium':
    //     case 'ec':
    //       value = buffer.readUInt16LE(0);
    //       break;

    //     default:
    //       value = buffer.readUInt8(0);
    //       break;
    //     // Example: Raw value or ppm, consult device spec
    //     // default:

    //     //   console.warn(`No specific decoding for ${charName}, returning raw first byte or 0`);
    //     //   return buffer.length > 0 ? buffer.readUInt8(0) : 0; // Fallback
    //   }
    //   if (isNaN(value) || !isFinite(value)) {
    //     console.warn(`Skipping ${charName} — decoded value is invalid:`, value);
    //     return undefined;
    //   }
    //   return value;
    // } catch (e) {
    //   console.error(`Error decoding ${charName}:`, e, "Raw:", base64Value);
    //   return undefined;
    // }
  };

  const readSoilData = useCallback(async () => {
    if (!connectedDevice) {
      Alert.alert('Not Connected', 'No device is connected to read data from.');
      return;
    }
    console.log('Attempting to read soil data from service:', SOIL_SENSOR_SERVICE_UUID);
    let updatedSoilData: Partial<SoilData> = { timestamp: new Date().toISOString() };
    let characteristicsRead = 0;

    try {
      for (const charName in CHARACTERISTIC_UUIDS) {
        const charUUID = CHARACTERISTIC_UUIDS[charName];
        try {
          console.log(`Reading characteristic ${charName} (${charUUID})...`);
          const characteristic = await manager.readCharacteristicForDevice(
            connectedDevice.id,
            SOIL_SENSOR_SERVICE_UUID, // Assuming all these are under the ENV_SERVICE_UUID
            charUUID
          );
          console.log(`Raw value for ${charName}:`, characteristic.value);
          const decodedValue = decodeCharacteristicValue(charName, characteristic.value);
          if (decodedValue !== undefined) {
            (updatedSoilData as any)[charName] = decodedValue; // Dynamically assign to SoilData field
            characteristicsRead++;
          }
        } catch (charError) {
          // It's common for devices not to implement ALL characteristics of a service
          const bleCharError = charError as BleError;
          if (bleCharError.errorCode === 2 /* CharacteristicNotFound */ || bleCharError.errorCode === 204 /*GattError*/) {
            console.log(`Characteristic ${charName} (${charUUID}) not found or not readable.`);
          } else {
            console.error(`Failed to read characteristic ${charName} (${charUUID}):`, bleCharError.message, 'Code:', bleCharError.errorCode);
          }
        }
      }

      if (characteristicsRead > 0) {
        setSoilData(prevData => ({ ...prevData, ...updatedSoilData }));
        console.log('Soil data updated:', updatedSoilData);
      } else {
        Alert.alert('No Data Read', 'Could not read any relevant soil characteristics from the device.');
      }

    } catch (error) { // Catch errors from iterating or general connection issues during reads
      const bleError = error as BleError;
      console.error('General error during reading soil data:', bleError.message, 'Code:', bleError.errorCode);
      Alert.alert('Read Error', `Could not read soil data: ${bleError.message}`);
      if (bleError.errorCode === 201 /* DeviceDisconnected */ || bleError.errorCode === 205 /*GattError*/) {
        disconnectFromDevice();
      }
    }
  }, [connectedDevice, disconnectFromDevice]);

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
          Alert.alert('Bluetooth Off', 'Bluetooth has been turned off. Please turn it on to use BLE features.');
        }
      }
    }, true);
    return () => {
      subscription.remove();
      console.log('BluetoothProvider unmounted or BleManager state listener removed.');
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
      }}>
      {children}
    </BluetoothContext.Provider>
  );
};