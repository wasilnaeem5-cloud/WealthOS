import { FinancialProfile } from '../../../types';
import { IFinancialRepository } from '../types';
import { initialDemoFinancialProfile } from './initialData';

const STORAGE_KEY = 'wealthos_financial';

export class LocalFinancialRepository implements IFinancialRepository {
  async getFinancialProfile(userId: string): Promise<FinancialProfile | null> {
    if (typeof window === 'undefined') return initialDemoFinancialProfile;
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (!item) {
        await this.saveFinancialProfile(initialDemoFinancialProfile);
        return initialDemoFinancialProfile;
      }
      return JSON.parse(item);
    } catch {
      return initialDemoFinancialProfile;
    }
  }

  async saveFinancialProfile(profile: FinancialProfile): Promise<FinancialProfile> {
    const updated = { ...profile, updatedAt: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${profile.userId}`, JSON.stringify(updated));
    }
    return updated;
  }
}
