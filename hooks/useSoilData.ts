import { useContext } from 'react';
import { SoilDataContext } from '@/context/SoilDataContext';

export function useSoilData() {
  return useContext(SoilDataContext);
}