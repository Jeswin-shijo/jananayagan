import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  name: string;
  phone: string;
}

const STORAGE_KEY = 'emergency_contacts';
export const MAX_EMERGENCY_CONTACTS = 5;

interface EmergencyContactsState {
  contacts: EmergencyContact[];
  restore: () => Promise<void>;
  setContacts: (contacts: EmergencyContact[]) => Promise<void>;
  clear: () => Promise<void>;
}

const sanitize = (contacts: EmergencyContact[]): EmergencyContact[] =>
  contacts
    .map(c => ({name: (c.name ?? '').trim(), phone: (c.phone ?? '').trim()}))
    .filter(c => c.phone.length > 0)
    .slice(0, MAX_EMERGENCY_CONTACTS);

export const useEmergencyContactsStore = create<EmergencyContactsState>(set => ({
  contacts: [],

  restore: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        set({contacts: sanitize(parsed)});
      }
    } catch {
      // ignore corrupt storage
    }
  },

  setContacts: async contacts => {
    const next = sanitize(contacts);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({contacts: next});
  },

  clear: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({contacts: []});
  },
}));
