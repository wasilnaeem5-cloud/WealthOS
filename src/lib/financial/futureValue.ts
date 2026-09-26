import { ContributionTiming, YearlyBreakdownItem } from '../../types';

export interface FutureValueInput {
  initialAmount: number;
  monthlyContribution: number;
  expectedAnnualReturn: number;
  annualContributionIncrease: number;
  projectionYears: number;
  inflationRate: number;
  contributionTiming?: ContributionTiming; // default 'beginning'
  userCurrentAge?: number;
}

export interface FutureValueResult {
  nominalFutureValue: number;
  realFutureValue: number;
  totalInvested: number;
  totalGrowth: number;
  yearlyBreakdown: YearlyBreakdownItem[];
}

/**
 * Calculates compound interest and periodic SIP contributions deterministically.
 * 
 * Timing Conventions:
 * - 'beginning' (Annuity Due): Monthly contributions are made at the start of each monthly period,
 *   so each monthly deposit compounds for that month.
 * - 'end' (Ordinary Annuity): Monthly contributions are made at the end of each monthly period.
 * 
 * Step-up Convention:
 * - `annualContributionIncrease` increases the monthly contribution by the specified step-up percentage
 *   at the beginning of each new 12-month cycle (Year 2, Year 3, etc.).
 */
export function calculateFutureValue(input: FutureValueInput): FutureValueResult {
  const {
    initialAmount = 0,
    monthlyContribution = 0,
    expectedAnnualReturn = 0.08,
    annualContributionIncrease = 0,
    projectionYears = 10,
    inflationRate = 0.03,
    contributionTiming = 'beginning',
    userCurrentAge = 25,
  } = input;

  // Handle negative or zero year edge cases safely
  const safeYears = Math.max(1, Math.min(60, Math.floor(projectionYears)));
  const monthlyRate = expectedAnnualReturn / 12;

  let currentBalance = Math.max(0, initialAmount);
  let cumulativeContributions = Math.max(0, initialAmount);
  let currentMonthlyContribution = Math.max(0, monthlyContribution);

  const yearlyBreakdown: YearlyBreakdownItem[] = [];

  for (let year = 1; year <= safeYears; year++) {
    // Increase monthly contribution annually after Year 1 if step-up > 0
    if (year > 1 && annualContributionIncrease > 0) {
      currentMonthlyContribution *= (1 + annualContributionIncrease);
    }

    for (let month = 1; month <= 12; month++) {
      if (contributionTiming === 'beginning') {
        // Deposit at start of month
        currentBalance += currentMonthlyContribution;
        cumulativeContributions += currentMonthlyContribution;
        currentBalance *= (1 + monthlyRate);
      } else {
        // Deposit at end of month: interest accrues first, then contribution added
        currentBalance *= (1 + monthlyRate);
        currentBalance += currentMonthlyContribution;
        cumulativeContributions += currentMonthlyContribution;
      }
    }

    const nominalValue = Math.round(currentBalance * 100) / 100;
    // Inflation discount factor: (1 + inflationRate)^year
    const inflationFactor = Math.pow(1 + Math.max(0, inflationRate), year);
    const realValue = Math.round((nominalValue / inflationFactor) * 100) / 100;
    const roundedContributions = Math.round(cumulativeContributions * 100) / 100;
    const totalGrowth = Math.max(0, Math.round((nominalValue - roundedContributions) * 100) / 100);

    yearlyBreakdown.push({
      year,
      age: userCurrentAge + year,
      nominalValue,
      realValue,
      totalContributions: roundedContributions,
      totalGrowth,
    });
  }

  const finalNominal = yearlyBreakdown[yearlyBreakdown.length - 1]?.nominalValue || 0;
  const finalReal = yearlyBreakdown[yearlyBreakdown.length - 1]?.realValue || 0;
  const finalContributions = yearlyBreakdown[yearlyBreakdown.length - 1]?.totalContributions || 0;
  const finalGrowth = Math.max(0, Math.round((finalNominal - finalContributions) * 100) / 100);

  return {
    nominalFutureValue: finalNominal,
    realFutureValue: finalReal,
    totalInvested: finalContributions,
    totalGrowth: finalGrowth,
    yearlyBreakdown,
  };
}
