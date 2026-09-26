import { UserProfile } from '../../types';
import { RepositoryFactory } from '../repositories/factory';
import { userProfileSchema, UserProfileInput } from '../validation/profile';
import { generateId } from '../utils/id';

export class ProfileService {
  private repo = RepositoryFactory.getProfileRepository();

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.repo.getProfile(userId);
  }

  async updateProfile(userId: string, input: UserProfileInput): Promise<UserProfile> {
    const validated = userProfileSchema.parse(input);
    const existing = await this.repo.getProfile(userId);

    const profile: UserProfile = {
      id: existing?.id || generateId(),
      userId,
      name: validated.name,
      age: validated.age,
      currency: validated.currency,
      onboardingCompleted: validated.onboardingCompleted ?? existing?.onboardingCompleted ?? false,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.repo.saveProfile(profile);
  }

  async markOnboardingCompleted(userId: string): Promise<UserProfile> {
    const existing = await this.repo.getProfile(userId);
    const profile: UserProfile = {
      id: existing?.id || generateId(),
      userId,
      name: existing?.name || 'User',
      age: existing?.age || 26,
      currency: existing?.currency || 'USD',
      onboardingCompleted: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.repo.saveProfile(profile);
  }
}

