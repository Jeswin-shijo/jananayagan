import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import {AppColors} from '@constants/colors';
import {FontSize} from '@constants/typography';
import {BorderRadius, Spacing} from '@constants/spacing';
import {useTranslation} from '@hooks/useTranslation';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  isPassword = false,
  ...props
}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focused,
          !!error && styles.errorBorder,
        ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.withLeftIcon : null]}
          placeholderTextColor={Colors.textDisabled}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(v => !v)}
            style={styles.iconRight}>
            <Text style={styles.toggleText}>{showPassword ? t('hide') : t('show')}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {marginBottom: Spacing[4]},
  label: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing[1],
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  focused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    shadowColor: Colors.primary,
    shadowOpacity: 0.14,
  },
  errorBorder: {borderColor: Colors.danger},
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    minHeight: 52,
  },
  withLeftIcon: {paddingLeft: Spacing[2]},
  iconLeft: {paddingLeft: Spacing[3]},
  iconRight: {paddingRight: Spacing[3]},
  toggleText: {fontSize: FontSize.sm, color: Colors.primary},
  errorText: {fontSize: FontSize.xs, color: Colors.danger, marginTop: Spacing[1]},
});
