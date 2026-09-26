import { Scenario } from '../../../types';
import { IScenarioRepository } from '../types';
import { supabaseClient } from '../../supabase/client';

export class SupabaseScenarioRepository implements IScenarioRepository {
  async getScenarios(userId: string): Promise<Scenario[]> {
    const { data, error } = await supabaseClient
      .from('scenarios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load scenarios: ${error.message}`);
    }

    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      name: d.name,
      variablesJson: d.variables_json,
      resultsJson: d.results_json,
      createdAt: d.created_at,
    }));
  }

  async getScenarioById(userId: string, scenarioId: string): Promise<Scenario | null> {
    const { data, error } = await supabaseClient
      .from('scenarios')
      .select('*')
      .eq('user_id', userId)
      .eq('id', scenarioId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load scenario: ${error.message}`);
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      variablesJson: data.variables_json,
      resultsJson: data.results_json,
      createdAt: data.created_at,
    };
  }

  async saveScenario(scenario: Scenario): Promise<Scenario> {
    const { data, error } = await supabaseClient
      .from('scenarios')
      .upsert(
        {
          id: scenario.id,
          user_id: scenario.userId,
          name: scenario.name,
          variables_json: scenario.variablesJson,
          results_json: scenario.resultsJson,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw new Error(`Failed to save scenario: ${error.message}`);

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      variablesJson: data.variables_json,
      resultsJson: data.results_json,
      createdAt: data.created_at,
    };
  }

  async deleteScenario(userId: string, scenarioId: string): Promise<boolean> {
    const { error } = await supabaseClient
      .from('scenarios')
      .delete()
      .eq('user_id', userId)
      .eq('id', scenarioId);

    if (error) {
      throw new Error(`Failed to delete scenario: ${error.message}`);
    }

    return true;
  }
}
