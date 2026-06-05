import {Linking, Platform} from 'react-native';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export const mapsLinkFor = (coords?: LatLng | null): string =>
  coords ? `https://maps.google.com/?q=${coords.latitude},${coords.longitude}` : '';

// Open the SMS composer pre-filled with a message (platform-correct body separator).
export const shareViaSms = (phone: string, body: string) => {
  const sep = Platform.OS === 'ios' ? '&' : '?';
  return Linking.openURL(`sms:${phone}${sep}body=${encodeURIComponent(body)}`).catch(() => {});
};

// Open walking directions to a destination in the maps app / browser.
export const openDirections = (destination: string, coords?: LatLng | null) => {
  const origin = coords ? `&origin=${coords.latitude},${coords.longitude}` : '';
  const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${encodeURIComponent(
    destination,
  )}&travelmode=walking`;
  return Linking.openURL(url).catch(() => {});
};

// Open a "places near me" search (police, hospital, …) centred on the user.
export const openNearbySearch = (query: string, coords?: LatLng | null) => {
  const url = coords
    ? `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${coords.latitude},${coords.longitude},15z`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query} near me`)}`;
  return Linking.openURL(url).catch(() => {});
};
