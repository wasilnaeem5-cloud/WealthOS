import { z } from 'zod';

export const goalSchema = z.object({
  name: z
    .string()
    .min(1, 'Goal name is required')
    .max(100, 'Goal name too long'),
  targetAmount: z
    .number({ message: 'Target amount must be a number' })
    .positive('Target amount must be greater than zero'),
  currentAmount: z
    .number({ message: 'Current amount must be a number' })
    .min(0, 'Current saved amount cannot be negative'),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format'),
  contributionAmount: z
    .number({ message: 'Contribution amount must be a number' })
    .min(0, 'Contribution amount cannot be negative'),
});

export type GoalInput = z.infer<typeof goalSchema>;
