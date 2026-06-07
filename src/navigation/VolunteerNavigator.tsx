import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {VolunteerTabParamList, VolunteerStackParamList} from '@appTypes/navigation';
import {VolunteerHomeScreen} from '@screens/Volunteer/VolunteerHomeScreen';
import {VolunteerTasksScreen} from '@screens/Volunteer/VolunteerTasksScreen';
import {FieldWorkScreen} from '@screens/Volunteer/FieldWorkScreen';
import {VolunteerTeamScreen} from '@screens/Volunteer/VolunteerTeamScreen';
import {CommunityFeedScreen} from '@screens/Citizen/CommunityFeedScreen';
import {CreatePostScreen} from '@screens/Citizen/CreatePostScreen';
import {ReportProblemScreen} from '@screens/Citizen/ReportProblemScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {SuccessScreen} from '@screens/Shared/SuccessScreen';
import {NotificationsScreen} from '@screens/Shared/NotificationsScreen';
import {WomenSafetyScreen} from '@screens/Citizen/WomenSafetyScreen';
import {SafeRouteScreen} from '@screens/Citizen/SafeRouteScreen';
import {RideTrackerScreen} from '@screens/Citizen/RideTrackerScreen';
import {SilentReportScreen} from '@screens/Citizen/SilentReportScreen';
import {NearbyHelpScreen} from '@screens/Citizen/NearbyHelpScreen';
import {useTranslation} from '@hooks/useTranslation';
import {Navy} from '@constants/colors';

const Tab = createBottomTabNavigator<VolunteerTabParamList>();
const Stack = createNativeStackNavigator<VolunteerStackParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const VolunteerTabs: React.FC = () => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="CommunityFeed"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3FA2FF',
        tabBarInactiveTintColor: '#8AA0C2',
        tabBarStyle: {
          backgroundColor: Navy.surface,
          borderTopColor: Navy.border,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 12,
          paddingTop: 8,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        tabBarIcon: ({color, focused, size}) => {
          const icons: Record<string, {active: MaterialCommunityIconName; inactive: MaterialCommunityIconName}> = {
            CommunityFeed: {active: 'home', inactive: 'home-outline'},
            Dashboard: {active: 'view-dashboard', inactive: 'view-dashboard-outline'},
            VolunteerTasks: {active: 'clipboard-check', inactive: 'clipboard-check-outline'},
            MyTeam: {active: 'account-group', inactive: 'account-group-outline'},
            FieldWork: {active: 'map-marker-radius', inactive: 'map-marker-radius-outline'},
            Profile: {active: 'account', inactive: 'account-outline'},
          };
          const icon = icons[route.name];
          return <MaterialCommunityIcons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="CommunityFeed" component={CommunityFeedScreen} options={{title: t('home')}} />
      <Tab.Screen name="Dashboard" component={VolunteerHomeScreen} options={{title: t('dashboard')}} />
      <Tab.Screen name="VolunteerTasks" component={VolunteerTasksScreen} options={{title: t('myTasks')}} />
      <Tab.Screen name="MyTeam" component={VolunteerTeamScreen} options={{title: 'My Team'}} />
      <Tab.Screen name="FieldWork" component={FieldWorkScreen} options={{title: t('fieldWork')}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{title: t('profile')}} />
    </Tab.Navigator>
  );
};

export const VolunteerNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="VolunteerTabs" component={VolunteerTabs} />
    <Stack.Screen name="ReportProblem" component={ReportProblemScreen as any} />
    <Stack.Screen name="ComplaintTicket" component={ComplaintTicketScreen as any} />
    <Stack.Screen name="SubmitPetition" component={SubmitPetitionScreen} />
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
