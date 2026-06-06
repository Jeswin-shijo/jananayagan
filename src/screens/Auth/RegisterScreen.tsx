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
import {registerSchema, RegisterFormData} from '@utils/validators';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
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

const formatDob = (text: string, prev: string): string => {
  const digits = text.replace(/\D/g, '');
  if (text.length < prev.length) return text;
  if (digits.length === 2 || digits.length === 4) return digits.slice(0, 2) + '/' + digits.slice(2, 4) + (digits.length === 4 ? '/' : '');
  if (digits.length > 4) return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
  return digits;
};

export const RegisterScreen: React.FC<Props> = ({navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [genderError, setGenderError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {name: '', phone: '', dob: '', wardNumber: ''},
  });

  const dobValue = watch('dob');

  const onSubmit = async (data: RegisterFormData) => {
    if (!selectedGender) {
      setGenderError(true);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('OTPVerification', {
        phone: data.phone,
        role: selectedRole,
        gender: selectedGender,
        registrationData: {name: data.name, dob: data.dob, wardNumber: data.wardNumber},
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.logoBubble}>
              <MaterialCommunityIcons name="account-plus-outline" size={38} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{t('createAccount')}</Text>
            <Text style={styles.subtitle}>{t('tagline')}</Text>
          </View>

          <View style={styles.form}>
            {/* Role */}
            <Text style={styles.sectionTitle}>{t('selectRole')}</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map(role => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => setSelectedRole(role.id)}
                  style={[styles.roleCard, selectedRole === role.id && styles.roleCardActive]}>
                  <View style={[styles.roleIconBubble, selectedRole === role.id && styles.roleIconBubbleActive]}>
                    <MaterialCommunityIcons
                      name={role.icon}
                      size={24}
                      color={selectedRole === role.id ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.roleLabel, selectedRole === role.id && styles.roleLabelActive]}>
                    {t(role.id)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Full Name */}
            <Controller
              control={control}
              name="name"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label={t('username')}
                  placeholder={t('usernamePlaceholder')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                />
              )}
            />

            {/* Phone */}
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
                  onChangeText={v => onChange(v.replace(/\D/g, ''))}
                  onBlur={onBlur}
                  error={errors.phone?.message}
                />
              )}
            />

            {/* Date of Birth */}
            <Controller
              control={control}
              name="dob"
              render={({field: {onChange, value, onBlur}}) => (
                <>
                  <AppInput
                    label={t('dateOfBirth')}
                    placeholder={t('dateOfBirthPlaceholder')}
                    keyboardType="number-pad"
                    maxLength={10}
                    value={value}
                    onChangeText={text => {
                      const formatted = formatDob(text, value);
                      onChange(formatted);
                      setValue('dob', formatted);
                    }}
                    onBlur={onBlur}
                    error={errors.dob?.message}
                  />
                  {!errors.dob && (
                    <Text style={styles.fieldHint}>{t('dateOfBirthHint')}</Text>
                  )}
                </>
              )}
            />

            {/* Ward Number */}
            <Controller
              control={control}
              name="wardNumber"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label={t('wardNumber')}
                  placeholder={t('wardNumberPlaceholder')}
                  keyboardType="default"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.wardNumber?.message}
                />
              )}
            />

            {/* Gender */}
            <Text style={styles.sectionTitle}>{t('selectGender')}</Text>
            <View style={styles.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => {setSelectedGender(g.id); setGenderError(false);}}
                  style={[styles.genderCard, selectedGender === g.id && styles.genderCardActive]}>
                  <MaterialCommunityIcons
                    name={g.icon}
                    size={20}
                    color={selectedGender === g.id ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.genderLabel, selectedGender === g.id && styles.genderLabelActive]}>
                    {t(g.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {genderError && <Text style={styles.genderError}>{t('genderRequired')}</Text>}

            <AppButton
              title={isLoading ? t('registering') : t('register')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitBtn}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}> {t('loginHere')}</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    backgroundColor: Navy.base,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[4],
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  logoBubble: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  title: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: '#FFFFFF', letterSpacing: 1},
  subtitle: {fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', marginTop: Spacing[1]},
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
    marginTop: Spacing[2],
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  roleCard: {
    width: '48%',
    alignItems: 'center',
    padding: Spacing[3],
    marginBottom: Spacing[2],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardActive: {borderColor: Colors.primary, backgroundColor: Colors.primaryLight},
  roleIconBubble: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    marginBottom: Spacing[1],
  },
  roleIconBubbleActive: {backgroundColor: Colors.surface},
  roleLabel: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500'},
  roleLabelActive: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  genderRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[3]},
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
  genderError: {fontSize: FontSize.xs, color: Colors.danger, marginTop: -Spacing[1], marginBottom: Spacing[2]},
  submitBtn: {marginTop: Spacing[5]},
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[4],
    paddingBottom: Spacing[6],
  },
  loginHint: {fontSize: FontSize.sm, color: Colors.textSecondary},
  loginLink: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
  fieldHint: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: -Spacing[3],
    marginBottom: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
} as const);
