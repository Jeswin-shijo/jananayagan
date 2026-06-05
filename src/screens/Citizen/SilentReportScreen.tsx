import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {CitizenStackParamList} from '@appTypes/navigation';
import {AppHeader} from '@components/common/AppHeader';
import {AppButton} from '@components/common/AppButton';
import {VoiceNoteRecorder} from '@components/common/VoiceNoteRecorder';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useImagePicker} from '@hooks/useImagePicker';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {useLocationStore} from '@store/locationStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type Props = NativeStackScreenProps<CitizenStackParamList, 'SilentReport'>;
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';

// Hero illustration. Swap the file at src/assets/silent-report.png to update it;
// set to null to fall back to the icon composition below.
const HERO_IMAGE: number | null = require('@assets/silent-report.png');

export const SilentReportScreen: React.FC<Props> = ({navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  const [description, setDescription] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [descModal, setDescModal] = useState(false);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [audioModal, setAudioModal] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);

  const {selectedImages, openPicker} = useImagePicker(5);
  const {fetchLocation, isLoading: locationLoading} = useCurrentLocation();
  const {coords, address} = useLocationStore();

  const toggleLocation = () => {
    const next = !shareLocation;
    setShareLocation(next);
    if (next && !coords) {
      fetchLocation().catch(() => {});
    }
  };

  const openDescription = () => {
    setDescDraft(description);
    setDescModal(true);
  };

  const saveDescription = () => {
    setDescription(descDraft.trim());
    setDescModal(false);
    if (descDraft.trim().length >= 10) setError('');
  };

  const onSubmit = () => {
    const hasDescription = description.trim().length >= 10;
    if (!hasDescription && !voiceUri) {
      setError(t('voiceOrDescriptionRequired'));
      return;
    }
    setError('');
    setSubmitting(true);
    // Anonymous submission — no user identity is attached.
    setTimeout(() => {
      setSubmitting(false);
      setRefId('SR-' + Date.now().toString().slice(-6));
    }, 1600);
  };

  const locationSubtitle = shareLocation
    ? address
      ? address
      : locationLoading
      ? t('locating')
      : coords
      ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
      : t('detecting')
    : undefined;

  type Row = {icon: IconName; label: string; subtitle?: string; done: boolean; onPress: () => void};
  const rows: Row[] = [
    {
      icon: 'camera-outline',
      label: t('uploadPhotoVideo'),
      subtitle: selectedImages.length ? `${selectedImages.length}` : undefined,
      done: selectedImages.length > 0,
      onPress: openPicker,
    },
    {
      icon: 'microphone-outline',
      label: t('recordAudio'),
      done: !!voiceUri,
      onPress: () => setAudioModal(true),
    },
    {
      icon: 'map-marker-outline',
      label: t('locationOptional'),
      subtitle: locationSubtitle,
      done: shareLocation && !!coords,
      onPress: toggleLocation,
    },
    {
      icon: 'pencil-outline',
      label: t('typeYourDescription'),
      subtitle: description ? description : undefined,
      done: description.trim().length > 0,
      onPress: openDescription,
    },
  ];

  if (refId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppHeader
          title={t('silentReport')}
          showBack
          rightAction={<MaterialCommunityIcons name="shield-check" size={22} color={PURPLE} />}
        />
        <View style={styles.successWrap}>
          <View style={styles.successRing}>
            <MaterialCommunityIcons name="shield-check" size={40} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>{t('reportSubmitted')}</Text>
          <Text style={styles.successText}>{t('silentReportSuccess')}</Text>
          <View style={styles.refBox}>
            <Text style={styles.refText}>{t('referenceNo')} {refId}</Text>
          </View>
          <AppButton title={t('done')} accent={PURPLE} onPress={() => navigation.goBack()} style={styles.successBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader
        title={t('silentReport')}
        showBack
        rightAction={<MaterialCommunityIcons name="shield-check" size={22} color={PURPLE} />}
      />
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          {HERO_IMAGE ? (
            <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <View style={styles.heroFallback}>
              <View style={styles.heroCircle}>
                <MaterialCommunityIcons name="account-alert-outline" size={56} color={PURPLE} />
              </View>
              <View style={styles.heroBubble}>
                <MaterialCommunityIcons name="dots-horizontal" size={20} color={PURPLE} />
              </View>
              <View style={styles.heroLock}>
                <MaterialCommunityIcons name="lock" size={22} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.title}>{t('reportHarassmentAnon')}</Text>
        <Text style={styles.subtitle}>{t('silentReportConfidential')}</Text>

        {/* Action rows */}
        <View style={styles.rows}>
          {rows.map((r, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.row, i < rows.length - 1 && styles.rowDivider]}
              activeOpacity={0.7}
              onPress={r.onPress}>
              <MaterialCommunityIcons name={r.icon} size={22} color={r.done ? PURPLE : Colors.text} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                {!!r.subtitle && (
                  <Text style={styles.rowSubtitle} numberOfLines={1}>{r.subtitle}</Text>
                )}
              </View>
              <MaterialCommunityIcons
                name={r.done ? 'check-circle' : 'chevron-right'}
                size={r.done ? 20 : 22}
                color={r.done ? PURPLE : Colors.textDisabled}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Photo thumbnails */}
        {selectedImages.length > 0 && (
          <View style={styles.thumbs}>
            {selectedImages.map(img => (
              <Image key={img.uri} source={{uri: img.uri}} style={styles.thumb} />
            ))}
          </View>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <AppButton
          title={submitting ? t('submitting') : t('submitReport')}
          onPress={onSubmit}
          loading={submitting}
          accent={PURPLE}
          style={styles.submitBtn}
        />
      </ScrollView>

      {/* Description modal */}
      <Modal
        isVisible={descModal}
        onBackdropPress={() => setDescModal(false)}
        onBackButtonPress={() => setDescModal(false)}
        avoidKeyboard
        useNativeDriver
        style={styles.modal}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('typeYourDescription')}</Text>
            <TouchableOpacity onPress={() => setDescModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TextInput
              style={styles.descInput}
              placeholder={t('problemDescriptionPlaceholder')}
              placeholderTextColor={Colors.textDisabled}
              multiline
              maxLength={500}
              value={descDraft}
              onChangeText={setDescDraft}
              autoFocus
            />
          </KeyboardAvoidingView>
          <AppButton title={t('done')} accent={PURPLE} onPress={saveDescription} style={styles.sheetBtn} />
        </View>
      </Modal>

      {/* Audio modal */}
      <Modal
        isVisible={audioModal}
        onBackdropPress={() => setAudioModal(false)}
        onBackButtonPress={() => setAudioModal(false)}
        useNativeDriver
        style={styles.modal}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('recordAudio')}</Text>
            <TouchableOpacity onPress={() => setAudioModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <VoiceNoteRecorder
            value={voiceUri}
            onChange={uri => {
              setVoiceUri(uri);
              if (uri) setError('');
            }}
          />
          <AppButton title={t('done')} accent={PURPLE} onPress={() => setAudioModal(false)} style={styles.sheetBtn} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  heroWrap: {height: 200, alignItems: 'center', justifyContent: 'center', marginTop: Spacing[2]},
  heroImage: {width: 250, height: 200},
  heroFallback: {width: 200, height: 170, alignItems: 'center', justifyContent: 'center'},
  heroCircle: {
    width: 150,
    height: 150,
    borderRadius: BorderRadius.full,
    backgroundColor: PURPLE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBubble: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: PURPLE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLock: {
    position: 'absolute',
    bottom: 8,
    right: 18,
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  title: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center', marginTop: Spacing[4], lineHeight: 32},
  subtitle: {fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: Spacing[2], paddingHorizontal: Spacing[4]},
  rows: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing[6],
    overflow: 'hidden',
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingHorizontal: Spacing[4], paddingVertical: Spacing[4]},
  rowDivider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  rowText: {flex: 1},
  rowLabel: {fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium},
  rowSubtitle: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  thumbs: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[3]},
  thumb: {width: 64, height: 64, borderRadius: BorderRadius.md},
  errorText: {fontSize: FontSize.xs, color: Colors.danger, marginTop: Spacing[3], textAlign: 'center'},
  submitBtn: {marginTop: Spacing[6]},
  successWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[6]},
  successRing: {width: 88, height: 88, borderRadius: BorderRadius.full, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[4]},
  successTitle: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center'},
  successText: {fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: Spacing[2]},
  refBox: {backgroundColor: Colors.surfaceSoft, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], marginTop: Spacing[4]},
  refText: {fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.semiBold},
  successBtn: {marginTop: Spacing[6], alignSelf: 'stretch'},
  modal: {justifyContent: 'flex-end', margin: 0},
  sheet: {backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], padding: Spacing[5]},
  sheetHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing[4]},
  sheetTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  descInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceSoft,
    padding: Spacing[3],
    fontSize: FontSize.base,
    color: Colors.text,
    textAlignVertical: 'top',
  },
  sheetBtn: {marginTop: Spacing[4]},
} as const);
