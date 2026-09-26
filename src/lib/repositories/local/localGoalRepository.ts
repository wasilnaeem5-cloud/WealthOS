import { Goal } from '../../../types';
import { IGoalRepository } from '../types';
import { initialDemoGoals } from './initialData';

const STORAGE_KEY = 'wealthos_goals';

export class LocalGoalRepository implements IGoalRepository {
  async getGoals(userId: string): Promise<Goal[]> {
    if (typeof window === 'undefined') return initialDemoGoals;
    try {
      const item = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (!item) {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(initialDemoGoals));
        return initialDemoGoals;
      }
      return JSON.parse(item);
    } catch {
      return initialDemoGoals;
    }
  }

  async getGoalById(userId: string, goalId: string): Promise<Goal | null> {
    const goals = await this.getGoals(userId);
    return goals.find(g => g.id === goalId) || null;
  }

  async saveGoal(goal: Goal): Promise<Goal> {
    const goals = await this.getGoals(goal.userId);
    const existingIndex = goals.findIndex(g => g.id === goal.id);

    let updatedGoal: Goal;
    if (existingIndex >= 0) {
      updatedGoal = { ...goal, updatedAt: new Date().toISOString() };
      goals[existingIndex] = updatedGoal;
    } else {
      updatedGoal = {
        ...goal,
        id: goal.id || `goal-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      goals.push(updatedGoal);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${goal.userId}`, JSON.stringify(goals));
    }
    return updatedGoal;
  }

  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const goals = await this.getGoals(userId);
    const filtered = goals.filter(g => g.id !== goalId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(filtered));
    }
    return true;
  }
}
