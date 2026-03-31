import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EngagementState {
  // Tied explicitly to a user
  userId: string | null;

  // Chest Gacha System
  chestStreak: number;
  lastChestClaimDate: string | null; // e.g., '2023-10-25'
  hasClaimedToday: boolean;

  // Economy
  streakFreezes: number;

  // Virtual Pet
  petEnergy: number; // 0 to 100
  lastPetUpdateDate: string | null;

  // Actions
  setUserId: (id: string) => void;
  claimChest: () => number; // Returns XP reward
  buyStreakFreeze: () => boolean; // Returns true if successful
  consumeStreakFreeze: () => boolean; // Returns true if consumed
  feedPet: (amount: number) => void;
  processDailyLogin: (todayStr: string, yesterdayStr: string) => void;
}

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      userId: null,

      chestStreak: 0,
      lastChestClaimDate: null,
      hasClaimedToday: false,

      streakFreezes: 0,

      petEnergy: 100, // Starts happy
      lastPetUpdateDate: null,

      setUserId: (id) => set({ userId: id }),

      claimChest: () => {
        const state = get();
        if (state.hasClaimedToday) return 0; // Prevent double claims

        let newStreak = state.chestStreak + 1;
        let xpReward = 0;

        if (newStreak === 7) {
          xpReward = 500; // Jackpot
          newStreak = 0; // Reset after jackpot
        } else {
          // RNG between 50 and 150
          xpReward = Math.floor(Math.random() * 100) + 50;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        set({
          chestStreak: newStreak,
          lastChestClaimDate: todayStr,
          hasClaimedToday: true
        });

        return xpReward;
      },

      buyStreakFreeze: () => {
        set((state) => ({ streakFreezes: state.streakFreezes + 1 }));
        return true;
      },

      consumeStreakFreeze: () => {
        const state = get();
        if (state.streakFreezes > 0) {
          set({ streakFreezes: state.streakFreezes - 1 });
          return true;
        }
        return false;
      },

      feedPet: (amount: number) => {
        set((state) => ({
          petEnergy: Math.min(100, state.petEnergy + amount)
        }));
      },

      processDailyLogin: (todayStr: string, yesterdayStr: string) => {
        const state = get();
        
        let newChestStreak = state.chestStreak;
        let newHasClaimedToday = state.hasClaimedToday;
        let newPetEnergy = state.petEnergy;

        // Process Chest
        if (state.lastChestClaimDate !== todayStr) {
          newHasClaimedToday = false;
        }
        // If they missed yesterday entirely, break the chest streak
        if (state.lastChestClaimDate && state.lastChestClaimDate !== todayStr && state.lastChestClaimDate !== yesterdayStr) {
          newChestStreak = 0;
        }

        // Process Pet Withering
        if (state.lastPetUpdateDate && state.lastPetUpdateDate !== todayStr) {
           // Base decay is 30 per day missed
           // To be perfectly accurate, we could calculate Date diff, but usually missing a day is just a flat 30 drop.
           // If they miss multiple days, it drops significantly.
           const date1 = new Date(state.lastPetUpdateDate);
           const date2 = new Date(todayStr);
           const diffTime = Math.abs(date2.getTime() - date1.getTime());
           const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
           
           if (diffDays > 0) {
               newPetEnergy = Math.max(0, state.petEnergy - (30 * diffDays));
           }
        }

        set({
          chestStreak: newChestStreak,
          hasClaimedToday: newHasClaimedToday,
          petEnergy: newPetEnergy,
          lastPetUpdateDate: todayStr
        });
      }
    }),
    {
      name: 'questlog-engagement-storage',
    }
  )
);
