import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator, DrawerContentComponentProps} from '@react-navigation/drawer';
import {LinearGradient} from 'react-native-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AdminStackParamList, AdminDrawerParamList} from '@appTypes/navigation';
import {useAppColors, useThemedStyles} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';
import {useAuthStore} from '@store/authStore';
import {AppColors} from '@constants/colors';
import {TranslationKey} from '@constants/i18n';
import {FontSize, FontWeight} from '@constants/typography';
import {Spacing, BorderRadius} from '@constants/spacing';

import {AdminDashboardScreen} from '@screens/Admin/AdminDashboardScreen';
import {UserManagementScreen} from '@screens/Admin/UserManagementScreen';
import {ConstituenciesScreen} from '@screens/Admin/ConstituenciesScreen';
import {ModerationScreen} from '@screens/Admin/ModerationScreen';
import {PoliticianComplaintsScreen} from '@screens/Politician/PoliticianComplaintsScreen';
import {AnnouncementsScreen} from '@screens/Politician/AnnouncementsScreen';
import {ReportsScreen} from '@screens/Politician/ReportsScreen';
import {PoliticianSettingsScreen} from '@screens/Politician/PoliticianSettingsScreen';
import {SupportScreen} from '@screens/Politician/SupportScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();
const Drawer = createDrawerNavigator<AdminDrawerParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type DrawerItem = {route: keyof AdminDrawerParamList; icon: MaterialCommunityIconName; labelKey: TranslationKey};
type DrawerGroup = {titleKey: TranslationKey; items: DrawerItem[]};

const DRAWER_GROUPS: DrawerGroup[] = [
  {
    titleKey: 'main',
    items: [
      {route: 'AdminDashboard', icon: 'view-dashboard-outline', labelKey: 'dashboard'},
      {route: 'UserManagement', icon: 'account-multiple-outline', labelKey: 'userManagement'},
      {route: 'Constituencies', icon: 'map-outline', labelKey: 'constituencies'},
      {route: 'Moderation', icon: 'shield-alert-outline', labelKey: 'moderation'},
    ],
  },
  {
    titleKey: 'oversight',
    items: [
      {route: 'Complaints', icon: 'clipboard-text-outline', labelKey: 'complaints'},
      {route: 'Announcements', icon: 'bullhorn-outline', labelKey: 'announcements'},
      {route: 'Reports', icon: 'chart-box-outline', labelKey: 'reports'},
    ],
  },
  {
    titleKey: 'settings',
    items: [
      {route: 'Profile', icon: 'account-outline', labelKey: 'profile'},
      {route: 'Settings', icon: 'cog-outline', labelKey: 'settings'},
      {route: 'SupportHelp', icon: 'lifebuoy', labelKey: 'supportHelp'},
    ],
  },
];

const AdminDrawerContent: React.FC<DrawerContentComponentProps> = ({state, navigation}) => {
  const Colors = useAppColors();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation();
  const {user, logout} = useAuthStore();
  const activeRoute = state.routeNames[state.index];

  return (
    <View style={styles.drawer}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.drawerSafe}>
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.brand}>
          <View style={styles.brandLogo}>
            <MaterialCommunityIcons name="shield-account" size={22} color={Colors.primary} />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>{t('appName')}</Text>
            <Text style={styles.brandTag}>{user?.name ?? t('admin')} · {t('admin')}</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.items}>
          {DRAWER_GROUPS.map(group => (
            <View key={group.titleKey} style={styles.group}>
              <Text style={styles.groupTitle}>{t(group.titleKey).toUpperCase()}</Text>
              {group.items.map(item => {
                const isActive = activeRoute === item.route;
                return (
                  <TouchableOpacity key={item.route} style={[styles.item, isActive && styles.itemActive]} onPress={() => navigation.navigate(item.route)}>
                    <MaterialCommunityIcons name={item.icon} size={22} color={isActive ? Colors.primary : Colors.textSecondary} />
                    <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{t(item.labelKey)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const AdminDrawer: React.FC = () => {
  const Colors = useAppColors();
  return (
    <Drawer.Navigator
      initialRouteName="AdminDashboard"
      drawerContent={props => <AdminDrawerContent {...props} />}
      screenOptions={{headerShown: false, drawerType: 'front', drawerStyle: {width: 288, backgroundColor: Colors.surface}}}>
      <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Drawer.Screen name="UserManagement" component={UserManagementScreen} />
      <Drawer.Screen name="Constituencies" component={ConstituenciesScreen} />
      <Drawer.Screen name="Moderation" component={ModerationScreen} />
      <Drawer.Screen name="Complaints" component={PoliticianComplaintsScreen} />
      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
      <Drawer.Screen name="Reports" component={ReportsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={PoliticianSettingsScreen} />
      <Drawer.Screen name="SupportHelp" component={SupportScreen} />
    </Drawer.Navigator>
  );
};

export const AdminNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="AdminDrawer" component={AdminDrawer} />
    <Stack.Screen name="ComplaintTicket" component={ComplaintTicketScreen as any} />
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
