import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppCard} from '@components/common/AppCard';
import {DrawerHeader} from '@components/common/DrawerHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {MOCK_MEDIA, MediaItem} from '@utils/politicianData';
import {toastSuccess, toastError} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.85, 620);

type MediaType = 'photo' | 'video' | 'document';
const MEDIA_TYPES: {key: MediaType; icon: MaterialCommunityIconName}[] = [
  {key: 'photo', icon: 'image-outline'},
  {key: 'video', icon: 'video-outline'},
  {key: 'document', icon: 'file-document-outline'},
];

export const MediaCenterScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const [items, setItems] = useState<MediaItem[]>(MOCK_MEDIA);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [internalVisible, setInternalVisible] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sheetVisible) {
      setTitle('');
      setMediaType('photo');
      setPickedUri(null);
      setTouched(false);
      setInternalVisible(true);
      Animated.parallel([
        Animated.spring(slideAnim, {toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14}),
        Animated.timing(backdropAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      closeSheet();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetVisible]);

  const closeSheet = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {toValue: SHEET_HEIGHT, duration: 240, useNativeDriver: true}),
      Animated.timing(backdropAnim, {toValue: 0, duration: 200, useNativeDriver: true}),
    ]).start(() => {
      setInternalVisible(false);
      setSheetVisible(false);
    });
  };

  const handlePickMedia = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toastError(t('mcPermissionDenied'), t('mcAllowMediaAccess'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video'
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPickedUri(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    setTouched(true);
    if (!title.trim()) return;
    setUploading(true);
    setTimeout(() => {
      const iconMap: Record<MediaType, MaterialCommunityIconName> = {
        photo: 'image-outline',
        video: 'video-outline',
        document: 'file-document-outline',
      };
      const newItem: MediaItem = {
        id: `m-${Date.now()}`,
        title: title.trim(),
        typeKey: mediaType,
        ago: t('justNow'),
        views: 0,
        icon: iconMap[mediaType],
      };
      setItems(prev => [newItem, ...prev]);
      setUploading(false);
      toastSuccess(t('mediaUploaded'));
      setSheetVisible(false);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DrawerHeader title={t('mediaCenter')} />
      <OfflineBanner />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setSheetVisible(true)} activeOpacity={0.85} style={styles.createBtn}>
          <LinearGradient colors={['#2563EB', '#06B6D4']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.createBtnGradient}>
            <Text style={styles.createBtnText}>{t('uploadMedia')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {items.map(m => (
          <AppCard key={m.id}>
            <View style={styles.row}>
              <View style={styles.thumb}>
                <MaterialCommunityIcons name={m.icon as MaterialCommunityIconName} size={24} color={Colors.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.itemTitle} numberOfLines={2}>{m.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{t(m.typeKey as TranslationKey)}</Text>
                  </View>
                  <Text style={styles.meta}>{m.views.toLocaleString()} {t('views')} · {t('agoShort', {time: m.ago})}</Text>
                </View>
              </View>
            </View>
          </AppCard>
        ))}
        <View style={{height: Spacing[8]}} />
      </ScrollView>

      {/* Upload Sheet */}
      <Modal
        visible={internalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeSheet}>

        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View style={[styles.backdrop, {opacity: backdropAnim}]} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kavWrapper}
          pointerEvents="box-none">
          <Animated.View style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>

            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('uploadMedia')}</Text>
              <TouchableOpacity onPress={closeSheet} style={styles.closeBtn} activeOpacity={0.7}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <MaterialCommunityIcons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetBody}>

              {/* Media type selector */}
              <Text style={styles.label}>{t('mcMediaType')}</Text>
              <View style={styles.typeRow}>
                {MEDIA_TYPES.map(mt => (
                  <TouchableOpacity
                    key={mt.key}
                    onPress={() => { setMediaType(mt.key); setPickedUri(null); }}
                    style={[styles.typeChip, mediaType === mt.key && styles.typeChipActive]}
                    activeOpacity={0.75}>
                    <MaterialCommunityIcons
                      name={mt.icon}
                      size={16}
                      color={mediaType === mt.key ? '#FFFFFF' : Colors.textSecondary}
                    />
                    <Text style={[styles.typeChipLabel, mediaType === mt.key && styles.typeChipLabelActive]}>
                      {t(mt.key as TranslationKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title */}
              <Text style={styles.label}>
                {t('title')} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, touched && !title.trim() && styles.inputError]}
                placeholder={t('mcEnterMediaTitle')}
                placeholderTextColor={Colors.textDisabled}
                value={title}
                onChangeText={setTitle}
              />
              {touched && !title.trim() && (
                <Text style={styles.errorText}>{t('mcTitleRequired')}</Text>
              )}

              {/* File picker */}
              {mediaType !== 'document' && (
                <>
                  <Text style={[styles.label, {marginTop: Spacing[2]}]}>
                    {mediaType === 'photo' ? t('mcSelectPhoto') : t('mcSelectVideo')}
                  </Text>
                  <TouchableOpacity onPress={handlePickMedia} activeOpacity={0.8} style={styles.pickerBtn}>
                    {pickedUri && mediaType === 'photo' ? (
                      <Image source={{uri: pickedUri}} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                      <View style={styles.pickerPlaceholder}>
                        <MaterialCommunityIcons
                          name={mediaType === 'photo' ? 'image-plus' : 'video-plus'}
                          size={32}
                          color={Colors.primary}
                        />
                        <Text style={styles.pickerText}>
                          {pickedUri
                            ? t('mcVideoSelectedTapToChange')
                            : mediaType === 'photo'
                              ? t('mcTapToSelectPhoto')
                              : t('mcTapToSelectVideo')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Upload button */}
              <TouchableOpacity
                onPress={handleUpload}
                activeOpacity={0.85}
                style={styles.submitBtn}
                disabled={uploading}>
                <LinearGradient
                  colors={['#2563EB', '#06B6D4']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.submitGradient}>
                  <Text style={styles.submitText}>
                    {uploading ? t('mcUploading') : t('uploadMedia')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{height: Spacing[6]}} />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4]},

  createBtn: {marginBottom: Spacing[5]},
  createBtnGradient: {borderRadius: BorderRadius['2xl'], overflow: 'hidden' as const, paddingVertical: Spacing[4], alignItems: 'center' as const},
  createBtnText: {color: '#FFFFFF', fontSize: FontSize.base, fontWeight: FontWeight.bold, letterSpacing: 0.3},

  row: {flexDirection: 'row' as const, gap: Spacing[3], alignItems: 'center' as const},
  thumb: {width: 56, height: 56, borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryLight, alignItems: 'center' as const, justifyContent: 'center' as const},
  info: {flex: 1},
  itemTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[2]},
  metaRow: {flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing[2]},
  typeTag: {backgroundColor: Colors.secondaryLight, paddingHorizontal: Spacing[2], paddingVertical: 1, borderRadius: BorderRadius.full},
  typeText: {fontSize: 10, color: Colors.secondaryDark, fontWeight: FontWeight.semiBold},
  meta: {fontSize: FontSize.xs, color: Colors.textSecondary},

  // Sheet
  backdrop: {
    position: 'absolute' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kavWrapper: {flex: 1, justifyContent: 'flex-end' as const},
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
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center' as const,
    marginTop: Spacing[3], marginBottom: Spacing[1],
  },
  sheetHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
  },
  sheetTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  closeBtn: {
    width: 32, height: 32, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSoft,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  sheetBody: {paddingHorizontal: Spacing[5], paddingBottom: Spacing[2]},

  // Type chips
  typeRow: {flexDirection: 'row' as const, gap: Spacing[2], marginBottom: Spacing[4]},
  typeChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  typeChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  typeChipLabel: {fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semiBold},
  typeChipLabelActive: {color: '#FFFFFF'},

  label: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, marginBottom: Spacing[2]},
  required: {color: Colors.danger},

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
    marginBottom: Spacing[1],
  } as object,
  inputError: {borderColor: Colors.danger},
  errorText: {fontSize: FontSize.xs, color: Colors.danger, marginBottom: Spacing[3]},

  // Picker
  pickerBtn: {
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed' as const,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
    marginBottom: Spacing[4],
    height: 140,
  },
  pickerPlaceholder: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: Spacing[2],
    backgroundColor: Colors.background,
  },
  pickerText: {fontSize: FontSize.sm, color: Colors.textSecondary},
  previewImage: {width: '100%' as const, height: '100%' as const},

  // Submit
  submitBtn: {marginTop: Spacing[2]},
  submitGradient: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden' as const,
    paddingVertical: Spacing[4],
    alignItems: 'center' as const,
  },
  submitText: {color: '#FFFFFF', fontSize: FontSize.base, fontWeight: FontWeight.bold, letterSpacing: 0.3},
} as const);
