export type ContributionFrequency = 'monthly' | 'annually';
export type ContributionTiming = 'beginning' | 'end';

export interface FinancialAssumptions {
  expectedAnnualReturn: number; // e.g. 0.08 for 8%
  inflationRate: number; // e.g. 0.03 for 3%
  contributionFrequency: ContributionFrequency;
  contributionTiming: ContributionTiming;
  annualContributionIncrease: number; // e.g. 0.05 for 5% step-up
  projectionYears: number; // e.g. 10, 20, 30
  currency: string; // e.g. 'USD', 'EUR', 'INR', 'GBP'
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  currency: string;
  onboardingCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialProfile {
  id: string;
  userId: string;
  income: number; // monthly
  expenses: number; // monthly
  savings: number; // liquid savings balance
  investments: number; // existing portfolio value
  debt: number; // total outstanding debt
  monthlyContribution: number; // target monthly investment
  assumptions: FinancialAssumptions;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  contributionAmount: number; // allocated monthly contribution
  createdAt: string;
  updatedAt: string;
}

export interface YearlyBreakdownItem {
  year: number;
  age: number;
  nominalValue: number;
  realValue: number;
  totalContributions: number;
  totalGrowth: number;
}

export interface ScenarioCalculationResult {
  monthlySurplus: number;
  savingsRate: number;
  netWorthCurrent: number;
  projectedNominalFutureValue: number;
  projectedRealFutureValue: number;
  totalInvested: number;
  totalInterestEarned: number;
  yearlyBreakdown: YearlyBreakdownItem[];
  timestamp: string;
}

export interface Scenario {
  id: string;
  userId: string;
  name: string;
  variablesJson: {
    financialProfileSnapshot: FinancialProfile;
    assumptionsSnapshot: FinancialAssumptions;
  };
  resultsJson: ScenarioCalculationResult;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextJson?: Record<string, unknown>;
  createdAt: string;
}

export type DataMode = 'supabase' | 'local';
