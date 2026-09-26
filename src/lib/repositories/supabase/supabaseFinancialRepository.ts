import { FinancialProfile } from '../../../types';
import { IFinancialRepository } from '../types';
import { supabaseClient } from '../../supabase/client';

export class SupabaseFinancialRepository implements IFinancialRepository {
  async getFinancialProfile(userId: string): Promise<FinancialProfile | null> {
    const { data, error } = await supabaseClient
      .from('financial_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load financial profile: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      income: Number(data.income),
      expenses: Number(data.expenses),
      savings: Number(data.savings),
      investments: Number(data.investments),
      debt: Number(data.debt),
      monthlyContribution: Number(data.monthly_contribution),
      assumptions: data.assumptions_json,
      updatedAt: data.updated_at,
    };
  }

  async saveFinancialProfile(profile: FinancialProfile): Promise<FinancialProfile> {
    // Do NOT include `id` when upserting on user_id conflict.
    // Sending id=undefined for new records creates an ambiguous INSERT
    // that bypasses the ON CONFLICT path and fails RLS checks.
    const payload: Record<string, unknown> = {
      user_id: profile.userId,
      income: profile.income,
      expenses: profile.expenses,
      savings: profile.savings,
      investments: profile.investments,
      debt: profile.debt,
      monthly_contribution: profile.monthlyContribution,
      assumptions_json: profile.assumptions,
      updated_at: new Date().toISOString(),
    };
    // Only include id when we already have one (UPDATE path)
    if (profile.id) {
      payload.id = profile.id;
    }

    const { data, error } = await supabaseClient
      .from('financial_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new Error(`Failed to save financial profile: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      income: Number(data.income),
      expenses: Number(data.expenses),
      savings: Number(data.savings),
      investments: Number(data.investments),
      debt: Number(data.debt),
      monthlyContribution: Number(data.monthly_contribution),
      assumptions: data.assumptions_json,
      updatedAt: data.updated_at,
    };
  }
}
