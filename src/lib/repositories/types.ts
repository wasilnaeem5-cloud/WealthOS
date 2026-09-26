import { UserProfile, FinancialProfile, Goal, Scenario, AIChatMessage, AIConversation } from '../../types';

export interface IProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
}

export interface IFinancialRepository {
  getFinancialProfile(userId: string): Promise<FinancialProfile | null>;
  saveFinancialProfile(profile: FinancialProfile): Promise<FinancialProfile>;
}

export interface IGoalRepository {
  getGoals(userId: string): Promise<Goal[]>;
  getGoalById(userId: string, goalId: string): Promise<Goal | null>;
  saveGoal(goal: Goal): Promise<Goal>;
  deleteGoal(userId: string, goalId: string): Promise<boolean>;
}

export interface IScenarioRepository {
  getScenarios(userId: string): Promise<Scenario[]>;
  getScenarioById(userId: string, scenarioId: string): Promise<Scenario | null>;
  saveScenario(scenario: Scenario): Promise<Scenario>;
  deleteScenario(userId: string, scenarioId: string): Promise<boolean>;
}

export interface IAIRepository {
  getConversations(userId: string): Promise<AIConversation[]>;
  getMessages(conversationId: string): Promise<AIChatMessage[]>;
  saveMessage(message: AIChatMessage): Promise<AIChatMessage>;
  createConversation(userId: string, title: string): Promise<AIConversation>;
}
