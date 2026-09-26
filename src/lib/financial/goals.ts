export interface GoalRequiredContributionInput {
  targetAmount: number;
  currentAmount: number;
  monthsRemaining: number;
  expectedAnnualReturn: number;
}

export interface GoalRequirementResult {
  requiredMonthlyContribution: number;
  projectedAmountWithCurrentContribution: number;
  gapAmount: number;
  isTargetAchievable: boolean;
}

/**
 * Calculates the required monthly contribution to reach a financial target goal by deadline.
 * 
 * Rearranged Annuity Due formula:
 * P = (Target - Current * (1+r)^n) / [ (((1+r)^n - 1)/r) * (1+r) ]
 */
export function calculateGoalRequiredContribution(
  input: GoalRequiredContributionInput
): GoalRequirementResult {
  const {
    targetAmount = 0,
    currentAmount = 0,
    monthsRemaining = 12,
    expectedAnnualReturn = 0.08,
  } = input;

  const safeTarget = Math.max(0, targetAmount);
  const safeCurrent = Math.max(0, currentAmount);
  const safeMonths = Math.max(1, Math.floor(monthsRemaining));
  const r = expectedAnnualReturn / 12;

  // Future value of existing saved amount
  const futureValueOfCurrent = r === 0
    ? safeCurrent
    : safeCurrent * Math.pow(1 + r, safeMonths);

  const remainingNeeded = Math.max(0, safeTarget - futureValueOfCurrent);

  if (remainingNeeded <= 0) {
    return {
      requiredMonthlyContribution: 0,
      projectedAmountWithCurrentContribution: Math.round(futureValueOfCurrent * 100) / 100,
      gapAmount: 0,
      isTargetAchievable: true,
    };
  }

  let requiredMonthly = 0;
  if (r === 0) {
    requiredMonthly = remainingNeeded / safeMonths;
  } else {
    const compoundFactor = Math.pow(1 + r, safeMonths);
    const annuityFactor = ((compoundFactor - 1) / r) * (1 + r);
    requiredMonthly = remainingNeeded / annuityFactor;
  }

  const roundedRequired = Math.round(requiredMonthly * 100) / 100;
  const gapAmount = Math.round((safeTarget - safeCurrent) * 100) / 100;

  return {
    requiredMonthlyContribution: roundedRequired,
    projectedAmountWithCurrentContribution: Math.round(futureValueOfCurrent * 100) / 100,
    gapAmount,
    isTargetAchievable: roundedRequired > 0,
  };
}
