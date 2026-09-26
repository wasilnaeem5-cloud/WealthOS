import { z } from 'zod';

export const financialAssumptionsSchema = z.object({
  expectedAnnualReturn: z
    .number({ message: 'Expected return must be a number' })
    .min(-0.5, 'Expected return cannot be less than -50%')
    .max(1.0, 'Expected return cannot exceed 100%'),
  inflationRate: z
    .number({ message: 'Inflation rate must be a number' })
    .min(0, 'Inflation rate cannot be negative')
    .max(0.5, 'Inflation rate cannot exceed 50%'),
  contributionFrequency: z.enum(['monthly', 'annually']),
  contributionTiming: z.enum(['beginning', 'end']),
  annualContributionIncrease: z
    .number({ message: 'Annual step-up must be a number' })
    .min(0, 'Annual contribution increase cannot be negative')
    .max(0.5, 'Annual contribution increase cannot exceed 50%'),
  projectionYears: z
    .number({ message: 'Projection years must be an integer' })
    .int('Projection duration must be whole years')
    .min(1, 'Projection period must be at least 1 year')
    .max(60, 'Projection period cannot exceed 60 years'),
  currency: z
    .string()
    .min(1, 'Currency symbol is required')
    .max(5, 'Currency symbol too long'),
});

export type FinancialAssumptionsInput = z.infer<typeof financialAssumptionsSchema>;
