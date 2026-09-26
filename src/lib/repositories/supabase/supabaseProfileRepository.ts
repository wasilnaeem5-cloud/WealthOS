import { UserProfile } from '../../../types';
import { IProfileRepository } from '../types';
import { supabaseClient } from '../../supabase/client';

export class SupabaseProfileRepository implements IProfileRepository {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load profile: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      age: data.age,
      currency: data.currency,
      // Column may not exist yet if migration hasn't run — default safely to false
      onboardingCompleted: data.onboarding_completed != null ? !!data.onboarding_completed : false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    // Stage 1: upsert the core fields that are guaranteed to exist in the schema.
    const corePayload: Record<string, unknown> = {
      user_id: profile.userId,
      name: profile.name,
      age: profile.age,
      currency: profile.currency,
      updated_at: new Date().toISOString(),
    };
    if (profile.id) {
      corePayload.id = profile.id;
    }

    const { data: coreData, error: coreError } = await supabaseClient
      .from('profiles')
      .upsert(corePayload, { onConflict: 'user_id' })
      .select()
      .single();

    if (coreError) {
      throw new Error(`Failed to save profile: ${coreError.message}`);
    }

    // Stage 2: try to update onboarding_completed separately.
    // This column may not exist if the migration hasn't been applied yet.
    // We attempt it and surface a clear actionable message if it fails.
    if (profile.onboardingCompleted !== undefined) {
      const { error: flagError } = await supabaseClient
        .from('profiles')
        .update({ onboarding_completed: profile.onboardingCompleted })
        .eq('user_id', profile.userId);

      if (flagError) {
        if (flagError.message.includes('onboarding_completed') || flagError.code === 'PGRST204') {
          // Column missing — migration not yet applied. Log clearly and continue.
          console.error(
            '[WealthOS] MIGRATION REQUIRED: The "onboarding_completed" column is missing from ' +
            'public.profiles. Run src/lib/supabase/migration_add_onboarding.sql in the ' +
            'Supabase SQL Editor to fix this. Onboarding state will not persist until then.'
          );
        } else {
          throw new Error(`Failed to update onboarding status: ${flagError.message}`);
        }
      }
    }

    return {
      id: coreData.id,
      userId: coreData.user_id,
      name: coreData.name,
      age: coreData.age,
      currency: coreData.currency,
      onboardingCompleted: coreData.onboarding_completed != null
        ? !!coreData.onboarding_completed
        : profile.onboardingCompleted ?? false,
      createdAt: coreData.created_at,
      updatedAt: coreData.updated_at,
    };
  }
}
