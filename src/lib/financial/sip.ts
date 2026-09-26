import { ContributionTiming } from '../../types';

export interface SIPCalculationInput {
  monthlyContribution: number;
  expectedAnnualReturn: number;
  projectionYears: number;
  contributionTiming?: ContributionTiming;
}

export interface SIPCalculationResult {
  futureValue: number;
  totalInvested: number;
  estimatedReturns: number;
}

/**
 * Standard SIP Formula implementation.
 * 
 * Formula (Beginning of period / Annuity Due):
 * FV = P * [((1 + r)^n - 1) / r] * (1 + r)
 * 
 * Formula (End of period / Ordinary Annuity):
 * FV = P * [((1 + r)^n - 1) / r]
 * 
 * Where:
 * P = periodic monthly contribution
 * r = monthly interest rate (annualReturn / 12)
 * n = total number of compounding periods (years * 12)
 */
export function calculateSIP(input: SIPCalculationInput): SIPCalculationResult {
  const {
    monthlyContribution = 0,
    expectedAnnualReturn = 0.08,
    projectionYears = 10,
    contributionTiming = 'beginning',
  } = input;

  const safeP = Math.max(0, monthlyContribution);
  const safeYears = Math.max(0, Math.floor(projectionYears));
  const n = safeYears * 12;

  if (safeP === 0 || n === 0) {
    return {
      futureValue: 0,
      totalInvested: 0,
      estimatedReturns: 0,
    };
  }

  const r = expectedAnnualReturn / 12;

  let fv = 0;
  if (r === 0) {
    fv = safeP * n;
  } else {
    const compoundFactor = Math.pow(1 + r, n);
    const baseFormula = safeP * ((compoundFactor - 1) / r);
    fv = contributionTiming === 'beginning' ? baseFormula * (1 + r) : baseFormula;
  }

  const totalInvested = safeP * n;
  const roundedFV = Math.round(fv * 100) / 100;
  const estimatedReturns = Math.max(0, Math.round((roundedFV - totalInvested) * 100) / 100);

  return {
    futureValue: roundedFV,
    totalInvested: Math.round(totalInvested * 100) / 100,
    estimatedReturns,
  };
}
