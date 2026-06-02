import {create} from 'zustand';

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked';

interface Coords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationState {
  coords: Coords | null;
  address: string | null;
  permissionStatus: PermissionStatus;
  isLoading: boolean;
  setCoords: (coords: Coords) => void;
  setAddress: (address: string) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>(set => ({
  coords: null,
  address: null,
  permissionStatus: 'unknown',
  isLoading: false,

  setCoords: coords => set({coords}),
  setAddress: address => set({address}),
  setPermissionStatus: permissionStatus => set({permissionStatus}),
  setLoading: isLoading => set({isLoading}),
  reset: () => set({coords: null, address: null}),
}));
