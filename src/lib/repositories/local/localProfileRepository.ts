import { UserProfile } from '../../../types';
import { IProfileRepository } from '../types';
import { initialDemoProfile } from './initialData';

const STORAGE_KEY = 'wealthos_profile';

export class LocalProfileRepository implements IProfileRepository {
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return initialDemoProfile;
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (!item) {
        this.saveProfile(initialDemoProfile);
        return initialDemoProfile;
      }
      return JSON.parse(item);
    } catch {
      return initialDemoProfile;
    }
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${profile.userId}`, JSON.stringify(updated));
    }
    return updated;
  }
}
