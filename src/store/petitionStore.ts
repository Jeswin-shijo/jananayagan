import {create} from 'zustand';
import {Petition} from '@appTypes/api';
import {MOCK_PETITIONS} from '@utils/mockData';

interface PetitionState {
  petitions: Petition[];
  signedPetitionIds: string[];
  getPetition: (id: string) => Petition | undefined;
  hasSigned: (id: string) => boolean;
  signPetition: (id: string) => void;
}

export const usePetitionStore = create<PetitionState>((set, get) => ({
  petitions: MOCK_PETITIONS,
  signedPetitionIds: [],

  getPetition: id => get().petitions.find(petition => petition.id === id),

  hasSigned: id => get().signedPetitionIds.includes(id),

  signPetition: id =>
    set(state => {
      if (state.signedPetitionIds.includes(id)) {
        return state;
      }

      return {
        signedPetitionIds: [...state.signedPetitionIds, id],
        petitions: state.petitions.map(petition =>
          petition.id === id
            ? {...petition, currentSignatures: petition.currentSignatures + 1}
            : petition,
        ),
      };
    }),
}));
