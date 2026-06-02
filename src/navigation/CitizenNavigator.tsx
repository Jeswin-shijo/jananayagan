import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenTabParamList, CitizenStackParamList} from '@appTypes/navigation';
import {CitizenHomeScreen} from '@screens/Citizen/CitizenHomeScreen';
import {MyComplaintsScreen} from '@screens/Citizen/MyComplaintsScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {PublicPollScreen} from '@screens/Citizen/PublicPollScreen';
import {ReportProblemScreen} from '@screens/Citizen/ReportProblemScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {useNotificationStore} from '@store/notificationStore';
import {useAppColors} from '@hooks/useThemedStyles';

const Tab = createBottomTabNavigator<CitizenTabParamList>();
const Stack = createNativeStackNavigator<CitizenStackParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CitizenTabs: React.FC = () => {
  const Colors = useAppColors();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 66,
          paddingBottom: 10,
          paddingTop: 6,
          elevation: 10,
          shadowColor: Colors.black,
          shadowOffset: {width: 0, height: -6},
          shadowOpacity: 0.08,
          shadowRadius: 14,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({color, focused, size}) => {
          const icons: Record<string, {active: MaterialCommunityIconName; inactive: MaterialCommunityIconName}> = {
            CitizenHome: {active: 'home', inactive: 'home-outline'},
            MyComplaints: {active: 'clipboard-text', inactive: 'clipboard-text-outline'},
            SubmitPetition: {active: 'file-sign', inactive: 'file-sign'},
            PublicPoll: {active: 'poll', inactive: 'poll'},
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
      <Tab.Screen name="CitizenHome" component={CitizenHomeScreen} options={{title: 'Home'}} />
      <Tab.Screen name="MyComplaints" component={MyComplaintsScreen} options={{title: 'Complaints'}} />
      <Tab.Screen name="SubmitPetition" component={SubmitPetitionScreen} options={{title: 'Petition'}} />
      <Tab.Screen name="PublicPoll" component={PublicPollScreen} options={{title: 'Polls'}} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

export const CitizenNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="CitizenTabs" component={CitizenTabs} />
    <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
    <Stack.Screen name="ComplaintTicket" component={ComplaintTicketScreen} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintTicketScreen as any} />
  </Stack.Navigator>
);
