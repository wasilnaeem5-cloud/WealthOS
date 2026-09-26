import { z } from 'zod';
import { financialAssumptionsSchema } from './assumptions';

export const financialProfileSchema = z.object({
  income: z
    .number({ message: 'Income must be a number' })
    .min(0, 'Income cannot be negative'),
  expenses: z
    .number({ message: 'Expenses must be a number' })
    .min(0, 'Expenses cannot be negative'),
  savings: z
    .number({ message: 'Savings must be a number' })
    .min(0, 'Savings cannot be negative'),
  investments: z
    .number({ message: 'Investments must be a number' })
    .min(0, 'Investments cannot be negative'),
  debt: z
    .number({ message: 'Debt must be a number' })
    .min(0, 'Debt cannot be negative'),
  monthlyContribution: z
    .number({ message: 'Monthly contribution must be a number' })
    .min(0, 'Monthly contribution cannot be negative'),
  assumptions: financialAssumptionsSchema,
});

export type FinancialProfileInput = z.infer<typeof financialProfileSchema>;
