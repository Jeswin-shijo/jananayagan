import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PoliticianStackParamList} from '@appTypes/navigation';
import {PoliticianDashboardScreen} from '@screens/Politician/PoliticianDashboardScreen';
import {VolunteerManagementScreen} from '@screens/Politician/VolunteerManagementScreen';
import {AISentimentDashboardScreen} from '@screens/Politician/AISentimentDashboardScreen';
import {ElectionModeScreen} from '@screens/Politician/ElectionModeScreen';

const Stack = createNativeStackNavigator<PoliticianStackParamList>();

export const PoliticianNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="PoliticianDashboard" component={PoliticianDashboardScreen} />
    <Stack.Screen name="VolunteerManagement" component={VolunteerManagementScreen} />
    <Stack.Screen name="AISentimentDashboard" component={AISentimentDashboardScreen} />
    <Stack.Screen name="ElectionMode" component={ElectionModeScreen} />
  </Stack.Navigator>
);
