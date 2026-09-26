import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateInflationAdjustedValue } from '../inflation';

describe('calculateInflationAdjustedValue', () => {
  test('Inflation adjustment over 10 years at 3%', () => {
    const realVal = calculateInflationAdjustedValue(100000, 0.03, 10);
    assert.ok(realVal < 100000);
    assert.equal(realVal, 74409.39);
  });

  test('Zero inflation rate', () => {
    const realVal = calculateInflationAdjustedValue(100000, 0, 10);
    assert.equal(realVal, 100000);
  });

  test('Zero years', () => {
    const realVal = calculateInflationAdjustedValue(100000, 0.04, 0);
    assert.equal(realVal, 100000);
  });
});
