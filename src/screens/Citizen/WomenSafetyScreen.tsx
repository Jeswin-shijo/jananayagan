import React, {useEffect, useRef, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay, Easing} from 'react-native-reanimated';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useAuthStore} from '@store/authStore';
import {useEmergencyContactsStore} from '@store/emergencyContactsStore';
import {AppCard} from '@components/common/AppCard';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {SosEmergencyModal} from '@components/common/SosEmergencyModal';
import {
  EmergencyContactsSheet,
  EmergencyContactsSheetRef,
} from '@components/common/EmergencyContactsSheet';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Safety hub uses its own purple/red accent palette (matches the provided design).
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#EDE9FE';
const HOLD_MS = 3000;

// Hero illustration (woman + shield). Swap the file at src/assets/women-safety.png
// to update it. Set back to null to fall back to the shield placeholder.
const HERO_IMAGE: number | null = require('@assets/women-safety.png');

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
    transform: [{scale: 0.38 + p.value * 1.12}],
    opacity: 0.5 * (1 - p.value),
  }));
  return <Animated.View pointerEvents="none" style={[styles_wave.ring, style]} />;
};

const styles_wave = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 2,
    borderColor: 'rgba(224,50,42,0.45)',
    backgroundColor: 'rgba(224,50,42,0.10)',
  },
});

// Code-drawn city skyline silhouette + location pin for the safety hero background.
// {w,h} = building width/height in px, o = silhouette opacity (layered depth).
const SKY_BUILDINGS: {w: number; h: number; o: number}[] = [
  {w: 20, h: 34, o: 0.1}, {w: 28, h: 54, o: 0.14}, {w: 16, h: 28, o: 0.1},
  {w: 32, h: 70, o: 0.16}, {w: 22, h: 44, o: 0.12}, {w: 18, h: 58, o: 0.14},
  {w: 30, h: 38, o: 0.1}, {w: 22, h: 50, o: 0.13}, {w: 26, h: 64, o: 0.16},
  {w: 18, h: 32, o: 0.1}, {w: 30, h: 46, o: 0.12}, {w: 24, h: 56, o: 0.14},
  {w: 20, h: 36, o: 0.1}, {w: 28, h: 48, o: 0.12},
];

const HeroSkyline: React.FC = () => (
  <View pointerEvents="none" style={styles_sky.wrap}>
    <View style={styles_sky.row}>
      {SKY_BUILDINGS.map((b, i) => (
        <View
          key={i}
          style={{
            width: b.w,
            height: b.h,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: `rgba(124,58,237,${b.o})`,
          }}
        />
      ))}
    </View>
    <MaterialCommunityIcons name="map-marker" size={30} color="#F2589B" style={styles_sky.pin} />
  </View>
);

const styles_sky = StyleSheet.create({
  wrap: {position: 'absolute', left: 0, right: 0, bottom: 0, height: 96, justifyContent: 'flex-end'},
  row: {flexDirection: 'row', alignItems: 'flex-end', gap: 5, paddingHorizontal: 6},
  pin: {position: 'absolute', left: '28%', bottom: 50},
});

type FeatureScreen = 'SafeRoute' | 'RideTracker' | 'SilentReport' | 'NearbyHelp';

type Feature = {
  key: string;
  icon: MaterialCommunityIconName;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  tint: string;
  bg: string;
  screen: FeatureScreen;
};

const FEATURES: Feature[] = [
  {key: 'route', icon: 'shield-check', titleKey: 'safeRoute', descKey: 'safeRouteDesc', tint: PURPLE, bg: PURPLE_LIGHT, screen: 'SafeRoute'},
  {key: 'ride', icon: 'car', titleKey: 'rideTracker', descKey: 'rideTrackerDesc', tint: PURPLE, bg: PURPLE_LIGHT, screen: 'RideTracker'},
  {key: 'report', icon: 'bullhorn', titleKey: 'silentReport', descKey: 'silentReportDesc', tint: PURPLE, bg: PURPLE_LIGHT, screen: 'SilentReport'},
  {key: 'help', icon: 'hospital-building', titleKey: 'nearbyHelp', descKey: 'nearbyHelpDesc', tint: PURPLE, bg: PURPLE_LIGHT, screen: 'NearbyHelp'},
];

const GUARDIAN_POINTS: TranslationKey[] = ['monitoringSafety', 'locationProtectionOn', 'emergencyDetectionOn'];

