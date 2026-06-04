import React, {useState} from 'react';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {CitizenStackParamList, CitizenTabParamList} from '@appTypes/navigation';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
import {AppHeader} from '@components/common/AppHeader';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {useNotificationStore} from '@store/notificationStore';
import {AppColors} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {MOCK_COMPLAINTS, MOCK_POLLS} from '@utils/mockData';
import {formatRelativeTime} from '@utils/formatters';

type Nav = NativeStackNavigationProp<CitizenStackParamList>;
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type TileToken = 'tileBlue' | 'tileGreen' | 'tilePurple' | 'tileAmber';
type IconToken = 'primary' | 'secondary' | 'statusInProgress' | 'warning';

type QuickAction = {
  id: string;
  icon: MaterialCommunityIconName;
  labelKey: 'reportProblem' | 'myComplaints' | 'petition' | 'vote';
  subtitle: string;
  tile: TileToken;
  iconColor: IconToken;
  route:
    | {type: 'stack'; screen: 'ReportProblem' | 'SubmitPetition' | 'PublicPoll'}
    | {type: 'tab'; screen: keyof CitizenTabParamList};
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'report',
    icon: 'alert-outline',
    labelKey: 'reportProblem',
    subtitle: 'Raise an issue in your area',
    tile: 'tileAmber',
    iconColor: 'warning',
    route: {type: 'stack', screen: 'ReportProblem'},
  },
  {
    id: 'complaints',
    icon: 'clipboard-text-outline',
    labelKey: 'myComplaints',
    subtitle: 'Track and manage your complaints',
    tile: 'tileBlue',
    iconColor: 'primary',
    route: {type: 'tab', screen: 'MyComplaints'},
  },
  {
    id: 'petition',
    icon: 'file-sign',
    labelKey: 'petition',
    subtitle: 'Create or sign petitions',
    tile: 'tilePurple',
    iconColor: 'statusInProgress',
    route: {type: 'stack', screen: 'SubmitPetition'},
  },
  {
    id: 'poll',
    icon: 'poll',
    labelKey: 'vote',
    subtitle: 'Participate in polls and make your voice count',
    tile: 'tileGreen',
    iconColor: 'secondary',
    route: {type: 'stack', screen: 'PublicPoll'},
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getTimeGreetingKey = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'goodMorning';
  if (hour < 15) return 'goodAfternoon';
  if (hour < 18) return 'goodEvening';
  return 'goodNight';
};

interface QuickActionCardProps {
  action: QuickAction;
  colors: AppColors;
  styles: ReturnType<typeof createStyles>;
  label: string;
  variant: 'feature' | 'compact' | 'wide';
  onPress: (action: QuickAction) => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  colors,
  styles,
  label,
  variant,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <AnimatedPressable
      onPress={() => onPress(action)}
      onPressIn={() => {
        scale.value = withSpring(0.96, {damping: 16, stiffness: 240});
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {damping: 14, stiffness: 220});
      }}
      style={[
        styles.actionCard,
        variant === 'feature' && styles.actionCardFeature,
        variant === 'compact' && styles.actionCardCompact,
        variant === 'wide' && styles.actionCardWide,
        {backgroundColor: colors[action.tile]},
        animatedStyle,
      ]}>
      <View
        style={[
          styles.actionIconWrap,
          variant === 'feature' && styles.actionIconFeature,
          variant === 'wide' && styles.actionIconWide,
          {backgroundColor: colors[action.iconColor]},
        ]}>
        <MaterialCommunityIcons
          name={action.icon}
          size={variant === 'compact' ? 24 : 30}
          color={colors.textOnPrimary}
        />
      </View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
      </View>
      <View style={[styles.actionArrow, variant === 'feature' && styles.actionArrowFeature]}>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors[action.iconColor]} />
      </View>
    </AnimatedPressable>
  );
};

