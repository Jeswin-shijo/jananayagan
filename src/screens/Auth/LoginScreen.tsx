import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  View,
  Text,
  StyleSheet,
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
import {AuthStackParamList, UserRole} from '@appTypes/navigation';
import {loginSchema, LoginFormData} from '@utils/validators';
import {AppButton} from '@components/common/AppButton';
import {AppInput} from '@components/common/AppInput';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {AppStrings} from '@constants/strings';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const ROLES: {id: UserRole; label: string; icon: MaterialCommunityIconName}[] = [
  {id: 'citizen', label: 'Citizen', icon: 'account-outline'},
  {id: 'politician', label: 'Politician', icon: 'bank-outline'},
  {id: 'admin', label: 'Admin', icon: 'shield-outline'},
  {id: 'volunteer', label: 'Volunteer', icon: 'hand-heart-outline'},
];

export const LoginScreen: React.FC<Props> = ({navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [isLoading, setIsLoading] = useState(false);

  const {control, handleSubmit, formState: {errors}} = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {phone: ''},
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    // TODO: call sendOTP API
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('OTPVerification', {phone: data.phone});
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.appName}>{AppStrings.appName}</Text>
            <Text style={styles.tagline}>{AppStrings.tagline}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.sectionTitle}>{AppStrings.selectRole}</Text>
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
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Controller
              control={control}
              name="phone"
              render={({field: {onChange, value, onBlur}}) => (
                <AppInput
                  label="Mobile Number"
                  placeholder="Enter 10-digit number"
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
              title={isLoading ? 'Sending OTP...' : AppStrings.sendOTP}
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

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {flexGrow: 1, padding: Spacing[6]},
  header: {alignItems: 'center', marginTop: Spacing[8], marginBottom: Spacing[8]},
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
    color: Colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing[1],
  },
  form: {flex: 1},
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
  submitBtn: {marginTop: Spacing[4]},
});
