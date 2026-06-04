import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppInput} from '@components/common/AppInput';
import {AppButton} from '@components/common/AppButton';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TextInputProps} from 'react-native';

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

export const FormModal: React.FC<FormModalProps> = ({visible, title, fields, submitLabel, onSubmit, onClose}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (visible) {
      setValues({});
      setTouched(false);
    }
  }, [visible]);

  const setField = (key: string, val: string) => setValues(prev => ({...prev, [key]: val}));

  const handleSubmit = () => {
    setTouched(true);
    const missing = fields.some(f => f.required && !values[f.key]?.trim());
    if (missing) {
      return;
    }
    onSubmit(values);
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      useNativeDriver
      backdropOpacity={0.5}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {fields.map(field => (
              <AppInput
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                multiline={field.multiline}
                keyboardType={field.keyboardType}
                value={values[field.key] ?? ''}
                onChangeText={v => setField(field.key, v)}
                error={touched && field.required && !values[field.key]?.trim() ? t('requiredField') : undefined}
                style={field.multiline ? styles.multiline : undefined}
              />
            ))}
            <AppButton title={submitLabel} onPress={handleSubmit} style={styles.submit} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (Colors: AppColors) => ({
  modal: {justifyContent: 'flex-end', margin: 0},
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
    paddingTop: Spacing[2],
    maxHeight: '85%',
  },
  handle: {width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing[3]},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[4]},
  title: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  closeBtn: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  multiline: {minHeight: 90, textAlignVertical: 'top'},
  submit: {marginTop: Spacing[2]},
} as const);
