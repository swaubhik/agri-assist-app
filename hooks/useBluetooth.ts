import { useContext } from 'react';
import { BluetoothContext } from '@/context/BluetoothContext';

export function useBluetooth() {
  return useContext(BluetoothContext);
}