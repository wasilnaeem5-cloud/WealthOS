import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFutureValue } from '../futureValue';
import { calculateScenarioDifference } from '../scenarios';

describe('calculateScenarioDifference', () => {
  test('13. Scenario differences baseline vs alternate', () => {
    const baseline = calculateFutureValue({
      initialAmount: 5000,
      monthlyContribution: 500,
      expectedAnnualReturn: 0.06,
      annualContributionIncrease: 0,
      projectionYears: 10,
      inflationRate: 0.02,
    });

    const alternate = calculateFutureValue({
      initialAmount: 5000,
      monthlyContribution: 800,
      expectedAnnualReturn: 0.09,
      annualContributionIncrease: 0.03,
      projectionYears: 10,
      inflationRate: 0.02,
    });

    const diff = calculateScenarioDifference(baseline, alternate);

    assert.ok(diff.nominalDifference > 0);
    assert.ok(diff.percentageChange > 0);
    assert.equal(diff.isAlternateSuperior, true);
  });
});
