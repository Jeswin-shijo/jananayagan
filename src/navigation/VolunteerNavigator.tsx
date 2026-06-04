import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {VolunteerTabParamList, VolunteerStackParamList} from '@appTypes/navigation';
import {VolunteerHomeScreen} from '@screens/Volunteer/VolunteerHomeScreen';
import {VolunteerTasksScreen} from '@screens/Volunteer/VolunteerTasksScreen';
import {FieldWorkScreen} from '@screens/Volunteer/FieldWorkScreen';
import {CommunityFeedScreen} from '@screens/Citizen/CommunityFeedScreen';
import {CreatePostScreen} from '@screens/Citizen/CreatePostScreen';
import {ReportProblemScreen} from '@screens/Citizen/ReportProblemScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {SuccessScreen} from '@screens/Shared/SuccessScreen';
import {useAppColors} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';

const Tab = createBottomTabNavigator<VolunteerTabParamList>();
const Stack = createNativeStackNavigator<VolunteerStackParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const VolunteerTabs: React.FC = () => {
  const Colors = useAppColors();
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="CommunityFeed"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '600'},
        tabBarIcon: ({color, focused, size}) => {
          const icons: Record<string, {active: MaterialCommunityIconName; inactive: MaterialCommunityIconName}> = {
            CommunityFeed: {active: 'home', inactive: 'home-outline'},
            Dashboard: {active: 'view-dashboard', inactive: 'view-dashboard-outline'},
            VolunteerTasks: {active: 'clipboard-check', inactive: 'clipboard-check-outline'},
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
  </Stack.Navigator>
);
