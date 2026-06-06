import React, {useEffect, useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CitizenStackParamList} from '@appTypes/navigation';
import {reportProblemSchema, ReportProblemFormData} from '@utils/validators';
import {AppButton} from '@components/common/AppButton';
import {AppHeader} from '@components/common/AppHeader';
import {AppChip} from '@components/common/AppChip';
import {VoiceNoteRecorder} from '@components/common/VoiceNoteRecorder';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAppAlert} from '@components/common/AppAlert';
import {useImagePicker} from '@hooks/useImagePicker';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {useLocationStore} from '@store/locationStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type Props = NativeStackScreenProps<CitizenStackParamList, 'ReportProblem'>;

const CATEGORIES = [
  {id: 'road', labelKey: 'road', subCategories: ['Pothole', 'Damaged Road', 'No Markings']},
  {id: 'water', labelKey: 'water', subCategories: ['Leakage', 'No Supply', 'Contamination']},
  {id: 'electricity', labelKey: 'electricity', subCategories: ['Street Light', 'Power Cut', 'Damaged Wire']},
  {id: 'sanitation', labelKey: 'sanitation', subCategories: ['Garbage', 'Drainage', 'Open Defecation']},
  {id: 'other', labelKey: 'other', subCategories: ['Noise', 'Encroachment', 'Other']},
];

const PRIORITIES = [
  {id: 'low', labelKey: 'low'},
  {id: 'medium', labelKey: 'medium'},
  {id: 'high', labelKey: 'high'},
];

const HERO_IMAGE = require('@assets/create-complaint.png');

