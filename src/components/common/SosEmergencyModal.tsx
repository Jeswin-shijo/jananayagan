import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useLocationStore} from '@store/locationStore';
import {useCurrentLocation} from '@hooks/useCurrentLocation';
import {toastSuccess} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type Stage = 'idle' | 'counting' | 'sent';

const COUNTDOWN_FROM = 5;

export const HELPLINES: {labelKey: TranslationKey; number: string; icon: MaterialCommunityIconName}[] = [
  {labelKey: 'callPolice', number: '100', icon: 'police-badge-outline'},
  {labelKey: 'callEmergency', number: '112', icon: 'phone-alert-outline'},
  {labelKey: 'womenHelpline', number: '1091', icon: 'human-female'},
];

interface SosEmergencyModalProps {
  visible: boolean;
  onClose: () => void;
  // When true, opening the modal immediately dispatches the alert (used by press-and-hold).
  autoSend?: boolean;
}

export const SosEmergencyModal: React.FC<SosEmergencyModalProps> = ({visible, onClose, autoSend}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {coords, address} = useLocationStore();
  const {fetchLocation} = useCurrentLocation();

  const [stage, setStage] = useState<Stage>('idle');
  const [count, setCount] = useState(COUNTDOWN_FROM);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  const dispatchAlert = () => {
    fetchLocation().catch(() => {});
    setStage('sent');
    toastSuccess(t('sosSent'));
  };

  useEffect(() => {
    if (!visible) {
      clearTimer();
      setStage('idle');
      setCount(COUNTDOWN_FROM);
      return;
    }
    if (autoSend) {
      dispatchAlert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, autoSend]);

  useEffect(() => () => clearTimer(), []);

  const activate = () => {
    fetchLocation().catch(() => {});
    setStage('counting');
    setCount(COUNTDOWN_FROM);
    clearTimer();
    timer.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearTimer();
          setStage('sent');
          toastSuccess(t('sosSent'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancel = () => {
    clearTimer();
    setStage('idle');
    setCount(COUNTDOWN_FROM);
  };

  const call = (num: string) => Linking.openURL(`tel:${num}`);

  const locationText = address
    ? address
    : coords
    ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
    : t('detecting');

  const Helplines = () => (
    <View style={styles.helplineRow}>
      {HELPLINES.map(h => (
        <TouchableOpacity key={h.number} style={styles.helpline} onPress={() => call(h.number)}>
          <MaterialCommunityIcons name={h.icon} size={20} color={Colors.primary} />
          <Text style={styles.helplineLabel}>{t(h.labelKey)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={stage === 'counting' ? undefined : onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.7}
      useNativeDriver
      style={styles.modal}>
      <View style={styles.sheet}>
        {stage === 'idle' && (
          <>
            <View style={styles.iconRing}>
              <MaterialCommunityIcons name="shield-alert-outline" size={34} color={Colors.danger} />
            </View>
            <Text style={styles.title}>{t('emergencySos')}</Text>
            <Text style={styles.desc}>{t('sosDescription')}</Text>
            <TouchableOpacity style={styles.activateBtn} onPress={activate} activeOpacity={0.85}>
              <MaterialCommunityIcons name="alarm-light-outline" size={22} color="#FFFFFF" />
              <Text style={styles.activateText}>{t('activateSos')}</Text>
            </TouchableOpacity>
            <Text style={styles.helplineTitle}>{t('orCallNow')}</Text>
            <Helplines />
            <TouchableOpacity onPress={onClose} style={styles.closeRow}>
              <Text style={styles.closeText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'counting' && (
          <>
            <View style={styles.countRing}>
              <Text style={styles.countNum}>{count}</Text>
            </View>
            <Text style={styles.title}>{t('sosCountdown', {seconds: count})}</Text>
            <Text style={styles.desc}>{t('sosCountdownHint')}</Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={cancel} activeOpacity={0.85}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'sent' && (
          <>
            <View style={styles.sentRing}>
              <MaterialCommunityIcons name="check-bold" size={34} color={Colors.success} />
            </View>
            <Text style={styles.title}>{t('sosSent')}</Text>
            <Text style={styles.desc}>{t('sosSentMessage')}</Text>
            <View style={styles.locBox}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={Colors.primary} />
              <Text style={styles.locText}>{locationText}</Text>
            </View>
            <Helplines />
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneText}>{t('done')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
};

const createStyles = (Colors: AppColors) => ({
  modal: {justifyContent: 'flex-end', margin: 0},
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing[5],
    alignItems: 'center',
  },
  iconRing: {width: 72, height: 72, borderRadius: BorderRadius.full, backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[3]},
  title: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center'},
  desc: {fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: Spacing[2], marginBottom: Spacing[4]},
  activateBtn: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], width: '100%', height: 56, borderRadius: BorderRadius.xl, backgroundColor: '#E0322A'},
  activateText: {color: '#FFFFFF', fontWeight: FontWeight.bold, fontSize: FontSize.md},
  helplineTitle: {fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: Spacing[5], marginBottom: Spacing[3], fontWeight: FontWeight.semiBold},
  helplineRow: {flexDirection: 'row', gap: Spacing[2], width: '100%'},
  helpline: {flex: 1, alignItems: 'center', gap: 4, paddingVertical: Spacing[3], borderRadius: BorderRadius.lg, backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.border},
  helplineLabel: {fontSize: 11, color: Colors.primary, fontWeight: FontWeight.semiBold, textAlign: 'center'},
  closeRow: {marginTop: Spacing[4], padding: Spacing[2]},
  closeText: {fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium},
  countRing: {width: 100, height: 100, borderRadius: BorderRadius.full, backgroundColor: Colors.dangerLight, borderWidth: 3, borderColor: '#E0322A', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[3]},
  countNum: {fontSize: 44, fontWeight: FontWeight.bold, color: '#E0322A'},
  cancelBtn: {width: '100%', height: 56, borderRadius: BorderRadius.xl, backgroundColor: Colors.text, alignItems: 'center', justifyContent: 'center', marginTop: Spacing[2]},
  cancelText: {color: Colors.surface, fontWeight: FontWeight.bold, fontSize: FontSize.md},
  sentRing: {width: 72, height: 72, borderRadius: BorderRadius.full, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[3]},
  locBox: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], backgroundColor: Colors.surfaceSoft, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing[3], paddingVertical: Spacing[2], marginBottom: Spacing[4], alignSelf: 'stretch'},
  locText: {flex: 1, fontSize: FontSize.sm, color: Colors.text},
  doneBtn: {width: '100%', height: 52, borderRadius: BorderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: Spacing[4]},
  doneText: {color: Colors.textOnPrimary, fontWeight: FontWeight.bold, fontSize: FontSize.md},
} as const);
