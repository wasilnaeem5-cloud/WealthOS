/**
 * Adjusts a nominal future monetary amount for inflation.
 * Real Value = Nominal Value / (1 + inflationRate)^years
 */
export function calculateInflationAdjustedValue(
  nominalValue: number,
  inflationRate: number,
  years: number
): number {
  const safeNominal = Math.max(0, nominalValue);
  const safeRate = Math.max(0, inflationRate);
  const safeYears = Math.max(0, years);

  if (safeYears === 0 || safeRate === 0) {
    return Math.round(safeNominal * 100) / 100;
  }

  const inflationFactor = Math.pow(1 + safeRate, safeYears);
  const realValue = safeNominal / inflationFactor;

  return Math.round(realValue * 100) / 100;
}
