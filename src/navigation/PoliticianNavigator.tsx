import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator, DrawerContentComponentProps} from '@react-navigation/drawer';
import {LinearGradient} from 'react-native-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PoliticianStackParamList, PoliticianDrawerParamList} from '@appTypes/navigation';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useAuthStore} from '@store/authStore';
import {useAppAlert} from '@components/common/AppAlert';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

import {PoliticianDashboardScreen} from '@screens/Politician/PoliticianDashboardScreen';
import {PoliticianPetitionsScreen} from '@screens/Politician/PoliticianPetitionsScreen';
import {HeatMapScreen} from '@screens/Politician/HeatMapScreen';
import {PoliticianComplaintsScreen} from '@screens/Politician/PoliticianComplaintsScreen';
import {AnnouncementsScreen} from '@screens/Politician/AnnouncementsScreen';
import {PoliticianPollsScreen} from '@screens/Politician/PoliticianPollsScreen';
import {VolunteerManagementScreen} from '@screens/Politician/VolunteerManagementScreen';
import {BoothManagementScreen} from '@screens/Politician/BoothManagementScreen';
import {SurveysScreen} from '@screens/Politician/SurveysScreen';
import {EventsScreen} from '@screens/Politician/EventsScreen';
import {MediaCenterScreen} from '@screens/Politician/MediaCenterScreen';
import {ReportsScreen} from '@screens/Politician/ReportsScreen';
import {AISentimentDashboardScreen} from '@screens/Politician/AISentimentDashboardScreen';
import {ElectionModeScreen} from '@screens/Politician/ElectionModeScreen';
import {TeamScreen} from '@screens/Politician/TeamScreen';
import {PoliticianSettingsScreen} from '@screens/Politician/PoliticianSettingsScreen';
import {SupportScreen} from '@screens/Politician/SupportScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {SuccessScreen} from '@screens/Shared/SuccessScreen';
import {ReportProblemScreen} from '@screens/Citizen/ReportProblemScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {CommunityFeedScreen} from '@screens/Citizen/CommunityFeedScreen';
import {CreatePostScreen} from '@screens/Citizen/CreatePostScreen';
import {WomenSafetyScreen} from '@screens/Citizen/WomenSafetyScreen';
import {SafeRouteScreen} from '@screens/Citizen/SafeRouteScreen';
import {RideTrackerScreen} from '@screens/Citizen/RideTrackerScreen';
import {SilentReportScreen} from '@screens/Citizen/SilentReportScreen';
import {NearbyHelpScreen} from '@screens/Citizen/NearbyHelpScreen';
import {NotificationsScreen} from '@screens/Shared/NotificationsScreen';

const Stack = createNativeStackNavigator<PoliticianStackParamList>();
const Drawer = createDrawerNavigator<PoliticianDrawerParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type DrawerItem = {route: keyof PoliticianDrawerParamList; icon: MaterialCommunityIconName; labelKey: TranslationKey};
type DrawerGroup = {titleKey: TranslationKey; items: DrawerItem[]};

const DRAWER_GROUPS: DrawerGroup[] = [
  {
    titleKey: 'main',
    items: [
      {route: 'PoliticianDashboard', icon: 'view-dashboard-outline', labelKey: 'dashboard'},
      {route: 'HeatMap', icon: 'map-marker-radius-outline', labelKey: 'heatMap'},
      {route: 'Complaints', icon: 'clipboard-text-outline', labelKey: 'complaints'},
      {route: 'Announcements', icon: 'bullhorn-outline', labelKey: 'announcements'},
      {route: 'PublicPolls', icon: 'poll', labelKey: 'publicPolls'},
    ],
  },
  {
    titleKey: 'manage',
    items: [
      {route: 'VolunteerManagement', icon: 'account-group-outline', labelKey: 'volunteers'},
      {route: 'BoothManagement', icon: 'office-building-outline', labelKey: 'boothManagement'},
      {route: 'Surveys', icon: 'clipboard-list-outline', labelKey: 'surveys'},
      {route: 'Events', icon: 'calendar-outline', labelKey: 'events'},
      {route: 'MediaCenter', icon: 'image-multiple-outline', labelKey: 'mediaCenter'},
    ],
  },
  {
    titleKey: 'analytics',
    items: [
      {route: 'Reports', icon: 'chart-box-outline', labelKey: 'reports'},
      {route: 'AISentimentDashboard', icon: 'brain', labelKey: 'aiInsights'},
      {route: 'ElectionMode', icon: 'vote-outline', labelKey: 'voterSentiment'},
    ],
  },
  {
    titleKey: 'settings',
    items: [
      {route: 'Profile', icon: 'account-outline', labelKey: 'profile'},
      {route: 'Team', icon: 'account-multiple-outline', labelKey: 'team'},
      {route: 'Settings', icon: 'cog-outline', labelKey: 'settings'},
      {route: 'SupportHelp', icon: 'lifebuoy', labelKey: 'supportHelp'},
    ],
  },
];

