import React, {useState, useEffect, useRef} from 'react';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@appTypes/navigation';
import {AppButton} from '@components/common/AppButton';
import {AppHeader} from '@components/common/AppHeader';
import {useAuthStore} from '@store/authStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {formatPhone} from '@utils/formatters';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

const OTP_LENGTH = 6;

export const OTPVerificationScreen: React.FC<Props> = ({route}) => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {phone, role, gender, registrationData} = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const {login} = useAuthStore();

  useEffect(() => {
    const focusTimer = setTimeout(() => inputs.current[0]?.focus(), 300);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearTimeout(focusTimer);
      clearInterval(timer);
    };
  }, []);

  const handleOTPChange = (text: string, index: number) => {
    if (!/^\d*$/.test(text)) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');
    if (text && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) {
      setError(t('otpIncomplete'));
      return;
    }
    setIsLoading(true);
    setError('');
    // TODO: call verifyOTP API
    setTimeout(async () => {
      setIsLoading(false);
      await login(
        {
          id: '1',
          name: registrationData?.name ?? 'Demo User',
          phone,
          role,
          gender,
          dob: registrationData?.dob,
          wardNumber: registrationData?.wardNumber,
          constituency: role === 'politician' || role === 'admin' ? 'Coimbatore South' : undefined,
        },
        'mock_token_12345',
      );
    }, 1200);
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(30);
    setCanResend(false);
    setError('');
    // TODO: call sendOTP API
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('verifyOTP')} showBack showBell={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('enterVerificationCode')}</Text>
          <Text style={styles.subtitle}>
            {t('otpSubtitle', {phone: formatPhone(phone)})}
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={el => {inputs.current[idx] = el;}}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null, error ? styles.otpBoxError : null]}
                value={digit}
                onChangeText={text => handleOTPChange(text, idx)}
                onKeyPress={({nativeEvent}) => handleKeyPress(nativeEvent.key, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <AppButton
            title={isLoading ? t('verifying') : t('verifyOTP')}
            onPress={handleVerify}
            loading={isLoading}
            style={styles.btn}
          />

          <TouchableOpacity onPress={handleResend} disabled={!canResend} style={styles.resendRow}>
            <Text style={[styles.resendText, !canResend && styles.resendDisabled]}>
              {canResend ? t('resendOTP') : t('resendIn', {seconds: countdown})}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  content: {flex: 1, padding: Spacing[6], alignItems: 'center'},
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing[8],
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[8],
  },
  phone: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  otpRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  otpBox: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    textAlign: 'center',
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  otpBoxFilled: {borderColor: Colors.primary, backgroundColor: Colors.primaryLight},
  otpBoxError: {borderColor: Colors.danger},
  error: {fontSize: FontSize.sm, color: Colors.danger, marginBottom: Spacing[4]},
  btn: {marginTop: Spacing[4], width: '100%'},
  resendRow: {marginTop: Spacing[6]},
  resendText: {fontSize: FontSize.base, color: Colors.primary, fontWeight: '500'},
  resendDisabled: {color: Colors.textDisabled},
} as const);
