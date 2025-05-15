import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/ui/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import Colors from '@/constants/Colors';
import Card from '@/components/ui/Card';
import { User, LogOut, ChevronRight, Bell, Globe, HelpCircle, Phone } from 'lucide-react-native';
import Button from '@/components/ui/Button';

export default function ProfileScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    landSize: user?.landSize || '',
    location: user?.location || '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      Alert.alert(t('success'), t('profileUpdated'));
    } catch (error) {
      Alert.alert(t('error'), t('profileUpdateFailed'));
    }
  };

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <View style={styles.container}>
      <Header
        title={t('profile')}
        showBackButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#fff" />
            </View>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>

          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>{t('editProfile')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <Card style={styles.editCard}>
            <Text style={styles.editTitle}>{t('editProfile')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('name')}</Text>
              <TextInput
                style={styles.input}
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                placeholder={t('enterName')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                placeholder={t('enterPhone')}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('landSize')}</Text>
              <TextInput
                style={styles.input}
                value={profileData.landSize}
                onChangeText={(text) => setProfileData({ ...profileData, landSize: text })}
                placeholder={t('enterLandSize')}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('location')}</Text>
              <TextInput
                style={styles.input}
                value={profileData.location}
                onChangeText={(text) => setProfileData({ ...profileData, location: text })}
                placeholder={t('enterLocation')}
              />
            </View>

            <View style={styles.buttonGroup}>
              <Button
                label={t('save')}
                onPress={handleSaveProfile}
                style={styles.saveButton}
              />

              <Button
                label={t('cancel')}
                onPress={() => setIsEditing(false)}
                style={styles.cancelButton}
                variant="secondary"
              />
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('landSize')}</Text>
                <Text style={styles.infoValue}>{user.landSize || t('notSpecified')}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('location')}</Text>
                <Text style={styles.infoValue}>{user.location || t('notSpecified')}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('totalReadings')}</Text>
                <Text style={styles.infoValue}>12</Text>
              </View>
            </Card>

            <Card style={styles.settingsCard}>
              <Text style={styles.settingsTitle}>{t('settings')}</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Bell color={Colors.text.primary} size={20} style={styles.settingIcon} />
                  <Text style={styles.settingLabel}>{t('notifications')}</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.background.disabled, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Globe color={Colors.text.primary} size={20} style={styles.settingIcon} />
                  <Text style={styles.settingLabel}>{t('language')}</Text>
                </View>
                <View style={styles.settingRight}>
                  <Text style={styles.settingValue}>
                    {language === 'en' ? 'English' : 'हिंदी'}
                  </Text>
                  <ChevronRight color={Colors.text.secondary} size={18} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <HelpCircle color={Colors.text.primary} size={20} style={styles.settingIcon} />
                  <Text style={styles.settingLabel}>{t('help')}</Text>
                </View>
                <ChevronRight color={Colors.text.secondary} size={18} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Phone color={Colors.text.primary} size={20} style={styles.settingIcon} />
                  <Text style={styles.settingLabel}>{t('contactSupport')}</Text>
                </View>
                <ChevronRight color={Colors.text.secondary} size={18} />
              </TouchableOpacity>
            </Card>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert(
                  t('logout'),
                  t('logoutConfirm'),
                  [
                    {
                      text: t('cancel'),
                      style: 'cancel',
                    },
                    {
                      text: t('logout'),
                      style: 'destructive',
                      onPress: () => logout(),
                    },
                  ]
                );
              }}>
              <LogOut color={Colors.error} size={18} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Version 1.0.0</Text>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.background.secondary,
    padding: 4,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  userPhone: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginVertical: 4,
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
  },
  editButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.primary,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  settingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  settingsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.error,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  editCard: {
    padding: 16,
    marginBottom: 16,
  },
  editTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
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
    paddingVertical: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.text.primary,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
});