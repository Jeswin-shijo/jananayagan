import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {CitizenTabParamList, CitizenStackParamList} from '@appTypes/navigation';
import {CitizenHomeScreen} from '@screens/Citizen/CitizenHomeScreen';
import {MyComplaintsScreen} from '@screens/Citizen/MyComplaintsScreen';
import {WomenSafetyScreen} from '@screens/Citizen/WomenSafetyScreen';
import {SubmitPetitionScreen} from '@screens/Citizen/SubmitPetitionScreen';
import {PublicPollScreen} from '@screens/Citizen/PublicPollScreen';
import {AnnouncementsScreen} from '@screens/Citizen/AnnouncementsScreen';
import {CommunityFeedScreen} from '@screens/Citizen/CommunityFeedScreen';
import {CreatePostScreen} from '@screens/Citizen/CreatePostScreen';
import {ReportProblemScreen} from '@screens/Citizen/ReportProblemScreen';
import {SilentReportScreen} from '@screens/Citizen/SilentReportScreen';
import {NearbyHelpScreen} from '@screens/Citizen/NearbyHelpScreen';
import {RideTrackerScreen} from '@screens/Citizen/RideTrackerScreen';
import {SafeRouteScreen} from '@screens/Citizen/SafeRouteScreen';
import {ComplaintTicketScreen} from '@screens/Citizen/ComplaintTicketScreen';
import {PetitionDetailScreen} from '@screens/Citizen/PetitionDetailScreen';
import {ProfileScreen} from '@screens/Shared/ProfileScreen';
import {NotificationsScreen} from '@screens/Shared/NotificationsScreen';
import {SuccessScreen} from '@screens/Shared/SuccessScreen';
import {FloatingTabBar} from '@components/common/FloatingTabBar';
import {useAppColors} from '@hooks/useThemedStyles';
import {useTranslation} from '@hooks/useTranslation';

const Tab = createBottomTabNavigator<CitizenTabParamList>();
const Stack = createNativeStackNavigator<CitizenStackParamList>();
type MaterialCommunityIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const PetitionTabScreen: React.FC = () => <SubmitPetitionScreen embedded />;

const CitizenTabs: React.FC = () => {
  const Colors = useAppColors();
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="CommunityFeed"
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, {active: MaterialCommunityIconName; inactive: MaterialCommunityIconName}> = {
            CommunityFeed: {active: 'home-variant', inactive: 'home-variant-outline'},
            Dashboard: {active: 'view-dashboard', inactive: 'view-dashboard-outline'},
            MyComplaints: {active: 'file-document', inactive: 'file-document-outline'},
            Petition: {active: 'file-sign', inactive: 'file-sign'},
          };
          const icon = icons[route.name];
          return (
            <MaterialCommunityIcons
              name={icon.active}
              size={size}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="CommunityFeed" component={CommunityFeedScreen} options={{title: t('home')}} />
      <Tab.Screen name="Dashboard" component={CitizenHomeScreen} options={{title: t('dashboard')}} />
      <Tab.Screen name="MyComplaints" component={MyComplaintsScreen} options={{title: t('complaints')}} />
      <Tab.Screen name="Petition" component={PetitionTabScreen} options={{title: t('petition')}} />
    </Tab.Navigator>
  );
};

export const CitizenNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="CitizenTabs" component={CitizenTabs} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="SubmitPetition" component={SubmitPetitionScreen} />
    <Stack.Screen name="PublicPoll" component={PublicPollScreen} />
    <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
    <Stack.Screen name="WomenSafety" component={WomenSafetyScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="ReportProblem" component={ReportProblemScreen} />
    <Stack.Screen name="SilentReport" component={SilentReportScreen} />
    <Stack.Screen name="NearbyHelp" component={NearbyHelpScreen} />
    <Stack.Screen name="RideTracker" component={RideTrackerScreen} />
    <Stack.Screen name="SafeRoute" component={SafeRouteScreen} />
    <Stack.Screen name="ComplaintTicket" component={ComplaintTicketScreen} />
    <Stack.Screen name="PetitionDetail" component={PetitionDetailScreen} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintTicketScreen as any} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="Success" component={SuccessScreen} />
  </Stack.Navigator>
);
