import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {View, Text, StyleSheet, ScrollView, Share, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenStackParamList} from '@appTypes/navigation';
import {AppButton} from '@components/common/AppButton';
import {AppHeader} from '@components/common/AppHeader';
import {AppCard} from '@components/common/AppCard';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {TranslationKey} from '@constants/i18n';

type Props = NativeStackScreenProps<CitizenStackParamList, 'ComplaintTicket'>;

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const STEPS: {id: string; labelKey: TranslationKey; icon: MaterialCommunityIconName}[] = [
  {id: 'submitted', labelKey: 'submitted', icon: 'send-check-outline'},
  {id: 'under_review', labelKey: 'underReview', icon: 'magnify'},
  {id: 'in_progress', labelKey: 'inProgress', icon: 'progress-wrench'},
  {id: 'resolved', labelKey: 'resolved', icon: 'check-circle-outline'},
];

export const ComplaintTicketScreen: React.FC<Props> = ({route, navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {ticketId} = route.params;
  const activeStep = 0;

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

        {/* Status Timeline */}
        <AppCard>
          <Text style={styles.sectionTitle}>{t('statusTimeline')}</Text>
          {STEPS.map((step, idx) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={[
                  styles.stepCircle,
                  idx <= activeStep ? styles.stepActive : styles.stepInactive,
                ]}>
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={18}
                    color={idx <= activeStep ? Colors.primary : Colors.textDisabled}
                  />
                </View>
                {idx < STEPS.length - 1 && (
                  <View style={[styles.stepLine, idx < activeStep && styles.stepLineActive]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepLabel,
                  idx <= activeStep ? styles.stepLabelActive : styles.stepLabelInactive,
                ]}>
                  {t(step.labelKey)}
                </Text>
                {idx === activeStep && (
                  <Text style={styles.stepDate}>{t('justNow')}</Text>
                )}
              </View>
            </View>
          ))}
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
            onPress={() => navigation.navigate('CitizenTabs')}
            style={styles.actionBtn}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ReportProblem')}
          style={styles.reportAnother}>
          <Text style={styles.reportAnotherText}>{t('reportAnotherProblem')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <CitizenCreateFab />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
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
  stepRow: {flexDirection: 'row', marginBottom: Spacing[1]},
  stepLeft: {alignItems: 'center', marginRight: Spacing[3]},
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {backgroundColor: Colors.primaryLight},
  stepInactive: {backgroundColor: Colors.borderLight},
  stepLine: {width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 2},
  stepLineActive: {backgroundColor: Colors.primary},
  stepContent: {flex: 1, paddingVertical: Spacing[2]},
  stepLabel: {fontSize: FontSize.base, fontWeight: '500'},
  stepLabelActive: {color: Colors.text},
  stepLabelInactive: {color: Colors.textDisabled},
  stepDate: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  actions: {flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[2]},
  actionBtn: {flex: 1},
  reportAnother: {alignItems: 'center', marginTop: Spacing[4]},
  reportAnotherText: {
    fontSize: FontSize.base,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
});
