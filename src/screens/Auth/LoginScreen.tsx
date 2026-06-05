import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AuthStackParamList, UserRole, Gender} from '@appTypes/navigation';
import {loginSchema, LoginFormData} from '@utils/validators';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const ROLES: {id: UserRole; icon: MaterialCommunityIconName}[] = [
  {id: 'citizen', icon: 'account-outline'},
  {id: 'politician', icon: 'bank-outline'},
  {id: 'admin', icon: 'shield-outline'},
  {id: 'volunteer', icon: 'hand-heart-outline'},
];

const GENDERS: {id: Gender; icon: MaterialCommunityIconName; labelKey: 'male' | 'female' | 'other'}[] = [
  {id: 'male', icon: 'gender-male', labelKey: 'male'},
  {id: 'female', icon: 'gender-female', labelKey: 'female'},
  {id: 'other', icon: 'gender-male-female', labelKey: 'other'},
];

export const LoginScreen: React.FC<Props> = ({navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [genderError, setGenderError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {phone: ''},
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!selectedGender) {
      setGenderError(true);
      return;
    }
    setIsLoading(true);
    // TODO: call sendOTP API
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('OTPVerification', {phone: data.phone, role: selectedRole, gender: selectedGender});
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoBubble}>
              <MaterialCommunityIcons name="vote-outline" size={42} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>{t('selectRole')}</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map(role => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => setSelectedRole(role.id)}
                  style={[
                    styles.roleCard,
                    selectedRole === role.id && styles.roleCardActive,
                  ]}>
                  <View style={[styles.roleIconBubble, selectedRole === role.id && styles.roleIconBubbleActive]}>
                    <MaterialCommunityIcons
                      name={role.icon}
                      size={26}
                      color={selectedRole === role.id ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text style={[
                    styles.roleLabel,
                    selectedRole === role.id && styles.roleLabelActive,
                  ]}>
                    {t(role.id)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t('selectGender')}</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => {setSelectedGender(g.id); setGenderError(false);}}
                  style={[styles.genderCard, selectedGender === g.id && styles.genderCardActive]}>
                  <MaterialCommunityIcons
                    name={g.icon}
                    size={22}
                    color={selectedGender === g.id ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.genderLabel, selectedGender === g.id && styles.genderLabelActive]}>
                    {t(g.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {genderError && <Text style={styles.genderError}>{t('genderRequired')}</Text>}

            <Controller
              control={control}
              name="phone"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label={t('mobileNumber')}
                  placeholder={t('mobilePlaceholder')}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />

            <AppButton
              title={isLoading ? t('sendingOTP') : t('sendOTP')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Navy.base},
  flex: {flex: 1},
  scroll: {flexGrow: 1},
  header: {alignItems: 'center', paddingHorizontal: Spacing[6], paddingTop: Spacing[8], paddingBottom: Spacing[6], backgroundColor: Navy.base},
  logoBubble: {
    width: 84,
    height: 84,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  appName: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing[1],
  },
  form: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[6],
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[3],
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing[6],
  },
  roleCard: {
    width: '48%',
    alignItems: 'center',
    padding: Spacing[4],
    marginBottom: Spacing[2],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleIconBubble: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    marginBottom: Spacing[2],
  },
  roleIconBubbleActive: {backgroundColor: Colors.surface},
  roleLabel: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500'},
  roleLabelActive: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  genderRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  genderCardActive: {borderColor: Colors.primary, backgroundColor: Colors.primaryLight},
  genderLabel: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500'},
  genderLabelActive: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  genderError: {fontSize: FontSize.xs, color: Colors.danger, marginTop: -Spacing[2], marginBottom: Spacing[3]},
  submitBtn: {marginTop: Spacing[4]},
} as const);