const PoliticianDrawerContent: React.FC<DrawerContentComponentProps> = ({state, navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {user, logout} = useAuthStore();
  const {showAlert} = useAppAlert();
  const activeRoute = state.routeNames[state.index];

  return (
    <View style={styles.drawer}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.drawerSafe}>
        {/* Brand */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.brand}>
          <View style={styles.brandLogo}>
            <MaterialCommunityIcons name="account-voice" size={22} color={Colors.primary} />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>{t('appName')}</Text>
            <Text style={styles.brandTag}>{user?.name ?? t('politician')}</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.items}>
          {DRAWER_GROUPS.map(group => (
            <View key={group.titleKey} style={styles.group}>
              <Text style={styles.groupTitle}>{t(group.titleKey).toUpperCase()}</Text>
              {group.items.map(item => {
                const isActive = activeRoute === item.route;
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[styles.item, isActive && styles.itemActive]}
                    onPress={() => navigation.navigate(item.route)}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={22}
                      color={isActive ? Colors.primary : Colors.textSecondary}
                    />
                    <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{t(item.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.logout}
          onPress={() =>
            showAlert({
              title: t('logout'),
              message: t('logoutMessage'),
              variant: 'danger',
              actions: [
                {text: t('cancel'), style: 'cancel'},
                {text: t('logout'), style: 'destructive', onPress: logout},
              ],
            })
          }>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const PoliticianDrawer: React.FC = () => {
  const Colors = useAppColors();
  return (
    <Drawer.Navigator
      initialRouteName="PoliticianDashboard"
      drawerContent={props => <PoliticianDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {width: 288, backgroundColor: Colors.surface},
      }}>
      <Drawer.Screen name="PoliticianDashboard" component={PoliticianDashboardScreen} />
      <Drawer.Screen name="HeatMap" component={HeatMapScreen} />
      <Drawer.Screen name="Complaints" component={PoliticianComplaintsScreen} />
      <Drawer.Screen name="PetitionManagement" component={PoliticianPetitionsScreen} />
      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
      <Drawer.Screen name="PublicPolls" component={PoliticianPollsScreen} />
      <Drawer.Screen name="VolunteerManagement" component={VolunteerManagementScreen} />
      <Drawer.Screen name="BoothManagement" component={BoothManagementScreen} />
      <Drawer.Screen name="Surveys" component={SurveysScreen} />
      <Drawer.Screen name="Events" component={EventsScreen} />
      <Drawer.Screen name="MediaCenter" component={MediaCenterScreen} />
      <Drawer.Screen name="Reports" component={ReportsScreen} />
      <Drawer.Screen name="AISentimentDashboard" component={AISentimentDashboardScreen} />
      <Drawer.Screen name="ElectionMode" component={ElectionModeScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Team" component={TeamScreen} />
      <Drawer.Screen name="Settings" component={PoliticianSettingsScreen} />
      <Drawer.Screen name="SupportHelp" component={SupportScreen} />
    </Drawer.Navigator>
  );
};

export const PoliticianNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="PoliticianDrawer" component={PoliticianDrawer} />
    <Stack.Screen name="ReportProblem" component={ReportProblemScreen as any} />
    <Stack.Screen name="ComplaintTicket" component={ComplaintTicketScreen as any} />
    <Stack.Screen name="SubmitPetition" component={SubmitPetitionScreen} />
    <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="Success" component={SuccessScreen} />
    <Stack.Screen name="WomenSafety" component={WomenSafetyScreen} />
    <Stack.Screen name="SafeRoute" component={SafeRouteScreen} />
    <Stack.Screen name="RideTracker" component={RideTrackerScreen} />
    <Stack.Screen name="SilentReport" component={SilentReportScreen} />
    <Stack.Screen name="NearbyHelp" component={NearbyHelpScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

const createStyles = (Colors: AppColors) => ({
  drawer: {flex: 1, backgroundColor: Colors.surface},
  drawerSafe: {flex: 1},
  brand: {flexDirection: 'row', alignItems: 'center', padding: Spacing[4], gap: Spacing[3]},
  brandLogo: {width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center'},
  brandText: {flex: 1},
  brandName: {fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textOnPrimary},
  brandTag: {fontSize: FontSize.xs, color: Colors.textOnPrimary, opacity: 0.85, marginTop: 1},
  items: {paddingVertical: Spacing[3]},
  group: {marginBottom: Spacing[3]},
  groupTitle: {fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textDisabled, letterSpacing: 1, paddingHorizontal: Spacing[4], marginBottom: Spacing[1]},
  item: {flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], marginHorizontal: Spacing[2], borderRadius: BorderRadius.md},
  itemActive: {backgroundColor: Colors.primaryLight},
  itemLabel: {fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium},
  itemLabelActive: {color: Colors.primary, fontWeight: FontWeight.semiBold},
  logout: {flexDirection: 'row', alignItems: 'center', gap: Spacing[2], paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderTopWidth: 1, borderTopColor: Colors.borderLight},
  logoutText: {fontSize: FontSize.base, color: Colors.danger, fontWeight: FontWeight.semiBold},
} as const);
