import { useContext } from 'react';
import { I18nContext } from '@/context/I18nContext';

export function useTranslation() {
  return useContext(I18nContext).t;
}