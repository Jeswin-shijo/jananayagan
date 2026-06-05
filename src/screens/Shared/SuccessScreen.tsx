import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {FadeInDown, ZoomIn} from 'react-native-reanimated';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppButton} from '@components/common/AppButton';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type SuccessKind = 'complaint' | 'petition';
type SuccessParams = {Success: {kind: SuccessKind; refId: string}};

export const SuccessScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SuccessParams, 'Success'>>();
  const {kind, refId} = route.params;

  const message = kind === 'complaint' ? t('complaintSubmittedMsg') : t('petitionSubmittedMsg');

  const onTrack = () => {
    if (kind === 'complaint') {
      navigation.replace('ComplaintTicket', {ticketId: refId});
    } else {
      navigation.popToTop?.();
      navigation.navigate('CitizenTabs', {
        screen: 'Petition',
      });
    }
  };

  const onHome = () => {
    navigation.popToTop?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.secondaryLight, Colors.background, Colors.primaryLight]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.badge}>
          <View style={styles.badgeGlow} />
          <MaterialCommunityIcons name="check-decagram" size={120} color={Colors.secondary} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150)} style={styles.copy}>
          <Text style={styles.title}>{t('success')}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.refPill}>
            <Text style={styles.refText}>{t('referenceNo')} {refId}</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(280)} style={styles.actions}>
        <AppButton title={t('trackStatus')} onPress={onTrack} />
        <AppButton title={t('backToHome')} onPress={onHome} variant="outline" style={styles.homeBtn} />
      </Animated.View>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[6]},
  badge: {alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[6]},
  badgeGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: Colors.secondaryLight,
    opacity: 0.7,
  },
  copy: {alignItems: 'center'},
  title: {fontSize: FontSize['4xl'], fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing[2]},
  message: {fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing[4]},
  refPill: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  refText: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text, letterSpacing: 0.5},
  actions: {paddingHorizontal: Spacing[6], paddingBottom: Spacing[6], gap: Spacing[3]},
  homeBtn: {marginTop: 0},
} as const);
