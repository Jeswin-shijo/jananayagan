import {create} from 'zustand';
import {Complaint} from '@appTypes/api';

interface ComplaintState {
  complaints: Complaint[];
  activeComplaint: Complaint | null;
  isLoading: boolean;
  error: string | null;
  setComplaints: (complaints: Complaint[]) => void;
  setActiveComplaint: (complaint: Complaint | null) => void;
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useComplaintStore = create<ComplaintState>(set => ({
  complaints: [],
  activeComplaint: null,
  isLoading: false,
  error: null,

  setComplaints: complaints => set({complaints}),
  setActiveComplaint: complaint => set({activeComplaint: complaint}),
  addComplaint: complaint =>
    set(state => ({complaints: [complaint, ...state.complaints]})),
  updateComplaint: (id, updates) =>
    set(state => ({
      complaints: state.complaints.map(c =>
        c.id === id ? {...c, ...updates} : c,
      ),
    })),
  setLoading: isLoading => set({isLoading}),
  setError: error => set({error}),
}));
