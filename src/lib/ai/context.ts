import { FinancialProfile, ScenarioCalculationResult, UserProfile } from '../../types';

export interface StructuredAIContext {
  userAge: number;
  currency: string;
  monthlySurplus: number;
  savingsRate: number;
  netWorthCurrent: number;
  projectedNominalFutureValue: number;
  projectedRealFutureValue: number;
  totalInvested: number;
  totalGrowth: number;
  expectedAnnualReturn: number;
  inflationRate: number;
  projectionYears: number;
  disclaimer: string;
}

export function buildMinimalAIContext(
  profile: UserProfile,
  finProfile: FinancialProfile,
  calcResult: ScenarioCalculationResult
): StructuredAIContext {
  return {
    userAge: profile.age,
    currency: profile.currency,
    monthlySurplus: calcResult.monthlySurplus,
    savingsRate: calcResult.savingsRate,
    netWorthCurrent: calcResult.netWorthCurrent,
    projectedNominalFutureValue: calcResult.projectedNominalFutureValue,
    projectedRealFutureValue: calcResult.projectedRealFutureValue,
    totalInvested: calcResult.totalInvested,
    totalGrowth: calcResult.totalInterestEarned,
    expectedAnnualReturn: finProfile.assumptions.expectedAnnualReturn,
    inflationRate: finProfile.assumptions.inflationRate,
    projectionYears: finProfile.assumptions.projectionYears,
    disclaimer: 'Projection values are deterministic estimates based on user assumptions, not guaranteed investment returns.',
  };
}
