import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppHeader} from '@components/common/AppHeader';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {MOCK_CITIZEN_ANNOUNCEMENTS, AnnouncementCategory} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Per-category icon + accent colour for the announcement cards.
export const ANNOUNCEMENT_META: Record<
  AnnouncementCategory,
  {icon: MaterialCommunityIconName; color: string; bg: string}
> = {
  power: {icon: 'flash', color: '#D97706', bg: '#FEF3C7'},
  water: {icon: 'water', color: '#2563EB', bg: '#DBEAFE'},
  roadwork: {icon: 'road-variant', color: '#7C3AED', bg: '#EDE9FE'},
  health: {icon: 'hospital-box', color: '#DC2626', bg: '#FEE2E2'},
  weather: {icon: 'weather-pouring', color: '#0891B2', bg: '#CFFAFE'},
  event: {icon: 'calendar-star', color: '#059669', bg: '#D1FAE5'},
  general: {icon: 'bullhorn', color: '#475569', bg: '#E2E8F0'},
};

export const AnnouncementsScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={t('announcements')} showBack />
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {MOCK_CITIZEN_ANNOUNCEMENTS.map(item => {
          const meta = ANNOUNCEMENT_META[item.category];
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBubble, {backgroundColor: meta.bg}]}>
                  <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.metaRow}>
                    <MaterialCommunityIcons name="map-marker" size={13} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{item.area}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.metaText}>{formatRelativeTime(item.createdAt)}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          );
        })}
        <View style={{height: Spacing[8]}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background},
    scroll: {padding: Spacing[4]},
    card: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.border,
      padding: Spacing[4],
      marginBottom: Spacing[3],
    },
    cardHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: Spacing[3]},
    iconBubble: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {flex: 1},
    title: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 21},
    metaRow: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3},
    metaText: {fontSize: FontSize.xs, color: Colors.textSecondary},
    dot: {fontSize: FontSize.xs, color: Colors.textDisabled, marginHorizontal: 2},
    body: {fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing[3]},
  });
