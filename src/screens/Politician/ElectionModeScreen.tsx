import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet, ScrollView, Switch, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppCard} from '@components/common/AppCard';
import {AppHeader} from '@components/common/AppHeader';
import {AppButton} from '@components/common/AppButton';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

const ELECTION_DATE = '2025-11-15';
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const getDaysUntil = (dateStr: string) => {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86400000));
};

export const ElectionModeScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const [electionModeOn, setElectionModeOn] = useState(false);
  const daysLeft = getDaysUntil(ELECTION_DATE);

  const handleToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Election Mode',
        'This will activate election tracking features for your constituency. Continue?',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Enable', onPress: () => setElectionModeOn(true)},
        ],
      );
    } else {
      setElectionModeOn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Election Mode" showBack />
      <OfflineBanner />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Toggle Card */}
        <AppCard style={[styles.toggleCard, electionModeOn && styles.toggleCardActive]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.titleRow}>
                <MaterialCommunityIcons name="vote-outline" size={20} color={Colors.primary} />
                <Text style={styles.toggleTitle}>Election Mode</Text>
              </View>
              <Text style={styles.toggleSub}>
                {electionModeOn ? 'Active — Election tracking enabled' : 'Inactive — Enable for election features'}
              </Text>
            </View>
            <Switch
              value={electionModeOn}
              onValueChange={handleToggle}
              trackColor={{false: Colors.border, true: Colors.primaryLight}}
              thumbColor={electionModeOn ? Colors.primary : Colors.textDisabled}
            />
          </View>
        </AppCard>

        {/* Countdown */}
        <AppCard style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Days Until Election</Text>
          <Text style={styles.countdownValue}>{daysLeft}</Text>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.countdownDate}>{ELECTION_DATE}</Text>
          </View>
        </AppCard>

        {/* Features */}
        <Text style={styles.sectionTitle}>Election Features</Text>

        {[
          {icon: 'bank-outline' as MaterialCommunityIconName, title: 'Candidate Profiles', desc: 'View and compare candidate manifestos', ready: false},
          {icon: 'map-marker-radius-outline' as MaterialCommunityIconName, title: 'Polling Booth Locator', desc: 'Find nearest polling booth on map', ready: false},
          {icon: 'chart-bar' as MaterialCommunityIconName, title: 'Voter Turnout Stats', desc: 'Real-time turnout data by ward', ready: false},
          {icon: 'newspaper-variant-outline' as MaterialCommunityIconName, title: 'Election News Feed', desc: 'Latest election news from verified sources', ready: false},
          {icon: 'bell-outline' as MaterialCommunityIconName, title: 'Election Reminders', desc: 'Automated voter reminder notifications', ready: electionModeOn},
        ].map(feature => (
          <AppCard key={feature.title}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconBubble}>
                <MaterialCommunityIcons name={feature.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
              <View style={[styles.featureBadge, {backgroundColor: feature.ready ? Colors.successLight : Colors.borderLight}]}>
                <Text style={[styles.featureBadgeText, {color: feature.ready ? Colors.success : Colors.textDisabled}]}>
                  {feature.ready ? 'Active' : 'Coming'}
                </Text>
              </View>
            </View>
          </AppCard>
        ))}

        {electionModeOn && (
          <AppButton
            title="Send Voter Reminders"
            onPress={() => Alert.alert('Reminders Queued', 'Voter reminders will be sent to registered citizens.')}
            style={styles.reminderBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  toggleCard: {},
  toggleCardActive: {borderWidth: 2, borderColor: Colors.primary},
  toggleRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  toggleInfo: {flex: 1, marginRight: Spacing[4]},
  toggleTitle: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  toggleSub: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  countdownCard: {alignItems: 'center', backgroundColor: Colors.primaryLight},
  countdownLabel: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600'},
  countdownValue: {
    fontSize: 72,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    lineHeight: 80,
  },
  dateRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing[1]},
  countdownDate: {fontSize: FontSize.sm, color: Colors.textSecondary},
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  featureRow: {flexDirection: 'row', alignItems: 'center'},
  featureIconBubble: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginRight: Spacing[3],
  },
  featureInfo: {flex: 1},
  featureTitle: {fontSize: FontSize.base, fontWeight: '500', color: Colors.text},
  featureDesc: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  featureBadge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  featureBadgeText: {fontSize: FontSize.xs, fontWeight: '600'},
  reminderBtn: {marginTop: Spacing[4]},
});
