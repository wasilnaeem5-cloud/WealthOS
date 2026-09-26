import { Goal } from '../../../types';
import { IGoalRepository } from '../types';
import { supabaseClient } from '../../supabase/client';

export class SupabaseGoalRepository implements IGoalRepository {
  async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load goals: ${error.message}`);
    }

    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      name: d.name,
      targetAmount: Number(d.target_amount),
      currentAmount: Number(d.current_amount),
      targetDate: d.target_date,
      contributionAmount: Number(d.contribution_amount),
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async getGoalById(userId: string, goalId: string): Promise<Goal | null> {
    const { data, error } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('id', goalId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load goal: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date,
      contributionAmount: Number(data.contribution_amount),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveGoal(goal: Goal): Promise<Goal> {
    const { data, error } = await supabaseClient
      .from('goals')
      .upsert(
        {
          id: goal.id,
          user_id: goal.userId,
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          target_date: goal.targetDate,
          contribution_amount: goal.contributionAmount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save goal: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: Number(data.current_amount),
      targetDate: data.target_date,
      contributionAmount: Number(data.contribution_amount),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const { error } = await supabaseClient
      .from('goals')
      .delete()
      .eq('user_id', userId)
      .eq('id', goalId);

    if (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }

    return true;
  }
}
