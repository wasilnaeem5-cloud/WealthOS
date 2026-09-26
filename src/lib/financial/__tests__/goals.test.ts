import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateGoalRequiredContribution } from '../goals';

describe('calculateGoalRequiredContribution', () => {
  test('10. Goal required contribution normal scenario', () => {
    const res = calculateGoalRequiredContribution({
      targetAmount: 100000,
      currentAmount: 10000,
      monthsRemaining: 60,
      expectedAnnualReturn: 0.08,
    });

    assert.ok(res.requiredMonthlyContribution > 0);
    assert.ok(res.requiredMonthlyContribution < 2000);
    assert.equal(res.gapAmount, 90000);
    assert.equal(res.isTargetAchievable, true);
  });

  test('Goal already achieved with current balance', () => {
    const res = calculateGoalRequiredContribution({
      targetAmount: 50000,
      currentAmount: 50000,
      monthsRemaining: 24,
      expectedAnnualReturn: 0.06,
    });

    assert.equal(res.requiredMonthlyContribution, 0);
    assert.equal(res.gapAmount, 0);
    assert.equal(res.isTargetAchievable, true);
  });

  test('Goal requirement with zero return rate', () => {
    const res = calculateGoalRequiredContribution({
      targetAmount: 12000,
      currentAmount: 0,
      monthsRemaining: 12,
      expectedAnnualReturn: 0,
    });

    assert.equal(res.requiredMonthlyContribution, 1000);
  });
});
