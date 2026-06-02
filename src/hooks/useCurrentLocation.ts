import {useState, useCallback} from 'react';
import * as Location from 'expo-location';
import {useLocationStore} from '@store/locationStore';
import {useLocationPermission} from './useLocationPermission';

interface UseCurrentLocationResult {
  isLoading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
}

export const useCurrentLocation = (): UseCurrentLocationResult => {
  const {setCoords, setLoading} = useLocationStore();
  const {requestPermission} = useLocationPermission();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocation = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      setError('Location permission denied');
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch location');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [requestPermission, setCoords, setLoading]);

  return {isLoading, error, fetchLocation};
};
