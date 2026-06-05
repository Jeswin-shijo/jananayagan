import {createNavigationContainerRef} from '@react-navigation/native';

// Global navigation ref so components mounted outside the NavigationContainer
// (e.g. the floating Women Safety button in App.tsx) can trigger navigation.
export const navigationRef = createNavigationContainerRef();

export const navigate = (name: string, params?: object) => {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as (n: string, p?: object) => void)(name, params);
  }
};
