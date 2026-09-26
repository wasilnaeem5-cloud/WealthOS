export interface NetWorthInput {
  savings: number;
  investments: number;
  debt: number;
}

/**
 * Calculates current total net worth.
 * Net Worth = Liquid Savings + Portfolio Investments - Outstanding Debt
 */
export function calculateNetWorth(input: NetWorthInput): number {
  const { savings = 0, investments = 0, debt = 0 } = input;
  const netWorth = (Math.max(0, savings) + Math.max(0, investments)) - Math.max(0, debt);
  return Math.round(netWorth * 100) / 100;
}

/**
 * Calculates monthly disposable surplus.
 * Monthly Surplus = Income - Expenses
 */
export function calculateMonthlySurplus(income: number, expenses: number): number {
  const surplus = Math.max(0, income) - Math.max(0, expenses);
  return Math.round(surplus * 100) / 100;
}

/**
 * Calculates monthly savings/investment rate as a percentage of income.
 * Savings Rate = (Monthly Contribution / Monthly Income) * 100
 */
export function calculateSavingsRate(monthlyContribution: number, income: number): number {
  const safeIncome = Math.max(0, income);
  if (safeIncome === 0) return 0;
  const rate = (Math.max(0, monthlyContribution) / safeIncome) * 100;
  return Math.min(100, Math.round(rate * 100) / 100);
}
