import {useEffect, useRef} from 'react';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {AudioModule} from 'expo-audio';
import * as Notifications from 'expo-notifications';

// Asks for the app's core permissions once on startup. Requests run sequentially
// so the OS dialogs queue one after another instead of overlapping. The OS only
// shows a prompt for permissions that are still "undetermined", so calling this on
// every cold start is safe and won't nag for already-decided permissions.
export const useStartupPermissions = () => {
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) {
      return;
    }
    requested.current = true;

    (async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch {}
      try {
        await ImagePicker.requestCameraPermissionsAsync();
      } catch {}
      try {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch {}
      try {
        await AudioModule.requestRecordingPermissionsAsync();
      } catch {}
      try {
        await Notifications.requestPermissionsAsync();
      } catch {}
    })();
  }, []);
};
