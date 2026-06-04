import {useState, useCallback} from 'react';
import {Linking} from 'react-native';
import * as Location from 'expo-location';
import {useLocationStore} from '@store/locationStore';
import {useAppAlert} from '@components/common/AppAlert';

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked';

interface UseLocationPermissionResult {
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
}

export const useLocationPermission = (): UseLocationPermissionResult => {
  const {permissionStatus, setPermissionStatus} = useLocationStore();
  const {showAlert} = useAppAlert();
  const [localStatus, setLocalStatus] = useState<PermissionStatus>(permissionStatus);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const checked = await Location.getForegroundPermissionsAsync();

    if (checked.granted) {
      setPermissionStatus('granted');
      setLocalStatus('granted');
      return true;
    }

    if (!checked.canAskAgain) {
      setPermissionStatus('blocked');
      setLocalStatus('blocked');
      showAlert({
        title: 'Location Permission Required',
        message: 'Please enable location access in Settings to use this feature.',
        variant: 'warning',
        icon: 'map-marker-alert-outline',
        actions: [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      });
      return false;
    }

    const result = await Location.requestForegroundPermissionsAsync();
    if (result.granted) {
      setPermissionStatus('granted');
      setLocalStatus('granted');
      return true;
    }

    setPermissionStatus('denied');
    setLocalStatus('denied');
    return false;
  }, [setPermissionStatus, showAlert]);

  return {permissionStatus: localStatus, requestPermission};
};
