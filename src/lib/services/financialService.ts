import { FinancialProfile, ScenarioCalculationResult } from '../../types';
import { RepositoryFactory } from '../repositories/factory';
import { financialProfileSchema, FinancialProfileInput } from '../validation/financial';
import { calculateFutureValue } from '../financial/futureValue';
import { generateId } from '../utils/id';
import { calculateNetWorth, calculateMonthlySurplus, calculateSavingsRate } from '../financial/netWorth';

export class FinancialService {
  private repo = RepositoryFactory.getFinancialRepository();

  async getFinancialProfile(userId: string): Promise<FinancialProfile | null> {
    return this.repo.getFinancialProfile(userId);
  }

  async updateFinancialProfile(userId: string, input: FinancialProfileInput): Promise<FinancialProfile> {
    const validated = financialProfileSchema.parse(input);
    const existing = await this.repo.getFinancialProfile(userId);

    const profile: FinancialProfile = {
      id: existing?.id || generateId(),
      userId,
      income: validated.income,
      expenses: validated.expenses,
      savings: validated.savings,
      investments: validated.investments,
      debt: validated.debt,
      monthlyContribution: validated.monthlyContribution,
      assumptions: validated.assumptions,
      updatedAt: new Date().toISOString(),
    };

    return this.repo.saveFinancialProfile(profile);
  }

  /**
   * Runs the deterministic pure financial engine for a user profile.
   */
  calculateProjection(profile: FinancialProfile, userAge: number = 26): ScenarioCalculationResult {
    const { income, expenses, savings, investments, debt, monthlyContribution, assumptions } = profile;

    const netWorthCurrent = calculateNetWorth({ savings, investments, debt });
    const monthlySurplus = calculateMonthlySurplus(income, expenses);
    const savingsRate = calculateSavingsRate(monthlyContribution, income);

    const fvResult = calculateFutureValue({
      initialAmount: savings + investments,
      monthlyContribution,
      expectedAnnualReturn: assumptions.expectedAnnualReturn,
      annualContributionIncrease: assumptions.annualContributionIncrease,
      projectionYears: assumptions.projectionYears,
      inflationRate: assumptions.inflationRate,
      contributionTiming: assumptions.contributionTiming,
      userCurrentAge: userAge,
    });

    return {
      monthlySurplus,
      savingsRate,
      netWorthCurrent,
      projectedNominalFutureValue: fvResult.nominalFutureValue,
      projectedRealFutureValue: fvResult.realFutureValue,
      totalInvested: fvResult.totalInvested,
      totalInterestEarned: fvResult.totalGrowth,
      yearlyBreakdown: fvResult.yearlyBreakdown,
      timestamp: new Date().toISOString(),
    };
  }
}
