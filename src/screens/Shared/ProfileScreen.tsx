import React from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {View, Text, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {AppCard} from '@components/common/AppCard';
import {AppButton} from '@components/common/AppButton';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {useNotificationStore} from '@store/notificationStore';
import {useThemeStore} from '@store/themeStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {MOCK_NOTIFICATIONS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';

export const ProfileScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {user, logout} = useAuthStore();
  const {notifications, markRead} = useNotificationStore();
  const {isDark, toggleMode} = useThemeStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Logout', style: 'destructive', onPress: logout},
    ]);
  };

  const displayNotifications = notifications.length > 0 ? notifications : MOCK_NOTIFICATIONS;

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'User'}</Text>
          <Text style={styles.phone}>{user?.phone ?? ''}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() ?? 'CITIZEN'}</Text>
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        {displayNotifications.slice(0, 5).map(notif => (
          <AppCard
            key={notif.id}
            onPress={() => markRead(notif.id)}
            style={[styles.notifCard, !notif.isRead && styles.notifUnread]}>
            <View style={styles.notifRow}>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{formatRelativeTime(notif.createdAt)}</Text>
              </View>
              {!notif.isRead && <View style={styles.unreadDot} />}
            </View>
          </AppCard>
        ))}

        {/* Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <AppCard style={styles.settingItem}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBubble}>
              <MaterialCommunityIcons
                name={isDark ? 'weather-night' : 'white-balance-sunny'}
                size={20}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleMode}
              trackColor={{false: Colors.border, true: Colors.primaryLight}}
              thumbColor={isDark ? Colors.primary : Colors.textDisabled}
            />
          </View>
        </AppCard>
        <AppCard padding={0}>
          {[
            {icon: 'bell-outline', label: 'Notification Settings'},
            {icon: 'translate', label: 'Language'},
            {icon: 'shield-lock-outline', label: 'Privacy Policy'},
            {icon: 'phone-outline', label: 'Contact Support'},
            {icon: 'information-outline', label: 'About JANANAYAGAN v1.0'},
          ].map((item, index, items) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => {}}
              activeOpacity={0.75}
              style={[styles.settingRowButton, index < items.length - 1 && styles.settingDivider]}>
              <View style={styles.settingRow}>
                <View style={styles.settingIconBubble}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.primary} />
                </View>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
              </View>
            </TouchableOpacity>
          ))}
        </AppCard>

        <AppButton
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  scroll: {padding: Spacing[4], paddingBottom: Spacing[10]},
  profileSection: {alignItems: 'center', paddingVertical: Spacing[6]},
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  avatarText: {fontSize: FontSize['3xl'], color: Colors.white, fontWeight: FontWeight.bold},
  name: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text},
  phone: {fontSize: FontSize.base, color: Colors.textSecondary, marginTop: 4},
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.full,
    marginTop: Spacing[2],
  },
  roleText: {fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, letterSpacing: 1},
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing[3],
    marginTop: Spacing[2],
  },
  notifCard: {marginHorizontal: 0},
  notifUnread: {borderLeftWidth: 3, borderLeftColor: Colors.primary},
  notifRow: {flexDirection: 'row', alignItems: 'flex-start'},
  notifInfo: {flex: 1},
  notifTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.text},
  notifBody: {fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2},
  notifTime: {fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 4},
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  settingItem: {marginBottom: Spacing[3]},
  settingRow: {flexDirection: 'row', alignItems: 'center'},
  settingRowButton: {paddingHorizontal: Spacing[4], paddingVertical: Spacing[3]},
  settingDivider: {borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
  settingIconBubble: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  settingLabel: {flex: 1, fontSize: FontSize.base, color: Colors.text},
  logoutBtn: {marginTop: Spacing[6]},
});