export const WomenSafetyScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore(s => s.user);
  const emergencyContacts = useEmergencyContactsStore(s => s.contacts);

  const [sosVisible, setSosVisible] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactsSheetRef = useRef<EmergencyContactsSheetRef>(null);

  // Continuous gentle pulse on the SOS circle.
  const sosPulse = useSharedValue(1);
  useEffect(() => {
    sosPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, {duration: 900, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 900, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      false,
    );
  }, [sosPulse]);
  const sosPulseStyle = useAnimatedStyle(() => ({transform: [{scale: sosPulse.value}]}));

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
    navigation.navigate(f.screen);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <OfflineBanner />
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity style={styles.topIcon} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.brand}>{t('womenSafetyHub')}</Text>
        </View>
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
          <LinearGradient colors={[PURPLE_LIGHT, '#FCE7F3', Colors.surface]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={StyleSheet.absoluteFill} />
          <HeroSkyline />
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

        {/* SOS press & hold — big circle with radar waves */}
        <View style={styles.sosSection}>
          <Pressable onPressIn={startHold} onPressOut={endHold} style={styles.sosBigWrap}>
            <SosWave delay={0} />
            <SosWave delay={440} />
            <SosWave delay={880} />
            <SosWave delay={1320} />
            <SosWave delay={1760} />
            <Animated.View style={[styles.sosBigCircle, sosPulseStyle]}>
              <LinearGradient
                colors={['#FB6F6A', '#E0322A']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.sosBigText}>SOS</Text>
              <Text style={styles.sosHoldText}>
                {holding ? t('keepHolding') : t('hold3sToActivate')}
              </Text>
            </Animated.View>
          </Pressable>

          {holding ? (
            <View style={styles.preparingPill}>
              <ActivityIndicator size="small" color="#E0322A" />
              <Text style={styles.preparingText}>{t('preparingAlert')}</Text>
            </View>
          ) : (
            <Text style={styles.sosBigTitle}>{t('emergencySos')}</Text>
          )}
        </View>

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

        {/* Emergency family contacts — opens a bottom sheet to add up to 5 numbers */}
        <TouchableOpacity
          style={styles.contactsTrigger}
          activeOpacity={0.85}
          onPress={() => contactsSheetRef.current?.present()}>
          <View style={styles.contactsTriggerIcon}>
            <MaterialCommunityIcons name="account-heart-outline" size={22} color={PURPLE} />
          </View>
          <View style={styles.contactsTriggerText}>
            <Text style={styles.contactsTriggerTitle}>{t('emergencyContacts')}</Text>
            <Text style={styles.contactsTriggerSub} numberOfLines={1}>
              {emergencyContacts.length
                ? emergencyContacts.map(c => c.name || c.phone).join(', ')
                : t('addEmergencyContacts')}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

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
      <EmergencyContactsSheet ref={contactsSheetRef} accent={PURPLE} />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing[4], paddingVertical: Spacing[2]},
  topLeft: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1]},
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
    padding: Spacing[5],
    minHeight: 188,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing[4],
  },
  heroCopy: {flex: 1, paddingRight: 146, zIndex: 1, alignSelf: 'flex-start', marginTop: Spacing[3]},
  heroTitle: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 30},
  heroSub: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing[1]},
  heroShield: {position: 'absolute', right: Spacing[5], top: '50%', marginTop: -42, width: 84, height: 84, borderRadius: BorderRadius.full, backgroundColor: 'rgba(124,58,237,0.12)', alignItems: 'center', justifyContent: 'center'},
  heroImage: {position: 'absolute', right: 0, bottom: 0, width: 154, height: 188},
  sosSection: {alignItems: 'center', marginTop: Spacing[1], marginBottom: Spacing[3]},
  sosBigWrap: {width: 320, height: 220, alignItems: 'center', justifyContent: 'center'},
  sosBigCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: Spacing[3],
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#E0322A',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sosBigText: {color: '#FFFFFF', fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, letterSpacing: 2},
  sosHoldText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sosBigTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing[3]},
  preparingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[3],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingLeft: Spacing[3],
    paddingRight: Spacing[4],
    paddingVertical: Spacing[2],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  preparingText: {fontSize: FontSize.sm, color: '#E0322A', fontWeight: FontWeight.semiBold},
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
  contactsTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
    marginTop: Spacing[2],
    marginBottom: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  contactsTriggerIcon: {width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: PURPLE_LIGHT, alignItems: 'center', justifyContent: 'center'},
  contactsTriggerText: {flex: 1},
  contactsTriggerTitle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text},
  contactsTriggerSub: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
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
