import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFutureValue } from '../futureValue';

describe('calculateFutureValue', () => {
  test('1. Normal contribution values', () => {
    const res = calculateFutureValue({
      initialAmount: 10000,
      monthlyContribution: 500,
      expectedAnnualReturn: 0.08,
      annualContributionIncrease: 0,
      projectionYears: 10,
      inflationRate: 0.03,
      contributionTiming: 'beginning',
    });

    assert.ok(res.nominalFutureValue > 100000);
    assert.equal(res.yearlyBreakdown.length, 10);
    assert.equal(res.totalInvested, 10000 + 500 * 12 * 10);
  });

  test('2. Zero contribution', () => {
    const res = calculateFutureValue({
      initialAmount: 10000,
      monthlyContribution: 0,
      expectedAnnualReturn: 0.08,
      annualContributionIncrease: 0,
      projectionYears: 5,
      inflationRate: 0.03,
    });

    assert.ok(res.nominalFutureValue > 10000);
    assert.equal(res.totalInvested, 10000);
  });

  test('3. Zero return', () => {
    const res = calculateFutureValue({
      initialAmount: 5000,
      monthlyContribution: 200,
      expectedAnnualReturn: 0.0,
      annualContributionIncrease: 0,
      projectionYears: 2,
      inflationRate: 0.0,
    });

    assert.equal(res.totalInvested, 5000 + 200 * 24);
    assert.equal(res.nominalFutureValue, 5000 + 200 * 24);
    assert.equal(res.totalGrowth, 0);
  });

  test('4. Very small return (0.1%)', () => {
    const res = calculateFutureValue({
      initialAmount: 1000,
      monthlyContribution: 100,
      expectedAnnualReturn: 0.001,
      annualContributionIncrease: 0,
      projectionYears: 1,
      inflationRate: 0,
    });

    assert.ok(res.nominalFutureValue > 2200);
  });

  test('5. High return assumptions (25%)', () => {
    const res = calculateFutureValue({
      initialAmount: 1000,
      monthlyContribution: 500,
      expectedAnnualReturn: 0.25,
      annualContributionIncrease: 0,
      projectionYears: 10,
      inflationRate: 0.03,
    });

    assert.ok(res.totalGrowth > res.totalInvested);
  });

  test('6. Short projection period (1 year)', () => {
    const res = calculateFutureValue({
      initialAmount: 0,
      monthlyContribution: 1000,
      expectedAnnualReturn: 0.10,
      annualContributionIncrease: 0,
      projectionYears: 1,
      inflationRate: 0.02,
    });

    assert.equal(res.yearlyBreakdown.length, 1);
    assert.equal(res.totalInvested, 12000);
  });

  test('7. Long projection period (40 years)', () => {
    const res = calculateFutureValue({
      initialAmount: 5000,
      monthlyContribution: 300,
      expectedAnnualReturn: 0.08,
      annualContributionIncrease: 0,
      projectionYears: 40,
      inflationRate: 0.03,
    });

    assert.equal(res.yearlyBreakdown.length, 40);
    assert.ok(res.nominalFutureValue > 1000000);
  });

  test('8. Annual contribution step-ups (5%)', () => {
    const resWithoutStepUp = calculateFutureValue({
      initialAmount: 0,
      monthlyContribution: 500,
      expectedAnnualReturn: 0.08,
      annualContributionIncrease: 0,
      projectionYears: 5,
      inflationRate: 0,
    });

    const resWithStepUp = calculateFutureValue({
      initialAmount: 0,
      monthlyContribution: 500,
      expectedAnnualReturn: 0.08,
      annualContributionIncrease: 0.05,
      projectionYears: 5,
      inflationRate: 0,
    });

    assert.ok(resWithStepUp.totalInvested > resWithoutStepUp.totalInvested);
    assert.ok(resWithStepUp.nominalFutureValue > resWithoutStepUp.nominalFutureValue);
  });

  test('9. Inflation adjustment', () => {
    const res = calculateFutureValue({
      initialAmount: 10000,
      monthlyContribution: 500,
      expectedAnnualReturn: 0.08,
      annualContributionIncrease: 0,
      projectionYears: 10,
      inflationRate: 0.04,
    });

    assert.ok(res.realFutureValue < res.nominalFutureValue);
  });

  test('14. Invalid/negative inputs handling', () => {
    const res = calculateFutureValue({
      initialAmount: -5000,
      monthlyContribution: -200,
      expectedAnnualReturn: -0.10,
      annualContributionIncrease: -0.05,
      projectionYears: -5,
      inflationRate: -0.02,
    });

    assert.ok(res.nominalFutureValue >= 0);
    assert.equal(res.yearlyBreakdown.length, 1);
  });

  test('16. Contribution timing convention (beginning vs end)', () => {
    const beginningRes = calculateFutureValue({
      initialAmount: 0,
      monthlyContribution: 1000,
      expectedAnnualReturn: 0.12,
      annualContributionIncrease: 0,
      projectionYears: 1,
      inflationRate: 0,
      contributionTiming: 'beginning',
    });

    const endRes = calculateFutureValue({
      initialAmount: 0,
      monthlyContribution: 1000,
      expectedAnnualReturn: 0.12,
      annualContributionIncrease: 0,
      projectionYears: 1,
      inflationRate: 0,
      contributionTiming: 'end',
    });

    assert.ok(beginningRes.nominalFutureValue > endRes.nominalFutureValue);
  });
});
