import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {View, Text, ScrollView, Share, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenStackParamList} from '@appTypes/navigation';
import {AppButton} from '@components/common/AppButton';
import {AppHeader} from '@components/common/AppHeader';
import {AppCard} from '@components/common/AppCard';
import {MOCK_COMPLAINTS} from '@utils/mockData';
import {ComplaintStatus} from '@appTypes/api';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type Props = NativeStackScreenProps<CitizenStackParamList, 'ComplaintTicket'>;

const STEPS: {id: ComplaintStatus; labelKey: TranslationKey}[] = [
  {id: 'submitted', labelKey: 'submitted'},
  {id: 'under_review', labelKey: 'underReview'},
  {id: 'in_progress', labelKey: 'inProgress'},
  {id: 'resolved', labelKey: 'resolved'},
];

const STEP_INDEX: Record<string, number> = {
  submitted: 0,
  under_review: 1,
  in_progress: 2,
  resolved: 3,
};

export const ComplaintTicketScreen: React.FC<Props> = ({route, navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {ticketId} = route.params;
  const complaint = MOCK_COMPLAINTS.find(c => c.ticketId === ticketId);
  const activeStep = STEP_INDEX[complaint?.status ?? 'submitted'] ?? 0;

  const handleShare = async () => {
    await Share.share({
      message: t('shareComplaintMessage', {ticketId}),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={t('complaintTicket')} showBack />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Success */}
        <View style={styles.successSection}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle-outline" size={44} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>{t('complaintSubmitted')}</Text>
          <Text style={styles.successSub}>
            {t('complaintRegistered')}
          </Text>
        </View>

        {/* Ticket ID */}
        <AppCard style={styles.ticketCard}>
          <Text style={styles.ticketLabel}>{t('ticketId')}</Text>
          <Text style={styles.ticketId}>{ticketId}</Text>
          <View style={styles.etaRow}>
            <MaterialCommunityIcons name="clock-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.etaText}>{t('estimatedResolution')}</Text>
          </View>
        </AppCard>

        {/* Status Stepper */}
        <AppCard>
          <Text style={styles.sectionTitle}>{t('statusTimeline')}</Text>
          <View style={styles.stepperRow}>
            {STEPS.map((step, idx) => {
              const done = idx <= activeStep;
              const leftActive = idx > 0 && idx <= activeStep + 1;
              const rightActive = idx < STEPS.length - 1 && idx <= activeStep;
              return (
                <View key={step.id} style={styles.stepCol}>
                  <View style={styles.trackRow}>
                    <View style={[styles.halfLine, idx === 0 && styles.lineHidden, leftActive && styles.lineActive]} />
                    <View style={[styles.dot, done ? styles.dotDone : styles.dotPending]}>
                      {done && <MaterialCommunityIcons name="check" size={16} color={Colors.white} />}
                    </View>
                    <View style={[styles.halfLine, idx === STEPS.length - 1 && styles.lineHidden, rightActive && styles.lineActive]} />
                  </View>
                  <Text
                    style={[styles.stepCaption, done ? styles.captionActive : styles.captionInactive]}
                    numberOfLines={1}>
                    {t(step.labelKey)}
                  </Text>
                </View>
              );
            })}
          </View>
        </AppCard>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            title={t('shareTicket')}
            onPress={handleShare}
            variant="outline"
            style={styles.actionBtn}
          />
          <AppButton
            title={t('trackComplaints')}
            onPress={() => navigation.navigate('CitizenTabs', {screen: 'MyComplaints'})}
            style={styles.actionBtn}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ReportProblem')}
          style={styles.reportAnother}>
          <Text style={styles.reportAnotherText}>{t('reportAnotherProblem')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  successSection: {alignItems: 'center', paddingVertical: Spacing[6]},
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  successTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[2],
  },
  successSub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ticketCard: {alignItems: 'center'},
  ticketLabel: {fontSize: FontSize.sm, color: Colors.textSecondary},
  ticketId: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginVertical: Spacing[2],
    letterSpacing: 1,
  },
  etaRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1]},
  etaText: {fontSize: FontSize.sm, color: Colors.textSecondary},
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[4],
  },
  stepperRow: {flexDirection: 'row', marginTop: Spacing[1]},
  stepCol: {flex: 1, alignItems: 'center'},
  trackRow: {flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch'},
  halfLine: {flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2},
  lineActive: {backgroundColor: Colors.primary},
  lineHidden: {backgroundColor: 'transparent'},
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {backgroundColor: Colors.primary},
  dotPending: {backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border},
  stepCaption: {fontSize: FontSize.xs, marginTop: Spacing[2], textAlign: 'center'},
  captionActive: {color: Colors.text, fontWeight: FontWeight.semiBold},
  captionInactive: {color: Colors.textDisabled},
  actions: {flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2]},
  actionBtn: {flex: 1},
  reportAnother: {alignItems: 'center', marginTop: Spacing[4]},
  reportAnotherText: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
} as const);
