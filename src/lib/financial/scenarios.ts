import { FutureValueResult } from './futureValue';

export interface ScenarioDifferenceResult {
  nominalDifference: number; // alternate - baseline
  realDifference: number;
  percentageChange: number; // ((alternate / baseline) - 1) * 100
  totalInvestedDifference: number;
  totalGrowthDifference: number;
  isAlternateSuperior: boolean;
}

/**
 * Compares two deterministic simulation calculation results (Baseline vs Alternate scenario).
 */
export function calculateScenarioDifference(
  baseline: FutureValueResult,
  alternate: FutureValueResult
): ScenarioDifferenceResult {
  const nominalDiff = Math.round((alternate.nominalFutureValue - baseline.nominalFutureValue) * 100) / 100;
  const realDiff = Math.round((alternate.realFutureValue - baseline.realFutureValue) * 100) / 100;
  const investedDiff = Math.round((alternate.totalInvested - baseline.totalInvested) * 100) / 100;
  const growthDiff = Math.round((alternate.totalGrowth - baseline.totalGrowth) * 100) / 100;

  let pctChange = 0;
  if (baseline.nominalFutureValue > 0) {
    pctChange = Math.round(((alternate.nominalFutureValue / baseline.nominalFutureValue) - 1) * 10000) / 100;
  }

  return {
    nominalDifference: nominalDiff,
    realDifference: realDiff,
    percentageChange: pctChange,
    totalInvestedDifference: investedDiff,
    totalGrowthDifference: growthDiff,
    isAlternateSuperior: nominalDiff > 0,
  };
}
