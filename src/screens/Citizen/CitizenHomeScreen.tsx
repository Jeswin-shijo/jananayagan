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
import {AppHeader} from '@components/common/AppHeader';
import {CitizenCreateFab} from '@components/common/CitizenCreateFab';
import {OfflineBanner} from '@components/common/OfflineBanner';
import {useAuthStore} from '@store/authStore';
import {useNotificationStore} from '@store/notificationStore';
import {AppColors, Navy} from '@constants/colors';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';
import {MOCK_CITIZEN_ANNOUNCEMENTS, MOCK_POLLS} from '@utils/mockData';
import {ANNOUNCEMENT_META} from '@screens/Citizen/AnnouncementsScreen';
import {formatRelativeTime} from '@utils/formatters';

type Nav = NativeStackNavigationProp<CitizenStackParamList>;
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type TileToken = 'tileBlue' | 'tileGreen' | 'tilePurple' | 'tileAmber' | 'accentOrangeSoft';
type IconToken = 'primary' | 'secondary' | 'statusInProgress' | 'warning' | 'accentOrange';

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
    tile: 'accentOrangeSoft',
    iconColor: 'accentOrange',
    route: {type: 'stack', screen: 'ReportProblem'},
  },
  {
    id: 'complaints',
    icon: 'clipboard-text-outline',
    labelKey: 'myComplaints',
    subtitle: 'Manage your complaints',
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

// Decorative skyline silhouette heights for the hero banner.
const BANNER_SKYLINE = [16, 26, 20, 34, 22, 30, 18, 28, 24, 36, 20, 30, 16];

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
          variant === 'compact' && styles.actionIconCompact,
          variant === 'wide' && styles.actionIconWide,
          {backgroundColor: colors[action.iconColor]},
        ]}>
        <MaterialCommunityIcons
          name={action.icon}
          size={variant === 'compact' ? 22 : 30}
          color={colors.textOnPrimary}
        />
      </View>
      <View
        style={[
          styles.actionCopy,
          variant === 'compact' && styles.actionCopyCompact,
          variant === 'feature' && styles.actionCopyFeature,
        ]}>
        <Text style={[styles.actionLabel, variant === 'feature' && styles.actionLabelFeature]}>{label}</Text>
        <Text
          numberOfLines={variant === 'compact' ? 1 : undefined}
          style={[styles.actionSubtitle, variant === 'feature' && styles.actionSubtitleFeature]}>
          {action.subtitle}
        </Text>
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
          {/* Skyline silhouette */}
          <View pointerEvents="none" style={styles.bannerSkyline}>
            {BANNER_SKYLINE.map((h, i) => (
              <View key={i} style={[styles.bannerBuilding, {height: h}]} />
            ))}
          </View>

          <View style={styles.bannerContent}>
            <View style={styles.bannerIconWrap}>
              <MaterialCommunityIcons name="bullhorn-outline" size={28} color={Colors.white} />
            </View>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>{t('tagline')}</Text>
              <Text style={styles.bannerSub}>{t('voiceSubtitle')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.reportNowBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ReportProblem')}>
            <Text style={styles.reportNowText}>{t('reportNow')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.primary} />
          </TouchableOpacity>
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

        {/* Announcements — dark navy section (two-tone) */}
        <View style={styles.darkSection}>
          <LinearGradient
            colors={[Navy.surface, Navy.base]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.darkHeader}>
            <View style={styles.darkHeaderTitle}>
              <MaterialCommunityIcons name="bullhorn-outline" size={18} color="#8FC0FF" />
              <Text style={styles.darkSectionTitle}>{t('announcements')}</Text>
            </View>
            <TouchableOpacity
              style={styles.darkSeeAllBtn}
              onPress={() => navigation.navigate('Announcements')}>
              <Text style={styles.darkSeeAll}>{t('viewAll')}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#8FC0FF" />
            </TouchableOpacity>
          </View>

          {MOCK_CITIZEN_ANNOUNCEMENTS.slice(0, 2).map(item => {
            const meta = ANNOUNCEMENT_META[item.category];
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.darkCard}
                activeOpacity={0.85}
                // onPress={() => navigation.navigate('Announcements')}
                >
                <View style={[styles.darkIconBubble, {backgroundColor: meta.bg}]}>
                  <MaterialCommunityIcons name={meta.icon} size={20} color={meta.color} />
                </View>
                <View style={styles.darkCardBody}>
                  <Text style={styles.darkDesc} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.darkAnnouncementBody} numberOfLines={2}>{item.body}</Text>
                  <Text style={styles.darkDate}>{item.area} • {formatRelativeTime(item.createdAt)}</Text>
                </View>
                {/* <MaterialCommunityIcons name="chevron-right" size={20} color="#6B819B" /> */}
              </TouchableOpacity>
            );
          })}

          {/* Active Poll Banner */}
          {/* {MOCK_POLLS.filter(p => p.status === 'active').length > 0 && (
            <TouchableOpacity
              style={styles.darkPoll}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('PublicPoll')}>
              <View style={styles.darkPollIcon}>
                <MaterialCommunityIcons name="poll" size={22} color="#8FC0FF" />
              </View>
              <View style={styles.darkPollText}>
                <Text style={styles.darkPollTitle}>{t('newPoll')}</Text>
                <Text style={styles.darkPollSub} numberOfLines={1}>
                  {MOCK_POLLS.find(p => p.status === 'active')?.question}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#6B819B" />
            </TouchableOpacity>
          )} */}
        </View>
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
    padding: Spacing[5],
    minHeight: 150,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    justifyContent: 'space-between',
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
    paddingRight: 120,
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
  bannerSkyline: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: '42%',
    height: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 4,
    paddingRight: Spacing[4],
    opacity: 0.9,
  },
  bannerBuilding: {
    width: 12,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  reportNowBtn: {
    position: 'absolute',
    right: Spacing[5],
    bottom: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingLeft: Spacing[4],
    paddingRight: Spacing[3],
    paddingVertical: Spacing[2],
    zIndex: 2,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  reportNowText: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary},
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
    minHeight: 190,
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
    minHeight: 190,
    // alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[4],
    borderColor: Colors.accentOrange,
  },
  actionCardCompact: {
    flex: 1,
    minHeight: 89,
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
    width: 48,
    height: 48,
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
    width: 52,
    height: 52,
  },
  actionIconCompact: {
    width: 40,
    height: 40,
  },
  actionIconWide: {
    width: 62,
    height: 62,
  },
  actionCopy: {flex: 1, paddingRight: Spacing[4]},
  actionCopyCompact: {paddingRight: Spacing[5]},
  actionCopyFeature: {flex: 0, marginTop: Spacing[3]},
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing[1],
  },
  actionLabelFeature: {
    fontSize: FontSize.lg,
    marginBottom: Spacing[2],
    // textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  actionSubtitleFeature: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    // textAlign: 'center',
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
    borderColor: Colors.accentOrange,
  },
  darkSection: {
    marginTop: Spacing[6],
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[12],
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: Navy.base,
  },
  darkHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing[4]},
  darkHeaderTitle: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2]},
  darkSectionTitle: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#EAF1FB'},
  darkSeeAllBtn: {flexDirection: 'row', alignItems: 'center', gap: 2},
  darkSeeAll: {fontSize: FontSize.sm, color: '#8FC0FF', fontWeight: FontWeight.semiBold},
  darkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Navy.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: Spacing[4],
    marginBottom: Spacing[3],
  },
  darkCardBody: {flex: 1, paddingHorizontal: Spacing[3]},
  darkIconBubble: {width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center'},
  darkId: {fontSize: FontSize.xs, color: '#8FC0FF', fontWeight: FontWeight.semiBold, marginBottom: 2},
  darkDesc: {fontSize: FontSize.base, color: '#EAF1FB', fontWeight: FontWeight.semiBold, lineHeight: 20},
  darkAnnouncementBody: {fontSize: FontSize.sm, color: '#B7C7DC', lineHeight: 18, marginTop: 2},
  darkDate: {fontSize: FontSize.xs, color: '#90A4BD', marginTop: 4},
  darkCardRight: {alignItems: 'flex-end', gap: Spacing[2]},
  darkPoll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    backgroundColor: Navy.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E3A5F',
    padding: Spacing[4],
    marginTop: Spacing[1],
  },
  darkPollIcon: {width: 44, height: 44, borderRadius: BorderRadius.full, backgroundColor: Navy.base, alignItems: 'center', justifyContent: 'center'},
  darkPollText: {flex: 1},
  darkPollTitle: {fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#EAF1FB'},
  darkPollSub: {fontSize: FontSize.sm, color: '#90A4BD', marginTop: 2},
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
