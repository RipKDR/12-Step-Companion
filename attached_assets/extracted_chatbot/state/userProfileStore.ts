import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types';

interface UserProfileState {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
}

const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      userProfile: {
        sobrietyDate: '',
        triggers: '',
        currentStep: '',
      },
      setUserProfile: (profile: UserProfile) => set({ userProfile: profile }),
    }),
    {
      name: 'ai-sponsor-user-profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserProfileStore;
