import { DataMode } from '../../types';
import {
  IProfileRepository,
  IFinancialRepository,
  IGoalRepository,
  IScenarioRepository,
  IAIRepository,
} from './types';
import { LocalProfileRepository } from './local/localProfileRepository';
import { LocalFinancialRepository } from './local/localFinancialRepository';
import { LocalGoalRepository } from './local/localGoalRepository';
import { LocalScenarioRepository } from './local/localScenarioRepository';
import { LocalAIRepository } from './local/localAIRepository';

import { SupabaseProfileRepository } from './supabase/supabaseProfileRepository';
import { SupabaseFinancialRepository } from './supabase/supabaseFinancialRepository';
import { SupabaseGoalRepository } from './supabase/supabaseGoalRepository';
import { SupabaseScenarioRepository } from './supabase/supabaseScenarioRepository';
import { SupabaseAIRepository } from './supabase/supabaseAIRepository';

export function getDataMode(): DataMode {
  const envMode = process.env.NEXT_PUBLIC_DATA_MODE;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (envMode === 'supabase' && supabaseUrl) {
    return 'supabase';
  }
  return 'local';
}

export class RepositoryFactory {
  private static getMode(): DataMode {
    return getDataMode();
  }

  static getProfileRepository(): IProfileRepository {
    return this.getMode() === 'supabase'
      ? new SupabaseProfileRepository()
      : new LocalProfileRepository();
  }

  static getFinancialRepository(): IFinancialRepository {
    return this.getMode() === 'supabase'
      ? new SupabaseFinancialRepository()
      : new LocalFinancialRepository();
  }

  static getGoalRepository(): IGoalRepository {
    return this.getMode() === 'supabase'
      ? new SupabaseGoalRepository()
      : new LocalGoalRepository();
  }

  static getScenarioRepository(): IScenarioRepository {
    return this.getMode() === 'supabase'
      ? new SupabaseScenarioRepository()
      : new LocalScenarioRepository();
  }

  static getAIRepository(): IAIRepository {
    return this.getMode() === 'supabase'
      ? new SupabaseAIRepository()
      : new LocalAIRepository();
  }
}
