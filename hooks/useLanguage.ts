import { useContext } from 'react';
import { I18nContext } from '@/context/I18nContext';

export function useLanguage() {
  const { language, setLanguage } = useContext(I18nContext);
  return { language, setLanguage };
}