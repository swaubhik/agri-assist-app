import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import Colors from '@/constants/Colors';
import Button from '@/components/ui/Button';
import Geolocation from '@react-native-community/geolocation'; // or use Expo Location

export default function LoginScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    passwordConfirmation: '',
    name: '',
    location: '',
    landSize: '',
  });

  // Add coordinates to state
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        if (!formData.phone || !formData.password) {
          throw new Error(t('allFieldsRequired'));
        }

        await login(formData.phone, formData.password);
        router.replace('/(tabs)');
      } else {
        // Registration flow
        if (!formData.name || !formData.phone || !formData.password) {
          throw new Error(t('requiredFieldsMissing'));
        }

        await register({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          password_confirmation: formData.passwordConfirmation, // <-- add this
          location: coordinates
            ? `${coordinates.latitude},${coordinates.longitude}`
            : '', // <-- use GPS
          landSize: formData.landSize,
        });

        Alert.alert(t('registrationSuccess'), t('accountCreated'), [
          { text: t('continue'), onPress: () => setIsLogin(true) },
        ]);
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        error instanceof Error ? error.message : t('unknownError')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      phone: formData.phone,
      password: '',
      passwordConfirmation: '',
      name: '',
      location: '',
      landSize: '',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Image
            source={{
              uri: 'https://images.pexels.com/photos/5273645/pexels-photo-5273645.jpeg?auto=compress&cs=tinysrgb&w=800',
            }}
            style={styles.headerImage}
          />
          <View style={styles.overlay} />
          <View style={styles.headerContent}>
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.tagline}>{t('appTagline')}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.authTitle}>
            {isLogin ? t('loginToAccount') : t('createAccount')}
          </Text>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('name')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('enterName')}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('phone')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterPhone')}
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('password')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterPassword')}
              secureTextEntry
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
            />
          </View>

          {!isLogin && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('confirmPassword')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterPasswordAgain')}
                  secureTextEntry
                  value={formData.passwordConfirmation}
                  onChangeText={(text) =>
                    setFormData({ ...formData, passwordConfirmation: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('location')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterLocation')}
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('landSize')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('enterLandSizeInAcres')}
                  keyboardType="numeric"
                  value={formData.landSize}
                  onChangeText={(text) =>
                    setFormData({ ...formData, landSize: text })
                  }
                />
              </View>
            </>
          )}

          <Button
            label={isLogin ? t('login') : t('register')}
            onPress={handleSubmit}
            isLoading={loading}
            style={styles.submitButton}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.switchAction}>
                {isLogin ? t('createOne') : t('loginHere')}
              </Text>
            </TouchableOpacity>
          </View>

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>
          )}

          {Platform.OS === 'web' && (
            <View style={styles.mockNotice}>
              <Text style={styles.mockText}>{t('mockLoginNotice')}</Text>
              <TouchableOpacity
                onPress={() => {
                  login('demo', 'password');
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.mockAction}>{t('useDemoAccount')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#fff',
    marginBottom: 4,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  formContainer: {
    padding: 24,
  },
  authTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.text.primary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  switchAction: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  mockNotice: {
    marginTop: 36,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  mockText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  mockAction: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
});