export const CitizenHomeScreen: React.FC = () => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore(s => s.user);
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const [refreshing, setRefreshing] = useState(false);
  const reportAction = QUICK_ACTIONS[0];
  const complaintsAction = QUICK_ACTIONS[1];
  const petitionAction = QUICK_ACTIONS[2];
  const pollAction = QUICK_ACTIONS[3];

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: refetch data
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleQuickAction = (action: QuickAction) => {
    if (action.route.type === 'stack') {
      navigation.navigate(action.route.screen);
      return;
    }

    navigation.navigate('CitizenTabs', {screen: action.route.screen});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title={t('dashboard')} showBack />
      <OfflineBanner />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t(getTimeGreetingKey())}</Text>
            <Text style={styles.name}>{user?.name ?? t('citizen')}</Text>
          </View>
          {/* <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('CitizenTabs', {screen: 'Profile'})}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity> */}
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={[Colors.primaryDark, Colors.primary, Colors.secondary]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconWrap}>
              <MaterialCommunityIcons name="bullhorn-outline" size={30} color={Colors.white} />
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>{t('tagline')}</Text>
              <Text style={styles.bannerSub}>{t('quickActions')}</Text>
            </View>
          </View>
          <View style={styles.bannerGlow} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickHeader}>
          <View style={styles.quickHeaderTitle}>
            <MaterialCommunityIcons name="flash" size={20} color={Colors.primary} />
            <Text style={styles.sectionHeaderTitle}>{t('quickActions')}</Text>
          </View>
          {/* <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.seeAll}>{t('viewAll')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.primary} />
          </TouchableOpacity> */}
        </View>
        <View style={styles.actionsPanel}>
          <View style={styles.actionsTopRow}>
            <QuickActionCard
              action={reportAction}
              colors={Colors}
              styles={styles}
              label={t(reportAction.labelKey)}
              variant="feature"
              onPress={handleQuickAction}
            />
            <View style={styles.actionsSideColumn}>
              <QuickActionCard
                action={complaintsAction}
                colors={Colors}
                styles={styles}
                label={t(complaintsAction.labelKey)}
                variant="compact"
                onPress={handleQuickAction}
              />
              <QuickActionCard
                action={petitionAction}
                colors={Colors}
                styles={styles}
                label={t(petitionAction.labelKey)}
                variant="compact"
                onPress={handleQuickAction}
              />
            </View>
          </View>
          <QuickActionCard
            action={pollAction}
            colors={Colors}
            styles={styles}
            label={`${t(pollAction.labelKey)} & ${t('polls')}`}
            variant="wide"
            onPress={handleQuickAction}
          />
        </View>

        {/* Recent Complaints */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>{t('recentComplaints')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CitizenTabs', {screen: 'MyComplaints'})}>
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {MOCK_COMPLAINTS.slice(0, 3).map(complaint => (
          <View key={complaint.id} style={{paddingHorizontal: Spacing[4]}}>
            <AppCard
              onPress={() => navigation.navigate('ComplaintTicket', {ticketId: complaint.ticketId})}>
              <View style={styles.complaintRow}>
                <View style={styles.complaintInfo}>
                  <Text style={styles.complaintId}>{complaint.ticketId}</Text>
                  <Text style={styles.complaintDesc} numberOfLines={1}>
                    {complaint.description}
                  </Text>
                  <Text style={styles.complaintDate}>{formatRelativeTime(complaint.createdAt)}</Text>
                </View>
                <AppBadge status={complaint.status} />
              </View>
            </AppCard>
          </View>
        ))}

        {/* Active Poll Banner */}
        {MOCK_POLLS.filter(p => p.status === 'active').length > 0 && (
          <AppCard
            style={styles.pollBanner}
            onPress={() => navigation.navigate('PublicPoll')}>
            <MaterialCommunityIcons name="poll" size={34} color={Colors.secondary} />
            <Text style={styles.pollBannerTitle}>{t('newPoll')}</Text>
            <Text style={styles.pollBannerSub} numberOfLines={1}>
              {MOCK_POLLS.find(p => p.status === 'active')?.question}
            </Text>
          </AppCard>
        )}

        <View style={{height: Spacing[8]}} />
      </Animated.ScrollView>
      <CitizenCreateFab />
    </SafeAreaView>
  );
};

const createStyles = (Colors: AppColors) => ({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  name: {fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text},
  notifBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold},
  banner: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[2],
    marginBottom: Spacing[4],
    padding: Spacing[4],
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  bannerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
  },
  bannerCopy: {flex: 1},
  bannerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -36,
    top: -46,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  bannerTitle: {fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textOnPrimary},
  bannerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.82)',
    marginTop: Spacing[1],
    lineHeight: 20,
  },
  quickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[4],
    marginBottom: Spacing[3],
  },
  quickHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[4],
    marginBottom: Spacing[2],
  },
  sectionHeaderTitle: {
    fontSize: FontSize.md,
    lineHeight: 24,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
  },
  seeAll: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500'},
  actionsPanel: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    gap: Spacing[3],
  },
  actionsTopRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    minHeight: 238,
  },
  actionsSideColumn: {
    flex: 0.95,
    gap: Spacing[3],
  },
  actionCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 5,
  },
  actionCardFeature: {
    flex: 1.15,
    minHeight: 238,
    justifyContent: 'space-between',
    padding: Spacing[5],
    borderColor: Colors.warning,
  },
  actionCardCompact: {
    flex: 1,
    minHeight: 112,
    justifyContent: 'space-between',
    padding: Spacing[3],
  },
  actionCardWide: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    gap: Spacing[3],
    borderColor: Colors.secondarySoft,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIconFeature: {
    width: 68,
    height: 68,
  },
  actionIconWide: {
    width: 62,
    height: 62,
  },
  actionCopy: {flex: 1, paddingRight: Spacing[4]},
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[1],
  },
  actionSubtitle: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  actionArrow: {
    position: 'absolute',
    right: Spacing[3],
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArrowFeature: {
    position: 'absolute',
    right: Spacing[4],
    bottom: Spacing[4],
    top: undefined,
    marginTop: 0,
    width: 36,
    height: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  complaintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  complaintInfo: {flex: 1, marginRight: Spacing[3]},
  complaintId: {fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 2},
  complaintDesc: {fontSize: FontSize.base, color: Colors.text, fontWeight: '500', marginBottom: 4},
  complaintDate: {fontSize: FontSize.xs, color: Colors.textDisabled},
  pollBanner: {
    marginHorizontal: Spacing[4],
    // marginBottom: Spacing[4],
    marginTop: Spacing[6],
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pollBannerTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.secondary,
    marginTop: Spacing[1],
  },
  pollBannerSub: {fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center'},
} as const);
