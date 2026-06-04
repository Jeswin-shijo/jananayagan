import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '@appTypes/navigation';
import {useAuthStore} from '@store/authStore';
import {AuthNavigator} from './AuthNavigator';
import {CitizenNavigator} from './CitizenNavigator';
import {PoliticianNavigator} from './PoliticianNavigator';
import {AdminNavigator} from './AdminNavigator';
import {VolunteerNavigator} from './VolunteerNavigator';
import {AppLoader} from '@components/common/AppLoader';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const role = useAuthStore(s => s.role);

  switch (role) {
    case 'admin':
      return <AdminNavigator />;
    case 'politician':
      return <PoliticianNavigator />;
    case 'volunteer':
      return <VolunteerNavigator />;
    case 'citizen':
    default:
      return <CitizenNavigator />;
  }
};

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, isLoading, restoreSession} = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isLoading) {
    return <AppLoader fullScreen message="Loading JANANAYAGAN..." />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
