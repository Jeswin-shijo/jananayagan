import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {AppEmptyState} from '@components/common/AppEmptyState';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useNotificationStore} from '@store/notificationStore';
import {MOCK_NOTIFICATIONS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';
import {Notification} from '@appTypes/api';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// Per-category icon + colour tile (kept theme-independent for clear category identity).
const TYPE_META: Record<Notification['type'], {icon: MaterialCommunityIconName; color: string; bg: string}> = {
  complaint_update: {icon: 'clipboard-text', color: '#EF4444', bg: '#FEE2E2'},
  petition_update: {icon: 'file-sign', color: '#22C55E', bg: '#DCFCE7'},
  poll_new: {icon: 'poll', color: '#6366F1', bg: '#E0E7FF'},
  general: {icon: 'bullhorn', color: '#3B82F6', bg: '#DBEAFE'},
};

export const NotificationsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {notifications, markRead, markAllRead} = useNotificationStore();

  const data = notifications.length > 0 ? notifications : MOCK_NOTIFICATIONS;
  const hasUnread = data.some(n => !n.isRead);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notifications')}</Text>
        {hasUnread && (
          <TouchableOpacity onPress={() => markAllRead?.()}>
            <Text style={styles.markAll}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <OfflineBanner />
      {data.length === 0 ? (
        <AppEmptyState icon="bell-outline" title={t('noNotifications')} subtitle={t('noNotificationsSubtitle')} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {data.map((notif, index) => {
            const meta = TYPE_META[notif.type] ?? TYPE_META.general;
            return (
              <TouchableOpacity
                key={notif.id}
                activeOpacity={0.7}
                onPress={() => markRead(notif.id)}
                style={[styles.row, index < data.length - 1 && styles.divider]}>
                <View style={[styles.iconTile, {backgroundColor: meta.bg}]}>
                  <MaterialCommunityIcons name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                  <Text style={styles.notifBody} numberOfLines={2}>{notif.body}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.time}>{formatRelativeTime(notif.createdAt)}</Text>
                  {!notif.isRead && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{height: Spacing[10]}} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.surface},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[3],
  },
  title: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  markAll: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semiBold},
  scroll: {paddingHorizontal: Spacing[4]},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  divider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {flex: 1},
  notifTitle: {fontSize: FontSize.base, fontWeight: FontWeight.semiBold, color: Colors.text},
  notifBody: {fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 18},
  metaCol: {alignItems: 'flex-end', justifyContent: 'flex-start', minWidth: 54},
  time: {fontSize: FontSize.xs, color: Colors.textDisabled},
  unreadDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 6},
} as const);
