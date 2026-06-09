import React, {useMemo, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {NotificationBell} from '@components/common/NotificationBell';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppAlert} from '@components/common/AppAlert';
import {useAuthStore} from '@store/authStore';
import {useThemeStore} from '@store/themeStore';
import {useLanguageStore} from '@store/languageStore';
import {useTranslation} from '@hooks/useTranslation';
import {Gender} from '@appTypes/navigation';
import {AppColors, Navy} from '@constants/colors';
import {SUPPORTED_LANGUAGES, TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {toastSuccess} from '@utils/toast';

type MCIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const GENDERS: {id: Gender; icon: MCIcon; labelKey: 'male' | 'female' | 'other'}[] = [
  {id: 'male', icon: 'gender-male', labelKey: 'male'},
  {id: 'female', icon: 'gender-female', labelKey: 'female'},
  {id: 'other', icon: 'gender-male-female', labelKey: 'other'},
];

const formatDob = (text: string, prev: string): string => {
  const digits = text.replace(/\D/g, '');
  if (text.length < prev.length) return text;
  if (digits.length === 2 || digits.length === 4) return digits.slice(0, 2) + '/' + digits.slice(2, 4) + (digits.length === 4 ? '/' : '');
  if (digits.length > 4) return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
  return digits;
};

export const ProfileScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<any>();
  const {t, language} = useTranslation();
  const {showAlert} = useAppAlert();
  const canGoBack = navigation.canGoBack();
  const canOpenDrawer = typeof navigation.openDrawer === 'function';
  const routeNames = navigation.getState?.()?.routeNames ?? [];
  const isTabProfile = routeNames.includes('CommunityFeed') && routeNames.includes('Profile');
  const {user, logout, updateProfile, deleteAccount} = useAuthStore();
  const {isDark, toggleMode} = useThemeStore();
  const setLanguage = useLanguageStore(state => state.setLanguage);

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit profile local state
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editWard, setEditWard] = useState('');
  const [editConstituency, setEditConstituency] = useState('');
  const [editGender, setEditGender] = useState<Gender | null>(null);
  const [editNameError, setEditNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedLanguage = useMemo(
    () => SUPPORTED_LANGUAGES.find(item => item.code === language) ?? SUPPORTED_LANGUAGES[0],
    [language],
  );

  const openEditModal = () => {
    setEditName(user?.name ?? '');
    setEditDob(user?.dob ?? '');
    setEditWard(user?.wardNumber ?? '');
    setEditConstituency(user?.constituency ?? '');
    setEditGender(user?.gender ?? null);
    setEditNameError('');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName.trim().length < 2) {
      setEditNameError(t('profNameMinLength'));
      return;
    }
    setEditNameError('');
    setIsSaving(true);
    await updateProfile({
      name: editName.trim(),
      dob: editDob || undefined,
      wardNumber: editWard || undefined,
      constituency: editConstituency || undefined,
      gender: editGender ?? undefined,
    });
    setIsSaving(false);
    setEditModalVisible(false);
    toastSuccess(t('profileUpdated'));
  };

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

  const handleDeleteAccount = () => {
    showAlert({
      title: t('deleteAccount'),
      message: t('deleteAccountMessage'),
      variant: 'danger',
      actions: [
        {text: t('cancel'), style: 'cancel'},
        {text: t('deleteAccount'), style: 'destructive', onPress: deleteAccount},
      ],
    });
  };

  const links: {icon: MCIcon; labelKey: TranslationKey}[] = [
    {icon: 'bell-outline', labelKey: 'notificationSettings'},
    {icon: 'shield-lock-outline', labelKey: 'privacyPolicy'},
    {icon: 'phone-outline', labelKey: 'contactSupport'},
    {icon: 'information-outline', labelKey: 'aboutApp'},
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.headerBar}>
        {!isTabProfile && (canGoBack || canOpenDrawer) && (
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.8}
            onPress={() => (canGoBack ? navigation.goBack() : navigation.openDrawer())}>
            <MaterialCommunityIcons name={canGoBack ? 'arrow-left' : 'menu'} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{t('myProfile')}</Text>
        <NotificationBell />
      </View>

      <ScrollView style={styles.panel} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile card with Edit button */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name ?? t('user')}</Text>
              <Text style={styles.role}>{user?.role ? t(user.role) : t('citizen')}</Text>
              {!!user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
              {!!user?.wardNumber && (
                <Text style={styles.wardText}>{t('ward')} {user.wardNumber}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={openEditModal} activeOpacity={0.8}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.primary} />
              <Text style={styles.editBtnText}>{t('editProfile')}</Text>
            </TouchableOpacity>
          </View>
          {(!!user?.dob || !!user?.constituency) && (
            <View style={styles.profileMeta}>
              {!!user?.dob && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="cake-variant-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{user.dob}</Text>
                </View>
              )}
              {!!user?.constituency && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{user.constituency}</Text>
                </View>
              )}
              {!!user?.gender && (
                <View style={styles.metaChip}>
                  <MaterialCommunityIcons name="account-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{t(user.gender as 'male' | 'female' | 'other')}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Preferences */}
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

        {/* Links */}
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

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteRow} activeOpacity={0.7} onPress={handleDeleteAccount}>
          <MaterialCommunityIcons name="account-remove-outline" size={20} color={Colors.danger} />
          <Text style={styles.deleteText}>{t('deleteAccount')}</Text>
        </TouchableOpacity>

        <View style={{height: Spacing[10]}} />
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.sheet}>
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

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.editModalWrap}>
          <Pressable style={styles.editOverlay} onPress={() => setEditModalVisible(false)} />
          <View style={styles.editSheet}>
            {/* Sheet handle */}
            <View style={styles.sheetHandle} />
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Phone (read-only) */}
              <Text style={styles.fieldLabel}>{t('mobileNumber')}</Text>
              <View style={styles.readonlyField}>
                <MaterialCommunityIcons name="lock-outline" size={16} color={Colors.textDisabled} style={styles.lockIcon} />
                <Text style={styles.readonlyText}>{user?.phone}</Text>
              </View>
              <Text style={styles.fieldHint}>{t('phoneCannotBeEdited')}</Text>

              {/* Full Name */}
              <Text style={styles.fieldLabel}>{t('username')}</Text>
              <TextInput
                style={[styles.editInput, !!editNameError && styles.editInputError]}
                value={editName}
                onChangeText={v => {setEditName(v); setEditNameError('');}}
                placeholder={t('usernamePlaceholder')}
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="words"
              />
              {!!editNameError && <Text style={styles.inputError}>{editNameError}</Text>}

              {/* Date of Birth */}
              <Text style={styles.fieldLabel}>{t('dateOfBirth')}</Text>
              <TextInput
                style={styles.editInput}
                value={editDob}
                onChangeText={v => setEditDob(formatDob(v, editDob))}
                placeholder={t('dateOfBirthPlaceholder')}
                placeholderTextColor={Colors.textDisabled}
                keyboardType="number-pad"
                maxLength={10}
              />
              <Text style={styles.fieldHint}>{t('dateOfBirthHint')}</Text>

              {/* Ward Number */}
              <Text style={styles.fieldLabel}>{t('wardNumber')}</Text>
              <TextInput
                style={styles.editInput}
                value={editWard}
                onChangeText={setEditWard}
                placeholder={t('wardNumberPlaceholder')}
                placeholderTextColor={Colors.textDisabled}
              />

              {/* Constituency */}
              <Text style={styles.fieldLabel}>{t('constituency')}</Text>
              <TextInput
                style={styles.editInput}
                value={editConstituency}
                onChangeText={setEditConstituency}
                placeholder={t('constituencyPlaceholder')}
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="words"
              />

              {/* Gender */}
              <Text style={styles.fieldLabel}>{t('selectGender')}</Text>
              <View style={styles.genderRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setEditGender(g.id)}
                    style={[styles.genderCard, editGender === g.id && styles.genderCardActive]}>
                    <MaterialCommunityIcons
                      name={g.icon}
                      size={18}
                      color={editGender === g.id ? Colors.primary : Colors.textSecondary}
                    />
                    <Text style={[styles.genderLabel, editGender === g.id && styles.genderLabelActive]}>
                      {t(g.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppButton
                title={isSaving ? t('saving') : t('saveChanges')}
                onPress={handleSaveProfile}
                loading={isSaving}
                style={styles.saveBtn}
              />
              <View style={{height: Spacing[6]}} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Navy.base},
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[4],
    backgroundColor: Navy.base,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerTitle: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: '#FFFFFF'},
  panel: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
  },
  scroll: {paddingHorizontal: Spacing[4], paddingTop: Spacing[4]},

  // Profile card
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  profileRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3]},
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  avatarText: {fontSize: FontSize['2xl'], color: Colors.white, fontWeight: FontWeight.bold},
  profileInfo: {flex: 1},
  name: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  role: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1},
  phone: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold, marginTop: 1},
  wardText: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1},
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  editBtnText: {fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semiBold},
  profileMeta: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[3]},
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metaText: {fontSize: FontSize.xs, color: Colors.textSecondary},

  // Menu
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

  // Actions
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    marginTop: Spacing[1],
  },
  logoutText: {fontSize: FontSize.base, color: Colors.danger, fontWeight: FontWeight.semiBold},
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  deleteText: {fontSize: FontSize.sm, color: Colors.danger, fontWeight: '500'},

  // Language modal
  modalOverlay: {flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end', padding: Spacing[4]},
  sheet: {
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

  // Edit profile modal
  editModalWrap: {flex: 1},
  editOverlay: {flex: 1, backgroundColor: Colors.overlay},
  editSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing[3],
    marginBottom: Spacing[2],
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[5],
  },
  editTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[2],
    marginTop: Spacing[4],
  },
  editInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  editInputError: {borderColor: Colors.danger},
  inputError: {fontSize: FontSize.xs, color: Colors.danger, marginTop: Spacing[1]},
  readonlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.borderLight,
    opacity: 0.7,
  },
  lockIcon: {marginRight: Spacing[2]},
  readonlyText: {fontSize: FontSize.base, color: Colors.textSecondary},
  fieldHint: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing[1]},
  genderRow: {flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[1]},
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  genderCardActive: {borderColor: Colors.primary, backgroundColor: Colors.primaryLight},
  genderLabel: {fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500'},
  genderLabelActive: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  saveBtn: {marginTop: Spacing[6]},
} as const);
