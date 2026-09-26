import { UserProfile, FinancialProfile, Goal, Scenario, AIChatMessage, AIConversation } from '../../../types';
import { calculateFutureValue } from '../../financial/futureValue';

export const DEMO_USER_ID = 'demo-user-123';

export const initialDemoProfile: UserProfile = {
  id: 'profile-demo-123',
  userId: DEMO_USER_ID,
  name: 'Alex Morgan',
  age: 26,
  currency: 'USD',
  onboardingCompleted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialDemoFinancialProfile: FinancialProfile = {
  id: 'fin-demo-123',
  userId: DEMO_USER_ID,
  income: 5000,
  expenses: 3200,
  savings: 12000,
  investments: 18000,
  debt: 4000,
  monthlyContribution: 800,
  assumptions: {
    expectedAnnualReturn: 0.08,
    inflationRate: 0.03,
    contributionFrequency: 'monthly',
    contributionTiming: 'beginning',
    annualContributionIncrease: 0.05,
    projectionYears: 20,
    currency: 'USD',
  },
  updatedAt: new Date().toISOString(),
};

export const initialDemoGoals: Goal[] = [
  {
    id: 'goal-1',
    userId: DEMO_USER_ID,
    name: 'Home Down Payment',
    targetAmount: 60000,
    currentAmount: 18000,
    targetDate: '2029-12-31',
    contributionAmount: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal-2',
    userId: DEMO_USER_ID,
    name: 'Emergency Fund',
    targetAmount: 20000,
    currentAmount: 12000,
    targetDate: '2027-06-30',
    contributionAmount: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const baselineResult = calculateFutureValue({
  initialAmount: 30000,
  monthlyContribution: 800,
  expectedAnnualReturn: 0.08,
  annualContributionIncrease: 0.05,
  projectionYears: 20,
  inflationRate: 0.03,
  contributionTiming: 'beginning',
  userCurrentAge: 26,
});

export const initialDemoScenarios: Scenario[] = [
  {
    id: 'scenario-baseline',
    userId: DEMO_USER_ID,
    name: 'Baseline Growth (8% Return)',
    variablesJson: {
      financialProfileSnapshot: initialDemoFinancialProfile,
      assumptionsSnapshot: initialDemoFinancialProfile.assumptions,
    },
    resultsJson: {
      monthlySurplus: 1800,
      savingsRate: 16,
      netWorthCurrent: 26000,
      projectedNominalFutureValue: baselineResult.nominalFutureValue,
      projectedRealFutureValue: baselineResult.realFutureValue,
      totalInvested: baselineResult.totalInvested,
      totalInterestEarned: baselineResult.totalGrowth,
      yearlyBreakdown: baselineResult.yearlyBreakdown,
      timestamp: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  },
];

export const initialDemoConversations: AIConversation[] = [
  {
    id: 'conv-1',
    userId: DEMO_USER_ID,
    title: 'Financial Future Overview',
    createdAt: new Date().toISOString(),
  },
];

export const initialDemoMessages: AIChatMessage[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    role: 'assistant',
    content: 'Welcome to WealthOS! I am your AI Financial Copilot. I analyze calculation results from the deterministic engine and explain concepts like compound interest, inflation impact, and goal timelines. How can I help you understand your financial future today?',
    createdAt: new Date().toISOString(),
  },
];