export const ReportProblemScreen: React.FC<Props> = ({navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {showAlert} = useAppAlert();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [descLength, setDescLength] = useState(0);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [messageError, setMessageError] = useState('');

  const {selectedImages, openPicker, removeImage} = useImagePicker(5);
  const {fetchLocation, isLoading: locationLoading} = useCurrentLocation();
  const {coords, address} = useLocationStore();

  const {control, handleSubmit, setValue, watch, formState: {errors}} = useForm<ReportProblemFormData>({
    resolver: zodResolver(reportProblemSchema),
    defaultValues: {category: '', description: '', address: '', priority: 'medium'},
  });
  const description = watch('description') ?? '';

  useEffect(() => {
    if (coords?.latitude) {
      setValue('address', `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`, {shouldValidate: true});
    }
  }, [coords, setValue]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('');
    setValue('category', catId);
  };

  const subCategories = CATEGORIES.find(c => c.id === selectedCategory)?.subCategories ?? [];

  const onSubmit = async (data: ReportProblemFormData) => {
    // A complaint needs EITHER a typed description (min 20 chars) OR a voice note.
    const hasDescription = !!data.description && data.description.trim().length >= 20;
    if (!hasDescription && !voiceUri) {
      setMessageError(t('voiceOrDescriptionRequired'));
      return;
    }
    setMessageError('');
    if (selectedImages.length === 0) {
      showAlert({
        title: t('photoRequired'),
        message: t('photoRequiredMessage'),
        variant: 'warning',
        icon: 'camera-plus-outline',
      });
      return;
    }
    setIsSubmitting(true);
    // TODO: call submitComplaint API + upload images + voice note
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('Success', {kind: 'complaint', refId: 'JAN-' + Date.now().toString().slice(-6)});
    }, 2000);
  };

  const rowItems: {
    icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
    subtitle?: string;
    done: boolean;
    onPress: () => void;
  }[] = [
    {
      icon: 'camera-outline',
      label: t('uploadPhotoVideo'),
      subtitle: selectedImages.length ? `${selectedImages.length} selected` : undefined,
      done: selectedImages.length > 0,
      onPress: openPicker,
    },
    {
      icon: 'microphone-outline',
      label: t('recordAudio'),
      subtitle: voiceUri ? t('voiceNote') : undefined,
      done: !!voiceUri,
      onPress: () => setAudioModalVisible(true),
    },
    {
      icon: 'map-marker-outline',
      label: t('locationRequired'),
      subtitle: address
        ? address
        : coords
        ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
        : locationLoading
        ? t('detecting')
        : undefined,
      done: !!coords,
      onPress: () => fetchLocation(),
    },
    {
      icon: 'pencil-outline',
      label: t('typeYourDescription'),
      subtitle: description.trim() ? description.trim() : undefined,
      done: description.trim().length > 0,
      onPress: () => setDescriptionModalVisible(true),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('reportProblem')} showBack />
      <OfflineBanner />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.heroWrap}>
            <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="contain" />
          </View>

          <Text style={styles.title}>{t('reportProblem')}</Text>
          <Text style={styles.subtitle}>Raise a local issue with photos, voice note, priority, and location details.</Text>

          <View style={styles.formPanel}>
            {/* Category */}
            <Text style={styles.label}>{t('category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {CATEGORIES.map(cat => (
                <AppChip
                  key={cat.id}
                  label={t(cat.labelKey as TranslationKey)}
                  isActive={selectedCategory === cat.id}
                  onPress={() => handleCategorySelect(cat.id)}
                />
              ))}
            </ScrollView>
            {errors.category && <Text style={styles.errorText}>{errors.category.message}</Text>}

            {/* Sub-category */}
            {subCategories.length > 0 && (
              <>
                <Text style={styles.label}>{t('subCategory')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                  {subCategories.map(sub => (
                    <AppChip
                      key={sub}
                      label={sub}
                      isActive={selectedSubCategory === sub}
                      onPress={() => setSelectedSubCategory(sub)}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.rows}>
              {rowItems.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.row, index < rowItems.length - 1 && styles.rowDivider]}
                  activeOpacity={0.72}
                  onPress={item.onPress}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.done ? Colors.primary : Colors.text} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    {!!item.subtitle && (
                      <Text style={styles.rowSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    )}
                  </View>
                  <MaterialCommunityIcons
                    name={item.done ? 'check-circle' : 'chevron-right'}
                    size={item.done ? 20 : 22}
                    color={item.done ? Colors.primary : Colors.textDisabled}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {selectedImages.length > 0 && (
              <View style={styles.photoGrid}>
                {selectedImages.map(img => (
                  <View key={img.uri} style={styles.photoThumb}>
                    <Image source={{uri: img.uri}} style={styles.thumbImg} />
                    <TouchableOpacity
                      onPress={() => removeImage(img.uri!)}
                      style={styles.removeBtn}>
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!!messageError && <Text style={styles.errorText}>{messageError}</Text>}
            {!!errors.address?.message && <Text style={styles.errorText}>{errors.address.message}</Text>}
            {!!errors.description?.message && <Text style={styles.errorText}>{errors.description.message}</Text>}

            {/* Priority */}
            <Text style={styles.label}>{t('priority')}</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => {
                const pColor =
                  p.id === 'low'
                    ? Colors.priorityLow
                    : p.id === 'medium'
                    ? Colors.priorityMedium
                    : Colors.priorityHigh;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {setSelectedPriority(p.id); setValue('priority', p.id as any);}}
                    style={[
                      styles.priorityBtn,
                      selectedPriority === p.id && {
                        backgroundColor: pColor + '20',
                        borderColor: pColor,
                      },
                    ]}>
                    <Text style={[
                      styles.priorityText,
                      selectedPriority === p.id && {color: pColor},
                    ]}>
                      {t(p.labelKey as TranslationKey)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <AppButton
            title={isSubmitting ? t('submitting') : t('submitComplaint')}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        isVisible={descriptionModalVisible}
        onBackdropPress={() => setDescriptionModalVisible(false)}
        onBackButtonPress={() => setDescriptionModalVisible(false)}
        avoidKeyboard
        useNativeDriver
        style={styles.modal}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('typeYourDescription')}</Text>
            <TouchableOpacity onPress={() => setDescriptionModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Controller
            control={control}
            name="description"
            render={({field: {onChange, value, onBlur}}) => (
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <TextInput
                  style={styles.descInput}
                  placeholder={t('problemDescriptionPlaceholder')}
                  placeholderTextColor={Colors.textDisabled}
                  multiline
                  maxLength={500}
                  value={value}
                  onChangeText={text => {
                    onChange(text);
                    setDescLength(text.length);
                    if (text.trim().length >= 20) setMessageError('');
                  }}
                  onBlur={onBlur}
                  autoFocus
                />
              </KeyboardAvoidingView>
            )}
          />
          <Text style={styles.sheetCount}>{descLength}/500</Text>
          <AppButton title={t('done')} onPress={() => setDescriptionModalVisible(false)} style={styles.sheetBtn} />
        </View>
      </Modal>

      <Modal
        isVisible={audioModalVisible}
        onBackdropPress={() => setAudioModalVisible(false)}
        onBackButtonPress={() => setAudioModalVisible(false)}
        useNativeDriver
        style={styles.modal}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('recordAudio')}</Text>
            <TouchableOpacity onPress={() => setAudioModalVisible(false)}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <VoiceNoteRecorder
            value={voiceUri}
            onChange={uri => {
              setVoiceUri(uri);
              if (uri) setMessageError('');
            }}
          />
          <AppButton title={t('done')} onPress={() => setAudioModalVisible(false)} style={styles.sheetBtn} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scroll: {padding: Spacing[5], paddingBottom: Spacing[10]},
  heroWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    marginBottom: Spacing[3],
  },
  heroImage: {
    width: '100%',
    height: 190,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: Spacing[5],
  },
  formPanel: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing[4],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[2],
    marginTop: Spacing[3],
  },
  chipRow: {marginBottom: Spacing[2]},
  errorText: {fontSize: FontSize.xs, color: Colors.danger, marginTop: -Spacing[1], marginBottom: Spacing[2]},
  rows: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing[4],
    marginBottom: Spacing[3],
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    gap: Spacing[3],
  },
  rowDivider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  rowText: {flex: 1},
  rowLabel: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  rowSubtitle: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  modal: {justifyContent: 'flex-end', margin: 0},
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[4],
    paddingBottom: Spacing[6],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  sheetTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  descInput: {
    minHeight: 160,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSoft,
    padding: Spacing[4],
    fontSize: FontSize.base,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  sheetCount: {
    fontSize: FontSize.xs,
    color: Colors.textDisabled,
    textAlign: 'right',
    marginTop: Spacing[1],
  },
  sheetBtn: {
    marginTop: Spacing[4],
  },
  photoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[4]},
  photoThumb: {width: 80, height: 80, position: 'relative'},
  thumbImg: {width: 80, height: 80, borderRadius: BorderRadius.md},
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold},
  priorityRow: {flexDirection: 'row', gap: Spacing[2], marginBottom: Spacing[4]},
  priorityBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  priorityText: {fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary},
  submitBtn: {marginTop: Spacing[5]},
} as const);
