import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateNetWorth, calculateMonthlySurplus, calculateSavingsRate } from '../netWorth';

describe('netWorth, surplus, and savingsRate', () => {
  test('11. Net worth calculation', () => {
    const nw = calculateNetWorth({
      savings: 15000,
      investments: 45000,
      debt: 10000,
    });

    assert.equal(nw, 50000);
  });

  test('Net worth with zero debt', () => {
    const nw = calculateNetWorth({
      savings: 5000,
      investments: 20000,
      debt: 0,
    });

    assert.equal(nw, 25000);
  });

  test('Monthly surplus calculation', () => {
    const surplus = calculateMonthlySurplus(5000, 3200);
    assert.equal(surplus, 1800);
  });

  test('12. Savings rate calculation', () => {
    const rate = calculateSavingsRate(1500, 5000);
    assert.equal(rate, 30);
  });

  test('Savings rate with zero income', () => {
    const rate = calculateSavingsRate(500, 0);
    assert.equal(rate, 0);
  });
});
