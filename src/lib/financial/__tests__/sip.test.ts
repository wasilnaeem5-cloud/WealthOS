import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSIP } from '../sip';

describe('calculateSIP', () => {
  test('Standard SIP calculation', () => {
    const res = calculateSIP({
      monthlyContribution: 500,
      expectedAnnualReturn: 0.12,
      projectionYears: 10,
      contributionTiming: 'beginning',
    });

    assert.equal(res.totalInvested, 500 * 12 * 10); // 60,000
    assert.ok(res.futureValue > 115000);
    assert.ok(res.estimatedReturns > 55000);
  });

  test('Zero contribution SIP', () => {
    const res = calculateSIP({
      monthlyContribution: 0,
      expectedAnnualReturn: 0.10,
      projectionYears: 5,
    });

    assert.equal(res.futureValue, 0);
    assert.equal(res.totalInvested, 0);
    assert.equal(res.estimatedReturns, 0);
  });

  test('Zero return rate SIP', () => {
    const res = calculateSIP({
      monthlyContribution: 1000,
      expectedAnnualReturn: 0,
      projectionYears: 3,
    });

    assert.equal(res.totalInvested, 36000);
    assert.equal(res.futureValue, 36000);
    assert.equal(res.estimatedReturns, 0);
  });

  test('Timing beginning vs end of month', () => {
    const startRes = calculateSIP({
      monthlyContribution: 1000,
      expectedAnnualReturn: 0.10,
      projectionYears: 5,
      contributionTiming: 'beginning',
    });

    const endRes = calculateSIP({
      monthlyContribution: 1000,
      expectedAnnualReturn: 0.10,
      projectionYears: 5,
      contributionTiming: 'end',
    });

    assert.ok(startRes.futureValue > endRes.futureValue);
  });
});
