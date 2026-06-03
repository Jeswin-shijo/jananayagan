import React, {useMemo, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity, Modal, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {useNotificationStore} from '@store/notificationStore';
import {useThemeStore} from '@store/themeStore';
import {useLanguageStore} from '@store/languageStore';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {SUPPORTED_LANGUAGES} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {MOCK_NOTIFICATIONS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';

export const ProfileScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t, language} = useTranslation();
  const {user, logout} = useAuthStore();
  const {notifications, markRead} = useNotificationStore();
  const {isDark, toggleMode} = useThemeStore();
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const selectedLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find(item => item.code === language) ?? SUPPORTED_LANGUAGES[0],
    [language],
  );

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutMessage'), [
      {text: t('cancel'), style: 'cancel'},
      {text: t('logout'), style: 'destructive', onPress: logout},
    ]);
  };

  const displayNotifications = notifications.length > 0 ? notifications : MOCK_NOTIFICATIONS;

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={[Colors.primaryLight, Colors.surface, Colors.secondaryLight]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name ?? t('user')}</Text>
          <Text style={styles.phone}>{user?.phone ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role ? t(user.role).toUpperCase() : t('citizen').toUpperCase()}</Text>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>{t('notifications')}</Text>
        {displayNotifications.slice(0, 5).map(notif => (
          <AppCard
            key={notif.id}
            onPress={() => markRead(notif.id)}
            style={[styles.notifCard, !notif.isRead && styles.notifUnread]}>
            <View style={styles.notifRow}>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{formatRelativeTime(notif.createdAt)}</Text>
              </View>
              {!notif.isRead && <View style={styles.unreadDot} />}
            </View>
          </AppCard>
        ))}

        {/* Settings */}
        <Text style={styles.sectionTitle}>{t('account')}</Text>
        <AppCard style={styles.settingItem}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBubble}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'white-balance-sunny'}
                size={20}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.settingLabel}>{t('darkMode')}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{false: Colors.border, true: Colors.primaryLight}}
              thumbColor={isDark ? Colors.primary : Colors.textDisabled}
            />
          </View>
        </AppCard>
        <AppCard padding={0}>
          {[
            {icon: 'bell-outline', label: t('notificationSettings')},
            {icon: 'translate', label: t('language'), value: selectedLanguage.nativeLabel, onPress: () => setLanguageModalVisible(true)},
            {icon: 'shield-lock-outline', label: t('privacyPolicy')},
            {icon: 'phone-outline', label: t('contactSupport')},
            {icon: 'information-outline', label: t('aboutApp')},
          ].map((item, index, items) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              activeOpacity={0.75}
              style={[styles.settingRowButton, index < items.length - 1 && styles.settingDivider]}>
              <View style={styles.settingRow}>
                <View style={styles.settingIconBubble}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.settingLabel}>{item.label}</Text>
                {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
              </View>
            </TouchableOpacity>
          ))}
        </AppCard>

        <AppButton
          title={t('logout')}
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.languageSheet}>
            <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
            {SUPPORTED_LANGUAGES.map(item => {
              const isSelected = item.code === language;
              return (
                <TouchableOpacity
                  key={item.code}
                  activeOpacity={0.75}
                  style={[styles.languageOption, isSelected && styles.languageOptionActive]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLanguageModalVisible(false);
                  }}>
                  <View>
                    <Text style={styles.languageNative}>{item.nativeLabel}</Text>
                    <Text style={styles.languageEnglish}>{item.label}</Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
      <CitizenCreateFab />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing[6],
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: Spacing[5],
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  avatarText: {fontSize: FontSize['3xl'], color: Colors.white, fontWeight: FontWeight.bold},
  name: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  phone: {fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4},
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[2],
  },
  roleText: {fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, letterSpacing: 1},
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  notifCard: {marginHorizontal: 0},
  notifUnread: {borderLeftWidth: 3, borderLeftColor: Colors.primary},
  notifRow: {flexDirection: 'row', alignItems: 'flex-start'},
  notifInfo: {flex: 1},
  notifTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  notifBody: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  notifTime: {fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 4},
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  settingItem: {marginBottom: Spacing[3]},
  settingRow: {flexDirection: 'row', alignItems: 'center'},
  settingRowButton: {paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  settingDivider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  settingIconBubble: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  settingLabel: {flex: 1, fontSize: FontSize.base, color: Colors.text},
  settingValue: {fontSize: FontSize.sm, color: Colors.textSecondary, marginRight: Spacing[2]},
  logoutBtn: {marginTop: Spacing[6]},
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
    padding: Spacing[4],
  },
  languageSheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[3],
  },
  languageOption: {
    minHeight: 64,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageOptionActive: {backgroundColor: Colors.primaryLight},
  languageNative: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  languageEnglish: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2},
});
