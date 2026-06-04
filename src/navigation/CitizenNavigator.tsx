import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenTabParamList, CitizenStackParamList} from '@appTypes/navigation';
import {CitizenHomeScreen} from '@screens/Citizen/CitizenHomeScreen';
import {MyActivityScreen} from '@screens/Citizen/MyActivityScreen';
import {WomenSafetyScreen} from '@screens/Citizen/WomenSafetyScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {PublicPollScreen} from '@screens/Citizen/PublicPollScreen';
import {CommunityFeedScreen} from '@screens/Citizen/CommunityFeedScreen';
import {CreatePostScreen} from '@screens/Citizen/CreatePostScreen';
import {ReportProblemScreen} from '@screens/Citizen/ReportProblemScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {NotificationsScreen} from '@screens/Shared/NotificationsScreen';
import {SuccessScreen} from '@screens/Shared/SuccessScreen';
import {FloatingTabBar} from '@components/common/FloatingTabBar';
import {useNotificationStore} from '@store/notificationStore';
import {useAppColors} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';

const Tab = createBottomTabNavigator<CitizenTabParamList>();
const Stack = createNativeStackNavigator<CitizenStackParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CitizenTabs: React.FC = () => {
  const Colors = useAppColors();
  const {t} = useTranslation();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  return (
    <Tab.Navigator
      initialRouteName="CommunityFeed"
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarIcon: ({color, focused, size}) => {
          const icons: Record<string, {active: MaterialCommunityIconName; inactive: MaterialCommunityIconName}> = {
            CommunityFeed: {active: 'home-variant', inactive: 'home-variant-outline'},
            Dashboard: {active: 'view-dashboard', inactive: 'view-dashboard-outline'},
            MyComplaints: {active: 'file-document', inactive: 'file-document-outline'},
            SubmitPetition: {active: 'file-sign', inactive: 'file-sign'},
            PublicPoll: {active: 'poll', inactive: 'poll'},
            Notifications: {active: 'bell', inactive: 'bell-outline'},
            Safety: {active: 'shield-check', inactive: 'shield-check-outline'},
            Profile: {active: 'account', inactive: 'account-outline'},
          };
          const icon = icons[route.name];
          return (
            <MaterialCommunityIcons
              name={focused ? icon.active : icon.inactive}
              size={size}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="CommunityFeed" component={CommunityFeedScreen} options={{title: t('home')}} />
      <Tab.Screen name="Dashboard" component={CitizenHomeScreen} options={{title: t('dashboard')}} />
      <Tab.Screen name="MyComplaints" component={MyActivityScreen} options={{title: t('complaints')}} />
      <Tab.Screen name="SubmitPetition" component={SubmitPetitionScreen} options={{title: t('petition')}} />
      <Tab.Screen name="PublicPoll" component={PublicPollScreen} options={{title: t('polls')}} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: t('notifications'),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="Safety" component={WomenSafetyScreen} options={{title: t('safety')}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{title: t('profile')}} />
    </Tab.Navigator>
  );
};

export const CitizenNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="CitizenTabs" component={CitizenTabs} />
    <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
    <Stack.Screen name="ComplaintTicket" component={ComplaintTicketScreen} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintTicketScreen as any} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="Success" component={SuccessScreen} />
  </Stack.Navigator>
);
