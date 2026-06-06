import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@appTypes/navigation';
import {LoginScreen} from '@screens/Auth/LoginScreen';
import {RegisterScreen} from '@screens/Auth/RegisterScreen';
import {OTPVerificationScreen} from '@screens/Auth/OTPVerificationScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
  </Stack.Navigator>
);
