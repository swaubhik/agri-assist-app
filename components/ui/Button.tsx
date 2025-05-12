import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import Colors from '@/constants/Colors';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  isLoading = false,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  
  const getButtonStyle = () => {
    let buttonStyle = styles.button;
    
    switch (variant) {
      case 'primary':
        buttonStyle = {...buttonStyle, ...styles.primaryButton};
        break;
      case 'secondary':
        buttonStyle = {...buttonStyle, ...styles.secondaryButton};
        break;
      case 'outline':
        buttonStyle = {...buttonStyle, ...styles.outlineButton};
        break;
    }
    
    switch (size) {
      case 'small':
        buttonStyle = {...buttonStyle, ...styles.smallButton};
        break;
      case 'medium':
        buttonStyle = {...buttonStyle, ...styles.mediumButton};
        break;
      case 'large':
        buttonStyle = {...buttonStyle, ...styles.largeButton};
        break;
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textBaseStyle = styles.buttonText;
    
    switch (variant) {
      case 'primary':
        textBaseStyle = {...textBaseStyle, ...styles.primaryText};
        break;
      case 'secondary':
        textBaseStyle = {...textBaseStyle, ...styles.secondaryText};
        break;
      case 'outline':
        textBaseStyle = {...textBaseStyle, ...styles.outlineText};
        break;
    }
    
    switch (size) {
      case 'small':
        textBaseStyle = {...textBaseStyle, ...styles.smallText};
        break;
      case 'medium':
        textBaseStyle = {...textBaseStyle, ...styles.mediumText};
        break;
      case 'large':
        textBaseStyle = {...textBaseStyle, ...styles.largeText};
        break;
    }
    
    return textBaseStyle;
  };
  
  return (
    <TouchableOpacity 
      style={[getButtonStyle(), style]} 
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
      {...props}>
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'outline' ? Colors.primary : '#fff'} 
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[getTextStyle(), textStyle]}>{label}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: Colors.primary,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});