import {useState, useCallback} from 'react';
import {Linking, Alert} from 'react-native';
import * as Location from 'expo-location';
import {useLocationStore} from '@store/locationStore';

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked';

interface UseLocationPermissionResult {
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<boolean>;
}

export const useLocationPermission = (): UseLocationPermissionResult => {
  const {permissionStatus, setPermissionStatus} = useLocationStore();
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
      Alert.alert(
        'Location Permission Required',
        'Please enable location access in Settings to use this feature.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
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
  }, [setPermissionStatus]);

  return {permissionStatus: localStatus, requestPermission};
};
