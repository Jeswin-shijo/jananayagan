import React, {useMemo, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, ScrollView, Switch, TouchableOpacity, Modal, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppCard} from '@components/common/AppCard';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppAlert} from '@components/common/AppAlert';
import {useAuthStore} from '@store/authStore';
import {useThemeStore} from '@store/themeStore';
import {useLanguageStore} from '@store/languageStore';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {SUPPORTED_LANGUAGES, TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const ProfileScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t, language} = useTranslation();
  const {showAlert} = useAppAlert();
  const {user, logout} = useAuthStore();
  const {isDark, toggleMode} = useThemeStore();
  const setLanguage = useLanguageStore(state => state.setLanguage);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const selectedLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find(item => item.code === language) ?? SUPPORTED_LANGUAGES[0],
    [language],
  );

  const handleLogout = () => {
    showAlert({
      title: t('logout'),
      message: t('logoutMessage'),
      variant: 'danger',
      actions: [
        {text: t('cancel'), style: 'cancel'},
        {text: t('logout'), style: 'destructive', onPress: logout},
      ],
    });
  };

  // Same rows/actions as before — only the styling changed.
  const links: {icon: MaterialCommunityIconName; labelKey: TranslationKey}[] = [
    {icon: 'bell-outline', labelKey: 'notificationSettings'},
    {icon: 'shield-lock-outline', labelKey: 'privacyPolicy'},
    {icon: 'phone-outline', labelKey: 'contactSupport'},
    {icon: 'information-outline', labelKey: 'aboutApp'},
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('myProfile')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name ?? t('user')}</Text>
            <Text style={styles.role}>{user?.role ? t(user.role) : t('citizen')}</Text>
            {!!user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
          </View>
        </View>

        {/* Preferences (language + dark mode) */}
        <AppCard padding={0} style={styles.menuCard}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
            style={[styles.row, styles.divider]}>
            <View style={styles.iconBubble}>
              <MaterialCommunityIcons name="translate" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.label}>{t('language')}</Text>
            <Text style={styles.value}>{selectedLanguage.nativeLabel}</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.iconBubble}>
              <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={20} color={Colors.primary} />
            </View>
            <Text style={styles.label}>{t('darkMode')}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{false: Colors.border, true: Colors.primaryLight}}
              thumbColor={isDark ? Colors.primary : Colors.textDisabled}
            />
          </View>
        </AppCard>

        {/* Other links (same as before) */}
        <AppCard padding={0} style={styles.menuCard}>
          {links.map((item, i) => (
            <TouchableOpacity
              key={item.labelKey}
              activeOpacity={0.7}
              style={[styles.row, i < links.length - 1 && styles.divider]}>
              <View style={styles.iconBubble}>
                <MaterialCommunityIcons name={item.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.label}>{t(item.labelKey)}</Text>
              <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </AppCard>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutRow} activeOpacity={0.7} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>

        <View style={{height: Spacing[10]}} />
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

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  headerBar: {alignItems: 'center', paddingVertical: Spacing[3]},
  headerTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  scroll: {paddingHorizontal: Spacing[4], paddingTop: Spacing[2]},
  profileRow: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[5], gap: Spacing[4]},
  avatar: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  avatarText: {fontSize: FontSize['2xl'], color: Colors.white, fontWeight: FontWeight.bold},
  profileInfo: {flex: 1},
  name: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  role: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2},
  phone: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold, marginTop: 2},
  menuCard: {marginHorizontal: 0, marginBottom: Spacing[3]},
  row: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  divider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  label: {flex: 1, fontSize: FontSize.base, color: Colors.text},
  value: {fontSize: FontSize.sm, color: Colors.textSecondary, marginRight: Spacing[2]},
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[4],
    marginTop: Spacing[2],
  },
  logoutText: {fontSize: FontSize.base, color: Colors.danger, fontWeight: FontWeight.semiBold},
  modalOverlay: {flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end', padding: Spacing[4]},
  languageSheet: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing[3]},
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
} as const);
