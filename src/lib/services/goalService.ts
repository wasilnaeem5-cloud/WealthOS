import { Goal } from '../../types';
import { RepositoryFactory } from '../repositories/factory';
import { goalSchema, GoalInput } from '../validation/goals';
import { calculateGoalRequiredContribution, GoalRequirementResult } from '../financial/goals';
import { generateId } from '../utils/id';

export class GoalService {
  private repo = RepositoryFactory.getGoalRepository();

  async getUserGoals(userId: string): Promise<Goal[]> {
    return this.repo.getGoals(userId);
  }

  async saveGoal(userId: string, input: GoalInput, existingId?: string): Promise<Goal> {
    const validated = goalSchema.parse(input);

    const goal: Goal = {
      id: existingId || generateId(),
      userId,
      name: validated.name,
      targetAmount: validated.targetAmount,
      currentAmount: validated.currentAmount,
      targetDate: validated.targetDate,
      contributionAmount: validated.contributionAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.repo.saveGoal(goal);
  }

  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    return this.repo.deleteGoal(userId, goalId);
  }

  calculateGoalRequirement(goal: Goal, expectedAnnualReturn: number = 0.08): GoalRequirementResult {
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const diffMonths = Math.max(1, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()));

    return calculateGoalRequiredContribution({
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      monthsRemaining: diffMonths,
      expectedAnnualReturn,
    });
  }
}
