import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useEmergencyContactsStore, EmergencyContact, MAX_EMERGENCY_CONTACTS} from '@store/emergencyContactsStore';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

export interface EmergencyContactsSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface EmergencyContactsSheetProps {
  // Accent colour for the icon + save button (defaults to theme primary).
  accent?: string;
}

const isValid = (n: string) => /^\d{10}$/.test(n);
const digitsOnly = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 10);
const blank = (): EmergencyContact => ({name: '', phone: ''});

export const EmergencyContactsSheet = forwardRef<EmergencyContactsSheetRef, EmergencyContactsSheetProps>(
  ({accent}, ref) => {
    const Colors = useAppColors();
    const styles = useThemedStyles(createStyles);
    const {t} = useTranslation();
    const {contacts, setContacts} = useEmergencyContactsStore();
    const tint = accent ?? Colors.primary;

    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['65%', '92%'], []);
    const [entries, setEntries] = useState<EmergencyContact[]>([blank()]);
    const [touched, setTouched] = useState(false);

    // Seed the fields from the stored contacts each time the sheet opens.
    const seed = useCallback(() => {
      const list = contacts.slice(0, MAX_EMERGENCY_CONTACTS).map(c => ({name: c.name, phone: c.phone}));
      setEntries(list.length ? list : [blank()]);
      setTouched(false);
    }, [contacts]);

    useImperativeHandle(ref, () => ({
      present: () => {
        seed();
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }), [seed]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
      ),
      [],
    );

    const update = (index: number, field: keyof EmergencyContact, value: string) =>
      setEntries(prev =>
        prev.map((e, i) =>
          i === index ? {...e, [field]: field === 'phone' ? digitsOnly(value) : value} : e,
        ),
      );

    const addField = () =>
      setEntries(prev => (prev.length < MAX_EMERGENCY_CONTACTS ? [...prev, blank()] : prev));

    const removeField = (index: number) =>
      setEntries(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

    const filled = entries.filter(e => e.phone.trim().length > 0);
    const noneFilled = filled.length === 0;

    const save = async () => {
      setTouched(true);
      if (noneFilled || filled.some(e => !isValid(e.phone))) {
        return; // surface inline errors
      }
      await setContacts(filled.map(e => ({name: e.name.trim(), phone: e.phone})));
      toastSuccess(t('contactsSaved'));
      sheetRef.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.background}
        handleIndicatorStyle={styles.handle}>
        <BottomSheetScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={[styles.iconWrap, {backgroundColor: `${tint}1A`}]}>
              <MaterialCommunityIcons name="account-heart-outline" size={22} color={tint} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t('emergencyContacts')}</Text>
              <Text style={styles.subtitle}>{t('emergencyContactsHint')}</Text>
            </View>
          </View>

          {entries.map((e, i) => {
            const showError = touched && e.phone.trim().length > 0 && !isValid(e.phone);
            return (
              <View key={i} style={styles.group}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupLabel}>{t('contact')} {i + 1}</Text>
                  {entries.length > 1 && (
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeField(i)}>
                      <MaterialCommunityIcons name="close" size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.inputBox}>
                  <MaterialCommunityIcons name="account-outline" size={18} color={Colors.textSecondary} />
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder={t('contactNamePlaceholder')}
                    placeholderTextColor={Colors.textDisabled}
                    value={e.name}
                    onChangeText={v => update(i, 'name', v)}
                  />
                </View>

                <View style={[styles.inputBox, styles.inputSpaced, showError && styles.inputBoxError]}>
                  <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.textSecondary} />
                  <BottomSheetTextInput
                    style={styles.input}
                    placeholder={t('contactPhonePlaceholder')}
                    placeholderTextColor={Colors.textDisabled}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={e.phone}
                    onChangeText={v => update(i, 'phone', v)}
                  />
                </View>
                {showError && <Text style={styles.error}>{t('invalidPhone')}</Text>}
              </View>
            );
          })}

          {touched && noneFilled && <Text style={styles.error}>{t('addAtLeastOneNumber')}</Text>}

          {entries.length < MAX_EMERGENCY_CONTACTS && (
            <TouchableOpacity style={styles.addRow} onPress={addField} activeOpacity={0.85}>
              <View style={[styles.addIcon, {borderColor: tint}]}>
                <MaterialCommunityIcons name="plus" size={18} color={tint} />
              </View>
              <Text style={[styles.addText, {color: tint}]}>{t('addAnotherNumber')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.saveBtn, {backgroundColor: tint}]} onPress={save} activeOpacity={0.85}>
            <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveText}>{t('saveContacts')}</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

const createStyles = (Colors: AppColors) => ({
  background: {backgroundColor: Colors.surface, borderRadius: BorderRadius['2xl']},
  handle: {backgroundColor: Colors.border, width: 46},
  content: {paddingHorizontal: Spacing[5], paddingBottom: Spacing[8]},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[4]},
  iconWrap: {width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3]},
  headerText: {flex: 1},
  title: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  subtitle: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, lineHeight: 16},
  group: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSoft,
    padding: Spacing[3],
    marginBottom: Spacing[3],
  },
  groupHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[2]},
  groupLabel: {fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.semiBold},
  removeBtn: {width: 28, height: 28, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dangerLight},
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[3],
  },
  inputSpaced: {marginTop: Spacing[2]},
  inputBoxError: {borderColor: Colors.danger, backgroundColor: Colors.dangerLight},
  input: {flex: 1, fontSize: FontSize.base, color: Colors.text, padding: 0},
  error: {fontSize: FontSize.xs, color: Colors.danger, marginTop: Spacing[1], marginLeft: Spacing[1]},
  addRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingVertical: Spacing[2], marginBottom: Spacing[4]},
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold},
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    height: 52,
    borderRadius: BorderRadius.xl,
  },
  saveText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md},
} as const);
