import React, {useRef, useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TextInputProps} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.85, 600);

export type FormField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  required?: boolean;
};

interface FormModalProps {
  visible: boolean;
  title: string;
  fields: FormField[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}

export const FormModal: React.FC<FormModalProps> = ({
  visible,
  title,
  fields,
  submitLabel,
  onSubmit,
  onClose,
}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [internalVisible, setInternalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setValues({});
      setTouched(false);
      setFocusedKey(null);
      setInternalVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14}),
        Animated.timing(backdropAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      closeSheet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true}),
      Animated.timing(backdropAnim, {toValue: 0, duration: 200, useNativeDriver: true}),
    ]).start(() => {
      setInternalVisible(false);
      onClose();
    });
  };

  const setField = (key: string, val: string) =>
    setValues(prev => ({...prev, [key]: val}));

  const handleSubmit = () => {
    setTouched(true);
    const missing = fields.some(f => f.required && !values[f.key]?.trim());
    if (missing) return;
    onSubmit(values);
    closeSheet();
  };

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}>

      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View style={[styles.backdrop, {opacity: backdropAnim}]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kavWrapper}
        pointerEvents="box-none">
        <Animated.View
          style={[
            styles.sheet,
            {transform: [{translateY: slideAnim}]},
          ]}>

          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={closeSheet}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fieldList}>

            {fields.map(field => {
              const hasError = touched && field.required && !values[field.key]?.trim();
              const isFocused = focusedKey === field.key;
              return (
                <View key={field.key} style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    {field.label}
                    {field.required && <Text style={styles.requiredStar}> *</Text>}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      field.multiline && styles.inputMultiline,
                      isFocused && styles.inputFocused,
                      hasError && styles.inputError,
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textDisabled}
                    value={values[field.key] ?? ''}
                    onChangeText={v => setField(field.key, v)}
                    keyboardType={field.keyboardType ?? 'default'}
                    multiline={field.multiline}
                    textAlignVertical={field.multiline ? 'top' : 'center'}
                    onFocus={() => setFocusedKey(field.key)}
                    onBlur={() => setFocusedKey(null)}
                  />
                  {hasError && (
                    <Text style={styles.errorText}>{t('requiredField')}</Text>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              style={styles.submitBtn}>
              <LinearGradient
                colors={['#2563EB', '#06B6D4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.submitGradient}>
                <Text style={styles.submitText}>{submitLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{height: Spacing[6]}} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (Colors: AppColors) => ({
  backdrop: {
    ...({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    } as const),
  },

  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SHEET_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },

  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center' as const,
    marginTop: Spacing[3],
    marginBottom: Spacing[1],
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSoft,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  fieldList: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[2],
  },
  fieldGroup: {marginBottom: Spacing[4]},
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  requiredStar: {color: Colors.danger},

  input: {
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSize.base,
    color: Colors.text,
    minHeight: 52,
  } as object,
  inputMultiline: {
    minHeight: 100,
    paddingTop: Spacing[3],
  },
  inputFocused: {borderColor: Colors.primary},
  inputError: {borderColor: Colors.danger},
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: Spacing[1],
  },

  submitBtn: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden' as const,
    marginTop: Spacing[2],
  },
  submitGradient: {
    paddingVertical: Spacing[4],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
} as const);
