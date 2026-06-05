import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
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

const PetitionTabScreen: React.FC = () => {
  const Colors = useAppColors();

  return (
    <SafeAreaView edges={['top']} style={{flex: 1, backgroundColor: Colors.background}}>
      <SubmitPetitionScreen embedded />
    </SafeAreaView>
  );
};

const CitizenTabs: React.FC = () => {
  const Colors = useAppColors();
  const {t} = useTranslation();
  // Women Safety hub is available to every citizen login (not gender-gated).
  const showSafetyTab = true;

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
            MyComplaints: {active: 'file-document', inactive: 'file-document-outline'},
            Safety: {active: 'shield-check', inactive: 'shield-check-outline'},
            Petition: {active: 'file-sign', inactive: 'file-sign'},
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
      <Tab.Screen name="MyComplaints" component={MyActivityScreen} options={{title: t('complaints')}} />
      {showSafetyTab ? (
        <Tab.Screen name="Safety" component={WomenSafetyScreen} options={{title: t('safety')}} />
      ) : (
        <Tab.Screen name="Petition" component={PetitionTabScreen} options={{title: t('petition')}} />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} options={{title: t('profile')}} />
    </Tab.Navigator>
  );
};

export const CitizenNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="CitizenTabs" component={CitizenTabs} />
    <Stack.Screen name="Dashboard" component={CitizenHomeScreen} />
    <Stack.Screen name="SubmitPetition" component={SubmitPetitionScreen} />
    <Stack.Screen name="PublicPoll" component={PublicPollScreen} />
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
