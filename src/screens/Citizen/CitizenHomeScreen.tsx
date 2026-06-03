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
  FadeInDown,
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {CitizenStackParamList, CitizenTabParamList} from '@appTypes/navigation';
import {AppCard} from '@components/common/AppCard';
import {AppBadge} from '@components/common/AppBadge';
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

type QuickAction = {
  id: string;
  icon: MaterialCommunityIconName;
  labelKey: 'reportProblem' | 'myComplaints' | 'petition' | 'vote';
  color: string;
  route:
    | {type: 'stack'; screen: 'ReportProblem'}
    | {type: 'tab'; screen: keyof CitizenTabParamList};
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'report',
    icon: 'alert-outline',
    labelKey: 'reportProblem',
    color: '#FEF3C7',
    route: {type: 'stack', screen: 'ReportProblem'},
  },
  {
    id: 'complaints',
    icon: 'clipboard-text-outline',
    labelKey: 'myComplaints',
    color: '#E0F2FE',
    route: {type: 'tab', screen: 'MyComplaints'},
  },
  {
    id: 'petition',
    icon: 'file-sign',
    labelKey: 'petition',
    color: '#F3E8FF',
    route: {type: 'tab', screen: 'SubmitPetition'},
  },
  {
    id: 'poll',
    icon: 'poll',
    labelKey: 'vote',
    color: '#DCFCE7',
    route: {type: 'tab', screen: 'PublicPoll'},
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
  index: number;
  colors: AppColors;
  styles: ReturnType<typeof createStyles>;
  label: string;
  onPress: (action: QuickAction) => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  index,
  colors,
  styles,
  label,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(180 + index * 70).springify()}
      layout={Layout.springify()}
      style={styles.actionCardWrapper}>
      <AnimatedPressable
        onPress={() => onPress(action)}
        onPressIn={() => {
          scale.value = withSpring(0.96, {damping: 16, stiffness: 240});
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {damping: 14, stiffness: 220});
        }}
        style={[styles.actionCard, {backgroundColor: action.color}, animatedStyle]}>
        <View style={styles.actionIconWrap}>
          <MaterialCommunityIcons name={action.icon} size={28} color={colors.primary} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </AnimatedPressable>
    </Animated.View>
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
    <SafeAreaView style={styles.container}>
      <OfflineBanner />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}>

        {/* Header */}
        <Animated.View entering={FadeInUp.duration(450)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t(getTimeGreetingKey())}</Text>
            <Text style={styles.name}>{user?.name ?? t('citizen')}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Banner */}
        <Animated.View entering={FadeInDown.delay(90).springify()} style={[styles.banner, { marginTop: -20 }]}>
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
        </Animated.View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, index) => (
            <QuickActionCard
              key={action.id}
              action={action}
              index={index}
              colors={Colors}
              styles={styles}
              label={t(action.labelKey)}
              onPress={handleQuickAction}
            />
          ))}
        </View>

        {/* Recent Complaints */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('recentComplaints')}</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {MOCK_COMPLAINTS.slice(0, 3).map((complaint, index) => (
          <Animated.View
            key={complaint.id}
            entering={FadeInDown.delay(420 + index * 70).springify()} style={{paddingHorizontal: Spacing[4]}}>
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
          </Animated.View>
        ))}

        {/* Active Poll Banner */}
        {MOCK_POLLS.filter(p => p.status === 'active').length > 0 && (
          <AppCard
            style={styles.pollBanner}
            onPress={() => navigation.navigate('CitizenTabs', {screen: 'PublicPoll'})}>
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

const createStyles = (Colors: AppColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
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
    margin: Spacing[4],
    marginTop: -10,
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
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    paddingHorizontal: Spacing[4],
    // marginBottom: Spacing[4],
    marginTop: Spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: Spacing[4],
    marginBottom: -10,
  },
  seeAll: {fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500'},
  actionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    minHeight: 200,
  },
  actionCardWrapper: {
    width: '48%',
    marginBottom: Spacing[3],
  },
  actionCard: {
    alignItems: 'center',
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 5,
  },
  actionIconWrap: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  actionLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.text,
    textAlign: 'center',
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
});
