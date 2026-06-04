import React, {useEffect, useRef, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing} from 'react-native-reanimated';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useAuthStore} from '@store/authStore';
import {AppCard} from '@components/common/AppCard';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {SosEmergencyModal} from '@components/common/SosEmergencyModal';
import {toastInfo} from '@utils/toast';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Safety hub uses its own purple/red accent palette (matches the provided design).
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';
const HOLD_MS = 3000;

// Drop the illustration at src/assets/women-safety.png and set:
//   const HERO_IMAGE = require('@assets/women-safety.png');
// Until then the shield fallback is shown.
const HERO_IMAGE: number | null = null;

// One expanding/fading ripple ring behind the SOS badge (radar-style splash).
const SosWave: React.FC<{delay: number}> = ({delay}) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(withTiming(1, {duration: 2200, easing: Easing.out(Easing.ease)}), -1, false),
    );
  }, [delay, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{scale: 0.55 + p.value * 0.95}],
    opacity: 0.45 * (1 - p.value),
  }));
  return <Animated.View pointerEvents="none" style={[styles_wave.ring, style]} />;
};

const styles_wave = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});

type FeatureAction = 'report' | 'soon';

type Feature = {
  key: string;
  icon: MaterialCommunityIconName;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  tint: string;
  bg: string;
  action: FeatureAction;
};

const FEATURES: Feature[] = [
  {key: 'route', icon: 'shield-check', titleKey: 'safeRoute', descKey: 'safeRouteDesc', tint: '#7C3AED', bg: '#EDE9FE', action: 'soon'},
  {key: 'ride', icon: 'car', titleKey: 'rideTracker', descKey: 'rideTrackerDesc', tint: '#E11D48', bg: '#FCE7EF', action: 'soon'},
  {key: 'report', icon: 'bullhorn', titleKey: 'silentReport', descKey: 'silentReportDesc', tint: '#EA580C', bg: '#FFEDD5', action: 'report'},
  {key: 'help', icon: 'hospital-building', titleKey: 'nearbyHelp', descKey: 'nearbyHelpDesc', tint: '#2563EB', bg: '#E0ECFE', action: 'soon'},
];

const GUARDIAN_POINTS: TranslationKey[] = ['monitoringSafety', 'locationProtectionOn', 'emergencyDetectionOn'];

export const WomenSafetyScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);

  const [sosVisible, setSosVisible] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = () => {
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      setHolding(false);
      setSosVisible(true);
    }, HOLD_MS);
  };

  const endHold = () => {
    setHolding(false);
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleFeature = (f: Feature) => {
    if (f.action === 'report') {
      navigation.navigate('ReportProblem');
    } else {
      toastInfo(t(f.titleKey), t('comingSoon'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.topBar}>
        <Text style={styles.brand}>{t('womenSafetyHub')}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate('Notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient colors={[PURPLE_LIGHT, Colors.surface]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{t('womenSafetyHub')}</Text>
            <Text style={styles.heroSub}>{t('safetyTagline')}</Text>
          </View>
          {HERO_IMAGE ? (
            <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <View style={styles.heroShield}>
              <MaterialCommunityIcons name="shield-check" size={56} color={PURPLE} />
            </View>
          )}
        </View>

        {/* SOS press & hold */}
        <Pressable onPressIn={startHold} onPressOut={endHold} style={styles.sosCard}>
          <LinearGradient colors={['#FB6F6A', '#E0322A']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
          <View style={styles.sosCircleWrap}>
            <SosWave delay={0} />
            <SosWave delay={1100} />
            <View style={styles.sosCircle}>
              <Text style={styles.sosCircleText}>SOS</Text>
            </View>
          </View>
          <View style={styles.sosCopy}>
            <Text style={styles.sosTitle}>{t('emergencySos')}</Text>
            <Text style={styles.sosSub}>{holding ? t('keepHolding') : t('pressHold3s')}</Text>
          </View>
          <View style={styles.sosArrow}>
            <MaterialCommunityIcons name={holding ? 'timer-sand' : 'arrow-right'} size={20} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Feature grid */}
        <View style={styles.grid}>
          {FEATURES.map(f => (
            <TouchableOpacity
              key={f.key}
              style={styles.featureCard}
              activeOpacity={0.85}
              onPress={() => handleFeature(f)}>
              <View style={[styles.featureIcon, {backgroundColor: f.bg}]}>
                <MaterialCommunityIcons name={f.icon} size={24} color={f.tint} />
              </View>
              <Text style={styles.featureTitle}>{t(f.titleKey)}</Text>
              <Text style={styles.featureDesc}>{t(f.descKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Guardian */}
        <AppCard style={styles.guardian}>
          <View style={styles.guardianRow}>
            <View style={styles.guardianBot}>
              <MaterialCommunityIcons name="robot-happy-outline" size={32} color={PURPLE} />
            </View>
            <View style={styles.guardianInfo}>
              <Text style={styles.guardianTitle}>{t('aiGuardian')}</Text>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>{t('status')}: </Text>
                <Text style={styles.statusActive}>{t('statusActive').toUpperCase()}</Text>
              </View>
            </View>
          </View>
          {GUARDIAN_POINTS.map(p => (
            <View key={p} style={styles.pointRow}>
              <MaterialCommunityIcons name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.pointText}>{t(p)}</Text>
            </View>
          ))}
        </AppCard>

        <View style={{height: Spacing[8]}} />
      </ScrollView>

      <SosEmergencyModal visible={sosVisible} onClose={() => setSosVisible(false)} autoSend />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing[4], paddingVertical: Spacing[2]},
  brand: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text},
  topActions: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  topIcon: {width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center'},
  avatar: {width: 38, height: 38, borderRadius: BorderRadius.full, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#FFFFFF', fontWeight: FontWeight.bold},
  scroll: {padding: Spacing[4], paddingTop: Spacing[2]},
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    padding: Spacing[4],
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing[4],
  },
  heroCopy: {flex: 1},
  heroTitle: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 30},
  heroSub: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing[1]},
  heroShield: {width: 84, height: 84, borderRadius: BorderRadius.full, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center'},
  heroImage: {width: 130, height: 130},
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    padding: Spacing[4],
    marginBottom: Spacing[5],
    shadowColor: '#E0322A',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  sosCircleWrap: {width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3]},
  sosCircle: {width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center'},
  sosCircleText: {color: '#FFFFFF', fontSize: FontSize.xl, fontWeight: FontWeight.bold, letterSpacing: 1},
  sosCopy: {flex: 1},
  sosTitle: {color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: FontWeight.bold},
  sosSub: {color: 'rgba(255,255,255,0.9)', fontSize: FontSize.sm, marginTop: 2},
  sosArrow: {width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center'},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  featureCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  featureIcon: {width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[3]},
  featureTitle: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text},
  featureDesc: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4, lineHeight: 16},
  guardian: {marginTop: Spacing[2], marginHorizontal: 0},
  guardianRow: {flexDirection: 'row', alignItems: 'center', marginBottom: Spacing[3]},
  guardianBot: {width: 56, height: 56, borderRadius: BorderRadius.full, backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: Spacing[3]},
  guardianInfo: {flex: 1},
  guardianTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: PURPLE},
  statusRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  statusLabel: {fontSize: FontSize.sm, color: Colors.textSecondary},
  statusActive: {fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.bold},
  pointRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingVertical: Spacing[1]},
  pointText: {fontSize: FontSize.sm, color: Colors.text},
} as const);
