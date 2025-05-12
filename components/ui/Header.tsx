import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightIcon?: React.ReactNode;
  onBackPress?: () => void;
}

export default function Header({
  title,
  showBackButton = true,
  rightIcon,
  onBackPress,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };
  
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}>
            <ChevronLeft color={Colors.text.primary} size={24} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      
      <View style={styles.rightSection}>
        {rightIcon}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
});